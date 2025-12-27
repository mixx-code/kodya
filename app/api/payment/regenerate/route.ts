// app/api/payment/regenerate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { oldOrderId, userId, userName, userEmail } = await request.json();

        // Cari transaksi lama
        const { data: oldTransaction } = await supabaseAdmin
            .from('topup_history')
            .select('amount, status')
            .eq('order_id', oldOrderId)
            .single();

        if (!oldTransaction) {
            return NextResponse.json(
                { error: 'Transaksi lama tidak ditemukan' },
                { status: 404 }
            );
        }

        // Update status transaksi lama menjadi "regenerated"
        await supabaseAdmin
            .from('topup_history')
            .update({
                status: 'regenerated',
                updated_at: new Date().toISOString()
            })
            .eq('order_id', oldOrderId);

        // Buat order_id baru
        const newOrderId = `TOPUP-${Date.now()}-${userId.split('-')[0]}`;

        // Buat transaksi baru di Midtrans
        const snap = new midtransClient.Snap({
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
            serverKey: process.env.MIDTRANS_SERVER_KEY || '',
            clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
        });

        const parameter = {
            transaction_details: {
                order_id: newOrderId,
                gross_amount: oldTransaction.amount,
            },
            customer_details: {
                first_name: userName,
                email: userEmail,
            },
            item_details: [
                {
                    id: 'TOPUP-01',
                    price: oldTransaction.amount,
                    quantity: 1,
                    name: 'Top Up Saldo',
                },
            ],
            callbacks: {
                finish: `/api/payment/notification`
            }
        };

        const transaction = await snap.createTransaction(parameter) as { token: string; redirect_url: string };

        // Simpan transaksi baru
        const { error: dbError } = await supabaseAdmin.from('topup_history').insert({
            user_id: userId,
            order_id: newOrderId,
            amount: oldTransaction.amount,
            status: 'pending',
            snap_token: transaction.token,
            notes: `Regenerated from ${oldOrderId}`
        });

        if (dbError) throw new Error(dbError.message);

        return NextResponse.json({
            token: transaction.token,
            redirectUrl: transaction.redirect_url,
            orderId: newOrderId
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Regenerate Payment Error:', errorMessage);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}