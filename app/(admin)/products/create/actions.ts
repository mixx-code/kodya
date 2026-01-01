"use server";

import { getSupabaseServerClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult = {
    success: boolean;
    message: string;
    productId?: number;
}

export async function createProduct(formData: FormData): Promise<void> {
    try {
        const supabase = await getSupabaseServerClient();
        const BUCKET_NAME = 'images-kodya';

        // 1. Mengambil data dari form
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
        const price = formData.get("price") as string;
        const demo_url = formData.get("demo_url") as string;
        const link_program = formData.get("link_program") as string;

        // Validasi title wajib ada
        if (!title || title.trim() === "") {
            throw new Error("Judul produk wajib diisi");
        }

        const techStack = formData.getAll("tech_stack_array") as string[];
        const features = formData.getAll("features_array") as string[];
        const imageFiles = formData.getAll("images") as File[];

        // 2. Proses upload gambar ke bucket 'images-kodya'
        const imageUrls: string[] = [];
        const uploadedPaths: string[] = [];

        for (const file of imageFiles) {
            if (file && file.size > 0 && file.name !== 'undefined') {
                const fileExt = file.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${fileExt}`;
                const filePath = `product-images/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(filePath, file);

                if (uploadError) {
                    // Rollback uploaded files
                    if (uploadedPaths.length > 0) {
                        await supabase.storage.from(BUCKET_NAME).remove(uploadedPaths);
                    }

                    throw new Error(`Gagal mengunggah gambar "${file.name}": ${uploadError.message}`);
                }

                uploadedPaths.push(filePath);

                const { data: { publicUrl } } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(filePath);

                imageUrls.push(publicUrl);
            }
        }

        // 3. Persiapan data insert
        const productData: TablesInsert<'products'> = {
            title: title.trim(),
            description: description?.trim() || null,
            category: category?.trim() || null,
            price: price?.trim() || null,
            demo_url: demo_url?.trim() || null,
            link_program: link_program?.trim() || null,
            images: imageUrls.length > 0 ? imageUrls : null,
            tech_stack: techStack.filter(t => t.trim() !== ""),
            features: features.filter(f => f.trim() !== ""),
            rating: null,
            reviews: 0,
            sales: 0
        };

        // 4. Simpan ke Database
        const { data: insertedData, error: insertError } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (insertError) {
            // Rollback uploaded images
            if (uploadedPaths.length > 0) {
                await supabase.storage.from(BUCKET_NAME).remove(uploadedPaths);
            }

            throw new Error(`Gagal menyimpan produk: ${insertError.message}`);
        }

        // 5. Revalidasi cache dan redirect
        revalidatePath("/products");
        revalidatePath("/");

        // Redirect ke products page
        redirect("/products");

    } catch (error) {
        // Re-throw error untuk ditangkap oleh Next.js error boundary
        throw error;
    }
}