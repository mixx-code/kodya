"use client";

import { useDarkMode } from "../contexts/DarkModeContext";

export default function LayoutBeranda({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="container mx-auto px-6 py-8 max-w-[90%] mt-21">
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
