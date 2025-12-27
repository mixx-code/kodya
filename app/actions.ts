"use server";

import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function fetchProductsCursor(cursor?: number, limit: number = 6) {
    const supabase = await getSupabaseServerClient();

    let query = supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true }) // Urutkan berdasarkan ID sebagai kursor
        .limit(limit);

    // Jika ada kursor, ambil data yang ID-nya lebih besar dari kursor terakhir
    if (cursor) {
        query = query.gt("id", cursor);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching products:", error.message);
        return { data: [], nextCursor: null };
    }

    // Tentukan kursor berikutnya (ID dari item terakhir yang diambil)
    const nextCursor = data.length === limit ? data[data.length - 1].id : null;

    return { data, nextCursor };
}