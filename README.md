# Audiory

Platform informasi dan katalog perangkat audio (fokus awal: IEM), berbasis PWA.
Dibuat dengan JavaScript (React + Vite + Axios + vite-plugin-pwa).

## Menjalankan

### 1. API (folder `server/`)

```bash
cd server
npm install
npm start        # http://localhost:3000
```

Data tersimpan di `server/db.json` (berisi data contoh).

### 2. Frontend

```bash
cp .env.example .env     # sesuaikan VITE_API_URL
npm install
npm run dev
```

Untuk mencoba mode PWA (manifest + service worker):

```bash
npm run build
npm run preview
```

Lalu buka di Chrome dan cek DevTools > Application.

## Memakai API Modul 1

Frontend hanya butuh endpoint berikut. Jika API Modul 1 berbeda, cukup ubah `src/api.js`
dan nama field di form.

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| GET / POST | `/iems` | List / tambah IEM |
| GET / PUT / DELETE | `/iems/:id` | Detail / ubah / hapus IEM |
| GET / POST | `/tunings`, `/genres` | List / tambah kategori |
| PUT / DELETE | `/tunings/:id`, `/genres/:id` | Ubah / hapus kategori |

Relasi disimpan sebagai array ID di IEM: `tuning_ids` dan `genre_ids`.
Kategori yang masih dipakai IEM ditolak saat dihapus (HTTP 409).

## Halaman

1. Katalog IEM (list, klik item untuk detail)
2. Detail IEM
3. Form tambah/edit IEM (pilih tuning dan genre)
4. Tuning (list kategori + CRUD + list IEM per kategori, klik item untuk detail)
5. Genre (sama seperti Tuning)
6. About

Bottom Navigation: Katalog, Tuning, Genre, About.

## Deploy

- Frontend: Vercel (sudah ada `vercel.json` untuk rewrite SPA). Set `VITE_API_URL` di
  Environment Variables.
- API: server ini menulis ke `db.json`, jadi data tidak permanen di hosting serverless.
  Pakai API Modul 1 Anda atau hosting yang punya penyimpanan tetap.
