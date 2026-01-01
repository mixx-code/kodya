"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Wallet,
  ShoppingBag,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Info,
  X,
  AlertTriangle
} from "lucide-react";
import { useDarkMode } from "../../contexts/DarkModeContext";

// Import tipe Database asli dari file types/supabase.ts
import { Database } from "@/types/supabase";
import { createClient } from "@/lib/supabase-client";

// Mapping tipe data dari skema Database
type Product = Database['public']['Tables']['products']['Row'];
type Cart = Database['public']['Tables']['cart']['Row'];
type Saldo = Database['public']['Tables']['saldo']['Row'];

// Definisi Join: Cart Item memiliki satu produk (bisa null jika produk dihapus dari katalog)
interface CartItem extends Cart {
  products: Product | null;
}

// Direct checkout item interface
interface DirectCheckoutItem {
  product: Product;
  quantity: number;
}

interface CheckoutResponse {
  success: boolean;
  message: string;
  order_id?: string;
  cart_items_processed?: boolean;
  direct_items_processed?: boolean;
}

export default function CheckoutPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode } = useDarkMode();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [directItem, setDirectItem] = useState<DirectCheckoutItem | null>(null);
  const [userSaldo, setUserSaldo] = useState<Saldo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState("");
  const [isDirectCheckout, setIsDirectCheckout] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    isConfirm?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    message: string;
  }>({ show: false, type: 'info', title: '', isConfirm: false, message: '', onConfirm: () => {}, onCancel: () => {} });

  useEffect(() => {
    const productId = searchParams.get('product_id');
    const quantity = searchParams.get('quantity');
    
    if (productId && quantity) {
      // Direct checkout mode
      setIsDirectCheckout(true);
      fetchDirectCheckoutData(productId, parseInt(quantity));
    } else {
      // Normal cart checkout mode
      setIsDirectCheckout(false);
      fetchCheckoutData();
    }
  }, [searchParams]);

  const fetchDirectCheckoutData = async (productId: string, quantity: number) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch product data
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', parseInt(productId))
        .single();

      if (productError || !product) {
        console.error('Product not found:', productError);
        router.push('/');
        return;
      }

      setDirectItem({ product, quantity });

      // Fetch saldo user
      const { data: saldo, error: saldoError } = await supabase
        .from('saldo')
        .select('*')
        .eq('id', user.id)
        .single();

      if (saldoError) {
        console.error('Error fetching saldo:', saldoError);
      } else {
        setUserSaldo(saldo);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckoutData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch keranjang dengan join produk
      const { data: cart, error: cartError } = await supabase
        .from('cart')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id);

      if (cartError) throw cartError;

      if (!cart || cart.length === 0) {
        router.push('/cart');
        return;
      }

      setCartItems(cart as unknown as CartItem[]);

      // Fetch saldo user
      const { data: saldo, error: saldoError } = await supabase
        .from('saldo')
        .select('*')
        .eq('id', user.id)
        .single();

      if (saldoError) {
        console.error('Error fetching saldo:', saldoError);
      } else {
        setUserSaldo(saldo);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper kalkulasi dengan konversi tipe data yang aman
  const calculateSubtotal = () => {
    if (isDirectCheckout && directItem) {
      const price = Number(directItem.product.price) || 0;
      return price * directItem.quantity;
    } else {
      return cartItems.reduce((total, item) => {
        const price = Number(item.products?.price) || 0;
        return total + (price * item.quantity);
      }, 0);
    }
  };

  const calculateTax = () => calculateSubtotal() * 0.11;
  const shippingCost = 10000;
  const calculateTotal = () => calculateSubtotal() + calculateTax() + shippingCost;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlert({ show: true, type, title, message });
  };

  const hideAlert = () => {
    setAlert({ show: false, type: 'info', title: '', message: '' });
  };

  const confirmAction = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlert({ 
        show: true, 
        type: 'info', 
        title, 
        message,
        isConfirm: true,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  };

  const handleCheckout = async () => {
    const total = calculateTotal();
    const currentSaldo = userSaldo?.amount || 0;

    if (currentSaldo < total) {
      showAlert('error', 'Saldo Tidak Mencukupi', `Saldo Anda kurang ${formatPrice(total - currentSaldo)}. Silakan top up terlebih dahulu.`);
      return;
    }

    const confirmed = await confirmAction(
      'Konfirmasi Pembayaran',
      `Apakah Anda yakin ingin melakukan pembayaran sebesar ${formatPrice(total)}?`
    );
    
    if (!confirmed) return;

    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Siapkan parameter untuk checkout_cart function
      let checkoutParams: any = {
        p_user_id: user.id,
        p_shipping_address: 'Digital Product / Default Address',
        p_recipient_name: user.email?.split('@')[0] || 'Customer',
        p_recipient_phone: '-',
        p_notes: notes || null
      };

      // Jika direct checkout, tambahkan p_direct_products
      if (isDirectCheckout && directItem) {
        checkoutParams.p_direct_products = [
          {
            product_id: String(directItem.product.id), // Convert ke string untuk JSONB
            quantity: directItem.quantity
          }
        ];
      } else {
        // Jika cart checkout, set p_direct_products ke null
        checkoutParams.p_direct_products = null;
      }

      // Panggil fungsi checkout_cart
      const { data, error } = await supabase.rpc('checkout_cart', checkoutParams);

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      const response = data as unknown as CheckoutResponse;
      
      if (response.success) {
        showAlert(
          'success', 
          'Pembayaran Berhasil!', 
          'Transaksi Anda telah berhasil diproses. Akses produk akan segera tersedia.'
        );
        
        // Redirect ke halaman my-orders setelah 2 detik
        setTimeout(() => {
          router.push('/my-orders');
        }, 2000);
      } else {
        showAlert(
          'error', 
          'Checkout Gagal', 
          response.message || 'Terjadi kesalahan saat memproses transaksi.'
        );
      }

    } catch (error) {
      console.error('Checkout error:', error);
      showAlert(
        'error', 
        'Terjadi Kesalahan', 
        (error as Error).message || 'Gagal memproses transaksi. Silakan coba lagi.'
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  const total = calculateTotal();
  const currentSaldo = userSaldo?.amount || 0;
  const isSaldoSufficient = currentSaldo >= total;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent', color: 'var(--icon-secondary)' }}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Checkout</h1>
            <p className="text-gray-600" style={{ color: 'var(--text-secondary)' }}>Selesaikan pembayaran untuk mendapatkan akses produk</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri: Detail & Pembayaran */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Informasi Saldo */}
            <div className={`rounded-xl shadow-sm p-6 border-2 ${isSaldoSufficient ? 'border-success' : 'border-error'}`} style={{ 
              backgroundColor: 'var(--card-background)',
              borderColor: isSaldoSufficient ? 'var(--success)' : 'var(--error)'
            }}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${isSaldoSufficient ? 'bg-success' : 'bg-error'}`} style={{
                  backgroundColor: isSaldoSufficient ? 'var(--success)' : 'var(--error)'
                }}>
                  <Wallet className={`w-6 h-6 ${isSaldoSufficient ? 'text-inverse' : 'text-error'}`} style={{
                    color: 'var(--text-inverse)'
                  }} />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Saldo Dompet Anda</h3>
                  <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{formatPrice(currentSaldo)}</p>
                  {!isSaldoSufficient && (
                    <div className="flex items-center gap-2 text-sm mt-2" style={{ color: 'var(--error)' }}>
                      <AlertCircle className="w-4 h-4" />
                      <span>Butuh top up {formatPrice(total - currentSaldo)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* List Item Keranjang */}
            <div className="rounded-xl shadow-sm p-6" style={{ backgroundColor: 'var(--card-background)' }}>
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {isDirectCheckout ? 'Detail Produk' : 'Daftar Produk'}
                </h2>
              </div>

              <div className="space-y-6">
                {isDirectCheckout && directItem ? (
                  <div className="border border-gray-100 rounded-xl p-4 flex gap-4" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--border-muted)' }}>
                      <Image
                        src={directItem.product.images?.[0] || "https://placehold.co/200x200"}
                        alt={directItem.product.title || "Product"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{directItem.product.title}</h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Jumlah: {directItem.quantity}</p>
                      <p className="font-bold mt-1" style={{ color: 'var(--accent)' }}>{formatPrice(Number(directItem.product.price))}</p>
                    </div>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    if (!item.products) return null;
                    return (
                      <div key={item.id} className="border border-gray-100 rounded-xl p-4 flex gap-4" style={{ borderColor: 'var(--border-primary)' }}>
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--border-muted)' }}>
                          <Image
                            src={item.products.images?.[0] || "https://placehold.co/200x200"}
                            alt={item.products.title || "Product"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.products.title}</h3>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Jumlah: {item.quantity}</p>
                          <p className="font-bold mt-1" style={{ color: 'var(--accent)' }}>{formatPrice(Number(item.products.price))}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Catatan */}
            <div className="rounded-xl shadow-sm p-6" style={{ backgroundColor: 'var(--card-background)' }}>
              <h3 className="font-bold mb-3 text-sm uppercase" style={{ color: 'var(--text-primary)' }}>Catatan Pesanan</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan pesan jika perlu..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all resize-none"
                style={{
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--card-background)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Biaya */}
          <div className="lg:col-span-1">
            <div className="rounded-xl shadow-sm p-6 sticky top-4 border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-primary)' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Ringkasan Biaya</h2>
              
              <div className="space-y-3 text-sm pb-4 border-b" style={{ color: 'var(--text-secondary)', borderBottomColor: 'var(--border-muted)' }}>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak (11%)</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatPrice(calculateTax())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Layanan</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatPrice(shippingCost)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{formatPrice(total)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processing || !isSaldoSufficient}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  isSaldoSufficient 
                    ? 'shadow-lg transform hover:scale-105' 
                    : 'cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: isSaldoSufficient ? 'var(--success)' : 'var(--border-muted)',
                  color: isSaldoSufficient ? 'var(--text-inverse)' : 'var(--text-muted)',
                  boxShadow: isSaldoSufficient ? 'var(--card-shadow)' : 'none'
                }}
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {processing ? 'Memproses...' : 'Bayar Sekarang'}
              </button>

              {!isSaldoSufficient && (
                <button
                  onClick={() => router.push('/topup')}
                  className="w-full mt-3 py-3 rounded-xl font-bold transition-colors transform hover:scale-105"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--accent)',
                    borderColor: 'var(--accent)',
                    borderWidth: '2px'
                  }}
                >
                  Top Up Saldo
                </button>
              )}

              <div className="mt-6 flex gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-muted)' }}>
                <Info className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--accent)' }}>
                  Akses produk digital akan diberikan secara otomatis ke akun Anda setelah transaksi diverifikasi oleh sistem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Alert Modal */}
      {alert.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100"
            style={{ 
              backgroundColor: 'var(--card-background)',
              border: `2px solid ${
                alert.type === 'success' ? 'var(--success)' :
                alert.type === 'error' ? 'var(--error)' :
                alert.type === 'warning' ? 'var(--warning)' :
                'var(--info)'
              }`
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="p-2 rounded-full"
                style={{
                  backgroundColor: 
                    alert.type === 'success' ? 'var(--success)' :
                    alert.type === 'error' ? 'var(--error)' :
                    alert.type === 'warning' ? 'var(--warning)' :
                    'var(--info)'
                }}
              >
                {alert.type === 'success' && <CheckCircle className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />}
                {alert.type === 'error' && <AlertCircle className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />}
                {alert.type === 'warning' && <AlertTriangle className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />}
                {alert.type === 'info' && <Info className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />}
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                  {alert.title}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {alert.message}
                </p>
                
                {(alert as any).isConfirm ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        (alert as any).onCancel?.();
                        hideAlert();
                      }}
                      className="px-4 py-2 rounded-lg font-semibold transition-colors"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--text-secondary)',
                        border: `1px solid var(--border-primary)`
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => {
                        (alert as any).onConfirm?.();
                        hideAlert();
                      }}
                      className="px-4 py-2 rounded-lg font-semibold transition-colors"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--text-inverse)'
                      }}
                    >
                      Ya, Lanjutkan
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={hideAlert}
                    className="px-4 py-2 rounded-lg font-semibold transition-colors"
                    style={{
                      backgroundColor: 
                        alert.type === 'success' ? 'var(--success)' :
                        alert.type === 'error' ? 'var(--error)' :
                        alert.type === 'warning' ? 'var(--warning)' :
                        'var(--info)',
                      color: 'var(--text-inverse)'
                    }}
                  >
                    OK
                  </button>
                )}
              </div>
              <button
                onClick={hideAlert}
                className="p-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}