import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      // Tambahkan juga domain lain jika diperlukan
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'electric-hideously-drake.ngrok-free.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Untuk gambar placeholder
      },
      {
        protocol: 'https',
        hostname: 'fbtjmhsclyfdtfghfxxx.supabase.co', // GANTI dengan hostname Supabase Anda
      },
      {
        protocol: 'https',
        hostname: 'ppujrcixcibvfrcmxjxr.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Atau gunakan domains array untuk cara lama
    domains: [
      'lh3.googleusercontent.com',
      '*.googleusercontent.com',
      'avatars.githubusercontent.com',
      'ppujrcixcibvfrcmxjxr.supabase.co',
    ],
  },
};

export default nextConfig;
