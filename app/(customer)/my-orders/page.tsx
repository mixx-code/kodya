// app/(customer)/my-order/page.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Download
} from "lucide-react";
import { createClient } from "@/lib/supabase-client";

interface PurchasedProduct {
  id: string;
  access_granted_at: string | null;
  created_at: string;
  link_program: string;
  order_id: string;
  product_id: number;
  user_id: string;
  totalProductsInOrder?: number; // New field to show total products in this order
  products: {
    id: number;
    title: string;
    price: string;
    images: string[];
    category: string;
    description: string | null;
    demo_url: string | null;
  };
}

const ITEMS_PER_PAGE = 4;

function MyOrder() {
  const supabase = createClient();
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchasedProducts(true);
  }, []);

  const fetchPurchasedProducts = async (isInitial = true) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (isInitial) setLoading(false);
        else setIsLoadingMore(false);
        return;
      }

      let query = supabase
        .from('purchased_products')
        .select(`
          id,
          access_granted_at,
          created_at,
          link_program,
          order_id,
          product_id,
          user_id,
          products (
            id,
            title,
            price,
            images,
            category,
            description,
            demo_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching purchased products:', error);
      } else if (data) {
        // Group by order_id and count products per order
        const groupedByOrder = new Map<string, { item: any, totalProducts: number }>();
        
        data.forEach(item => {
          if (!groupedByOrder.has(item.order_id)) {
            groupedByOrder.set(item.order_id, { item, totalProducts: 1 });
          } else {
            const existing = groupedByOrder.get(item.order_id)!;
            existing.totalProducts++;
          }
        });

        // Get unique orders with product count
        const uniqueOrders = Array.from(groupedByOrder.values()).map(group => ({
          ...group.item,
          totalProductsInOrder: group.totalProducts
        }));

        // Apply pagination
        const more = uniqueOrders.length > ITEMS_PER_PAGE;
        const resultData = more ? uniqueOrders.slice(0, ITEMS_PER_PAGE) : uniqueOrders;

        if (isInitial) {
          setPurchasedProducts(resultData as PurchasedProduct[]);
        } else {
          setPurchasedProducts(prev => [...prev, ...resultData as PurchasedProduct[]]);
        }

        setHasMore(more);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  if (purchasedProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
        <Package className="w-24 h-24 mb-4" style={{ color: 'var(--text-muted)' }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Belum Ada Pembelian
        </h2>
        <p className="mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>
          Anda belum memiliki produk yang dibeli
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105"
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
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Pesanan Saya
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {purchasedProducts.length} produk yang telah Anda beli
          </p>
        </div>

        <div className="space-y-4">
          {purchasedProducts.map((item) => (
            <div
              key={item.id}
              className="rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              style={{ backgroundColor: 'var(--card-background)' }}
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Product Image */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--border-muted)' }}>
                    <Image
                      src={item.products.images[0] || "https://placehold.co/200x200"}
                      alt={item.products.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {item.access_granted_at ? (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{
                          backgroundColor: 'var(--success)',
                          color: 'var(--text-inverse)'
                        }}>
                          <CheckCircle className="w-3 h-3" />
                          Diakses
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{
                          backgroundColor: 'var(--warning)',
                          color: 'var(--text-inverse)'
                        }}>
                          <Clock className="w-3 h-3" />
                          Menunggu
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-grow text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/product/${item.product_id}`}
                          className="font-semibold text-xl transition-colors hover:scale-105 transform"
                          style={{
                            color: 'var(--text-primary)',
                            display: 'inline-block'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--accent)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                        >
                          {item.products.title}
                        </Link>
                        {item.totalProductsInOrder && item.totalProductsInOrder > 1 && (
                          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                            backgroundColor: 'var(--accent-muted)',
                            color: 'var(--accent)'
                          }}>
                            +{item.totalProductsInOrder - 1} produk lainnya
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {item.products.category}
                      </p>
                    </div>
                    <div className="text-xl font-bold text-center sm:text-left" style={{ color: 'var(--accent)' }}>
                      {formatPrice(Number(item.products.price))}
                    </div>
                  </div>

                  {item.products.description && (
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {item.products.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    <Calendar className="w-4 h-4" />
                    <span>Dibeli: {formatDate(item.created_at)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mt-4">
                    {item.link_program && (
                      <Link
                        href={item.link_program}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center sm:justify-start gap-2 transform hover:scale-105"
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
                        <ExternalLink className="w-4 h-4" />
                        Download Product
                      </Link>
                    )}

                    {item.products.demo_url && (
                      <Link
                        href={item.products.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center sm:justify-start gap-2 transform hover:scale-105"
                        style={{
                          backgroundColor: 'var(--border-muted)',
                          color: 'var(--text-primary)',
                          border: `1px solid var(--border-primary)`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--border-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--border-muted)';
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Lihat Demo
                      </Link>
                    )}

                    <Link
                      href={`/my-orders/${item.order_id}`}
                      className="w-full sm:w-auto py-2 px-4 rounded-lg font-medium transition-colors text-center transform hover:scale-105"
                      style={{
                        border: `1px solid var(--border-primary)`,
                        color: 'var(--text-primary)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--border-muted)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {item.totalProductsInOrder && item.totalProductsInOrder > 1 
                        ? `Lihat Detail Order (${item.totalProductsInOrder} produk)`
                        : 'Lihat Detail Order'
                      }
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <button
            onClick={() => fetchPurchasedProducts(false)}
            disabled={isLoadingMore}
            className="w-full py-4 flex items-center justify-center gap-2 font-bold text-sm rounded-2xl transition-colors border-2 border-dashed mt-4 transform hover:scale-105"
            style={{
              color: 'var(--accent)',
              borderColor: 'var(--accent-muted)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              if (!isLoadingMore) {
                e.currentTarget.style.backgroundColor = 'var(--accent-muted)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isLoadingMore ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                MUAT LEBIH BANYAK
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        )}

        {!hasMore && purchasedProducts.length > 0 && (
          <p className="text-center py-6 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
            ──── Akhir daftar pembelian ────
          </p>
        )}
      </div>
    </div>
  );
}

export default MyOrder;
