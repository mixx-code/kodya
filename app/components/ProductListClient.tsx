// app\components\ProductListClient.tsx
"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./productCard";
import { fetchProductsCursor } from "../actions";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "lucide-react";
import { websocketService, ProductData } from "@/lib/websocket";

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

    useEffect(() => {
        if (!mounted) return;

        console.log('🔄 ProductListClient WebSocket useEffect triggered');

        // Join WebSocket room for products
        console.log('📡 Attempting to join WebSocket products room');
        websocketService.joinProductsRoom();

        // Listen for real-time product updates
        const handleProductAdded = (data: { product: ProductData; timestamp: string }) => {
            console.log('🎉 New product received in real-time:', data);

            // Add the new product to the beginning of the list (only if not searching)
            if (!debouncedSearchTerm) {
                setProducts(prevProducts => {
                    const newProduct = {
                        id: data.product.id,
                        title: data.product.title,
                        description: data.product.description,
                        category: data.product.category,
                        price: data.product.price,
                        demo_url: data.product.demo_url,
                        link_program: data.product.link_program,
                        images: data.product.images,
                        tech_stack: data.product.tech_stack || [],
                        features: data.product.features || [],
                        rating: data.product.rating,
                        reviews: data.product.reviews,
                        sales: data.product.sales,
                        created_at: data.product.created_at,
                        updated_at: data.product.updated_at
                    };

                    const updatedProducts = [newProduct, ...prevProducts];
                    console.log('📝 Updated products list:', updatedProducts);
                    return updatedProducts;
                });

                // Show notification for new product
                if (typeof window !== 'undefined' && 'Notification' in window) {
                    if (Notification.permission === 'granted') {
                        new Notification('Produk Baru!', {
                            body: `${data.product.title} telah ditambahkan`,
                            icon: '/favicon.ico'
                        });
                    } else if (Notification.permission !== 'denied') {
                        Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                                new Notification('Produk Baru!', {
                                    body: `${data.product.title} telah ditambahkan`,
                                    icon: '/favicon.ico'
                                });
                            }
                        });
                    }
                }
            }
        };

        const handleProductUpdated = (data: { product: ProductData; timestamp: string }) => {
            console.log('🔄 Product updated in real-time:', data);

            // Update the product in the list
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === data.product.id
                        ? {
                            ...product,
                            title: data.product.title,
                            description: data.product.description,
                            category: data.product.category,
                            price: data.product.price,
                            demo_url: data.product.demo_url,
                            link_program: data.product.link_program,
                            images: data.product.images,
                            tech_stack: data.product.tech_stack || [],
                            features: data.product.features || [],
                            rating: data.product.rating,
                            reviews: data.product.reviews,
                            sales: data.product.sales,
                            updated_at: data.product.updated_at
                        }
                        : product
                )
            );
        };

        const handleProductDeleted = (data: { productId: number; timestamp: string }) => {
            console.log('🗑️ Product deleted in real-time:', data);

            // Remove the product from the list
            setProducts(prevProducts => prevProducts.filter(product => product.id !== data.productId));
        };

        console.log('👂 Registering product event listeners');
        websocketService.onProductAdded(handleProductAdded);
        websocketService.onProductUpdated(handleProductUpdated);
        websocketService.onProductDeleted(handleProductDeleted);

        // Cleanup
        return () => {
            console.log('🧹 Cleaning up WebSocket products room');
            websocketService.leaveProductsRoom();
            websocketService.offProductAdded(handleProductAdded);
            websocketService.offProductUpdated(handleProductUpdated);
            websocketService.offProductDeleted(handleProductDeleted);
        };
    }, [mounted, debouncedSearchTerm]);

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