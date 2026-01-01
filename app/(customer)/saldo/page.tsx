"use client";
import { useState, useEffect } from 'react';
import { CirclePlus, Wallet, ArrowDownRight, ArrowUpRight, History, Loader2, AlertCircle, CreditCard, ChevronDown, X, CheckCircle, Clock } from 'lucide-react';
import PaymentModal from '@/app/components/paymentModal';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/hooks/useSupabase';
import { useDarkMode } from '@/app/contexts/DarkModeContext';
import { Database } from '@/types/supabase';

type SaldoRow = Database['public']['Tables']['saldo']['Row'];
type TopupHistoryRow = Database['public']['Tables']['topup_history']['Row'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];

// ... rest of the code remains the same ...
interface TransactionHistory {
    id: string;
    type: 'topup' | 'payment';
    amount: number;
    created_at: string | null;
    description: string;
    payment_method: string | null;
    status: string | null;
    order_id: string;
    snap_token?: string | null;
    user_id: string | null;
}

function Saldo() {
    const { user, loading: authLoading, error: authError } = useAuth();
    const { isDarkMode } = useDarkMode();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saldo, setSaldo] = useState<SaldoRow | null>(null);
    const [topupHistory, setTopupHistory] = useState<TransactionHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [paymentNotification, setPaymentNotification] = useState<{
        type: 'success' | 'pending' | 'failed' | null;
        message: string;
    }>({ type: null, message: '' });

    const itemsPerPage = 5;

    // --- LOGIKA FETCH DATA (CURSOR BASED) ---
    const fetchData = async (isInitial = true) => {
        if (!user) return;

        if (isInitial) setLoading(true);
        else setIsLoadingMore(true);

        const supabase = createClient();
        try {
            // 1. Ambil Saldo (Hanya saat load awal)
            if (isInitial) {
                const { data: saldoData } = await supabase.from('saldo').select('*').eq('id', user.id).maybeSingle();
                if (saldoData) setSaldo(saldoData);
                else setSaldo({ id: user.id, amount: 0, currency: 'IDR', last_transaction_at: null, updated_at: null });
            }

            // 2. Ambil Riwayat Top Up (Uang Masuk) dengan Cursor
            let topupQuery = supabase
                .from('topup_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(itemsPerPage + 1);

            if (!isInitial && topupHistory.length > 0) {
                // Find the last transaction's created_at from the current state
                const lastTransaction = topupHistory[topupHistory.length - 1];
                if (lastTransaction && lastTransaction.created_at) {
                    console.log('Using cursor from last transaction:', lastTransaction.created_at);
                    topupQuery = topupQuery.lt('created_at', lastTransaction.created_at);
                }
            }

            const { data: topupData, error: topupError } = await topupQuery;
            if (topupError) {
                console.error('Topup query error:', topupError);
                throw topupError;
            }
            console.log('Topup data:', topupData);

            // 3. Ambil Riwayat Pembayaran (Uang Keluar) dengan Cursor
            // Join payments with orders to get user-specific payments
            let paymentsQuery = supabase
                .from('payments')
                .select(`
                    *,
                    orders!inner(
                        user_id
                    )
                `)
                .eq('orders.user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(itemsPerPage + 1);

            if (!isInitial && topupHistory.length > 0) {
                // Find the last transaction's created_at from the current state
                const lastTransaction = topupHistory[topupHistory.length - 1];
                if (lastTransaction && lastTransaction.created_at) {
                    console.log('Using cursor from last transaction:', lastTransaction.created_at);
                    paymentsQuery = paymentsQuery.lt('created_at', lastTransaction.created_at);
                }
            }

            console.log('Payments query about to execute...');
            const { data: paymentsData, error: paymentsError } = await paymentsQuery;
            if (paymentsError) {
                console.error('Payments query error:', paymentsError);
                throw paymentsError;
            }
            console.log('Payments data:', paymentsData);

            // 4. Gabungkan dan format data
            const allTransactions: TransactionHistory[] = [];

            // Tambahkan transaksi top up (uang masuk)
            if (topupData) {
                topupData.forEach(item => {
                    allTransactions.push({
                        id: item.id,
                        type: 'topup' as const,
                        amount: item.amount, // Positif untuk uang masuk
                        description: 'Top Up Saldo',
                        payment_method: null,
                        status: item.status,
                        order_id: item.order_id,
                        snap_token: item.snap_token,
                        user_id: item.user_id,
                        created_at: item.created_at
                    });
                });
            }

            // Tambahkan transaksi pembayaran (uang keluar)
            if (paymentsData) {
                paymentsData.forEach(item => {
                    allTransactions.push({
                        id: item.id,
                        type: 'payment' as const,
                        amount: -item.amount, // Negatif untuk uang keluar
                        description: `Pembayaran - ${item.payment_method}`,
                        payment_method: item.payment_method,
                        status: item.status,
                        order_id: item.order_id,
                        snap_token: null,
                        user_id: user?.id || null, // Gunakan user_id dari auth user
                        created_at: item.created_at
                    });
                });
            }

            // 5. Urutkan berdasarkan created_at
            allTransactions.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            });

            // 6. Terapkan pagination
            const more = allTransactions.length > itemsPerPage;
            const resultData = more ? allTransactions.slice(0, itemsPerPage) : allTransactions;

            console.log("All transactions: ", allTransactions);
            console.log("Result data: ", resultData);

            setTopupHistory(prev => {
                // Combine existing data with new data
                const combined = isInitial ? resultData : [...prev, ...resultData];

                // Deduplikasi berdasarkan composite key untuk menghindari duplicate keys
                const unique = combined.filter((transaction, index, self) =>
                    index === self.findIndex((t) => `${t.type}-${t.id}` === `${transaction.type}-${transaction.id}`)
                );

                console.log("Combined transactions: ", combined);
                console.log("Unique transactions: ", unique);

                return unique;
            });
            setHasMore(more);
        } catch (err) {
            let errorMessage = 'Unknown error occurred';

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'object' && err !== null) {
                // Handle Supabase error objects
                errorMessage = JSON.stringify(err);
            } else if (typeof err === 'string') {
                errorMessage = err;
            }

            setError('Gagal memuat data transaksi');
            console.error('Error fetching transaction data:', errorMessage);
            console.error('Full error object:', err);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) fetchData(true);
    }, [user, authLoading]);

    // --- MIDTRANS SCRIPT LOADER & NOTIF HANDLER ---
    useEffect(() => {
        const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
        if (!midtransClientKey) return;

        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', midtransClientKey);
        document.body.appendChild(script);

        // Check URL for status
        const params = new URLSearchParams(window.location.search);
        const status = params.get('payment');
        if (status) {
            const msgs = {
                success: 'Pembayaran berhasil! Saldo ditambahkan.',
                pending: 'Pembayaran tertunda. Segera selesaikan!',
                failed: 'Pembayaran gagal dilakukan.'
            };
            setPaymentNotification({
                type: status as 'failed' | 'pending' | 'success',
                message: msgs[status as keyof typeof msgs] || ''
            });
            window.history.replaceState({}, '', '/saldo');
            setTimeout(() => setPaymentNotification({ type: null, message: '' }), 5000);
        }

        return () => { if (script.parentNode) script.parentNode.removeChild(script); };
    }, []);

    // --- PAYMENT HANDLERS ---
    const handlePayPending = async (transaction: TransactionHistory) => {
        if (transaction.type !== 'topup') return;

    // Check if snap is loaded, if not, load it first
        if (!window.snap) {
            const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
            if (!midtransClientKey) {
                alert('Konfigurasi pembayaran belum diatur. Silakan hubungi administrator.');
                setPayingOrderId(null);
                return;
            }

            // Load Snap script dynamically
            const script = document.createElement('script');
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', midtransClientKey);

            script.onload = () => {
                // Script loaded, now proceed with payment
                proceedWithPayment(transaction);
            };

            script.onerror = () => {
                alert('Gagal memuat sistem pembayaran. Silakan coba lagi.');
                setPayingOrderId(null);
            };

            document.body.appendChild(script);
        } else {
            // Snap already loaded, proceed directly
            proceedWithPayment(transaction);
        }
    };

    const proceedWithPayment = (transaction: TransactionHistory) => {
        setPayingOrderId(transaction.order_id);

        window.snap?.pay(transaction.snap_token || '', {
            onSuccess: () => window.location.href = '/saldo?payment=success',
            onPending: () => window.location.href = '/saldo?payment=pending',
            onError: () => {
                setPayingOrderId(null);
                alert('Pembayaran gagal. Silakan coba lagi.');
            },
            onClose: () => {
                setPayingOrderId(null);
            }
        });
    };

    // --- RENDER HELPERS ---
    const formatCurrency = (amount: number | null) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

    const getStatusStyle = (status: string | null) => {
        if (status === 'settlement' || status === 'success') return {
            backgroundColor: 'var(--success)',
            color: 'var(--text-inverse)'
        };
        if (status === 'pending') return {
            backgroundColor: 'var(--warning)',
            color: 'var(--text-inverse)'
        };
        return {
            backgroundColor: 'var(--error)',
            color: 'var(--text-inverse)'
        };
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}></div>
            <p className="mt-4 font-bold" style={{ color: 'var(--text-secondary)' }}>Sinkronisasi saldo...</p>
        </div>
    );

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--background)' }}>
            {/* Notification Toast */}
            {paymentNotification.type && (
                <div className="fixed top-6 inset-x-4 md:left-1/2 md:-translate-x-1/2 md:w-max z-[100] animate-in slide-in-from-top-4">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-bold border`} style={{
                        backgroundColor: paymentNotification.type === 'success' ? 'var(--success)' :
                            paymentNotification.type === 'pending' ? 'var(--warning)' : 'var(--error)',
                        borderColor: paymentNotification.type === 'success' ? 'var(--success-muted)' :
                            paymentNotification.type === 'pending' ? 'var(--warning-muted)' : 'var(--error-muted)'
                    }}>
                        {paymentNotification.message}
                        <button onClick={() => setPaymentNotification({ type: null, message: '' })}>✕</button>
                    </div>
                </div>
            )}

            {/* Blue Card Section */}
            <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-12 mb-10">
                <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 shadow-2xl" style={{
                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                    boxShadow: isDarkMode ? '0 20px 25px -5px rgba(0, 0, 0, 0.3)' : '0 20px 25px -5px rgba(96, 165, 250, 0.3)'
                }}>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: 'var(--text-inverse)', opacity: 0.7 }}>Total Saldo Anda</p>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight" style={{ color: 'var(--text-inverse)' }}>
                                {formatCurrency(saldo?.amount || 0)}
                            </h1>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl transform"
                            style={{
                                backgroundColor: 'var(--text-inverse)',
                                color: 'var(--accent)'
                            }}
                        >
                            <CirclePlus className="w-5 h-5" /> TOP UP SALDO
                        </button>
                    </div>
                    <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'var(--text-inverse)', opacity: 0.1 }}></div>
                </div>
            </div>

            {/* History Section */}
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--accent)' }}>
                            <History className="w-5 h-5" style={{ color: 'var(--text-inverse)' }} />
                        </div>
                        <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Riwayat Transaksi</h2>
                    </div>
                </div>

                {topupHistory.length === 0 ? (
                    <div className="rounded-[2rem] p-20 text-center" style={{ backgroundColor: 'var(--card-background)', border: `1px solid var(--border-primary)` }}>
                        <Wallet className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                        <p className="font-bold" style={{ color: 'var(--text-secondary)' }}>Belum ada transaksi</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {topupHistory.map((trx) => (
                            <div key={`${trx.type}-${trx.id}`} className="rounded-2xl p-5 border shadow-sm hover:border-blue-200 transition-all group" style={{
                                backgroundColor: 'var(--card-background)',
                                borderColor: 'var(--border-primary)'
                            }}>
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="p-3 rounded-2xl h-fit" style={{
                                            backgroundColor: trx.type === 'topup' ?
                                                (trx.status === 'settlement' || trx.status === 'success' ? 'var(--success-muted)' : 'var(--warning-muted)') :
                                                'var(--error-muted)',
                                            color: trx.type === 'topup' ?
                                                (trx.status === 'settlement' || trx.status === 'success' ? 'var(--success)' : 'var(--warning)') :
                                                'var(--error)'
                                        }}>
                                            {trx.type === 'topup' ?
                                                <ArrowDownRight className="w-6 h-6" /> :
                                                <ArrowUpRight className="w-6 h-6" />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-black" style={{ color: 'var(--text-primary)' }}>{trx.description}</p>
                                            {trx.payment_method && (
                                                <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                                                    Metode: {trx.payment_method}
                                                </p>
                                            )}
                                            <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                                                {trx.created_at ? new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                            </p>
                                            <span className="text-[10px] font-mono px-2 py-1 rounded" style={{
                                                backgroundColor: 'var(--border-muted)',
                                                color: 'var(--text-secondary)'
                                            }}>#{trx.order_id.slice(-10)}</span>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 pt-3 md:pt-0" style={{ borderColor: 'var(--border-primary)' }}>
                                        <p className="text-lg font-black" style={{
                                            color: trx.type === 'topup' ? 'var(--success)' : 'var(--error)'
                                        }}>
                                            {trx.type === 'topup' ? '+' : '-'}{formatCurrency(Math.abs(trx.amount))}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {trx.type === 'topup' && trx.status === 'pending' && (
                                                <button
                                                    onClick={() => handlePayPending(trx)}
                                                    disabled={payingOrderId === trx.order_id}
                                                    className="flex items-center gap-2 p-1 rounded-lg transition-colors disabled:opacity-50"
                                                    style={{
                                                        backgroundColor: 'var(--accent)',
                                                        color: 'var(--text-inverse)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (payingOrderId !== trx.order_id) {
                                                            e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'var(--accent)';
                                                    }}
                                                >
                                                    {payingOrderId === trx.order_id ? <Loader2 className="w-3 h-3 animate-spin" /> :
                                                        <><CreditCard className="w-4 h-4" /> Bayar</>}
                                                </button>
                                            )}
                                            <span className="text-[10px] font-black px-3 p-2 rounded-lg uppercase flex items-center gap-1" style={getStatusStyle(trx.status)}>
                                                {trx.status === 'settlement' || trx.status === 'success'
                                                    ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3" />
                                                            Berhasil
                                                        </>
                                                    )
                                                    : trx.status === 'expire'
                                                        ? (
                                                            <>
                                                                <X className="w-3 h-3" />
                                                                Kedaluwarsa
                                                            </>
                                                        )
                                                        : (
                                                            <>
                                                                <Clock className="w-3 h-3" />
                                                                Tertunda
                                                            </>
                                                        )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                            {/* Load More Button */}
                            {/* Load More Button */}
                        {hasMore && (
                            <button
                                onClick={() => fetchData(false)}
                                disabled={isLoadingMore}
                                    className="w-full py-4 flex items-center justify-center gap-2 font-black text-sm rounded-2xl transition-colors border-2 border-dashed mt-4 transform hover:scale-105"
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
                                    <>MUAT LEBIH BANYAK <ChevronDown className="w-4 h-4" /></>
                                )}
                            </button>
                        )}

                        {!hasMore && topupHistory.length > 0 && (
                                <p className="text-center text-xs font-bold py-6" style={{ color: 'var(--text-muted)' }}>
                                    ──── Akhir riwayat transaksi ────
                                </p>
                        )}
                    </div>
                )}
            </div>

            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                clientKey={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''}
            />
        </div>
    );

}

export default Saldo;