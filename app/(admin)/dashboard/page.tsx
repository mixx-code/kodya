"use client"

import { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Plus,
  Wallet,
  ArrowUpRight,
  LucideIcon
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getAdminStats } from './actions/admin';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';

// --- Interfaces ---
interface SalesData {
  bulan: string;
  penjualan: number;
  transaksi: number;
}

interface OrderData {
  id: string;
  total_amount: number;
  created_at: string | null;
  status: string | null;
  profiles?: {
    full_name: string | null;
  } | null;
  order_items?: Array<{
    products?: {
      title: string | null;
    } | null;
  }> | null;
}

interface Transaction {
  id: string;
  user: string;
  produk: string;
  jumlah: number;
  status: 'Selesai' | 'Proses' | 'Pending';
  tanggal: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change: string;
  loading?: boolean;
}

// --- Sub-Component: Stat Card ---
const StatCard = ({ title, value, icon: Icon, color, change, loading }: StatCardProps) => (
  <div className="rounded-2xl p-6 border hover:shadow-md transition-all" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</p>
        <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {loading ? <div className="h-8 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--border-muted)' }} /> : value}
        </h3>
        <div className="flex items-center gap-1 text-xs font-semibold w-fit px-2 py-0.5 rounded-full" style={{ color: 'var(--success)', backgroundColor: 'var(--success)20' }}>
          <ArrowUpRight size={12} />
          {change}
        </div>
      </div>
      <div className="p-4 rounded-2xl shadow-lg" style={{ backgroundColor: color, color: 'var(--text-inverse)' }}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

// --- Main Component ---
export default function DashboardAdmin() {
  const supabase = createClient();
  const [dbStats, setDbStats] = useState({ totalDanaAdmin: 0, totalUser: 0, totalProduct: 0, totalDeposit: 0 });
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Fetch stats
        const stats = await getAdminStats();
        setDbStats(stats);

        // Fetch sales data from orders
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, created_at')
          .eq('status', 'completed')
          .order('created_at');

        // Process sales data by month
        const monthlyData = processMonthlySales(orders || []);
        setSalesData(monthlyData);

        // Fetch recent transactions
        const { data: recentOrders } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount,
            created_at,
            status,
            user_id
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch user profiles separately
        const userIds = recentOrders?.map(order => order.user_id).filter(Boolean) || [];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        // Fetch order items with products
        const orderIds = recentOrders?.map(order => order.id) || [];
        const { data: orderItems } = await supabase
          .from('order_items')
          .select(`
            order_id,
            quantity,
            subtotal,
            products!inner (
              title
            )
          `)
          .in('order_id', orderIds);

        // Combine the data
        const processedTransactions = recentOrders?.map(order => {
          const profile = profiles?.find(p => p.id === order.user_id);
          const orderItem = orderItems?.find(item => item.order_id === order.id);

          return {
            id: order.id,
            user: profile?.full_name || 'Unknown',
            produk: orderItem?.products?.title || 'Product',
            jumlah: order.total_amount,
            status: (order.status === 'completed' ? 'Selesai' : order.status === 'processing' ? 'Proses' : 'Pending') as 'Selesai' | 'Proses' | 'Pending',
            tanggal: order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : 'N/A'
          };
        }) || [];

        setTransactions(processedTransactions);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const processMonthlySales = (orders: any[]): SalesData[] => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyMap = new Map<string, { penjualan: number; transaksi: number }>();

    // Initialize all months with zero
    monthNames.forEach(month => {
      monthlyMap.set(month, { penjualan: 0, transaksi: 0 });
    });

    // Process orders
    orders.forEach(order => {
      if (order.created_at) {
        const month = new Date(order.created_at).toLocaleDateString('id-ID', { month: 'short' });
        const current = monthlyMap.get(month) || { penjualan: 0, transaksi: 0 };
        monthlyMap.set(month, {
          penjualan: current.penjualan + order.total_amount,
          transaksi: current.transaksi + 1
        });
      }
    });

    return Array.from(monthlyMap.entries()).map(([bulan, data]) => ({
      bulan,
      ...data
    }));
  };

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const currentTransactions = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Admin Insights</h1>
            <p className="mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>Laporan akumulasi saldo dan aktivitas platform.</p>
          </div>
          <div className="flex items-center gap-3 p-2 pr-6 rounded-2xl border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
            <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: 'var(--success)', color: 'var(--text-inverse)' }}>
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Dana Masuk</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{loading ? '...' : formatRupiah(dbStats.totalDanaAdmin)}</p>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="mb-8">
          <Link href="/admin/products/create" className="group flex w-56 items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all shadow-lg active:scale-95"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-inverse)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Tambah Produk Baru
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Deposit"
            value={formatRupiah(dbStats.totalDeposit)}
            icon={Wallet}
            color="var(--success)"
            change="Real-time"
            loading={loading}
          />
          <StatCard
            title="Total User"
            value={dbStats.totalUser}
            icon={Users}
            color="var(--warning)"
            change="+12% bln ini"
            loading={loading}
          />
          <StatCard
            title="Total Produk"
            value={dbStats.totalProduct}
            icon={Package}
            color="var(--info)"
            change="Aktif"
            loading={loading}
          />
          <StatCard
            title="Total Penjualan"
            value={formatRupiah(salesData.reduce((sum, data) => sum + data.penjualan, 0))}
            icon={TrendingUp}
            color="var(--primary)"
            change="+8.2%"
            loading={loading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="p-6 rounded-3xl border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
            <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Pertumbuhan Penjualan</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-muted)" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val) => formatRupiah(Number(val))}
                />
                <Line type="monotone" dataKey="penjualan" stroke="var(--primary)" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-6 rounded-3xl border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
            <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Volume Transaksi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-muted)" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'var(--border-muted)' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="transaksi" fill="var(--success)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-3xl border overflow-hidden" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
          <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-muted)' }}>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Transaksi Terbaru</h3>
            <button className="text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: 'var(--primary)' }}>Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                {currentTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:opacity-80 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>{trx.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{trx.user}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{trx.produk}</td>
                    <td className="px-6 py-4 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatRupiah(trx.jumlah)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${trx.status === 'Selesai' ? 'text-emerald-600' :
                        trx.status === 'Proses' ? 'text-amber-600' : 'text-rose-600'
                        }`} style={{
                          backgroundColor: trx.status === 'Selesai' ? 'var(--success)20' :
                            trx.status === 'Proses' ? 'var(--warning)20' : 'var(--error)20'
                        }}>
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}