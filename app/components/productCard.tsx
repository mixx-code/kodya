"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye, Star } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
    id: number;
    title: string;
    description: string;
    price: string;
    image: string[]; // Menerima array atau string
    category: string;
    rating?: number;
    sales?: number;
}

export function ProductCard({
    id,
    title,
    description,
    price,
    image, // Ini adalah data images dari DB
    category,
    rating = 5,
    sales = 0,
}: ProductCardProps) {
    // Ambil gambar pertama dari array, jika tidak ada gunakan placeholder
    console.log(image);
    const initialSrc = Array.isArray(image) && image.length > 0
        ? image[0]
        : (typeof image === 'string' ? image : "https://placehold.co/600x400?text=No+Image");

    const [imgSrc, setImgSrc] = useState(initialSrc);

    // Format Rupiah untuk Price
    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(Number(price));

    return (
        <Link href={`/product/${id}`} className="block h-full">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col">
                {/* Image */}
                <div className="relative h-48 md:h-56 bg-gray-100 overflow-hidden flex-shrink-0">
                    <Image
                        src={imgSrc}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        // Jika gambar gagal load (404), ganti ke placeholder
                        onError={() => setImgSrc("https://placehold.co/600x400?text=Image+Not+Found")}
                        unoptimized // Tambahkan ini jika menggunakan Supabase agar tidak memotong kuota optimization Next.js
                    />

                    <div className="absolute top-3 left-3">
                        <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">
                            {category}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {title}
                    </h3>

                    {/* Render HTML description secara aman atau gunakan text saja */}
                    <div
                        className="text-sm text-gray-600 mb-3 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />

                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-700">{rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">|</span>
                        <span className="text-xs text-gray-500">{sales} terjual</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <div>
                            <p className="text-xl font-bold text-blue-600">{formattedPrice}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                console.log("Add to cart:", id);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors shadow-md"
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}