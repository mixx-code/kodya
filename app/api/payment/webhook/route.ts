import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Definisikan tipe data sesuai spesifikasi Midtrans
interface MidtransNotification {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
    transaction_status: string;
    payment_type: string;
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body: MidtransNotification = await request.json();
        console.log('🔔 Webhook received for Order:', body);

        // 1. Verifikasi Signature (Keamanan agar tidak sembarang orang bisa nembak API ini)
        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const hashed = crypto
            .createHash('sha512')
            .update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`)
            .digest('hex');

        if (hashed !== body.signature_key) {
            console.error('❌ Invalid Signature');
            return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
        }

        // 2. Tentukan status transaksi
        const status = body.transaction_status;
        const orderId = body.order_id;

        // 3. Get existing transaction data first
        const { data: existingTopup, error: fetchError } = await supabaseAdmin
            .from('topup_history')
            .select('user_id, amount, status')
            .eq('order_id', orderId)
            .single();

        if (fetchError || !existingTopup) {
            console.warn('⚠️ Order ID tidak terdaftar:', orderId);
            return NextResponse.json({ message: 'Order not found' }, { status: 200 });
        }

        // Prevent duplicate processing - jika sudah success, jangan proses lagi
        if (existingTopup.status === 'settlement' || existingTopup.status === 'capture' || existingTopup.status === 'success') {
            console.log('⚠️ Transaction already processed:', orderId);
            return NextResponse.json({ message: 'Already processed' }, { status: 200 });
        }

        // 4. Update tabel topup_history
        const { error: updateError } = await supabaseAdmin
            .from('topup_history')
            .update({
                status: status,
                payment_type: body.payment_type,
                updated_at: new Date().toISOString()
            })
            .eq('order_id', orderId);

        if (updateError) {
            console.error('❌ Database Update Error:', updateError.message);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 5. Jika status SETTLEMENT atau CAPTURE, tambahkan saldo ke user
        if (status === 'settlement' || status === 'capture') {
            console.log('✅ Payment success! Adding balance to user:', existingTopup.user_id);

            const { error: rpcError } = await supabaseAdmin.rpc('increment_saldo', {
                user_id_param: existingTopup.user_id,
                amount_param: existingTopup.amount
            });

            if (rpcError) {
                console.error('❌ RPC Error (Increment Saldo):', rpcError.message);
                return NextResponse.json({ error: rpcError.message }, { status: 500 });
            }
        }

        // 6. Handle expired transactions - mark as failed
        if (status === 'expire' || status === 'cancel' || status === 'deny') {
            console.log('⏰ Transaction expired/cancelled:', orderId);
        }

        return NextResponse.json({ message: 'Webhook Processed' }, { status: 200 });

    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('⚠️ Webhook Catch Error:', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}