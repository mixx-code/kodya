import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID diperlukan' },
                { status: 400 }
            );
        }

        // Update waktu snap pertama kali dibuka
        const { data, error } = await supabaseAdmin
            .from('topup_history')
            .update({
                snap_opened_at: new Date().toISOString()
            })
            .eq('order_id', orderId)
            .is('snap_opened_at', null) // Hanya update jika belum pernah dibuka
            .select();

        if (error) {
            console.error('Error updating snap_opened_at:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Snap opened timestamp updated',
            data
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Mark Opened Error:', errorMessage);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}