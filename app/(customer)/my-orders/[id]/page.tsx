// app/(customer)/my-orders/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Download,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Truck,
  User,
  Star,
  MessageSquare,
  Check
} from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { ReviewForm } from "../../../components/ReviewForm";
import { ReviewList } from "../../../components/ReviewList";

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  subtotal: number;
  created_at: string | null;
  order_id: string;
  product_id: number;
  products: {
    id: number;
    title: string;
    price: string | null;
    images: string[];
    category: string;
    description: string | null;
    demo_url: string | null;
    features: string[] | null;
    tech_stack: string[] | null;
  };
  orders?: {
    id: string;
    total_amount: number;
    discount_amount: number | null;
    tax_amount: number | null;
    completed_at: string | null;
    created_at: string | null;
    status: string | null;
  };
}

interface OrderDetailData {
  items: OrderItem[];
  orderInfo: OrderItem['orders'];
}

function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const supabase = createClient();
  const [orderDetail, setOrderDetail] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const [forceRender, setForceRender] = useState(0);
  // Enhanced logging to show product details (move inside useEffect to avoid infinite loop)
  const [allProductsInfo, setAllProductsInfo] = useState<any[]>([]);
  
  useEffect(() => {
    console.log("reviewedProducts: ", Array.from(reviewedProducts));
    if (orderDetail && orderDetail.items.length > 0) {
      const reviewedProductsInfo = Array.from(reviewedProducts).map(key => {
        const [orderId, productIdStr] = key.split(':');
        const productId = parseInt(productIdStr);
        const product = orderDetail.items.find(item => 
          item.order_id === orderId && item.product_id === productId
        );
        return {
          key,
          orderId,
          productId,
          productName: product?.products.title || 'Unknown Product',
          isReviewed: true
        };
      });
      console.log("Reviewed Products with Details:", reviewedProductsInfo);
      
      const productsInfo = orderDetail.items.map(item => ({
        orderId: item.order_id,
        productId: item.product_id,
        productName: item.products.title,
        key: `${item.order_id}:${item.product_id}`,
        isReviewed: reviewedProducts.has(`${item.order_id}:${item.product_id}`)
      }));
      console.log("All Products in Order:", productsInfo);
      setAllProductsInfo(productsInfo);
      
      // Force re-render to ensure UI updates
      setForceRender(prev => prev + 1);
    }
  }, [reviewedProducts, orderDetail]);
  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  // Debug: Monitor reviewedProducts changes
  useEffect(() => {
    console.log("reviewedProducts state changed:", Array.from(reviewedProducts));
    if (orderDetail && orderDetail.items.length > 0) {
      const allProductsInfo = orderDetail.items.map(item => ({
        orderId: item.order_id,
        productId: item.product_id,
        productName: item.products.title,
        key: `${item.order_id}:${item.product_id}`,
        isReviewed: reviewedProducts.has(`${item.order_id}:${item.product_id}`)
      }));
      console.log("All Products Status (after state change):", allProductsInfo);
    }
  }, [reviewedProducts, orderDetail]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("Anda harus login untuk melihat detail pesanan");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price_at_purchase,
          subtotal,
          created_at,
          order_id,
          product_id,
          products (
            id,
            title,
            price,
            images,
            category,
            description,
            demo_url,
            features,
            tech_stack
          ),
          orders!inner (
            id,
            total_amount,
            discount_amount,
            tax_amount,
            completed_at,
            created_at,
            status
          )
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching order detail:', error);
        setError("Pesanan tidak ditemukan atau Anda tidak memiliki akses");
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const orderInfo = data[0].orders;
        const orderData: OrderDetailData = {
          items: data as OrderItem[],
          orderInfo: orderInfo
        };
        setOrderDetail(orderData);
        
        // Fetch review status for all products
        await fetchReviewStatuses(orderData.items);
      } else {
        setError("Pesanan tidak ditemukan atau Anda tidak memiliki akses");
      }

    } catch (error) {
      console.error('Error:', error);
      setError("Terjadi kesalahan saat memuat detail pesanan");
    } finally {
      setLoading(false);
    }
  };

  // Check if user has reviewed specific product
  const checkReviewStatus = async (productId: number, orderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('No user found for review check');
        return false;
      }

      console.log(`Checking review for user: ${user.id}, product: ${productId}, order: ${orderId}`);

      // Check if user has already reviewed this product from this specific order
      const { data: existingReview, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) {
        console.error('Error checking review status:', error);
        return false;
      }

      console.log(`Review found:`, !!existingReview);
      return !!existingReview;
    } catch (error) {
      console.error('Error checking review status:', error);
      return false;
    }
  };

  // Fetch review status for all products in order
  const fetchReviewStatuses = async (items: OrderItem[]) => {
    console.log('Fetching review statuses for items:', items.map(item => ({
      order_id: item.order_id,
      product_id: item.product_id,
      title: item.products.title
    })));
    
    const reviewStatuses = new Set<string>();

    for (const item of items) {
      console.log(`Processing item: ${item.products.title} (Order: ${item.order_id}, Product: ${item.product_id})`);
      const hasReviewed = await checkReviewStatus(item.product_id, item.order_id);
      if (hasReviewed) {
        const reviewKey = `${item.order_id}:${item.product_id}`;
        reviewStatuses.add(reviewKey);
        console.log(`✅ Product ${item.product_id} from order ${item.order_id} has been reviewed`);
      } else {
        console.log(`❌ Product ${item.product_id} from order ${item.order_id} has NOT been reviewed`);
      }
    }

    console.log('Final reviewed products set:', Array.from(reviewStatuses));
    setReviewedProducts(reviewStatuses);
  };

  const handleReviewSubmitted = (productId?: number, orderId?: string) => {
    console.log(`Review submitted for product: ${productId}, order: ${orderId}`);
    
    // Find product name for better logging
    const product = orderDetail?.items.find(item => 
      item.product_id === productId && item.order_id === orderId
    );
    const productName = product?.products.title || 'Unknown Product';
    
    // Only refresh the review list, don't refetch all review statuses
    setReviewRefreshTrigger(prev => prev + 1);

    if (productId && orderId) {
      const reviewKey = `${orderId}:${productId}`;
      console.log(`Adding to reviewed products: ${reviewKey} (${productName})`);
      setReviewedProducts(prev => {
        const newSet = new Set([...prev, reviewKey]);
        console.log('Updated reviewed products set:', Array.from(newSet));
        
        // Log detailed info
        if (orderDetail) {
          const reviewedProductsInfo = Array.from(newSet).map(key => {
            const [oid, pidStr] = key.split(':');
            const pid = parseInt(pidStr);
            const p = orderDetail.items.find(item => 
              item.order_id === oid && item.product_id === pid
            );
            return {
              key,
              productName: p?.products.title || 'Unknown Product',
              isReviewed: true
            };
          });
          console.log("Reviewed Products with Details:", reviewedProductsInfo);
        }
        
        // Force immediate re-render
        setForceRender(prev => prev + 1);
        
        return newSet;
      });
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'Selesai';
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'processing':
        return 'Diproses';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  if (error || !orderDetail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
        <Package className="w-24 h-24 mb-4" style={{ color: 'var(--text-muted)' }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Pesanan Tidak Ditemukan
        </h2>
        <p className="mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>
          {error || "Pesanan yang Anda cari tidak ditemukan"}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
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
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          <Link
            href="/my-orders"
            className="px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--text-inverse)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
          >
            Lihat Semua Pesanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Pesanan
          </button>
          
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Detail Pesanan
          </h1>
          {orderDetail.orderInfo && (
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>ID Pesanan: {orderDetail.orderInfo.id}</span>
              <span>•</span>
              <span>{orderDetail.orderInfo.created_at ? formatDate(orderDetail.orderInfo.created_at) : ''}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {orderDetail.items.map((item, index) => {
              // Find review status from allProductsInfo
              const productInfo = allProductsInfo.find(p => 
                p.orderId === item.order_id && p.productId === item.product_id
              );
              const isReviewed = productInfo?.isReviewed || false;
              const reviewKey = `${item.order_id}:${item.product_id}`;
              
              console.log(`UI Rendering - Product: ${item.products.title}, isReviewed: ${isReviewed}, from allProductsInfo: ${!!productInfo}`);
              
              return (
                <div key={`${item.id}-${reviewKey}-${forceRender}`} className="rounded-xl shadow-sm p-6" style={{ backgroundColor: 'var(--card-background)' }}>
                  <div className="flex gap-6 mb-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-48 h-48 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--border-muted)' }}>
                        <Image
                          src={item.products.images[0] || "https://placehold.co/300x300"}
                          alt={item.products.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        
                        {/* Quantity Badge */}
                        <div className="absolute top-2 left-2">
                          <div className="px-2 py-1 rounded-full text-xs font-medium" style={{
                            backgroundColor: 'var(--accent)',
                            color: 'var(--text-inverse)'
                          }}>
                            Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow">
                      <div className="mb-4">
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          {item.products.title}
                        </h2>
                        <p className="mb-2" style={{ color: 'var(--text-muted)' }}>
                          {item.products.category}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                            {formatPrice(Number(item.products.price))}
                          </div>
                          <div className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {formatPrice(item.price_at_purchase)}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/product/${item.product_id}`}
                          className="py-2 px-4 rounded-lg font-medium transition-colors"
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
                          Lihat Detail Produk
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {item.products.description && (
                    <div className="border-t pt-6" style={{ borderColor: 'var(--border-primary)' }}>
                      <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Deskripsi Produk</h3>
                      <div 
                        className="text-sm leading-relaxed prose prose-sm max-w-none"
                        style={{ color: 'var(--text-secondary)' }}
                        dangerouslySetInnerHTML={{ 
                          __html: item.products.description.replace(/&nbsp;/g, ' ') 
                        }}
                      />
                    </div>
                  )}

                  {/* Features */}
                  {item.products.features && item.products.features.length > 0 && (
                    <div className="border-t pt-6" style={{ borderColor: 'var(--border-primary)' }}>
                      <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Fitur Produk</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {item.products.features.map((feature: string, index: number) => (
                          <li key={index} style={{ color: 'var(--text-secondary)' }}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tech Stack */}
                  {item.products.tech_stack && item.products.tech_stack.length > 0 && (
                    <div className="border-t pt-6" style={{ borderColor: 'var(--border-primary)' }}>
                      <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Teknologi</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.products.tech_stack.map((tech: string, index: number) => (
                          <span
                            key={index}
                            className="text-xs px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: 'var(--accent-muted)',
                              color: 'var(--accent)'
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Section */}
                  <div className="border-t pt-6" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="space-y-6">
                      {/* Review Status */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          <Star className="w-5 h-5" />
                          Review Produk
                        </h3>
                        {isReviewed && (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium" style={{
                            backgroundColor: 'var(--success)',
                            color: 'var(--text-inverse)'
                          }}>
                            <Check className="w-4 h-4" />
                            Sudah Memberi Ulasan
                          </div>
                        )}
                      </div>

                      {/* Review Form */}
                      {!isReviewed && (
                        <div>
                          <ReviewForm
                            orderId={item.order_id}
                            productId={item.product_id}
                            onReviewSubmitted={() => handleReviewSubmitted(item.product_id, item.order_id)}
                          />
                        </div>
                      )}

                      {/* Review List */}
                      <div>
                        <ReviewList
                          productId={item.product_id}
                          refreshTrigger={reviewRefreshTrigger}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-xl shadow-sm p-6 sticky top-4" style={{ backgroundColor: 'var(--card-background)' }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Informasi Pesanan
              </h2>

              <div className="space-y-4">
                {/* Order Status */}
                <div>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Status Pesanan</h3>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium`} style={{
                    backgroundColor: orderDetail.orderInfo?.status === 'completed' ? 'var(--success)' : 
                                     orderDetail.orderInfo?.status === 'pending' ? 'var(--warning)' : 
                                     orderDetail.orderInfo?.status === 'processing' ? 'var(--info)' : 
                                     'var(--error)',
                    color: 'var(--text-inverse)'
                  }}>
                    {getStatusText(orderDetail.orderInfo?.status || 'pending')}
                  </div>
                </div>

                {/* Order Dates */}
                <div>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Tanggal</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Calendar className="w-4 h-4" />
                      <span>Dipesan: {orderDetail.orderInfo?.created_at ? formatDate(orderDetail.orderInfo.created_at) : '-'}</span>
                    </div>
                    {orderDetail.orderInfo?.completed_at && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <Package className="w-4 h-4" />
                        <span>Selesai: {formatDate(orderDetail.orderInfo.completed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Rincian Harga</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatPrice(orderDetail.orderInfo?.total_amount || 0)}
                      </span>
                    </div>
                    {orderDetail.orderInfo?.discount_amount && orderDetail.orderInfo.discount_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>Diskon</span>
                        <span className="font-medium" style={{ color: 'var(--success)' }}>
                          -{formatPrice(orderDetail.orderInfo.discount_amount)}
                        </span>
                      </div>
                    )}
                    {orderDetail.orderInfo?.tax_amount && orderDetail.orderInfo.tax_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>Pajak</span>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {formatPrice(orderDetail.orderInfo.tax_amount)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                      <div className="flex justify-between">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Total</span>
                        <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                          {formatPrice(orderDetail.orderInfo?.total_amount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order ID */}
                <div>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>ID Pesanan</h3>
                  <p className="text-sm font-mono p-2 rounded" style={{ 
                    backgroundColor: 'var(--border-muted)',
                    color: 'var(--text-primary)'
                  }}>
                    {orderDetail.orderInfo?.id || orderDetail.items[0]?.order_id}
                  </p>
                </div>

                {/* Product Count */}
                <div>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Jumlah Produk</h3>
                  <p className="text-sm font-mono p-2 rounded" style={{ 
                    backgroundColor: 'var(--border-muted)',
                    color: 'var(--text-primary)'
                  }}>
                    {orderDetail.items.length} produk
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
