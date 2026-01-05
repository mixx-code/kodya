"use client";

import Image from "next/image";
import Logo from "@/public/logo.png";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
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
import { Database } from '@/types/supabase';
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";
import { useDarkMode } from "../contexts/DarkModeContext";
import { useCart } from "../contexts/CartContext";
type SaldoRow = Database['public']['Tables']['saldo']['Row'];

function Navbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saldo, setSaldo] = useState<SaldoRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { cartCount } = useCart();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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
    const fetchUserData = async () => {
    // Jangan fetch data jika:
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
        // Reset data dan set loading selesai jika user tidak login
        setSaldo(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Hanya eksekusi query jika user sudah login
      const supabase = createClient();
      try {
        const userId = user.id;

        // Fetch saldo data
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

    fetchUserData();
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
      <nav className="h-14 flex flex-row justify-between items-center box-border px-5 fixed top-0 left-0 right-0 z-50" style={{
        backgroundColor: 'var(--navbar-background)',
        borderColor: 'var(--border-accent)'
      }}>
        <div id="logo" className="flex items-center gap-3">
          <div className="relative">
            <Image
              alt="Logo"
              src={Logo}
              className="w-10 h-10 rounded-xl object-cover shadow-md"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-xl"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-xl tracking-tight" style={{ color: 'var(--navbar-foreground)' }}>Kodya</h1>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Digital Marketplace</p>
          </div>
        </div>
        <div className="text-sm font-medium" style={{ color: 'var(--navbar-foreground)' }}>Memuat...</div>
      </nav>
    );
  }

  return (
    <nav className="h-21 shadow-lg border-b flex flex-row justify-between items-center box-border px-10 sm:px-7 lg:px-10 fixed top-0 left-0 right-0 z-50" style={{
      backgroundColor: 'var(--navbar-background)',
      borderColor: 'var(--border-accent)'
    }}>
      {/* Logo */}
      <div id="logo" className="flex items-center gap-2">
        <Image
          alt="Logo"
          src={Logo}
          className="w-11 h-11 rounded-full object-cover"
        />
        <h1 className="font-bold text-[1.3rem]" style={{ color: 'var(--navbar-foreground)' }}>Kodya</h1>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
        style={{
          color: 'var(--navbar-foreground)',
          backgroundColor: 'transparent'
        }}
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
        className="hidden md:flex h-full flex-row items-center gap-8"
      >
        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${item.icon ? "relative" : ""}`}
            style={{
              color: 'var(--navbar-foreground)',
              // backgroundColor: item.isHighlight ? 'var(--warning)' : 'transparent'
            }}
          >
            {item.icon && item.icon}
            {item.label}
            {/* Badge Cart */}
            {item.href === "/cart" && (
              <span className="ml-auto text-[0.8em] bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center" style={{
                color: 'var(--navbar-foreground)',
                backgroundColor: 'var(--error)'
              }}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </a>
        ))}

        {/* Saldo Display - Hanya tampil jika user sudah login */}
        {user && (
          <Link href="/saldo">
            <div className="flex items-center gap-3 backdrop-blur-md border px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md" style={{
              backgroundColor: 'var(--card-background)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}>
              <div className="text-left">
                <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>Saldo</p>
                <p className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{formatCurrency(saldo?.amount || 0)}</p>
              </div>
              <button
                className="p-2 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--text-inverse)'
                }}
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
              className="flex flex-row items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--navbar-foreground)'
              }}
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: 'var(--navbar-foreground)' }}>{getUserName()}</p>
                <p className="text-xs truncate max-w-32" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                style={{ color: 'var(--text-muted)' }}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="dropdown-menu absolute right-0 mt-3 w-56 rounded-xl shadow-2xl py-2 z-50 border overflow-hidden" style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--border-primary)'
              }}>
                <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>
                    {getUserName()}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {user.email}
                  </p>
                </div>

                <a
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  style={{
                    color: 'var(--text-primary)'
                  }}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Profil Saya</span>
                </a>

                <div className="border-t my-1" style={{ borderColor: 'var(--border-secondary)' }}></div>

                <button
                  onClick={handleLogout}
                  disabled={signOutLoading}
                  className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  style={{
                    color: 'var(--error)'
                  }}
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
              className="px-4 py-2 transition-colors font-medium"
              style={{
                color: 'var(--navbar-foreground)'
              }}
            >
              Masuk
            </a>
            <a
              href="/auth/register"
              className="px-4 py-2 rounded-lg transition-colors font-medium"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--text-inverse)'
              }}
            >
              Daftar
            </a>
          </div>
        )}
        <button
          onClick={() => {
            toggleDarkMode();
            setIsDropdownOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4" color="white" /> : <Moon className="w-4 h-4" color="black" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-21 left-0 right-0 shadow-xl z-40 border-t" style={{
          backgroundColor: 'var(--card-background)',
          borderColor: 'var(--border-primary)'
        }}>
          <div className="flex flex-col max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            {/* Profile Section - Hanya tampil jika user login */}
            {/* <button
              onClick={() => {
                toggleDarkMode();
                setIsDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" color="white" /> : <Moon className="w-4 h-4" color="black" />}
              <span style={{ color: 'var(--primary)' }}>{isDarkMode ? "Mode Terang" : "Mode Gelap"}</span>
            </button> */}
            {user && (
              <div className="px-4 py-3">
                <div className="flex items-center justify-between p-3 rounded-xl shadow-md"
                  style={{
                    background: 'linear-gradient(to right, var(--accent), var(--accent-hover))',
                  }}>
                  <Link href="/saldo" className="flex-1">
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: 'var(--text-inverse)' }}>Saldo Anda</p>
                      <p className="text-base font-bold tracking-wide" style={{ color: 'var(--text-inverse)' }}>
                        {formatCurrency(saldo?.amount || 0)}
                        <span className="text-[10px] ml-0.5 opacity-80">,00</span>
                      </p>
                    </div>
                  </Link>

                  <button
                    className="p-2 rounded-lg text-white shadow-lg transition-all active:scale-95"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    }}
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
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
                  style={{
                    color: 'var(--text-primary)',
                    backgroundColor: 'transparent'
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && item.icon}
                  <span>{item.label}</span>
                  {item.href === "/cart" && (
                    <span className="ml-auto text-[0.8em] bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center" style={{
                      backgroundColor: 'var(--error)'
                    }}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </a>
              ))}
            </div>

            {/* Divider */}
            {user && <div className="border-t" style={{ borderColor: 'var(--border-secondary)' }}></div>}

            {/* Settings Links - Hanya untuk user yang login */}
            {user && (
              <div className="px-4 py-3 space-y-1">
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium" style={{ color: 'var(--accent)' }}>
                    Profil Saya
                  </span>
                </a>
                <button
                  onClick={() => {
                    toggleDarkMode();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {isDarkMode ? <Sun className="w-5 h-5 text-blue-600" /> : <Moon className="w-5 h-5 text-blue-600" />}
                  <span className="font-medium" style={{ color: 'var(--accent)' }}>
                    {isDarkMode ? "Mode Terang" : "Mode Gelap"}
                  </span>
                </button>

                <div className="border-t pt-2" style={{ borderColor: 'var(--border-secondary)' }}>
                  <button
                    onClick={handleLogout}
                    disabled={signOutLoading}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    style={{
                      color: 'var(--error)'
                    }}
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