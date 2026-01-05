"use server";

import { getSupabaseServerClient } from "@/lib/supabase-server";
import { TablesUpdate } from "@/types/supabase";
import { revalidatePath } from "next/cache";

export async function updateProduct(productId: number, formData: FormData): Promise<any> {
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
        const deletedImages = formData.getAll("deleted_images") as string[];

        // 2. Get current product data to handle existing images
        const { data: currentProduct, error: fetchError } = await supabase
            .from('products')
            .select('images')
            .eq('id', productId)
            .single();

        if (fetchError || !currentProduct) {
            throw new Error("Produk tidak ditemukan");
        }

        // 3. Remove deleted images from storage
        if (deletedImages.length > 0) {
            for (const imageUrl of deletedImages) {
                try {
                    // Extract file path from URL
                    const urlParts = imageUrl.split('/');
                    const fileName = urlParts[urlParts.length - 1];
                    const filePath = `product-images/${fileName}`;
                    
                    const { error: deleteError } = await supabase.storage
                        .from(BUCKET_NAME)
                        .remove([filePath]);

                    if (deleteError) {
                        console.warn(`Failed to delete image from storage: ${deleteError.message}`);
                    }
                } catch (err) {
                    console.warn(`Error processing image deletion: ${err}`);
                }
            }
        }

        // 5. Proses upload gambar baru ke bucket 'images-kodya'
        const newImageUrls: string[] = [];
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

                newImageUrls.push(publicUrl);
            }
        }

        // 4. Combine existing images with new ones (excluding deleted ones)
        const existingImages = currentProduct.images || [];
        const remainingImages = existingImages.filter(img => !deletedImages.includes(img));
        const allImages = [...remainingImages, ...newImageUrls];

        // 6. Persiapan data update
        const productData: TablesUpdate<'products'> = {
            title: title.trim(),
            description: description?.trim() || null,
            category: category?.trim() || null,
            price: price?.trim() || null,
            demo_url: demo_url?.trim() || null,
            link_program: link_program?.trim() || null,
            images: allImages.length > 0 ? allImages : null,
            tech_stack: techStack.filter(t => t.trim() !== ""),
            features: features.filter(f => f.trim() !== ""),
            updated_at: new Date().toISOString()
        };

        // 7. Update di Database
        const { data: updatedData, error: updateError } = await supabase
            .from('products')
            .update(productData)
            .eq('id', productId)
            .select()
            .single();

        if (updateError) {
            // Rollback uploaded images
            if (uploadedPaths.length > 0) {
                await supabase.storage.from(BUCKET_NAME).remove(uploadedPaths);
            }

            throw new Error(`Gagal memperbarui produk: ${updateError.message}`);
        }

        // 8. Send WebSocket notification
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/websocket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product: updatedData,
                    action: 'updated'
                })
            });

            if (!response.ok) {
                console.error('Failed to send WebSocket notification:', response.statusText);
            } else {
                console.log('✅ WebSocket notification sent for updated product');
            }
        } catch (wsError) {
            console.error('WebSocket notification error:', wsError);
            // Don't throw error, just log it
        }

        // 9. Revalidasi cache
        revalidatePath("/products");
        revalidatePath("/products");
        revalidatePath("/");
        revalidatePath(`/products/${productId}`);

        // Return the updated product data
        return updatedData;

    } catch (error) {
        // Re-throw error untuk ditangkap oleh client
        throw error;
    }
}
