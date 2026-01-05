"use client";
import { ProductCard } from '@/app/components/productCard'
import { ShowWindow } from '@/app/components/showWindow'
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client'; // Client-side supabase

function Category() {
    const params = useParams();
    const router = useRouter();
    const categorySlug = params.category as string; // Sesuai nama folder [categorySlug]

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const supabase = createClient();

            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (!error && data) {
                // Filter berdasarkan slug yang diklik dari CategorySection sebelumnya
                const filtered = data.filter(
                    product => product.category?.toLowerCase().replace(/\s+/g, '-') === categorySlug
                );
                setProducts(filtered);
            }
            setLoading(false);
        };

        if (categorySlug) fetchProducts();
    }, [categorySlug]);

    // Format title agar cantik (contoh: next-js -> Next Js)
    const displayTitle = categorySlug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Back Button */}
            <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                Kembali ke Beranda
            </button>

            <ShowWindow
                title={`Kategori: ${displayTitle}`}
                description={`Menampilkan semua produk dalam kategori ${displayTitle}`}
            >
                {loading ? (
                    // Skeleton Loading
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                {...product}
                                // Mapping jika nama field di DB berbeda
                                image={product.images?.[0] || '/placeholder.jpg'}
                            />
                        ))}
                    </div>
                ) : (
                    // Empty State yang lebih cantik
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Produk Kosong</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mt-2">
                            Maaf, saat ini belum ada produk untuk kategori <b>{displayTitle}</b>.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-6 text-blue-600 font-semibold hover:underline"
                        >
                            Lihat Kategori Lain
                        </button>
                    </div>
                )}
            </ShowWindow>
        </div>
    )
}

export default Category;