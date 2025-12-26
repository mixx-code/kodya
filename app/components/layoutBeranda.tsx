export default function LayoutBeranda({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="container mx-auto px-6 py-8 max-w-[90%] mt-12">
          {children}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="px-4 py-6 pb-20 mt-12">{children}</div>
      </div>
    </div>
  );
}
