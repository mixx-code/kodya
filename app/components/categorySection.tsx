// components/CategorySection.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Code, Smartphone, Database, Layers, Zap, FileCode, Box, LayoutGrid } from "lucide-react";

// Helper untuk mapping icon berdasarkan nama kategori
const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('web')) return <Code className="w-5 h-5" />;
    if (n.includes('android') || n.includes('mobile')) return <Smartphone className="w-5 h-5" />;
    if (n.includes('react')) return <Layers className="w-5 h-5" />;
    if (n.includes('next')) return <Zap className="w-5 h-5" />;
    if (n.includes('php') || n.includes('laravel')) return <Box className="w-5 h-5" />;
    return <LayoutGrid className="w-5 h-5" />; // Icon default
};

interface CategorySectionProps {
    initialCategories: {
        id: number;
        name: string;
        slug: string;
        count: number;
    }[];
}

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    count: number;
}

interface CategorySectionProps {
    initialCategories: CategoryItem[];
}

function CategorySection({ initialCategories }: CategorySectionProps) {
    const [activeCategory, setActiveCategory] = useState<number | null>(null);

    return (
        <section className="w-full py-6 md:py-8">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Kategori Produk</h2>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                        Temukan {initialCategories.length} kategori teknologi terbaru
                    </p>
                </div>

                {/* Grid Container (Scrollable on mobile, Grid on desktop) */}
                <div className="flex md:grid md:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {initialCategories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/product/category/${category.slug}`}
                            onClick={() => setActiveCategory(category.id)}
                            className={`flex flex-col items-center justify-center min-w-[100px] md:min-w-0 p-4 rounded-xl border-2 transition-all ${activeCategory === category.id
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-gray-100 bg-white hover:border-blue-200"
                                }`}
                        >
                            <div className={`mb-2 ${activeCategory === category.id ? "text-blue-600" : "text-gray-500"}`}>
                                {getIcon(category.name)}
                            </div>
                            <h3 className="text-xs md:text-sm font-semibold text-gray-800 text-center line-clamp-1">
                                {category.name}
                            </h3>
                            <span className="text-[10px] text-gray-400 mt-1">
                                {category.count} Item
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CategorySection;