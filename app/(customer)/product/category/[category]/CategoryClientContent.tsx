"use client";
import { ProductCard } from '@/app/components/productCard';
import { ShowWindow } from '@/app/components/showWindow';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
    initialProducts: any[];
    categorySlug: string;
}

export default function CategoryClientContent({ initialProducts, categorySlug }: Props) {
    const router = useRouter();

    const displayTitle = categorySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <div className="container mx-auto px-4 py-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all mb-6 group"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Kembali</span>
            </button>

            <ShowWindow title={`Kategori: ${displayTitle}`}>
                {initialProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {initialProducts.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold">Produk Tidak Ditemukan</h3>
                        <p className="text-gray-500">Belum ada produk untuk kategori ini.</p>
                    </div>
                )}
            </ShowWindow>
        </div>
    );
}