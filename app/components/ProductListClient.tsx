"use client";

import { useState } from "react";
import { ProductCard } from "./productCard";
import { fetchProductsCursor } from "../actions";

export default function ProductListClient({
    initialProducts,
    initialCursor
}: {
    initialProducts: any[],
    initialCursor: number | null
}) {
    const [products, setProducts] = useState(initialProducts);
    const [cursor, setCursor] = useState(initialCursor);
    const [loading, setLoading] = useState(false);

    console.log('Products:', products);

    const loadMore = async () => {
        if (!cursor || loading) return;

        setLoading(true);
        const { data, nextCursor } = await fetchProductsCursor(cursor, 6);

        setProducts((prev) => [...prev, ...data]);
        setCursor(nextCursor);
        setLoading(false);
    };

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        {...product}
                        // Gunakan URL eksternal sementara jika tidak punya file lokal
                        image={product.images && product.images.length > 0
                            ? product.images[0]
                            : "https://placehold.co/600x400?text=No+Image"}
                    />
                ))}
            </div>

            {cursor && (
                <div className="flex justify-center">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Muat Lebih Banyak"}
                    </button>
                </div>
            )}
        </div>
    );
}