// actions/product.ts
import { createClient } from "@/lib/supabase-server";

export async function getProductById(id: number) {
    // TAMBAHKAN 'await' di sini karena createClient adalah fungsi async
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.log('Error fetching product:', error);
        return null;
    }

    return data;
}