"use server";

import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function fetchProductsCursor(cursor?: number, limit: number = 6, searchTerm: string = '') {
    const supabase = await getSupabaseServerClient();

    let query = supabase
        .from("products")
        .select(`
            *,
            order_items(count)
        `)
        .order("id", { ascending: true }) // Urutkan berdasarkan ID sebagai kursor
        .limit(limit);

    // Jika ada kursor, ambil data yang ID-nya lebih besar dari kursor terakhir
    if (cursor) {
        query = query.gt("id", cursor);
    }

    // Jika ada search term, tambahkan filter
    if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching products:", error.message);
        return { data: [], nextCursor: null };
    }

    // Transform data untuk menambahkan order_count
    const transformedData = data?.map(product => ({
        ...product,
        order_count: product.order_items?.[0]?.count || 0
    })) || [];

    // Tentukan kursor berikutnya (ID dari item terakhir yang diambil)
    const nextCursor = data.length === limit ? data[data.length - 1].id : null;

    return { data: transformedData, nextCursor };
}