import { NextRequest, NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { createClient } from '@supabase/supabase-js';

interface CustomerDetails {
    id: string;
    full_name: string;
    email: string;
}

interface PaymentRequest {
    amount: number;
    customerDetails: CustomerDetails;
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body: PaymentRequest = await request.json();
        const { amount, customerDetails } = body;

        if (!amount || amount < 10000) {
            return NextResponse.json(
                { error: 'Minimal top up adalah Rp 10.000' },
                { status: 400 }
            );
        }

        const orderId = `TOPUP-${Date.now()}-${customerDetails.id.split('-')[0]}`;

        const snap = new midtransClient.Snap({
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
            serverKey: process.env.MIDTRANS_SERVER_KEY || '',
            clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
        });

        // Get base URL from request
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host') || 'localhost:3000';
        const baseUrl = `${protocol}://${host}`;

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            customer_details: {
                first_name: customerDetails.full_name,
                email: customerDetails.email,
            },
            item_details: [
                {
                    id: 'TOPUP-01',
                    price: amount,
                    quantity: 1,
                    name: 'Top Up Saldo',
                },
            ],
            enabled_payments: [
                'credit_card',
                'mandiri_clickpay',
                'cimb_clicks',
                'bca_klikbca',
                'bca_klikpay',
                'bri_epay',
                'echannel',
                'permata_va',
                'bca_va',
                'bni_va',
                'bri_va',
                'other_va',
                'gopay',
                'indomaret',
                'alfamart',
                'danamon_online',
                'akulaku',
                'shopeepay',
                'qris'
            ],
            credit_card: {
                secure: true
            },
            callbacks: {
                finish: `${baseUrl}/saldo?payment=success`
            }
        };

        console.log('Creating payment with callback URL:', `${baseUrl}/saldo?payment=success`);

        const transaction = await snap.createTransaction(parameter) as { token: string; redirect_url: string };

        const { error: dbError } = await supabaseAdmin.from('topup_history').insert({
            user_id: customerDetails.id,
            order_id: orderId,
            amount: amount,
            status: 'pending',
            snap_token: transaction.token
        });

        if (dbError) {
            console.error('Database error:', dbError);
            throw new Error(dbError.message);
        }

        console.log('Payment created:', { orderId, token: transaction.token });

        return NextResponse.json({
            token: transaction.token,
            redirectUrl: transaction.redirect_url,
            orderId: orderId
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Payment Error:', errorMessage);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}