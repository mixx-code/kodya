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
    MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useDarkMode } from "../contexts/DarkModeContext";
import { ReviewList } from "./ReviewList";
import { createClient } from "@/lib/supabase-client";
import { useCart } from "../contexts/CartContext";
import { showNotification } from "./Notification";

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
    id,
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
    const [isLoading, setIsLoading] = useState(false);
    const { isDarkMode } = useDarkMode();
    const { addToCart } = useCart();
    const supabase = createClient();

    const handleBuyNow = async () => {
        setIsLoading(true);
        try {
            // Redirect ke checkout dengan product_id dan quantity
            window.location.href = `/checkout?product_id=${id}&quantity=1`;
        } catch (error) {
            console.error('Error redirecting to checkout:', error);
            alert('Terjadi kesalahan, silakan coba lagi');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async () => {
        setIsLoading(true);
        try {
            await addToCart(id);
            showNotification({
                message: `${title} berhasil ditambahkan ke keranjang!`,
                type: 'success'
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Gagal menambahkan ke keranjang');
        } finally {
            setIsLoading(false);
        }
    };

    // Validasi images
    if (!images || images.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
                <div className="text-center">
                    <p className="text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Product images not found</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Please add at least one image to display this product</p>
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
        <div className="min-h-screen py-6 md:py-8" style={{ backgroundColor: 'var(--background)' }}>
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    <Link href="/" className="transition-colors" style={{ color: 'var(--accent)' }}>
                        Beranda
                    </Link>
                    <span>/</span>
                    <span className="font-medium line-clamp-1" style={{ color: 'var(--text-primary)' }}>{title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* Image Gallery */}
                    <div className="rounded-2xl shadow-lg p-4 md:p-6 border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
                        {/* Main Image */}
                        <div
                            className="relative h-75 md:h-125 rounded-xl overflow-hidden mb-4 group cursor-zoom-in"
                            style={{ backgroundColor: 'var(--border-muted)' }}
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
                                        className="p-2 rounded-full shadow-lg transition transform hover:scale-110"
                                        style={{ backgroundColor: 'var(--card-background)', color: 'var(--icon-primary)' }}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="p-2 rounded-full shadow-lg transition transform hover:scale-110"
                                        style={{ backgroundColor: 'var(--card-background)', color: 'var(--icon-primary)' }}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            <div className="absolute bottom-4 right-4 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', color: 'var(--text-inverse)' }}>
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
                                        className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition snap-start ${currentImageIndex === index
                                            ? "ring-2"
                                            : "hover:border-blue-300"
                                            }`}
                                        style={{
                                            borderColor: currentImageIndex === index ? 'var(--accent)' : 'var(--border-primary)',
                                            boxShadow: currentImageIndex === index ? '0 0 0 2px var(--accent-muted)' : 'none'
                                        }}
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

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="rounded-2xl shadow-lg p-4 md:p-6 border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
                                    {category}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsLiked(!isLiked)}
                                        className="p-2 rounded-full transition"
                                        style={{ backgroundColor: isLiked ? 'var(--error)' : 'transparent', color: isLiked ? 'var(--text-inverse)' : 'var(--icon-secondary)' }}
                                    >
                                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                    </button>
                                    <button className="p-2 rounded-full transition" style={{ backgroundColor: 'transparent', color: 'var(--icon-secondary)' }}>
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                                {title}
                            </h1>

                            {/* Rating & Sales */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{rating}</span>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        ({reviews} ulasan)
                                    </span>
                                </div>
                                <span style={{ color: 'var(--text-muted)' }}>|</span>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {sales} terjual
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <p className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--accent)' }}>
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0
                                    }).format(Number(price))},00
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleBuyNow}
                                    disabled={isLoading}
                                    className="flex-1 py-3 px-6 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    {isLoading ? 'Loading...' : 'Beli Sekarang'}
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isLoading}
                                    className="py-3 px-6 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: 'var(--border-muted)',
                                        color: 'var(--text-primary)',
                                        boxShadow: 'var(--card-shadow)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--border-secondary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--border-muted)';
                                    }}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {isLoading ? 'Loading...' : 'Add to Cart'}
                                </button>
                                {demoUrl && (
                                    <a
                                        href={demoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="sm:w-auto py-3 px-6 rounded-xl font-semibold transition text-center hover:scale-105 transform"
                                        style={{
                                            backgroundColor: 'var(--border-muted)',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        Lihat Demo
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Features */}
                        {features && features.length > 0 && (
                            <div className="rounded-2xl shadow-lg p-4 md:p-6 border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
                                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                    Fitur Produk
                                </h2>
                                <ul className="space-y-3">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                                            <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tech Stack */}
                        {techStack && techStack.length > 0 && (
                            <div className="rounded-2xl shadow-lg p-4 md:p-6 border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
                                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                    Tech Stack
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {techStack.map((tech, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 rounded-lg text-sm font-medium"
                                            style={{
                                                backgroundColor: 'var(--border-muted)',
                                                color: 'var(--text-primary)'
                                            }}
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
                {description && (
                    <div className="mt-8 rounded-2xl shadow-lg p-4 md:p-6 border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
                        <h2 className="text-xl font-bold mb-6 pb-2 border-b" style={{ color: 'var(--text-primary)', borderBottomColor: 'var(--border-muted)' }}>
                            Deskripsi Produk
                        </h2>

                        <div
                            className="prose prose-blue max-w-none 
                            prose-headings:font-bold
                            prose-p:leading-relaxed prose-li:my-1"
                            style={{ color: 'var(--text-secondary)' }}
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
                    </div>
                )}

                {/* Reviews Section */}
                <div className="mt-8 rounded-2xl shadow-lg p-4 md:p-6 border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b flex items-center gap-2" style={{ color: 'var(--text-primary)', borderBottomColor: 'var(--border-muted)' }}>
                        <MessageSquare className="w-6 h-6" />
                        Ulasan Produk
                    </h2>

                    <ReviewList productId={id} />
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;