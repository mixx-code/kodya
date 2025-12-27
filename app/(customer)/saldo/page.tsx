"use client";
import { useState, useEffect } from 'react';
import { CirclePlus, Wallet, ArrowDownRight, History, Loader2, AlertCircle, CreditCard, ChevronDown } from 'lucide-react';
import PaymentModal from '@/app/components/paymentModal';
import { createClient } from '@/lib/supabase-client';
import { Tables } from '@/types/supabase';
import { useAuth } from '@/hooks/useSupabase';

type SaldoRow = Tables<'saldo'>;
type TopupHistoryRow = Tables<'topup_history'>;

function Saldo() {
    const { user, loading: authLoading, error: authError } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saldo, setSaldo] = useState<SaldoRow | null>(null);
    const [topupHistory, setTopupHistory] = useState<TopupHistoryRow[]>([]);
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

            // 2. Ambil Riwayat dengan Cursor
            let query = supabase
                .from('topup_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(itemsPerPage + 1); // Ambil lebih 1 untuk cek "hasMore"

            if (!isInitial && topupHistory.length > 0) {
                const lastCursor = topupHistory[topupHistory.length - 1].created_at;
                if (lastCursor) {
                    query = query.lt('created_at', lastCursor);
                }
            }

            const { data: historyData, error: historyError } = await query;
            if (historyError) throw historyError;

            if (historyData) {
                const more = historyData.length > itemsPerPage;
                const resultData = more ? historyData.slice(0, itemsPerPage) : historyData;
                console.log("topupHistory: ", historyData);

                setTopupHistory(prev => isInitial ? resultData : [...prev, ...resultData]);
                setHasMore(more);
            }
        } catch (err) {
            setError('Gagal memuat data transaksi');
            console.error(err);
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
    const handlePayPending = async (transaction: TopupHistoryRow) => {
        setPayingOrderId(transaction.order_id);
        if (!window.snap) {
            alert('Sistem belum siap');
            setPayingOrderId(null);
            return;
        }

        window.snap.pay(transaction.snap_token || '', {
            onSuccess: () => window.location.href = '/saldo?payment=success',
            onPending: () => window.location.href = '/saldo?payment=pending',
            onError: () => setPayingOrderId(null),
            onClose: () => setPayingOrderId(null)
        });
    };

    // --- RENDER HELPERS ---
    const formatCurrency = (amount: number | null) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

    const getStatusStyle = (status: string | null) => {
        if (status === 'settlement' || status === 'success') return 'bg-emerald-100 text-emerald-700';
        if (status === 'pending') return 'bg-amber-100 text-amber-700';
        return 'bg-rose-100 text-rose-700';
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-bold text-slate-500">Sinkronisasi saldo...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Notification Toast */}
            {paymentNotification.type && (
                <div className="fixed top-6 inset-x-4 md:left-1/2 md:-translate-x-1/2 md:w-max z-[100] animate-in slide-in-from-top-4">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-bold border ${paymentNotification.type === 'success' ? 'bg-emerald-600 border-emerald-400' :
                            paymentNotification.type === 'pending' ? 'bg-amber-500 border-amber-400' : 'bg-rose-600 border-rose-400'
                        }`}>
                        {paymentNotification.message}
                        <button onClick={() => setPaymentNotification({ type: null, message: '' })}>✕</button>
                    </div>
                </div>
            )}

            {/* Blue Card Section */}
            <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-12 mb-10">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-200">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <p className="text-blue-100/70 text-xs font-black tracking-widest uppercase mb-2">Total Saldo Anda</p>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                                {formatCurrency(saldo?.amount || 0)}
                            </h1>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl"
                        >
                            <CirclePlus className="w-5 h-5" /> TOP UP SALDO
                        </button>
                    </div>
                    <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* History Section */}
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                            <History className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">Riwayat Transaksi</h2>
                    </div>
                </div>

                {topupHistory.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100">
                        <Wallet className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">Belum ada transaksi</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {topupHistory.map((trx) => (
                            <div key={trx.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className={`p-3 rounded-2xl h-fit ${trx.status === 'settlement' || trx.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            <ArrowDownRight className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800">Top Up Saldo</p>
                                            <p className="text-xs text-slate-400 font-bold mb-2">
                                                {trx.created_at ? new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                            </p>
                                            <span className="text-[10px] font-mono px-2 py-1 bg-slate-100 rounded text-slate-500">#{trx.order_id.slice(-10)}</span>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                                        <p className="text-lg font-black text-emerald-600">+{formatCurrency(trx.amount)}</p>
                                        <div className="flex items-center gap-2">
                                            {trx.status === 'pending' && (
                                                <button
                                                    onClick={() => handlePayPending(trx)}
                                                    disabled={payingOrderId === trx.order_id}
                                                    className="flex items-center gap-2 bg-blue-600 text-white p-1 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                >
                                                    {payingOrderId === trx.order_id ? <Loader2 className="w-3 h-3 animate-spin" /> :
                                                        <><CreditCard className="w-4 h-4" /> Bayar</>}
                                                </button>
                                            )}
                                            <span className={`text-[10px] font-black px-3 p-2 rounded-lg uppercase ${getStatusStyle(trx.status)}`}>
                                                {trx.status === 'settlement' || trx.status === 'success'
                                                    ? 'Berhasil'
                                                    : trx.status === 'expire'
                                                        ? 'Kedaluwarsa'
                                                        : 'Tertunda'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination Cursor */}
                        {hasMore && (
                            <button
                                onClick={() => fetchData(false)}
                                disabled={isLoadingMore}
                                className="w-full py-4 flex items-center justify-center gap-2 text-blue-600 font-black text-sm hover:bg-blue-50 rounded-2xl transition-colors border-2 border-dashed border-blue-100 mt-4"
                            >
                                {isLoadingMore ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>MUAT LEBIH BANYAK <ChevronDown className="w-4 h-4" /></>
                                )}
                            </button>
                        )}

                        {!hasMore && topupHistory.length > 0 && (
                            <p className="text-center text-slate-400 text-xs font-bold py-6">─── Akhir riwayat transaksi ───</p>
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