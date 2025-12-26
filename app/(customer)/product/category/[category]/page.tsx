"use client";
import { ProductCard } from '@/app/components/productCard'
import { ShowWindow } from '@/app/components/showWindow'
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

function Category() {
    const params = useParams();
    const router = useRouter();
    const categorySlug = params.category as string;

    const products = [
        {
            id: 1,
            title: "Website E-Commerce Premium",
            description: "Template website toko online lengkap dengan admin panel dan fitur payment gateway",
            price: "Rp 2.500.000",
            image: "/product-1.jpg",
            category: "Web",
            rating: 4.8,
            sales: 45,
        },
        {
            id: 2,
            title: "Landing Page Bisnis",
            description: "Desain landing page modern dan responsif untuk meningkatkan konversi bisnis Anda",
            price: "Rp 1.500.000",
            image: "/product-2.jpg",
            category: "Web",
            rating: 4.9,
            sales: 67,
        },
        {
            id: 3,
            title: "Dashboard Admin Modern",
            description: "Template dashboard admin dengan berbagai fitur lengkap dan analytics",
            price: "Rp 1.800.000",
            image: "/product-1.jpg",
            category: "React JS",
            rating: 5.0,
            sales: 32,
        },
        {
            id: 4,
            title: "Mobile App UI Kit",
            description: "Kumpulan UI components untuk aplikasi mobile dengan desain modern",
            price: "Rp 1.200.000",
            image: "/product-2.jpg",
            category: "Android",
            rating: 4.7,
            sales: 28,
        },
        {
            id: 5,
            title: "CMS Laravel Advanced",
            description: "Content Management System dengan Laravel dan fitur lengkap",
            price: "Rp 3.200.000",
            image: "/product-1.jpg",
            category: "Laravel",
            rating: 4.9,
            sales: 19,
        },
        {
            id: 6,
            title: "Next.js Starter Kit",
            description: "Boilerplate Next.js dengan TypeScript dan best practices",
            price: "Rp 900.000",
            image: "/product-2.jpg",
            category: "Next JS",
            rating: 4.8,
            sales: 51,
        },
    ];

    // Filter products by category
    const filteredProducts = products.filter(
        product => product.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
    );
    return (
        <>
            {/* Mobile Back Button */}
            <div className="md:hidden mb-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Kembali</span>
                </button>
            </div>

            <ShowWindow
                title={`Produk ${categorySlug || 'Kami'}`}
                description="Temukan berbagai produk digital berkualitas untuk kebutuhan project Anda"
            >
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Tidak ada produk di kategori ini</p>
                    </div>
                )}
            </ShowWindow>
        </>
    )
}

export default Category