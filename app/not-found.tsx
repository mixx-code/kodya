import Link from "next/link";
import LottieNotFound from "./components/LottieNotFound";
// Import komponen client yang baru dibuat

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center overflow-hidden">
      {/* Mengganti icon Lucide dengan Animasi Lottie */}
      <LottieNotFound />
      <Link
        href="/"
        className="px-6 py-3 text-gray-500 font-bold rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-none"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}