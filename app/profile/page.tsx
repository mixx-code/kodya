"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Camera,
  Edit2,
  Save,
  X,
  Mail,
  Calendar,
  Shield,
  LogOut,
  Settings,
  CreditCard,
  ShoppingBag,
  ShoppingCart,
  Heart
} from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { useAuth, Profile } from "@/hooks/useSupabase";
import Alert from "@/app/components/Alert";
import { useAlert } from "@/hooks/useAlert";
import { useDarkMode } from "@/app/contexts/DarkModeContext";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { alert, showAlert, hideAlert } = useAlert();
  const { isDarkMode } = useDarkMode();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    cartItems: 0
  });

  // Fetch profile data
  useEffect(() => {
    // Cek user dan auth loading
    if (!user || authLoading) {
      if (!user && !authLoading) {
        router.push("/auth/login");
      }
      return;
    }

    console.log('Fetching profile for:', user.email);

    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        
        setProfile(data);
        setFullName(data.full_name || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        showAlert("error", "Error", "Gagal memuat data profil");
      } finally {
        setLoading(false);
      }
    };

    const fetchStatsData = async () => {
      try {
        // Fetch total orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("id, status")
          .eq("user_id", user.id);

        if (!ordersError && ordersData) {
          const totalOrders = ordersData.length;
          const completedOrders = ordersData.filter(order => order.status === "completed").length;
          
          setStats(prev => ({
            ...prev,
            totalOrders,
            completedOrders
          }));
        }

        // Fetch cart items count
        const { data: cartData, error: cartError } = await supabase
          .from("cart")
          .select("quantity")
          .eq("user_id", user.id);

        if (!cartError && cartData) {
          const cartItems = cartData.reduce((total, item) => total + (item.quantity || 0), 0);
          setStats(prev => ({
            ...prev,
            cartItems
          }));
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchProfileData();
    fetchStatsData();
  }, [user?.id, authLoading]); // Hanya depend pada user ID dan authLoading

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    
    setUploadingAvatar(true);

    try {
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("images-kodya")
        .upload(`avatars/${fileName}`, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("images-kodya")
        .getPublicUrl(`avatars/${fileName}`);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      
      showAlert("success", "Success", "Avatar berhasil diperbarui!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      showAlert("error", "Error", "Gagal mengupload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, full_name: fullName } : null);
      setEditing(false);
      showAlert("success", "Success", "Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert("error", "Error", "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
      showAlert("error", "Error", "Gagal logout");
    }
  };

  if (loading || authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center `}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Profil tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 `}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profil Saya</h1>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-red-400 hover:bg-red-900/20' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              {/* Avatar Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className={`w-32 h-32 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} mx-auto mb-4`}>
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt="Avatar"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className={`w-16 h-16 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      </div>
                    )}
                  </div>
                  
                  <label className={`absolute bottom-4 right-0 p-2 rounded-full cursor-pointer transition-colors ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}>
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadingAvatar && (
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Mengupload avatar...</p>
                )}

                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {profile.full_name || "Belum ada nama"}
                </h2>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{profile.email}</p>
                
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    {profile.role === "admin" ? "Admin" : "Customer"}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-2">
                <Link 
                  href="/my-orders"
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors block ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Pesanan Saya</span>
                </Link>
                <Link 
                  href="/cart"
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors block ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingCart className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Keranjang</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Informasi Pribadi</h3>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-blue-400 hover:bg-blue-900/20' 
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        isDarkMode 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFullName(profile.full_name || "");
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      Batal
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} border ${isDarkMode ? 'border-gray-600/30' : 'border-gray-200'}`}>
                    <p className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>{profile.email}</p>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <User className="w-4 h-4 inline mr-2" />
                    Nama Lengkap
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border border-gray-300 text-gray-900 bg-white'
                      }`}
                      placeholder="Masukkan nama lengkap"
                    />
                  ) : (
                    <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} border ${isDarkMode ? 'border-gray-600/30' : 'border-gray-200'}`}>
                      <p className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                        {profile.full_name || "Belum ada nama"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Shield className="w-4 h-4 inline mr-2" />
                    Peran
                  </label>
                  <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} border ${isDarkMode ? 'border-gray-600/30' : 'border-gray-200'}`}>
                    <p className={`capitalize ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {profile.role || "customer"}
                    </p>
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Bergabung Sejak
                  </label>
                  <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} border ${isDarkMode ? 'border-gray-600/30' : 'border-gray-200'}`}>
                    <p className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Tidak diketahui"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 mt-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Statistik Akun</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{stats.totalOrders}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Pesanan</p>
                </div>
                <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{stats.completedOrders}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pesanan Selesai</p>
                </div>
                <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{stats.cartItems}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Item di Keranjang</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {alert.show && (
        <Alert
          show={alert.show}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={hideAlert}
        />
      )}
    </div>
  );
}
