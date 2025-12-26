"use client";
import { useState } from "react";
import Image from "next/image";
import {
    Star,
    ShoppingCart,
    Heart,
    Share2,
    Check,
    Package,
    Shield,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
    techStack?: string[];
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
                        <div className="relative h-[300px] md:h-[500px] bg-gray-100 rounded-xl overflow-hidden mb-4">
                            <Image
                                src={images[currentImageIndex]}
                                alt={title}
                                fill
                                className="object-cover"
                                priority
                            />

                            {/* Navigation Buttons */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            {/* Image Counter */}
                            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`relative h-20 rounded-lg overflow-hidden border-2 transition ${currentImageIndex === index
                                            ? "border-blue-600"
                                            : "border-gray-200 hover:border-blue-300"
                                            }`}
                                    >
                                        <Image
                                            src={image}
                                            alt={`${title} ${index + 1}`}
                                            fill
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
                                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
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

                        {/* Guarantee */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Instant</p>
                                        <p className="font-semibold text-sm">Download</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <Shield className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">100%</p>
                                        <p className="font-semibold text-sm">Aman</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <RefreshCw className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Gratis</p>
                                        <p className="font-semibold text-sm">Update</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-4 md:p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Deskripsi Produk
                        </h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDetail;

// Example Component dengan Dummy Data
export function ProductDetailExample() {
    // Ambil ID dari URL
    const params = useParams();
    const productId = Number(params.id) || 1; // Convert ke number dan fallback ke 1

    const dummyProducts = [
        {
            id: 1,
            title: "Website E-Commerce Premium dengan Full Features",
            description: `Template website toko online lengkap dengan fitur payment gateway, manajemen produk, sistem order, tracking pengiriman, dan admin panel yang powerful. 

Cocok untuk bisnis online Anda dengan desain modern dan responsif. Mudah dikustomisasi sesuai kebutuhan brand Anda.

Dilengkapi dengan:
- Source code lengkap
- Database schema
- API documentation
- Video tutorial instalasi
- Support selama 3 bulan

Perfect untuk memulai bisnis e-commerce Anda tanpa perlu coding dari nol!`,
            price: "Rp 2.500.000",
            category: "Web Development",
            rating: 4.8,
            reviews: 124,
            sales: 45,
            images: [
                "/product-1.jpg",
                "/product-2.jpg",
                "/product-1.jpg",
                "/product-2.jpg",
            ],
            features: [
                "Responsive design untuk semua device (Mobile, Tablet, Desktop)",
                "Payment gateway integration (Midtrans, Xendit, Doku)",
                "Admin panel dengan analytics dan reporting",
                "Sistem manajemen produk & kategori unlimited",
                "Order tracking & email notification otomatis",
                "SEO optimized dengan meta tags dinamis",
                "Multi-language support (Indonesia & English)",
                "Free lifetime updates & bug fixes",
                "Documentation lengkap dan mudah dipahami",
                "Customer support 24/7 via WhatsApp",
            ],
            techStack: [
                "Next.js 14",
                "TypeScript",
                "Tailwind CSS",
                "Prisma ORM",
                "PostgreSQL",
                "NextAuth.js",
                "React Hook Form",
                "Zustand",
            ],
            demoUrl: "https://demo-ecommerce.example.com",
        },
        {
            id: 2,
            title: "Dashboard Admin Modern & Analytics",
            description: `Template dashboard admin yang powerful dengan berbagai fitur analytics, reporting, dan management system yang lengkap.

Didesain dengan UX/UI modern dan clean, cocok untuk berbagai jenis aplikasi bisnis, SaaS, atau internal tools perusahaan.

Fitur Unggulan:
- Real-time analytics & charts
- User management system
- Role & permission management
- Dark mode support
- Customizable widgets
- Export data to Excel/PDF

Hemat waktu development hingga 70% dengan template siap pakai ini!`,
            price: "Rp 1.800.000",
            category: "Dashboard",
            rating: 4.9,
            reviews: 89,
            sales: 67,
            images: [
                "/product-2.jpg",
                "/product-1.jpg",
                "/product-2.jpg",
                "/product-1.jpg",
            ],
            features: [
                "Modern & clean design dengan dark mode",
                "Real-time data visualization dengan charts interaktif",
                "User & role management system",
                "Advanced data tables dengan sorting & filtering",
                "Notification system dengan real-time updates",
                "Responsive layout untuk semua device",
                "API integration ready",
                "Component library lengkap & reusable",
                "Documentation & code examples",
                "Free updates selama 6 bulan",
            ],
            techStack: [
                "React 18",
                "TypeScript",
                "Tailwind CSS",
                "Recharts",
                "React Query",
                "Axios",
                "React Router",
                "Vite",
            ],
            demoUrl: "https://demo-dashboard.example.com",
        },
    ];

    // Cari product berdasarkan ID (default ke product pertama jika tidak ditemukan)
    const product = dummyProducts.find(p => p.id === productId) || dummyProducts[0];

    return <ProductDetail {...product} />;
}



