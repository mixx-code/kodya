# Real-Time Review WebSocket Implementation

## Overview

Sistem ini telah ditambahkan WebSocket untuk real-time review updates. Ketika seorang user mengirimkan review, user lain yang sedang membuka halaman produk yang sama akan langsung melihat review baru tersebut tanpa perlu refresh halaman.

## Cara Kerja

1. **WebSocket Server** (`server.js`): Menangani koneksi WebSocket dan broadcast review baru ke semua client yang terhubung
2. **WebSocket Service** (`lib/websocket.ts`): Service client untuk mengelola koneksi WebSocket
3. **ReviewList Component**: Menerima update real-time dan menambahkan review baru ke daftar
4. **ReviewForm Component**: Mengirim notifikasi real-time saat review baru dikirim

## Fitur

- ✅ Real-time review updates
- ✅ Automatic reconnection
- ✅ Browser notifications (jika diizinkan)
- ✅ Room-based communication per produk
- ✅ Error handling dan fallback

## Cara Menjalankan

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Testing Real-Time Updates

1. Buka 2 browser window/tab
2. Login dengan user berbeda di masing-masing window
3. Buka halaman produk yang sama di kedua window
4. Di window pertama, submit review baru
5. Di window kedua, review akan muncul secara otomatis tanpa refresh

## Struktur File

- `server.js` - WebSocket server dengan Next.js integration
- `lib/websocket.ts` - WebSocket client service
- `app/components/ReviewList.tsx` - Updated dengan real-time listener
- `app/components/ReviewForm.tsx` - Updated dengan real-time notification

## Environment Variables

Tidak ada environment variable tambahan yang diperlukan. WebSocket akan otomatis menggunakan:
- Development: `http://localhost:3000`
- Production: `window.location.origin`

## Troubleshooting

### WebSocket tidak terhubung
- Pastikan server berjalan dengan `node server.js`
- Check browser console untuk error messages
- Pastikan tidak ada firewall yang memblokir WebSocket connection

### Review tidak muncul real-time
- Pastikan kedua window membuka produk yang sama
- Check browser console untuk "New review received in real-time" message
- Pastikan user sudah login di kedua window

### Notifications tidak muncul
- Pastikan browser telah mengizinkan notifications
- Check browser settings untuk notification permissions

## Technical Details

### WebSocket Events
- `join-product` - Join room untuk produk tertentu
- `leave-product` - Leave room produk
- `new-review` - Broadcast review baru
- `review-added` - Terima review baru

### Data Flow
1. User submit review → ReviewForm
2. Review disimpan ke database → Supabase
3. WebSocket notification dikirim → Server
4. Broadcast ke semua client di room yang sama → ReviewList
5. UI update otomatis → Real-time update
