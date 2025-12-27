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


// --- Interfaces ---
interface SalesData {
  bulan: string;
  penjualan: number;
  transaksi: number;
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
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">
          {loading ? <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" /> : value}
        </h3>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
          <ArrowUpRight size={12} />
          {change}
        </div>
      </div>
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg shadow-current/20`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

// --- Main Component ---
export default function DashboardAdmin() {
  const [dbStats, setDbStats] = useState({ totalDanaAdmin: 0, totalUser: 0, totalProduct: 0, totalDeposit: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    async function fetchStats() {
      const stats = await getAdminStats();
      setDbStats(stats);
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Data Dummy untuk Chart & Tabel (Bisa dikonversi ke Action jika tabelnya sudah ada)
  const salesData: SalesData[] = [
    { bulan: 'Jan', penjualan: 4500000, transaksi: 45 },
    { bulan: 'Feb', penjualan: 5200000, transaksi: 52 },
    { bulan: 'Mar', penjualan: 4800000, transaksi: 48 },
    { bulan: 'Apr', penjualan: 6100000, transaksi: 61 },
    { bulan: 'Mei', penjualan: 7300000, transaksi: 73 },
    { bulan: 'Jun', penjualan: 6800000, transaksi: 68 },
  ];

  const transactions: Transaction[] = [
    { id: 'TRX001', user: 'Ahmad Rizki', produk: 'Website E-Commerce', jumlah: 2500000, status: 'Selesai', tanggal: '2024-12-20' },
    { id: 'TRX002', user: 'Siti Nur', produk: 'Landing Page Bisnis', jumlah: 1500000, status: 'Proses', tanggal: '2024-12-21' },
    { id: 'TRX003', user: 'Budi S', produk: 'UI Kit Mobile', jumlah: 800000, status: 'Selesai', tanggal: '2024-12-21' },
    // ... tambahkan data lain jika perlu
  ];

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const currentTransactions = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Insights</h1>
            <p className="text-slate-500 mt-1 font-medium">Laporan akumulasi saldo dan aktivitas platform.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="bg-emerald-500 p-3 rounded-xl text-white shadow-lg shadow-emerald-200">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Dana Masuk</p>
              <p className="text-xl font-bold text-slate-800">{loading ? '...' : formatRupiah(dbStats.totalDanaAdmin)}</p>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="mb-8">
          <Link href="/products/create" className="group flex w-56 items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200 active:scale-95">
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
            color="bg-emerald-500"
            change="Real-time"
            loading={loading}
          />
          <StatCard
            title="Total User"
            value={dbStats.totalUser}
            icon={Users}
            color="bg-orange-500"
            change="+12% bln ini"
            loading={loading}
          />
          <StatCard
            title="Total Produk"
            value={dbStats.totalProduct}
            icon={Package}
            color="bg-purple-500"
            change="Aktif"
            loading={loading}
          />
          <StatCard
            title="Penjualan"
            value="Rp 34.7M"
            icon={TrendingUp}
            color="bg-blue-500"
            change="+8.2%"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Pertumbuhan Deposit</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val) => formatRupiah(Number(val))}
                />
                <Line type="monotone" dataKey="penjualan" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Volume Transaksi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="transaksi" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Transaksi Terbaru</h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-400 group-hover:text-blue-600">{trx.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{trx.user}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{trx.produk}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatRupiah(trx.jumlah)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${trx.status === 'Selesai' ? 'bg-emerald-100 text-emerald-600' :
                          trx.status === 'Proses' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                        }`}>
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