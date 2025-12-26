"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye, Star } from "lucide-react";

// ProductCard Component - Card untuk menampilkan produk
interface ProductCardProps {
    id: number;
    title: string;
    description: string;
    price: string;
    image: string;
    category: string;
    rating?: number;
    sales?: number;
}

export function ProductCard({
    id,
    title,
    description,
    price,
    image,
    category,
    rating = 5,
    sales = 0,
}: ProductCardProps) {
    return (
        <Link href={`/product/${id}`} className="block h-full">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col">
                {/* Image */}
                <div className="relative h-48 md:h-56 bg-gray-100 overflow-hidden flex-shrink-0">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                        <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            {category}
                        </span>
                    </div>
                    {/* Quick View Button */}
                    <button
                        onClick={(e) => e.preventDefault()}
                        className="absolute top-3 right-3 bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-gray-100"
                    >
                        <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {description}
                    </p>

                    {/* Rating & Sales */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-700">{rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">|</span>
                        <span className="text-xs text-gray-500">{sales} terjual</span>
                    </div>

                    {/* Price & Button - Push to bottom */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <div>
                            <p className="text-xl font-bold text-blue-600">{price}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                // Handle add to cart logic here
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