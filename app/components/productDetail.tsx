"use client";
import { useState } from "react";
import Image from "next/image";
import {
    Star,
    ShoppingCart,
    Heart,
    Share2,
    Check,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface ProductDetailProps {
    id: number;
    title: string;
    description: string;
    price: string;
    category: string;
    rating: number;
    reviews: number;
    sales: number;
    images: string[];
    features: string[];
    techStack?: string[]; // Tetap cammelCase di props jika Anda memetakannya di page.tsx
    demoUrl?: string;
}
function ProductDetail({
    title,
    description,
    price,
    category,
    rating,
    reviews,
    sales,
    images,
    features,
    techStack = [],
    demoUrl,
}: ProductDetailProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Validasi images
    if (!images || images.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-600 text-lg mb-2">Product images not found</p>
                    <p className="text-gray-500 text-sm">Please add at least one image to display this product</p>
                </div>
            </div>
        );
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 md:py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="hover:text-blue-600">
                        Beranda
                    </Link>
                    <span>/</span>
                    <a href="#" className="hover:text-blue-600">
                        {category}
                    </a>
                    <span>/</span>
                    <span className="text-gray-900 font-medium line-clamp-1">{title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* Image Gallery */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                        {/* Main Image */}
                        <div
                            className="relative h-75 md:h-125 bg-gray-100 rounded-xl overflow-hidden mb-4 group cursor-zoom-in"
                            onClick={() => setIsModalOpen(true)} // Buka modal saat diklik
                        >
                            <Image
                                src={images[currentImageIndex]}
                                alt={title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                priority
                            />

                            {/* Navigation Buttons - Ditambah stopPropagation agar tidak memicu modal */}
                            {images.length > 1 && (
                                <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition transform hover:scale-110"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-800" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition transform hover:scale-110"
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-800" />
                                    </button>
                                </div>
                            )}

                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="flex gap-3 w-full overflow-x-auto pb-2 scrollbar-hide snap-x">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        // Menambahkan flex-shrink-0 agar gambar tidak gepeng
                                        // Menambahkan aspect-square agar thumbnail selalu kotak sempurna
                                        className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition snap-start ${currentImageIndex === index
                                                ? "border-blue-600 ring-2 ring-blue-100"
                                                : "border-gray-200 hover:border-blue-300"
                                            }`}
                                    >
                                        <Image
                                            src={image}
                                            alt={`${title} ${index + 1}`}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {isModalOpen && (
                        <div
                            className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-10"
                            onClick={() => setIsModalOpen(false)}
                        >
                            {/* Close Button */}
                            <button
                                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <span className="sr-only">Close</span>
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Modal Navigation */}
                            <div className="absolute inset-x-4 md:inset-x-10 flex items-center justify-between">
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </div>

                            {/* Modal Image */}
                            <div className="relative w-full h-full max-w-5xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                                <Image
                                    src={images[currentImageIndex]}
                                    alt={title}
                                    fill
                                    className="object-contain" // Contain agar gambar tidak terpotong
                                />
                            </div>

                            {/* Caption */}
                            <div className="absolute bottom-10 text-white/80 text-center">
                                <p className="text-sm font-medium">{title}</p>
                                <p className="text-xs opacity-60 mt-1">{currentImageIndex + 1} of {images.length}</p>
                            </div>
                        </div>
                    )}

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                            <div className="flex items-start justify-between mb-3">
                                <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                                    {category}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsLiked(!isLiked)}
                                        className="p-2 rounded-full hover:bg-gray-100 transition"
                                    >
                                        <Heart
                                            className={`w-5 h-5 ${isLiked
                                                ? "fill-red-500 text-red-500"
                                                : "text-gray-600"
                                                }`}
                                        />
                                    </button>
                                    <button className="p-2 rounded-full hover:bg-gray-100 transition">
                                        <Share2 className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                {title}
                            </h1>

                            {/* Rating & Sales */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold text-gray-900">{rating}</span>
                                    <span className="text-sm text-gray-600">
                                        ({reviews} ulasan)
                                    </span>
                                </div>
                                <span className="text-gray-400">|</span>
                                <span className="text-sm text-gray-600">
                                    {sales} terjual
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <p className="text-3xl md:text-4xl font-bold text-blue-600">
                                    {price}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    Beli Sekarang
                                </button>
                                {demoUrl && (
                                    <a
                                        href={demoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold transition text-center"
                                    >
                                        Lihat Demo
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Features */}
                        {features && features.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Fitur Produk
                                </h2>
                                <ul className="space-y-3">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tech Stack */}
                        {techStack && techStack.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Tech Stack
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {techStack.map((tech, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                {/* Description */}
                {description && (
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-4 md:p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b">
                            Deskripsi Produk
                        </h2>

                        {/* Gunakan dangerouslySetInnerHTML dengan styling prose */}
                        <div
                            className="prose prose-blue max-w-none text-gray-700 
                       prose-headings:text-gray-900 prose-headings:font-bold
                       prose-p:leading-relaxed prose-li:my-1
                       prose-strong:text-blue-600"
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDetail;