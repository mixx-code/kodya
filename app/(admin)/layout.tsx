export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-container">
      {/* Tambahkan navigation/sidebar jika perlu */}
      <main>{children}</main>
    </div>
  );
}
