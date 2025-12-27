// actions/categories.ts
import { createClient } from "@/lib/supabase-server";

export async function getUniqueCategories() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select('category');

    if (error || !data) {
        console.error('Error fetching categories:', error);
        return [];
    }

    // 1. Filter out null/empty categories and get unique names
    const uniqueNames = Array.from(
        new Set(
            data
                .map(p => p.category)
                .filter((cat): cat is string => !!cat) // Menghapus null/undefined
        )
    );

    // 2. Mapping dengan kepastian tipe (Type Assertion)
    return uniqueNames.map((name, index) => ({
        id: index + 1,
        name: name, // Pasti string karena sudah difilter
        slug: name.toLowerCase().replace(/\s+/g, '-'), // Pasti string
        count: data.filter(p => p.category === name).length
    }));
}