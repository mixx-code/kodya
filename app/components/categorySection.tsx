"use client";
import { useState } from "react";
import Link from "next/link";
import {
    Code,
    Smartphone,
    Database,
    Layers,
    Zap,
    FileCode,
    Box,
} from "lucide-react";

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: React.ReactNode;
    count: number;
}

function CategorySection() {
    const [activeCategory, setActiveCategory] = useState<number | null>(null);

    const categories: Category[] = [
        {
            id: 1,
            name: "Web",
            slug: "web",
            icon: <Code className="w-5 h-5 md:w-6 md:h-6" />,
            count: 24,
        },
        {
            id: 2,
            name: "Android",
            slug: "android",
            icon: <Smartphone className="w-5 h-5 md:w-6 md:h-6" />,
            count: 18,
        },
        {
            id: 3,
            name: "PHP",
            slug: "php",
            icon: <Database className="w-5 h-5 md:w-6 md:h-6" />,
            count: 15,
        },
        {
            id: 4,
            name: "React JS",
            slug: "react-js",
            icon: <Layers className="w-5 h-5 md:w-6 md:h-6" />,
            count: 32,
        },
        {
            id: 5,
            name: "Next JS",
            slug: "next-js",
            icon: <Zap className="w-5 h-5 md:w-6 md:h-6" />,
            count: 28,
        },
        {
            id: 6,
            name: "TypeScript",
            slug: "typescript",
            icon: <FileCode className="w-5 h-5 md:w-6 md:h-6" />,
            count: 21,
        },
        {
            id: 7,
            name: "Laravel",
            slug: "laravel",
            icon: <Box className="w-5 h-5 md:w-6 md:h-6" />,
            count: 19,
        },
    ];

    return (
        <section className="w-full py-6 md:py-8">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                        Kategori Produk
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                        Pilih kategori untuk menemukan produk yang Anda butuhkan
                    </p>
                </div>

                {/* Desktop: Grid Layout */}
                <div className="hidden md:grid grid-cols-4 lg:grid-cols-7 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/product/category/${category.slug}`}
                            onClick={() => setActiveCategory(category.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${activeCategory === category.id
                                ? "border-blue-500 bg-blue-50 shadow-md"
                                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                                }`}
                        >
                            <div
                                className={`mb-2 ${activeCategory === category.id
                                    ? "text-blue-600"
                                    : "text-gray-600"
                                    }`}
                            >
                                {category.icon}
                            </div>
                            <h3
                                className={`text-sm font-semibold ${activeCategory === category.id
                                    ? "text-blue-600"
                                    : "text-gray-800"
                                    }`}
                            >
                                {category.name}
                            </h3>
                            <span className="text-xs text-gray-500 mt-1">
                                {category.count} produk
                            </span>
                        </Link>
                    ))}
                </div>

                {/* Mobile: Horizontal Scroll */}
                <div className="md:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/product/category/${category.slug}`}
                            onClick={() => setActiveCategory(category.id)}
                            className={`flex flex-col items-center justify-center min-w-[90px] p-3 rounded-xl border-2 transition-all ${activeCategory === category.id
                                ? "border-blue-500 bg-blue-50 shadow-md"
                                : "border-gray-200 bg-white"
                                }`}
                        >
                            <div
                                className={`mb-2 ${activeCategory === category.id
                                    ? "text-blue-600"
                                    : "text-gray-600"
                                    }`}
                            >
                                {category.icon}
                            </div>
                            <h3
                                className={`text-xs font-semibold whitespace-nowrap ${activeCategory === category.id
                                    ? "text-blue-600"
                                    : "text-gray-800"
                                    }`}
                            >
                                {category.name}
                            </h3>
                            <span className="text-[10px] text-gray-500 mt-1">
                                {category.count}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CategorySection;