// actions/products.ts
import { createClient } from "@/lib/supabase-server";

export async function getProductsByCategory(categorySlug: string) {
    const supabase = await createClient();

    // Kita ambil semua produk, lalu filter berdasarkan slug kategori
    // Jika kolom kategori di DB Anda bukan slug, kita ambil semua dan filter di JS
    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) return [];

    // Filter produk yang slug kategorinya cocok
    return data.filter(product =>
        product.category?.toLowerCase().replace(/\s+/g, '-') === categorySlug
    );
}