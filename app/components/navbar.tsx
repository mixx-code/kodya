"use client";

import Image from "next/image";
import Logo from "@/public/logo.png";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Moon,
  Settings,
  LogOut,
  ShoppingCart,
  User,
  CirclePlus,
  Wallet,
} from "lucide-react";
import { useAuth, useRole, useSignOut } from "@/hooks/useSupabase";
import { useRouter } from "next/navigation";
import PaymentModal from "./paymentModal";
import { Tables } from '@/types/supabase';
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";
type SaldoRow = Tables<'saldo'>;

function Navbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saldo, setSaldo] = useState<SaldoRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Gunakan hook auth untuk mendapatkan data user
  const { user, loading: authLoading, error: authError } = useAuth();
  const { role, loading: roleLoading, error: roleError } = useRole()
  console.log("role: ", role)
  const { signOut, loading: signOutLoading } = useSignOut();
  console.log("data user: ", user)

  const handleLogout = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      // Refresh halaman setelah logout
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const fetchSaldoData = async () => {
      // Jangan fetch saldo jika:
      // 1. Masih loading auth
      // 2. Ada error auth
      // 3. User belum login (user null)
      if (authLoading) return;
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      if (!user) {
        // Reset saldo dan set loading selesai jika user tidak login
        setSaldo(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Hanya eksekusi query jika user sudah login
      const supabase = createClient();
      try {
        const userId = user.id;
        const saldoResponse = await supabase.from('saldo').select('*').eq('id', userId).maybeSingle();
        if (saldoResponse.error) {
          setSaldo({ id: userId, amount: 0, currency: 'IDR', last_transaction_at: null, updated_at: null });
        } else {
          setSaldo(saldoResponse.data);
        }
        setError(null);
      } catch (err) {
        setError('Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchSaldoData();
  }, [user, authLoading, authError]);

  const formatCurrency = (amount: number | null) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Tutup dropdown ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest("#profile") && !target.closest(".dropdown-menu")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Dapatkan initial nama dari user metadata atau email
  const getUserName = () => {
    if (!user) return "Guest";

    // Coba ambil dari user_metadata terlebih dahulu
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }

    // Jika tidak ada, ambil dari email
    return user.email?.split('@')[0] || "User";
  };

  // Dapatkan avatar/photo dari user metadata
  const getUserAvatar = () => {
    if (!user) return null;

    return user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null;
  };

  // Navigasi berdasarkan status login
  const getMenuItems = () => {
    // 1. Jika User Belum Login
    if (!user) {
      return [
        { href: "/", label: "Market" },
        { href: "/auth/login", label: "Masuk" },
      ];
    }

    // Ambil role dari metadata (pastikan saat registrasi/update role ini disimpan di metadata)
    const isAdmin = role === 'admin';
    console.log("user: ", user);
    console.log("isAdmin: ", isAdmin);
    // 2. Jika User adalah Admin
    if (isAdmin) {
      return [
        { href: "/", label: "Market" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/products", label: "List Products" },
        { href: "/products/create", label: "Create Product", isHighlight: true },
        { href: "/cart", label: "", icon: <ShoppingCart className="w-5 h-5" /> },
      ];
    }

    // 3. Jika User adalah Pembeli Biasa
    return [
      { href: "/", label: "Market" },
      { href: "/my-orders", label: "Pesanan Saya" },
      { href: "/cart", label: "", icon: <ShoppingCart className="w-5 h-5" /> },
    ];
  };

  const menuItems = getMenuItems();

  if (authLoading) {
    return (
      <nav className="h-14 bg-blue-300 dark:bg-blue-950 flex flex-row justify-between items-center box-border px-5 fixed top-0 left-0 right-0 z-50">
        <div id="logo" className="flex items-center gap-2">
          <Image
            alt="Logo"
            src={Logo}
            className="w-11 h-11 rounded-full object-cover"
          />
          <h1 className="font-bold text-[1.3rem] text-white">Kodya</h1>
        </div>
        <div className="text-white text-sm">Memuat...</div>
      </nav>
    );
  }

  return (
    <nav className="h-14 bg-blue-300 dark:bg-blue-950 flex flex-row justify-between items-center box-border px-5 fixed top-0 left-0 right-0 z-50">
      {/* Logo */}
      <div id="logo" className="flex items-center gap-2">
        <Image
          alt="Logo"
          src={Logo}
          className="w-11 h-11 rounded-full object-cover"
        />
        <h1 className="font-bold text-[1.3rem] text-white">Kodya</h1>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white focus:outline-none"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Desktop Navigation */}
      <div
        id="nav-menu"
        className="hidden md:flex h-full flex-row items-center gap-6"
      >
        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={`flex items-center gap-1 transition-colors ${item.icon ? "relative" : ""
              } ${
              item.isHighlight
                ? "bg-yellow-400 text-blue-950 px-3 py-1.5 rounded-lg font-bold hover:bg-yellow-300"
                : "text-white hover:text-blue-200"
              }`}
          >
            {item.icon && item.icon}
            {item.label}
            {/* Badge Cart */}
            {item.href === "/cart" && (
              <span className="absolute -top-2 -right-2 text-[10px] bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">
                9+
              </span>
            )}
          </a>
        ))}

        {/* Saldo Display - Hanya tampil jika user sudah login */}
        {user && (
          <Link href="/saldo">
            <div className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 p-1.5 pl-4 rounded-xl transition-all">
              <div className="text-left">
                <p className="text-[9px] text-blue-200 uppercase font-medium">Saldo</p>
                <p className="text-sm font-bold text-white tracking-wide">{formatCurrency(saldo?.amount || 0)},00</p>
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-400 p-2 rounded-lg text-white shadow-lg shadow-blue-900/20 transition-all"
                onClick={() => setIsModalOpen(true)}
              >
                <CirclePlus size={18} />
              </button>
            </div>
          </Link>
        )}

        {/* Profile Dropdown - Hanya tampil jika user sudah login */}
        {user && (
          <div className="relative">
            <button
              id="profile"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex flex-row items-center gap-2 hover:bg-blue-600 px-3 py-2 rounded-lg transition-colors"
            >
              {getUserAvatar() ? (
                <Image
                  alt="Profile"
                  src={getUserAvatar()}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="text-left">
                <p className="text-white text-sm font-medium">
                  {getUserName()}
                </p>
                <p className="text-blue-200 text-xs truncate max-w-30">
                  {user.email}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-white transition-transform ${isDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-gray-900 text-sm font-semibold truncate">
                    {getUserName()}
                  </p>
                  <p className="text-gray-600 text-xs truncate">
                    {user.email}
                  </p>
                </div>

                <a
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Profil Saya</span>
                </a>

                <a
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Pengaturan Akun</span>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Moon className="w-4 h-4" />
                  <span>Atur Mode</span>
                </a>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  disabled={signOutLoading}
                  className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{signOutLoading ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login/Register Buttons jika belum login */}
        {!user && (
          <div className="flex items-center gap-3">
            <a
              href="/auth/login"
              className="px-4 py-2 text-white hover:text-blue-200 transition-colors"
            >
              Masuk
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Daftar
            </a>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white md:hidden shadow-xl z-40 border-t border-gray-200">
          <div className="flex flex-col max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            {/* Profile Section - Hanya tampil jika user login */}
            {user && (
              <div className="px-4 py-3">
                <div className="flex items-center justify-between bg-linear-to-r from-blue-600 to-blue-500 p-3 rounded-xl shadow-md">
                  <Link href="/saldo" className="flex-1">
                    <div className="text-left">
                      <p className="text-[10px] text-blue-100 uppercase font-semibold tracking-wider">Saldo Anda</p>
                      <p className="text-base font-bold text-white tracking-wide">
                        {formatCurrency(saldo?.amount || 0)}
                        <span className="text-[10px] ml-0.5 opacity-80">,00</span>
                      </p>
                    </div>
                  </Link>

                  <button
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-lg text-white transition-all active:scale-95"
                    onClick={(e) => {
                      e.preventDefault(); // Mencegah Link ikut ter-klik
                      setIsModalOpen(true);
                    }}
                  >
                    <CirclePlus size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="px-4 py-3 space-y-1">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && item.icon}
                  <span>{item.label}</span>
                  {item.href === "/cart" && (
                    <span className="ml-auto text-[0.8em] bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
                      9+
                    </span>
                  )}
                </a>
              ))}
            </div>

            {/* Divider */}
            {user && <div className="border-t border-gray-200"></div>}

            {/* Settings Links - Hanya untuk user yang login */}
            {user && (
              <div className="px-4 py-3 space-y-1">
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Profil Saya</span>
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Pengaturan Akun</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Moon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Atur Mode</span>
                </a>

                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={handleLogout}
                    disabled={signOutLoading}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">
                      {signOutLoading ? "Logging out..." : "Logout"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Login/Register Links untuk user belum login */}
            {!user && (
              <div className="px-4 py-3 space-y-3">
                <a
                  href="/auth/login"
                  className="block px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Masuk
                </a>
                <a
                  href="/auth/register"
                  className="block px-4 py-3 border-2 border-blue-600 text-blue-600 text-center rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Daftar Akun Baru
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal - Hanya bisa dibuka jika user sudah login */}
      {user && (
        <PaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          clientKey={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''}
        />
      )}
    </nav>
  );
}

export default Navbar;