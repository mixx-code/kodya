// app\(customer)\cart\page.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { useCart } from "@/app/contexts/CartContext";
import Alert from "@/app/components/Alert";
import { useAlert } from "@/hooks/useAlert";

interface CartItem {
  id: string;
  product_id: number;
  quantity: number;
  created_at: string;
  products: {
    id: number;
    title: string;
    price: string;
    images: string[];
    category: string;
  };
}

const ITEMS_PER_PAGE = 5;

function Cart() {
  const supabase = createClient();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [previousCursors, setPreviousCursors] = useState<(string | null)[]>([]);
  const { removeFromCart: removeFromCartContext, updateCartCount } = useCart();
  const { alert, showAlert, showConfirm, hideAlert } = useAlert();

  useEffect(() => {
    fetchCartItems();
  }, [cursor]);

  useEffect(() => {
    updateCartCount();
  }, [cartItems]);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from('cart')
        .select(`
                    id,
                    product_id,
                    quantity,
                    created_at,
                    products (
                        id,
                        title,
                        price,
                        images,
                        category
                    )
                `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(ITEMS_PER_PAGE + 1); // Fetch 1 extra to check if there's more

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cart:', error);
        setLoading(false);
        return;
      }

      // Check if there are more items
      if (data && data.length > ITEMS_PER_PAGE) {
        setHasMore(true);
        setCartItems(data.slice(0, ITEMS_PER_PAGE) as CartItem[]);
      } else {
        setHasMore(false);
        setCartItems((data || []) as CartItem[]);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(cartId);
    try {
      const { error } = await supabase
        .from('cart')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId);

      if (error) {
        console.error('Error updating quantity:', error);
        showAlert('error', 'Gagal', 'Gagal memperbarui jumlah produk');
        return;
      }

      // Update local state
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === cartId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUpdating(null);
    }
  };

  const removeFromCart = async (cartId: string) => {
    const confirmed = await showConfirm(
      'Hapus Produk',
      'Apakah Anda yakin ingin menghapus produk ini dari keranjang?'
    );

    if (!confirmed) return;

    setUpdating(cartId);
    try {
      await removeFromCartContext(cartId);

      // Remove from local state
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartId));
      showAlert('success', 'Berhasil', 'Produk berhasil dihapus dari keranjang');

    } catch (error) {
      console.error('Error:', error);
      showAlert('error', 'Gagal', 'Gagal menghapus produk dari keranjang');
    } finally {
      setUpdating(null);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (Number(item.products.price) * item.quantity);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleNextPage = () => {
    if (!hasMore || cartItems.length === 0) return;

    const lastItem = cartItems[cartItems.length - 1];
    setPreviousCursors([...previousCursors, cursor]);
    setCursor(lastItem.created_at);
  };

  const handlePreviousPage = () => {
    if (previousCursors.length === 0) return;

    const newCursors = [...previousCursors];
    const prevCursor = newCursors.pop();
    setPreviousCursors(newCursors);
    setCursor(prevCursor || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <ShoppingBag className="w-24 h-24 mb-4" style={{ color: 'var(--icon-muted)' }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Keranjang Kosong
        </h2>
        <p className="mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>
          Belum ada produk di keranjang Anda
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg font-semibold transition-colors"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--text-inverse)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Keranjang Belanja
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {cartItems.length} produk di keranjang Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6 border"
                style={{
                  backgroundColor: 'var(--card-background)',
                  color: 'var(--card-foreground)',
                  borderColor: 'var(--card-border)',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    href={`/product/${item.product_id}`}
                    className="flex-shrink-0"
                  >
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border" style={{ backgroundColor: 'var(--border-muted)', borderColor: 'var(--border-secondary)' }}>
                      <Image
                        src={item.products.images[0] || "https://placehold.co/200x200"}
                        alt={item.products.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link
                          href={`/product/${item.product_id}`}
                          className="font-semibold hover:underline transition-colors line-clamp-2 text-lg"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {item.products.title}
                        </Link>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                          {item.products.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                      {/* Price */}
                      <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                        {formatPrice(Number(item.products.price))}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border rounded-lg shadow-sm" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-secondary)' }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id || item.quantity <= 1}
                            className="p-2 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            style={{ backgroundColor: 'transparent', border: 'none' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-muted)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Minus className="w-4 h-4" style={{ color: 'var(--icon-primary)' }} />
                          </button>
                          <span className="w-12 text-center font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id}
                            className="p-2 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            style={{ backgroundColor: 'transparent', border: 'none' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-muted)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Plus className="w-4 h-4" style={{ color: 'var(--icon-primary)' }} />
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          disabled={updating === item.id}
                          className="p-2 rounded-lg transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
                          style={{ color: 'var(--error)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--error)20'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {formatPrice(Number(item.products.price) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between rounded-xl shadow-sm p-4 border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
              <button
                onClick={handlePreviousPage}
                disabled={previousCursors.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--border-muted)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--border-secondary)')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--border-muted)')}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Page {previousCursors.length + 1}
              </span>

              <button
                onClick={handleNextPage}
                disabled={!hasMore}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--border-muted)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--border-secondary)')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--border-muted)')}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl shadow-sm p-6 sticky top-4 border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Ringkasan Belanja
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                  <span>Pajak (11%)</span>
                  <span>{formatPrice(calculateTotal() * 0.11)}</span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                  <span>Ongkir</span>
                  <span>{formatPrice(10000)}</span>
                </div>
                <div className="pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Total
                    </span>
                    <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                      {formatPrice(calculateTotal() + (calculateTotal() * 0.11) + 10000)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-inverse)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                Lanjut ke Checkout
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/"
                className="w-full mt-3 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 border"
                style={{
                  backgroundColor: 'var(--border-muted)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--border-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--border-muted)';
                }}
              >
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Custom Alert Modal */}
      <Alert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isConfirm={alert.isConfirm}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        onClose={hideAlert}
      />
    </div>
  );
}

export default Cart;