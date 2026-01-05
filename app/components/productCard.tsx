// app\components\productCard.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useCart } from "../contexts/CartContext";
import { showNotification } from "./Notification";

interface ProductCardProps {
    id: number;
    title: string;
    description: string;
    price: string;
    image: string[];
    category: string;
    rating?: number;
    sales?: number;
    order_count?: number; // New field from order_items aggregation
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
    order_count = 0, // Use order_count from database
}: ProductCardProps) {
    const supabase = createClient();
    const { isDarkMode } = useDarkMode();
    const { addToCart } = useCart();

    const initialSrc = Array.isArray(image) && image.length > 0
        ? image[0]
        : (typeof image === 'string' ? image : "https://placehold.co/600x400?text=No+Image");

    const [imgSrc, setImgSrc] = useState(initialSrc);
    const [isInCart, setIsInCart] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            checkIfInCart();
        }
    }, [id, mounted]);

    const checkIfInCart = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setIsInCart(false);
                return;
            }

            const { data, error } = await supabase
                .from('cart')
                .select('id')
                .eq('user_id', user.id)
                .eq('product_id', id)
                .maybeSingle();

            if (error) {
                console.error('Error checking if in cart:', error);
            } else {
                setIsInCart(!!data);
            }
        } catch (error) {
            console.error('Error checking if in cart:', error);
        }
    };

    // Format Rupiah untuk Price
    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(Number(price));

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);

        try {
            await addToCart(id);
            showNotification({
                message: `${title} berhasil ditambahkan ke keranjang!`,
                type: 'success'
            });
            setIsInCart(true);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Gagal menambahkan ke keranjang');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Link href={`/product/${id}`} className="block h-full">
            <div className="rounded-xl border overflow-hidden transition-all duration-300 group cursor-pointer h-full flex flex-col hover:shadow-2xl"
                style={{
                    backgroundColor: 'var(--card-background)',
                    borderColor: 'var(--card-border)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgb(0 0 0 / 0.25), 0 8px 16px -8px rgb(0 0 0 / 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                }}>
                {/* Image */}
                <div className="relative h-48 md:h-56 overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--border-muted)' }}>
                    <Image
                        src={imgSrc}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={() => setImgSrc("https://placehold.co/600x400?text=Image+Not+Found")}
                        unoptimized
                    />

                    <div className="absolute top-3 left-3">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase" style={{ backgroundColor: 'var(--accent)', color: 'var(--text-inverse)' }}>
                            {category}
                        </span>
                    </div>

                    {/* Badge if in cart */}
                    {mounted && isInCart && (
                        <div className="absolute top-3 right-3">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1" style={{ backgroundColor: 'var(--success)', color: 'var(--text-inverse)' }}>
                                <Check className="w-3 h-3" />
                                Di Cart
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {title}
                    </h3>

                    <div
                        className="text-sm mb-3 line-clamp-2"
                        style={{ color: 'var(--text-secondary)' }}
                        dangerouslySetInnerHTML={{ __html: description }}
                    />

                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{rating}</span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>|</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{order_count} terjual</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-auto" style={{ borderTop: '1px solid var(--border-muted)' }}>
                        <div>
                            <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{formattedPrice}</p>
                        </div>
                        <div suppressHydrationWarning>
                            {mounted ? (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isLoading}
                                    className={`
                                        p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                        ${isLoading ? 'animate-pulse' : 'hover:scale-110 transform'}
                                    `}
                                    style={{
                                        backgroundColor: mounted ? (isInCart ? 'var(--success)' : 'var(--accent)') : 'var(--accent)',
                                        color: 'var(--text-inverse)',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isLoading && mounted) {
                                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
                                            e.currentTarget.style.backgroundColor = isInCart ? 'var(--success)' : 'var(--accent-hover)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isLoading && mounted) {
                                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                                            e.currentTarget.style.backgroundColor = isInCart ? 'var(--success)' : 'var(--accent)';
                                        }
                                    }}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--text-inverse)', borderTopColor: 'transparent' }} />
                                    ) : mounted && isInCart ? (
                                        <Check className="w-5 h-5" style={{ filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.3))' }} />
                                    ) : (
                                        <ShoppingCart className="w-5 h-5" style={{ filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.3))' }} />
                                    )}
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: 'var(--accent)',
                                        color: 'var(--text-inverse)',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                    }}
                                >
                                    <ShoppingCart className="w-5 h-5" style={{ filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.3))' }} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}