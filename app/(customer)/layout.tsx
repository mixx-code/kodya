// app/(admin)/layout.tsx
import { createClient } from "@/lib/supabase-server"; // Ganti ke server client
import { redirect } from "next/navigation";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Panggil createClient dari server (biasanya berbentuk async atau mengembalikan instance server)
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Cek apakah user ada
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="admin-container">
      <main>{children}</main>
    </div>
  );
}