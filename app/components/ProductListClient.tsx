// app\components\ProductListClient.tsx
"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./productCard";
import { fetchProductsCursor } from "../actions";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "lucide-react";

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
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [mounted, setMounted] = useState(false);
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        setMounted(true);
    }, []);

    console.log('Products:', products);

    const loadMore = async () => {
        if (!cursor || loading) return;

        setLoading(true);
        const { data, nextCursor } = await fetchProductsCursor(cursor, 6, debouncedSearchTerm);

        console.log('Data Products:', data);

        setProducts((prev) => [...prev, ...data]);
        setCursor(nextCursor);
        setLoading(false);
    };

    // Fetch products when search term changes
    useEffect(() => {
        if (!mounted) return;

        const fetchSearchResults = async () => {
            setLoading(true);
            const { data, nextCursor } = await fetchProductsCursor(undefined, 6, debouncedSearchTerm);
            setProducts(data);
            setCursor(nextCursor);
            setLoading(false);
        };

        fetchSearchResults();
    }, [debouncedSearchTerm, mounted]);

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--icon-muted)' }} />
                <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all"
                    style={{
                        borderColor: 'var(--border-secondary)',
                        backgroundColor: 'var(--card-background)',
                        color: 'var(--text-primary)'
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    }}
                />
            </div>

            {/* Products Grid */}
            <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div key={product.id} className="transform transition-all duration-200 hover:scale-105">
                                <ProductCard
                                    {...product}
                                    // Gunakan URL eksternal sementara jika tidak punya file lokal
                                    image={product.images && product.images.length > 0
                                        ? product.images[0]
                                        : "https://placehold.co/600x400?text=No+Image"}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--border-muted)' }}>
                                <Search className="w-12 h-12" style={{ color: 'var(--icon-muted)' }} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Tidak ada produk ditemukan</h3>
                            <p>Coba ubah kata kunci pencarian</p>
                        </div>
                    )}
                </div>
                {/* Load More Button - only show when not searching and there are more products */}
                {!debouncedSearchTerm && cursor && (
                    <div className="flex justify-center">
                        <button
                            onClick={loadMore}
                            disabled={loading}
                            className="px-8 py-3 font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            style={{
                                backgroundColor: 'var(--accent)',
                                color: 'var(--text-inverse)',
                                boxShadow: 'var(--card-shadow)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--accent)';
                            }}
                        >
                            {loading ? "Loading..." : "Muat Lebih Banyak"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}