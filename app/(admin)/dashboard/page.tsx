"use client"

import { useState } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, Plus, LucideIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface StatCard {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  change: string;
}

function DashboardAdmin() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage: number = 5;

  // Data rekap penjualan
  const salesData: SalesData[] = [
    { bulan: 'Jan', penjualan: 4500000, transaksi: 45 },
    { bulan: 'Feb', penjualan: 5200000, transaksi: 52 },
    { bulan: 'Mar', penjualan: 4800000, transaksi: 48 },
    { bulan: 'Apr', penjualan: 6100000, transaksi: 61 },
    { bulan: 'Mei', penjualan: 7300000, transaksi: 73 },
    { bulan: 'Jun', penjualan: 6800000, transaksi: 68 },
  ];

  // Data transaksi user
  const transactions: Transaction[] = [
    { id: 'TRX001', user: 'Ahmad Rizki', produk: 'Laptop Gaming', jumlah: 15000000, status: 'Selesai', tanggal: '2024-12-20' },
    { id: 'TRX002', user: 'Siti Nurhaliza', produk: 'iPhone 15 Pro', jumlah: 18000000, status: 'Proses', tanggal: '2024-12-21' },
    { id: 'TRX003', user: 'Budi Santoso', produk: 'Smart Watch', jumlah: 3500000, status: 'Selesai', tanggal: '2024-12-21' },
    { id: 'TRX004', user: 'Dewi Lestari', produk: 'Tablet Pro', jumlah: 8500000, status: 'Selesai', tanggal: '2024-12-22' },
    { id: 'TRX005', user: 'Eko Prasetyo', produk: 'Wireless Earbuds', jumlah: 2500000, status: 'Pending', tanggal: '2024-12-22' },
    { id: 'TRX006', user: 'Fitri Handayani', produk: 'Gaming Mouse', jumlah: 850000, status: 'Selesai', tanggal: '2024-12-23' },
    { id: 'TRX007', user: 'Gunawan Susilo', produk: 'Mechanical Keyboard', jumlah: 1200000, status: 'Selesai', tanggal: '2024-12-23' },
    { id: 'TRX008', user: 'Hesti Purnamasari', produk: 'Monitor 4K', jumlah: 5500000, status: 'Proses', tanggal: '2024-12-24' },
    { id: 'TRX009', user: 'Irfan Hakim', produk: 'External SSD 2TB', jumlah: 3200000, status: 'Selesai', tanggal: '2024-12-24' },
    { id: 'TRX010', user: 'Julia Perez', produk: 'Webcam HD', jumlah: 1500000, status: 'Selesai', tanggal: '2024-12-25' },
    { id: 'TRX011', user: 'Krisna Wijaya', produk: 'Gaming Chair', jumlah: 4500000, status: 'Pending', tanggal: '2024-12-25' },
    { id: 'TRX012', user: 'Linda Marlina', produk: 'Smart Speaker', jumlah: 2200000, status: 'Selesai', tanggal: '2024-12-25' },
  ];

  // Statistik cards
  const stats: StatCard[] = [
    { title: 'Total Penjualan', value: 'Rp 34.7M', icon: TrendingUp, color: 'bg-blue-500', change: '+12.5%' },
    { title: 'Total Transaksi', value: '347', icon: ShoppingCart, color: 'bg-green-500', change: '+8.3%' },
    { title: 'Total Produk', value: '156', icon: Package, color: 'bg-purple-500', change: '+3' },
    { title: 'Total User', value: '1,247', icon: Users, color: 'bg-orange-500', change: '+45' },
  ];

  // Pagination logic
  const totalPages: number = Math.ceil(transactions.length / itemsPerPage);
  const startIndex: number = (currentPage - 1) * itemsPerPage;
  const endIndex: number = startIndex + itemsPerPage;
  const currentTransactions: Transaction[] = transactions.slice(startIndex, endIndex);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const formatRupiah = (number: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const getStatusColor = (status: Transaction['status']): string => {
    switch (status) {
      case 'Selesai': return 'bg-green-100 text-green-700';
      case 'Proses': return 'bg-yellow-100 text-yellow-700';
      case 'Pending': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Selamat datang kembali! Berikut ringkasan bisnis Anda.</p>
        </div>

        {/* Quick Menu */}
        <div className="mb-8">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md">
            <Plus size={20} />
            Create Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat: StatCard, index: number) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                  <p className="text-green-600 text-sm mt-2">{stat.change} dari bulan lalu</p>
                </div>
                <div className={`${stat.color} p-4 rounded-lg`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart - Penjualan */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tren Penjualan (6 Bulan Terakhir)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip formatter={(value) => typeof value === 'number' ? formatRupiah(value) : ''} />
                <Legend />
                <Line type="monotone" dataKey="penjualan" stroke="#3b82f6" strokeWidth={2} name="Penjualan (Rp)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Transaksi */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Jumlah Transaksi</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="transaksi" fill="#10b981" name="Transaksi" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Transaksi User Terbaru</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTransactions.map((transaction: Transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{transaction.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{transaction.produk}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatRupiah(transaction.jumlah)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{transaction.tanggal}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai{' '}
              <span className="font-medium">{Math.min(endIndex, transactions.length)}</span> dari{' '}
              <span className="font-medium">{transactions.length}</span> transaksi
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_: undefined, index: number) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;