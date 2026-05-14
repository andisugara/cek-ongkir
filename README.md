# Cek Ongkir + Transaksi Sandal

Aplikasi ini berisi halaman transaksi produk sandal dengan fitur:

- Input data penerima, alamat, dan item pesanan
- Ambil produk dari database (`products` + `product_sizes`)
- Hitung ongkir dari RajaOngkir (province/city/cost)
- Hitung subtotal, diskon ongkir, biaya COD, dan total
- Kirim template pesanan ke Telegram Bot
- Tidak menyimpan transaksi ke Supabase
- Halaman setting untuk edit `settings`
- Halaman produk untuk CRUD `products` dan `product_sizes`

## Menjalankan

1. Isi `.env`:

```dotenv
VITE_APP_RAJAONGKIR_KEY="YOUR_RAJAONGKIR_KEY"
VITE_APP_RAJAONGKIR_URL="https://rajaongkir.komerce.id/api/v1"
VITE_APP_SUPABASE_URL="https://YOUR_PROJECT.supabase.co/rest/v1/"
VITE_APP_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
VITE_APP_TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
VITE_APP_TELEGRAM_CHAT_ID="YOUR_TELEGRAM_CHAT_ID"
```

2. Pastikan tabel `settings` berisi minimal:

```json
[
  { "key": "COD", "value": "3" },
  { "key": "ORIGIN_PROVINCE", "value": "JAWA BARAT" },
  { "key": "ORIGIN_PROVINCE_ID", "value": "5" },
  { "key": "ORIGIN_CITY", "value": "BANDUNG BARAT" },
  { "key": "ORIGIN_CITY_ID", "value": "60" }
]
```

3. Install dependency:

```bash
npm install
```

4. Jalankan dev server:

```bash
npm run dev
```

## Catatan

- Integrasi RajaOngkir menggunakan endpoint Komerce terbaru (`/destination/*` dan `/calculate/district/domestic-cost`) via proxy Vite pada `vite.config.ts`.
- Base URL RajaOngkir disimpan di `VITE_APP_RAJAONGKIR_URL` dan bisa diganti lewat `.env`.
- Proxy hanya aktif saat development (`npm run dev`).
- Pengambilan produk memakai Supabase REST API secara read-only dari front-end.
- Origin pengiriman dibaca dari tabel `settings`, jadi tidak ada dropdown origin city.
- Kota tujuan baru dimuat setelah provinsi dipilih.
- Untuk production, disarankan memindahkan call RajaOngkir dan Telegram ke backend sendiri.
