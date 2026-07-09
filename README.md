# 🗳️ COBLOS ONLINE — Premium E-Voting & Live Quick Count Platform

<div align="center">

![Version](https://img.shields.io/badge/Version-2.0.0-6366f1?style=for-the-badge)
![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_Tunnel-Ready-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

**Coblos Online (Pilkasis / Pemilihan OSIS & Organisasi)** adalah platform *E-Voting* modern berstandar enterprise yang dirancang untuk menghadirkan pengalaman pemilihan umum yang **transparan, aman, cepat**, dan **memukau secara visual**.

Dapat dijalankan secara *Localhost* di lab sekolah/kampus maupun diakses secara *Publik Online* melalui arsitektur **Hybrid Cloudflare Quick Tunnel & Domain Proxy Webhook**.

</div>

---

## 🌟 Keunggulan Utama & Arsitektur Hybrid

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PEMILIH / PUBLIK (1.500+ USERS)                       │
│              Mengakses melalui HP / Laptop / Komputer Lab                   │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ HTTPS / Secure Web
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DOMAIN HOSTING SEKOLAH (PUBLIK)                       │
│     https://pilkasis.deckonecode.my.id (index.php Iframe & webhook.php)     │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ Cloudflare Quick Tunnel Encripted Link
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SERVER LOKAL SEKOLAH / PANITIA (PC)                     │
│               Laravel 11 Backend API + React Vite Frontend                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **⚡ Siap Untuk 1.500+ Pemilih Secara Bergantian:** Arsitektur bersahabat untuk hosting gratis maupun server lokal. Pemrosesan suara (*voting*) hanya membutuhkan waktu **< 100 milidetik**, dijamin lancar tanpa kendala server *down*.
- **🔒 Aman & Anti-Kecurangan (Satu Token = Satu Suara):** Menggunakan token sekali pakai (*One-Time Token*) yang otomatis terkunci (`is_used = true`) seketika setelah suara masuk ke database.
- **🎨 Desain UI/UX Premium & Responsif:** Menggunakan desain *Dark/Light Glassmorphism*, animasi *Framer Motion*, dan optimalisasi layar penuh mulai dari HP (Mobile Bottom Sheet), Tablet, hingga PC Desktop.

---

## ✨ Fitur-Fitur Unggulan

### 1. 🗳️ Halaman Pemilih (TPS Online / Voter Portal)
- **Akses Cepat Token:** Pemilih cukup memasukkan token rahasia yang telah dibagikan panitia.
- **Kartu Kandidat Paslon Pro:** Menampilkan foto Ketua & Wakil secara terpisah (*stacked photo cards*), nama lengkap paslon, serta Visi & Misi yang rinci.
- **Double Confirmation Modal:** Mencegah salah pilih dengan modal konfirmasi visual sebelum suara disimpan.
- **Privasi Terjamin:** Auto-Logout Countdown otomatis **3 detik** setelah memilih agar pemilih berikutnya tidak bisa melihat data sebelumnya.

---

### 2. 📊 Live Quick Count Publik (`/hasil`)
- **Akses Publik Tanpa Login:** Siapapun dapat memantau perolehan suara *real-time* dengan membuka alamat **`/hasil`**.
- **Banner Kandidat Unggul Sementara:** Menampilkan paslon pemimpin klasemen, **Status Persaingan** (*Unggul Sementara* / *Posisi Seri / Draw*), dan **Selisih Suara**.
- **Grafik Donut Interaktif (`Recharts`):** Dilengkapi garis penunjuk (*label line*) dan keterangan paslon + persentase di sekeliling potongan grafik.
- **Rangkuman Suara Animasi:** *Progress bar* suara terurut otomatis dari suara terbanyak serta indikator **Potensi Suara Belum Masuk**.
- **Auto-Update & Refresh Manual:** Memperbarui statistik otomatis setiap **30 detik** dan dilengkapi tombol *Refresh* berputar (`animate-spin`).

---

### 3. 🛡️ Admin Panel Pro (`/admin`)
- **Dashboard Overview:** Ringkasan statistik jumlah token (Total, Masuk, Sisa, Persentase Partisipasi), grafik batang (*Bar Chart*) dengan keterangan nama paslon di bawah sumbu X.
- **Manajemen Paslon (CRUD):** Tambah, Edit, dan Hapus kandidat beserta upload foto Ketua & Wakil terpisah (otomatis menggunakan siluet profesional jika belum ada foto).
- **Custom Token Generator:**
  - **Kustomisasi Karakter:** Ceklis kombinasi karakter acak (**Angka `0-9`**, **Huruf Besar `A-Z`**, **Huruf Kecil `a-z`**).
  - **Panjang Digit Custom:** Atur panjang token dari **1 sampai 9 digit**.
  - **Jumlah Token:** Generate hingga **500 token unik sekaligus**.
- **Fitur Print Kartu Token Siap Potong:** Desain cetak rapi berformat kartu (20 token per lembar) untuk dibagikan fisik kepada siswa/pemilih.
- **Backup & Restore Token JSON:** Unduh salinan cadangan data token atau pulihkan kembali kapan saja dengan satu klik.

---

### 4. 🚀 Otomatisasi Tunnel Satu Klik (`PowerShell Scripts`)
Dilengkapi skrip otomatisasi Windows PowerShell untuk menyalakan seluruh sistem tanpa konfigurasi rumit:
- **`tunnel_public.ps1`**: Menjalankan Laravel Backend, React Frontend, dan Cloudflare Tunnel (`trycloudflare.com`) sekaligus memperbarui *CORS* & mengirimkan *Webhook* URL ke domain hosting secara otomatis.
- **`tunnel_domain.ps1`**: Menghubungkan tunnel langsung ke domain kustom Anda.

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
| :--- | :--- |
| **Backend API** | [Laravel 11](https://laravel.com) (PHP 8.2+), Sanctum Authentication |
| **Frontend UI** | [React 18](https://react.dev), [Vite](https://vitejs.dev), [Tailwind CSS 3.4](https://tailwindcss.com) |
| **Animasi & Grafik** | Framer Motion, Recharts API, Lucide Icons |
| **Database** | SQLite (Default Ringan & Cepat) / MySQL / MariaDB |
| **Networking & Tunnel** | Cloudflare Quick Tunnel (`cloudflared`), Apache `.htaccess` Proxy |

---

## 🚀 Panduan Instalasi & Pengoperasian

### 1️⃣ Persiapan Lingkungan (Prerequisites)
Pastikan komputer/server Anda telah menginstal:
- **PHP >= 8.2** & Composer
- **Node.js >= 18.x** & npm

---

### 2️⃣ Instalasi & Menjalankan secara Lokal (Localhost)

#### A. Backend Laravel
```bash
# Masuk ke folder backend
cd backend

# Install dependensi PHP
composer install

# Salin konfigurasi .env dan generate key
cp .env.example .env
php artisan key:generate

# Jalankan migrasi database & link storage
php artisan migrate
php artisan storage:link

# Jalankan server backend (Port 8000)
php artisan serve
```

#### B. Frontend React Vite
```bash
# Buka terminal baru & masuk ke folder frontend
cd frontend

# Install dependensi JavaScript
npm install

# Jalankan server development (Port 5173)
npm run dev
```

---

### 3️⃣ Menjalankan secara Online via Cloudflare Tunnel (Tanpa Port Forwarding)

Cukup jalankan skrip otomatis yang telah disediakan di Windows PowerShell:
```powershell
.\tunnel_public.ps1
```
Skrip akan otomatis:
1. Menyetel backend & frontend agar saling terhubung secara aman.
2. Membuka koneksi Cloudflare Tunnel publik.
3. Mengupdate *Webhook* ke domain hosting Anda.

---

## 🔑 Akun Default Admin

Untuk masuk ke panel pengelolaan (`/admin/login`):
- **URL Admin:** `http://localhost:5173/admin/login` (atau `https://domain-anda.com/admin/login`)
- **Email:** `admin@coblos.com`
- **Password:** `admin123`

---

## 📁 Struktur Direktori Proyek

```text
COBLOS-ONLINE/
├── backend/                  # Laravel 11 Backend API
│   ├── app/Http/Controllers/ # Controller (Auth, Candidate, Token, Vote, Stats)
│   ├── database/migrations/  # Skema tabel database SQLite/MySQL
│   └── routes/api.php        # Endpoint REST API (Public & Protected)
├── frontend/                 # React 18 + Vite Frontend
│   ├── src/pages/            # Halaman (Home, AdminDashboard, PublicResults, AdminLogin)
│   └── src/index.css         # Tailwind Design System & Glassmorphism Tokens
├── hosting/                  # File untuk diupload ke Hosting Domain Publik
│   ├── index.php             # Smart Proxy Iframe Forwarder (Support /hasil, /admin, dll.)
│   ├── webhook.php           # Penerima pembaruan URL Tunnel otomatis
│   └── .htaccess             # Apache Rewrite Rules
├── tunnel_public.ps1         # Skrip Otomatisasi Cloudflare Tunnel Publik
└── README.md                 # Dokumentasi Proyek
```

---

## 📝 Tips & Praktik Terbaik Pelaksanaan Pemilihan

1. **Jalur Keterbukaan Publik (`/hasil`):** Bagikan tautan `https://domain-anda.com/hasil` di proyektor sekolah atau grup WhatsApp siswa agar semua pihak dapat menyaksikan penghitungan suara (*Quick Count*) secara jujur dan terbuka.
2. **Kestabilan PC Lokal:** Saat pemungutan suara berlangsung melalui tunnel, pastikan fitur *Sleep/Standby* pada laptop/PC server lokal dimatikan.
3. **Pencetakan Kartu Token:** Gunakan opsi **Print Background Graphics** pada pengaturan cetak browser agar kartu token tercetak rapi beserta warna latar belakangnya.

---

## 📄 Lisensi

Proyek ini dirilis di bawah [MIT License](LICENSE).  
*Developed with ❤️ for a better, smarter, and transparent democracy.*
