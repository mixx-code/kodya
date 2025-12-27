"use server";

import { getSupabaseServerClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
    const supabase = await getSupabaseServerClient();
    const BUCKET_NAME = 'images-kodya';

    // 1. Mengambil data dari form
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const demo_url = formData.get("demo_url") as string;

    const techStack = formData.getAll("tech_stack_array") as string[];
    const features = formData.getAll("features_array") as string[];
    const imageFiles = formData.getAll("images") as File[];

    // 2. Proses upload gambar ke bucket 'images-kodya'
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
        // Validasi apakah file ada dan valid
        if (file && file.size > 0 && file.name !== 'undefined') {
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `product-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file);

            // JIKA GAGAL UPLOAD: Langsung lempar error dan hentikan proses
            if (uploadError) {
                console.error("Storage Upload Error:", uploadError.message);
                throw new Error(`Gagal mengunggah gambar: ${uploadError.message}. Produk tidak diterbitkan.`);
            }

            // Ambil Public URL setelah berhasil upload
            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            imageUrls.push(publicUrl);
        }
    }

    // 3. Persiapan data insert sesuai skema products
    const productData: TablesInsert<'products'> = {
        title: title,
        description: description,
        category: category || null,
        price: price || null,
        demo_url: demo_url || null,
        images: imageUrls.length > 0 ? imageUrls : null,
        tech_stack: techStack.filter(t => t.trim() !== ""),
        features: features.filter(f => f.trim() !== ""),
        rating: 0,
        reviews: 0,
        sales: 0
    };

    // 4. Simpan ke Database
    const { error: insertError } = await supabase
        .from('products')
        .insert(productData);

    if (insertError) {
        console.error("Database Insert Error:", insertError.message);
        // Anda mungkin ingin menghapus gambar yang sudah terlanjur diupload jika database gagal
        // Namun untuk tahap ini, kita lempar error utama
        throw new Error("Gagal menyimpan data produk ke database.");
    }

    // 5. Revalidasi dan Redirect
    revalidatePath("/products");
    revalidatePath("/"); // Revalidasi halaman home juga jika perlu
    redirect("/products");
}