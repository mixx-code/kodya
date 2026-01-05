"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-client";
import { Loader2, Edit, Trash2, ArrowLeft, ExternalLink, Download, Star, ShoppingCart, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  price: string | null;
  demo_url: string | null;
  link_program: string | null;
  images: string[] | null;
  tech_stack: string[] | null;
  features: string[] | null;
  rating: number | null;
  reviews: number | null;
  sales: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', parseInt(productId))
                    .single();

                if (error) {
                    console.error('Error fetching product:', error);
                    setError('Produk tidak ditemukan');
                    return;
                }

                setProduct(data);
                // Reset current image index when product loads
                setCurrentImageIndex(0);
                
            } catch (err) {
                console.error('Error:', err);
                setError('Terjadi kesalahan saat memuat data produk');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleDelete = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

        setDeleteLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', parseInt(productId));

            if (error) {
                console.error('Error deleting product:', error);
                alert('Gagal menghapus produk');
                return;
            }

            alert('Produk berhasil dihapus');
            router.push('/products');
            
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menghapus produk');
        } finally {
            setDeleteLoading(false);
        }
    };

    const openLightbox = (index: number) => {
        setLightboxImageIndex(index);
    };

    const closeLightbox = () => {
        setLightboxImageIndex(null);
    };

    const navigateImage = (direction: 'prev' | 'next') => {
        if (!product?.images) return;
        
        const currentIndex = currentImageIndex;
        let newIndex;
        
        if (direction === 'prev') {
            newIndex = currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;
        } else {
            newIndex = currentIndex === product.images.length - 1 ? 0 : currentIndex + 1;
        }
        
        setCurrentImageIndex(newIndex);
        // Also update lightbox if open
        if (lightboxImageIndex !== null) {
            setLightboxImageIndex(newIndex);
        }
    };

    const formatPrice = (price: string | null) => {
        if (!price) return "Gratis";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(Number(price));
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
                <div className="text-center">
                    <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--error)20', borderColor: 'var(--error)' }}>
                        <p className="font-medium" style={{ color: 'var(--error)' }}>❌ {error}</p>
                    </div>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all"
                        style={{
                            backgroundColor: 'var(--primary)',
                            color: 'var(--text-inverse)'
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Daftar Produk
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
                            style={{
                                backgroundColor: 'var(--border-muted)',
                                color: 'var(--text-primary)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-secondary)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--border-muted)'}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali
                        </Link>
                        
                        <div className="flex gap-3">
                            <Link
                                href={`/products/${product.id}/edit`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
                                style={{
                                    backgroundColor: 'var(--primary)',
                                    color: 'var(--text-inverse)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </Link>
                            
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                                style={{
                                    backgroundColor: 'var(--error)20',
                                    color: 'var(--error)',
                                    borderColor: 'var(--error)'
                                }}
                                onMouseEnter={(e) => !deleteLoading && (e.currentTarget.style.backgroundColor = 'var(--error)30')}
                                onMouseLeave={(e) => !deleteLoading && (e.currentTarget.style.backgroundColor = 'var(--error)20')}
                            >
                                {deleteLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Images */}
                        <div className="rounded-2xl shadow-lg p-4 md:p-6 border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
                            {product.images && product.images.length > 0 ? (
                                <div>
                                    {/* Main Image */}
                                    <div
                                        className="relative h-75 md:h-125 rounded-xl overflow-hidden mb-4 group cursor-zoom-in"
                                        style={{ backgroundColor: 'var(--border-muted)' }}
                                    >
                                        <Image
                                            src={product.images[currentImageIndex]}
                                            alt={product.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            priority
                                            unoptimized
                                            onClick={() => openLightbox(currentImageIndex)}
                                        />

                                        {/* Navigation Buttons */}
                                        {product.images.length > 1 && (
                                            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        navigateImage('prev'); 
                                                    }}
                                                    className="p-2 rounded-full shadow-lg transition transform hover:scale-110"
                                                    style={{ backgroundColor: 'var(--card-background)', color: 'var(--icon-primary)' }}
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        navigateImage('next'); 
                                                    }}
                                                    className="p-2 rounded-full shadow-lg transition transform hover:scale-110"
                                                    style={{ backgroundColor: 'var(--card-background)', color: 'var(--icon-primary)' }}
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}

                                        <div className="absolute bottom-4 right-4 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', color: 'var(--text-inverse)' }}>
                                            {currentImageIndex + 1} / {product.images.length}
                                        </div>
                                    </div>

                                    {/* Thumbnail Images */}
                                    {product.images.length > 1 && (
                                        <div className="flex gap-3 w-full overflow-x-auto pb-2 scrollbar-hide snap-x">
                                            {product.images.map((image, index) => (
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
                                                        alt={`${product.title} ${index + 1}`}
                                                        fill
                                                        sizes="80px"
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-75 md:h-125 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--border-muted)' }}>
                                    <div className="text-center" style={{ color: 'var(--text-muted)' }}>
                                        <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center border-2" style={{ borderColor: 'var(--border-secondary)' }}>
                                            <ExternalLink className="w-8 h-8" style={{ color: 'var(--icon-muted)' }} />
                                        </div>
                                        <p>Tidak ada gambar</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {product.title}
                                    </h1>
                                    {product.category && (
                                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}>
                                            {product.category}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-6 mb-4">
                                    <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                                        {formatPrice(product.price)}
                                    </div>
                                    <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                        <ShoppingCart className="w-4 h-4" />
                                        <span>{product.sales || 0} terjual</span>
                                    </div>
                                    {product.rating && (
                                        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span>{product.rating} ({product.reviews || 0} review)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Deskripsi</h3>
                                    <div 
                                        className="prose prose-sm max-w-none"
                                        style={{ color: 'var(--text-secondary)' }}
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                </div>
                            )}

                            {/* Links */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.demo_url && (
                                    <Link
                                        href={product.demo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all"
                                        style={{
                                            backgroundColor: 'var(--border-muted)',
                                            color: 'var(--text-primary)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-secondary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--border-muted)'}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Lihat Demo
                                    </Link>
                                )}
                                
                                {product.link_program && (
                                    <Link
                                        href={product.link_program}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all"
                                        style={{
                                            backgroundColor: 'var(--primary)',
                                            color: 'var(--text-inverse)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Program
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
                                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Fitur Utama</h3>
                                <ul className="space-y-2">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                                            <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }}></span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Tech Stack */}
                        {product.tech_stack && product.tech_stack.length > 0 && (
                            <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
                                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Tech Stack</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.tech_stack.map((tech, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 text-sm rounded-full"
                                            style={{
                                                backgroundColor: 'var(--border-muted)',
                                                color: 'var(--text-secondary)'
                                            }}
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Info */}
                        <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
                            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Informasi Produk</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--text-secondary)' }}>ID Produk</span>
                                    <span style={{ color: 'var(--text-primary)' }}>#{product.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--text-secondary)' }}>Dibuat</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{formatDate(product.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--text-secondary)' }}>Diperbarui</span>
                                    <span style={{ color: 'var(--text-primary)' }}>{formatDate(product.updated_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImageIndex !== null && product?.images && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
                        {/* Close Button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Image */}
                        <img
                            src={product.images[lightboxImageIndex]}
                            alt={`${product.title} - Gambar ${lightboxImageIndex + 1}`}
                            className="max-w-full max-h-[80vh] object-contain"
                            style={{ maxHeight: '80vh' }}
                        />

                        {/* Navigation */}
                        {product.images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigateImage('prev');
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all z-10"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigateImage('next');
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all z-10"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        {/* Image Counter */}
                        {product.images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm z-10">
                                {lightboxImageIndex + 1} / {product.images.length}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
