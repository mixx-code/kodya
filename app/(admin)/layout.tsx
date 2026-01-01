// app/(admin)/layout.tsx
import { createClient } from "@/lib/supabase-server"; // Ganti ke server client
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Panggil createClient dari server (biasanya berbentuk async atau mengembalikan instance server)
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Cek apakah user ada
  if (!user) {
    redirect("/forbidden");
  }

  // Cek role dari profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Jika profile tidak ada atau role bukan admin, redirect
  if (error || !profile || profile.role !== 'admin') {
    redirect("/forbidden");
  }

  return (
    <div className="admin-container min-h-screen" style={{ backgroundColor: 'var(--background)' }}>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}