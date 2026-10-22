# Nagih.in Frontend

Nagih.in adalah aplikasi manajemen kost berbasis React dan Vite. Aplikasi ini
memiliki katalog kamar publik, dashboard admin, serta dashboard penghuni.
Data autentikasi dan data aplikasi disimpan di Firebase.

## Fitur

- Katalog kamar publik dengan pencarian dan filter tipe/status kamar.
- Pengajuan sewa dan chat dengan pengelola dari halaman publik.
- Login dan pendaftaran penghuni menggunakan Firebase Authentication.
- Dashboard admin untuk mengelola kamar, penghuni, tagihan, tiket perbaikan,
  dan pesan masuk.
- Dashboard penghuni untuk melihat kamar, mengirim komplain, dan mengelola
  akun.
- Sinkronisasi data secara realtime menggunakan Cloud Firestore.

## Teknologi

- React 19
- Vite
- React Router
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore

## Persiapan Firebase

Project ini menggunakan Firebase Authentication dan Cloud Firestore. Tidak
perlu membuat server Express terpisah.

1. Buat atau buka project di [Firebase Console](https://console.firebase.google.com/).
2. Buka **Project settings > Your apps**, tambahkan aplikasi Web (`</>`), lalu
   salin konfigurasi Firebase.
3. Di **Authentication > Sign-in method**, aktifkan:
   - **Email/Password** untuk login dan pendaftaran admin/penghuni.
   - **Anonymous** untuk chat dan pengajuan sewa dari pengunjung publik.
4. Buat database di **Firestore Database**.
5. Publish isi [`firestore.rules`](./firestore.rules) pada tab **Rules**
   di Firestore. Rules tersebut membatasi akses admin, penghuni, dan
   pengunjung publik sesuai kebutuhan aplikasi.

## Konfigurasi environment

Salin [`.env.example`](./.env.example) menjadi `.env`, kemudian isi nilainya
berdasarkan konfigurasi aplikasi Web Firebase:

```env
VITE_FIREBASE_API_KEY=isi_dari_firebase_console
VITE_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=isi_dari_firebase_console
VITE_FIREBASE_APP_ID=isi_dari_firebase_console
```

Semua variabel tersebut harus terisi agar Firebase diinisialisasi. Jangan
memasukkan Firebase service-account JSON, private key, atau kredensial server
lainnya ke frontend maupun file `.env` yang di-commit.

## Menjalankan project

Pastikan Node.js dan npm sudah terpasang, lalu jalankan:

```powershell
npm install
npm run dev
```

Vite akan menampilkan alamat development, biasanya
`http://localhost:5173`.

Perintah lain yang tersedia:

```powershell
npm run lint     # Memeriksa aturan ESLint
npm run build    # Membuat build production
npm run preview  # Menjalankan preview hasil build
```

## Akun dan role pengguna

Pendaftaran melalui halaman **Sign Up**:

1. Membuat akun di Firebase Authentication.
2. Membuat dokumen `users/{uid}` di Firestore dengan role `penghuni`.

Untuk membuat admin pertama:

1. Daftarkan akun melalui halaman **Sign Up**.
2. Buka koleksi `users` di Firestore.
3. Ubah field `role` pada dokumen akun tersebut dari `penghuni` menjadi
   `admin`.
4. Login ulang menggunakan akun tersebut.

Role disimpan di dokumen Firestore, bukan hanya di `localStorage`. Karena itu,
perubahan role harus dilakukan pada dokumen `users` yang benar dan mengikuti
format field yang digunakan aplikasi.

## Koleksi Firestore

Aplikasi menggunakan koleksi berikut:

| Koleksi | Kegunaan |
| --- | --- |
| `users` | Profil akun, role, nomor kamar, dan data penghuni |
| `kamar` | Data kamar, harga, status hunian, fasilitas, foto, dan pembayaran |
| `tagihan` | Riwayat atau data pembayaran tagihan |
| `penghuni` | Data penghuni yang didaftarkan admin |
| `tiket_perbaikan` | Tiket komplain/perbaikan dari penghuni |
| `pesan` | Chat publik, pengajuan sewa, dan balasan admin |

Saat admin pertama kali membuka dashboard dan koleksi `kamar` masih kosong,
aplikasi membuat data kamar contoh secara otomatis. Hapus atau ubah data contoh
tersebut sesuai kebutuhan setelah setup selesai.

## Rute aplikasi

### Publik dan autentikasi

- `/` atau `/katalog` — katalog kamar publik
- `/splash` — splash screen
- `/login` — login
- `/signup` — pendaftaran akun

### Admin

Semua rute admin membutuhkan role `admin`:

- `/admin` — dashboard admin
- `/admin/tagihan` — tagihan
- `/admin/tiket` — tiket perbaikan
- `/admin/penghuni` — data penghuni
- `/admin/kamar` — data kamar
- `/admin/pesan` — pesan masuk

### Penghuni

Semua rute penghuni membutuhkan role `penghuni`:

- `/penghuni` — dashboard penghuni
- `/penghuni/komplain` — pengajuan komplain
- `/penghuni/peraturan` — peraturan kost
- `/penghuni/akun` — pengaturan akun

## Struktur folder utama

```text
src/
├── Layouts/       # Layout dashboard admin dan penghuni
├── components/    # Komponen UI bersama
├── context/       # State autentikasi dan data Firestore
├── lib/           # Inisialisasi Firebase
└── pages/         # Halaman publik, auth, admin, dan penghuni
```

## Catatan keamanan

Firebase API key untuk aplikasi Web memang dapat terlihat di frontend, tetapi
akses data tetap harus diamankan dengan Firestore Security Rules. Jangan
menonaktifkan rules untuk production dan jangan mengandalkan role yang hanya
disimpan di sisi client.
