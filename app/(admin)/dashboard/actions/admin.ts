// actions/admin.ts
"use server";
import { createClient } from "@/lib/supabase-server";

export async function getAdminStats() {
    const supabase = await createClient();

    // 1. Ambil Akumulasi Deposit (Topup History)
    const { data: topupData, error: topupError } = await supabase
        .from('topup_history')
        .select('amount')
        .eq('status', 'settlement');

    // 2. Ambil Total User
    const { count: userCount, error: userError } = await supabase
        .from('profiles') // Sesuaikan dengan nama tabel user/profile Anda
        .select('*', { count: 'exact', head: true });

    // 3. Ambil Total Produk
    const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    // 4. total saldo admin
    const { data: adminSaldos, error: saldoError } = await supabase
        .from('saldo')
        .select(`
            amount,
            profiles!inner (
                role
            )
        `)
        .eq('profiles.role', 'admin');

    // Hitung akumulasi saldo khusus akun admin
    const totalDanaAdmin = adminSaldos?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    if (topupError) console.error('Error topup:', topupError);

    const totalDeposit = topupData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    return {
        totalDanaAdmin,
        totalDeposit,
        totalUser: userCount || 0,
        totalProduct: productCount || 0,
    };
}