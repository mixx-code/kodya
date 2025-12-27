'use client';

import { useState, useEffect } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useSupabase';

interface MidtransSnapResult {
    status_code: string;
    status_message: string;
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
}

interface SnapOptions {
    onSuccess?: (result: MidtransSnapResult) => void;
    onPending?: (result: MidtransSnapResult) => void;
    onError?: (result: MidtransSnapResult) => void;
    onClose?: () => void;
}

declare global {
    interface Window {
        snap?: {
            pay: (token: string, options: SnapOptions) => void;
        };
    }
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientKey: string;
}

export default function PaymentModal({ isOpen, onClose, clientKey }: PaymentModalProps) {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [snapLoaded, setSnapLoaded] = useState(false);

    // Ambil nama dengan aman (fallback ke 'Customer')
    const fullName = user?.user_metadata?.full_name ||
        user?.identities?.[0]?.identity_data?.full_name ||
        'Customer';

    useEffect(() => {
        if (isOpen && !snapLoaded) {
            const script = document.createElement('script');
            script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
            script.setAttribute('data-client-key', clientKey);
            script.async = true;
            script.onload = () => setSnapLoaded(true);
            document.body.appendChild(script);

            return () => {
                const existingScript = document.querySelector(`script[src="${script.src}"]`);
                if (existingScript) document.body.removeChild(existingScript);
            };
        }
    }, [isOpen, clientKey, snapLoaded]);

    const formatRupiah = (value: string) => {
        if (!value) return '';
        const number = value.replace(/\D/g, '');
        return new Intl.NumberFormat('id-ID').format(Number(number));
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setAmount(value);
        setError('');
    };

    const handleQuickAmount = (value: number) => {
        setAmount(value.toString());
        setError('');
    };

    const handlePayment = async () => {
        // Validasi minimal 10.000
        if (!amount || Number(amount) < 10000) {
            setError('Minimal top up Rp 10.000');
            return;
        }

        if (!user?.id) {
            setError('User tidak terautentikasi');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Number(amount),
                    customerDetails: {
                        full_name: fullName,
                        email: user.email,
                        id: user.id
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal membuat pembayaran');
            }

            // Tunggu window.snap tersedia
            let retries = 0;
            const maxRetries = 10;

            while (!window.snap && retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 300));
                retries++;
            }

            if (!window.snap) {
                throw new Error('Sistem pembayaran belum siap. Silakan refresh halaman.');
            }

            // Mark snap as opened
            await markSnapOpened(data.orderId);

            // Buka Snap Payment dengan redirect callbacks
            window.snap.pay(data.token, {
                onSuccess: (result: MidtransSnapResult) => {
                    console.log('Payment success:', result);
                    // Redirect ke halaman saldo dengan parameter success
                    window.location.href = '/saldo?payment=success';
                },
                onPending: (result: MidtransSnapResult) => {
                    console.log('Payment pending:', result);
                    // Redirect ke halaman saldo dengan parameter pending
                    window.location.href = '/saldo?payment=pending';
                },
                onError: (result: MidtransSnapResult) => {
                    console.error('Payment error:', result);
                    // Redirect ke halaman saldo dengan parameter failed
                    window.location.href = '/saldo?payment=failed';
                },
                onClose: () => {
                    console.log('Payment popup closed');
                    setLoading(false);
                }
            });

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
            setError(msg);
            setLoading(false);
        }
    };

    const markSnapOpened = async (orderId: string) => {
        try {
            await fetch('/api/payment/mark-opened', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId }),
            });
        } catch (error) {
            console.error('Error marking snap as opened:', error);
            // Non-critical error, continue with payment
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            {/* Overlay Glassmorphism */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden z-10 rounded-2xl"
            >
                {/* Header Section */}
                <div className="p-8 pb-4 text-center">
                    <div className="inline-flex p-3 bg-purple-100 rounded-2xl text-purple-600 mb-4">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-black tracking-tight">Nominal Bayar</h2>
                    <p className="text-black text-sm mt-1">Masukkan jumlah yang ingin Anda bayarkan</p>
                    <p className="text-black font-extrabold text-sm mt-1">Demo</p>
                </div>

                <div className="px-8 pb-8 space-y-8">
                    {/* Large Input Display */}
                    <div className="relative group text-center py-4">
                        <div className="inline-flex items-baseline gap-2 border-b-2 border-transparent group-focus-within:border-purple-500 transition-all duration-300">
                            <span className="text-2xl font-bold text-purple-500">Rp</span>
                            <input
                                type="text"
                                value={formatRupiah(amount)}
                                onChange={handleAmountChange}
                                placeholder="0"
                                disabled={loading}
                                maxLength={10}
                                className="bg-transparent text-2xl font-bold text-gray-900 outline-none w-full max-w-60 placeholder:text-gray-200"
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 text-xs font-semibold mt-3 bg-red-50 py-1 px-3 rounded-full inline-block"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Quick Select Chips */}
                    <div className="grid grid-cols-3 gap-2">
                        {[50000, 100000, 250000, 500000, 1000000, 2500000].map((val) => (
                            <button
                                key={val}
                                onClick={() => handleQuickAmount(val)}
                                disabled={loading}
                                className={`py-3 rounded-2xl text-[13px] font-bold transition-all active:scale-95 border ${amount === val.toString()
                                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200'
                                    : 'bg-white border-gray-100 text-gray-600 hover:border-purple-200 hover:bg-purple-50'
                                    }`}
                            >
                                {val >= 1000000 ? `${val / 1000000} Jt` : `${val / 1000} Rb`}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-2">
                        {/* Button Bayar: Blue Theme */}
                        <button
                            onClick={handlePayment}
                            disabled={loading || !amount || Number(amount) < 10000}
                            className="w-full h-14 py-4.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-200 disabled:bg-slate-200 disabled:text-slate-500 transition-all active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                            ) : (
                                <span className="text-white">Bayar Sekarang</span>
                            )}
                        </button>

                        {/* Button Batal: Red Theme */}
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold text-sm border border-red-100 transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer"
                        >
                            Batalkan Pembayaran
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}