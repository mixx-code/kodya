import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MidtransNotification {
    transaction_time: string;
    transaction_status: string;
    transaction_id: string;
    status_message: string;
    status_code: string;
    signature_key: string;
    settlement_time?: string;
    payment_type: string;
    order_id: string;
    merchant_id: string;
    gross_amount: string;
    fraud_status?: string;
    currency?: string;
}

function verifySignature(notification: MidtransNotification): boolean {
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const { order_id, status_code, gross_amount, signature_key } = notification;

    const hash = crypto
        .createHash('sha512')
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest('hex');

    return hash === signature_key;
}

export async function POST(request: NextRequest) {
    try {
        const notification: MidtransNotification = await request.json();

        console.log('Received notification:', {
            order_id: notification.order_id,
            status: notification.transaction_status,
            amount: notification.gross_amount
        });

        // Verify signature
        if (!verifySignature(notification)) {
            console.error('Invalid signature for order:', notification.order_id);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 403 }
            );
        }

        const { order_id, transaction_status, payment_type, gross_amount } = notification;

        // Cek apakah transaksi ada di database
        const { data: existingTransaction, error: fetchError } = await supabaseAdmin
            .from('topup_history')
            .select('id, user_id, status, amount')
            .eq('order_id', order_id)
            .single();

        if (fetchError) {
            console.error('Error fetching transaction:', {
                order_id,
                error: fetchError.message
            });
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        if (!existingTransaction) {
            console.error('Transaction not found:', order_id);
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        console.log('Found transaction:', existingTransaction);

        // Mapping status
        let updateStatus = transaction_status;
        if (transaction_status === 'capture' || transaction_status === 'settlement') {
            updateStatus = 'success';
        } else if (transaction_status === 'pending') {
            updateStatus = 'pending';
        } else if (transaction_status === 'deny' || transaction_status === 'expire' || transaction_status === 'cancel') {
            updateStatus = 'failed';
        }

        // Update topup_history menggunakan ID sebagai primary key
        const { data: updateResult, error: updateError } = await supabaseAdmin
            .from('topup_history')
            .update({
                status: updateStatus,
                payment_type: payment_type,
                updated_at: new Date().toISOString()
            })
            .eq('id', existingTransaction.id) // Gunakan ID, bukan order_id
            .select();

        if (updateError) {
            console.error('Error updating transaction:', {
                id: existingTransaction.id,
                error: updateError.message
            });
            return NextResponse.json(
                { error: 'Failed to update transaction' },
                { status: 500 }
            );
        }

        console.log('Transaction updated:', updateResult);

        // Update saldo jika pembayaran berhasil
        if (updateStatus === 'success' && existingTransaction.status !== 'success') {
            const userId = existingTransaction.user_id;
            const amount = parseInt(gross_amount);

            // Gunakan transaksi untuk atomic update
            const { data: saldoUpdate, error: saldoError } = await supabaseAdmin
                .rpc('increment_saldo', {
                    user_id: userId,
                    amount: amount
                });

            // Jika tidak ada function, gunakan query langsung
            if (saldoError?.message?.includes('function') || !saldoUpdate) {
                // Fallback: update manual
                const { data: currentSaldo, error: fetchSaldoError } = await supabaseAdmin
                    .from('saldo')
                    .select('amount')
                    .eq('user_id', userId)
                    .single();

                if (fetchSaldoError && fetchSaldoError.code !== 'PGRST116') {
                    console.error('Error fetching saldo:', fetchSaldoError);
                }

                const currentAmount = currentSaldo?.amount || 0;
                const newAmount = currentAmount + amount;

                const { error: upsertError } = await supabaseAdmin
                    .from('saldo')
                    .upsert({
                        user_id: userId,
                        amount: newAmount,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id'
                    });

                if (upsertError) {
                    console.error('Error updating saldo:', upsertError);
                } else {
                    console.log(`Saldo updated for user ${userId}: ${currentAmount} -> ${newAmount}`);
                }
            }

            console.log(`Payment successful for order ${order_id}, user ${userId}, amount ${amount}`);
        }

        return NextResponse.json({
            success: true,
            message: 'Notification processed successfully',
            order_id,
            status: updateStatus
        });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
// GET endpoint untuk handling redirect dari Midtrans
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const order_id = searchParams.get('order_id');
    const transaction_status = searchParams.get('transaction_status');
    const status_code = searchParams.get('status_code');

    console.log('Redirect received:', { order_id, transaction_status, status_code });

    // Redirect user ke halaman saldo dengan pesan sukses
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
        return NextResponse.redirect(new URL('/saldo?payment=success', request.url));
    } else if (transaction_status === 'pending') {
        return NextResponse.redirect(new URL('/saldo?payment=pending', request.url));
    } else {
        return NextResponse.redirect(new URL('/saldo?payment=failed', request.url));
    }
}