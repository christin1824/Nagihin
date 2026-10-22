# Nagih.in

Nagih.in adalah aplikasi manajemen kost. Frontend dibuat dengan
React dan Vite, sedangkan backend dibuat dengan Node.js dan Express.
Frontend berkomunikasi dengan backend melalui REST API. Backend menggunakan
Firebase Admin SDK untuk memverifikasi autentikasi dan mengakses Cloud
Firestore.

## Fitur

- Katalog kamar publik dengan pencarian dan filter tipe/status kamar.
- Pengajuan sewa dan chat dengan pengelola dari halaman publik.
- Login dan pendaftaran penghuni menggunakan Firebase Authentication.
- Dashboard admin untuk mengelola kamar, penghuni, tagihan, tiket perbaikan,
  dan pesan masuk.
- Dashboard penghuni untuk melihat kamar, mengirim komplain, dan mengelola
  akun.
- Pengambilan data aplikasi melalui REST API Node.js dengan Cloud Firestore
  sebagai database.

## Teknologi

- React 19
- Vite
- React Router
- Tailwind CSS
- Node.js dan Express
- Firebase Authentication
- Cloud Firestore
- Firebase Admin SDK

## Arsitektur

```text
Browser
  React + Vite
      │
      │ REST API + Firebase ID token
      ▼
Node.js + Express
      │
      │ Firebase Admin SDK
      ▼
Firebase Authentication + Cloud Firestore
```

Frontend tidak mengakses koleksi Firestore secara langsung untuk operasi data
aplikasi. Firebase Client SDK tetap digunakan di frontend hanya untuk login,
signup, anonymous authentication, dan mendapatkan ID token. Token tersebut
dikirim ke backend melalui header `Authorization: Bearer <token>`.

## Persiapan Firebase

1. Buat atau buka project di
   [Firebase Console](https://console.firebase.google.com/).
2. Buka **Project settings > Your apps**, tambahkan aplikasi Web (`</>`), lalu
   salin konfigurasi Firebase.
3. Di **Authentication > Sign-in method**, aktifkan:
   - **Email/Password** untuk login dan pendaftaran admin/penghuni.
   - **Anonymous** untuk chat dan pengajuan sewa dari pengunjung publik.
4. Buat database di **Firestore Database**.
5. Publish isi [`firestore.rules`](./firestore.rules) pada tab **Rules** di
   Firestore.
6. Buka **Project settings > Service accounts**, lalu generate private key
   baru. Kredensial ini hanya digunakan oleh backend. Jangan commit file JSON
   service account.

## Konfigurasi environment

File `.env` di root project dapat memuat konfigurasi frontend dan backend.
Salin [`.env.example`](./.env.example) menjadi `.env`, lalu isi konfigurasi
aplikasi Web Firebase:

```env
VITE_FIREBASE_API_KEY=isi_dari_firebase_console
VITE_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=isi_dari_firebase_console
VITE_FIREBASE_APP_ID=isi_dari_firebase_console
VITE_API_URL=http://localhost:3001/api
```

Tambahkan konfigurasi backend berdasarkan
[`.env.server.example`](./.env.server.example):

```env
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID=project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nisi_private_key\n-----END PRIVATE KEY-----\n"
```

`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, dan `FIREBASE_PRIVATE_KEY`
berasal dari file JSON service account. `FIREBASE_PRIVATE_KEY` harus
mempertahankan format `\n` seperti pada JSON.

Variabel tanpa prefix `VITE_` hanya dibaca oleh backend dan tidak dikirim ke
bundle frontend. Jangan memasukkan Firebase service-account JSON, private key,
atau kredensial server ke repository.

## Menjalankan project

Pastikan Node.js dan npm sudah terpasang, lalu jalankan:

```powershell
cd C:\layap\Nagih.in-Frontend
npm install
```

Jalankan backend pada terminal pertama:

```powershell
npm run server
```

Jalankan frontend pada terminal kedua:

```powershell
npm run dev
```

Backend berjalan di `http://localhost:3001`, sedangkan frontend Vite biasanya
berjalan di `http://localhost:5173`. Endpoint pemeriksaan backend adalah
`GET http://localhost:3001/api/health` dan seharusnya mengembalikan:

```json
{ "status": "ok" }
```

Perintah lain yang tersedia:

```powershell
npm run lint     # Memeriksa aturan ESLint
npm run build    # Membuat build production
npm run preview  # Menjalankan preview hasil build
```

## Akun dan role pengguna

Pendaftaran melalui halaman **Sign Up**:

1. Membuat akun di Firebase Authentication.
2. Membuat dokumen `users/{uid}` melalui backend dengan role `penghuni`.

Untuk membuat admin pertama:

1. Daftarkan akun melalui halaman **Sign Up**.
2. Buka koleksi `users` di Firestore.
3. Ubah field `role` pada dokumen akun tersebut dari `penghuni` menjadi
   `admin`.
4. Login ulang menggunakan akun tersebut.

Role disimpan di dokumen Firestore dan diverifikasi backend melalui Firebase
Admin SDK. Perubahan role harus dilakukan pada dokumen `users` yang benar.

## Koleksi Firestore

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

## API backend

Semua endpoint berikut menggunakan prefix `/api`:

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| `GET` | `/health` | Memeriksa status server |
| `GET` | `/me` | Membaca user dan profil login |
| `GET` | `/collections/:collectionName` | Membaca koleksi yang diizinkan |
| `POST` | `/collections/:collectionName` | Membuat dokumen |
| `PUT` | `/collections/:collectionName/:id` | Memperbarui dokumen |
| `DELETE` | `/collections/:collectionName/:id` | Menghapus dokumen admin |
| `POST` | `/collections/:collectionName/batch` | Memperbarui beberapa dokumen admin |

Endpoint selain `/health` menggunakan Firebase ID token. Akses admin
diverifikasi dari field `role` pada dokumen `users/{uid}`.

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
server/
├── index.js              # Server Express dan route API
├── firebaseAdmin.js      # Inisialisasi Firebase Admin SDK
└── middleware/auth.js    # Verifikasi token dan role
src/
├── Layouts/              # Layout dashboard admin dan penghuni
├── components/           # Komponen UI bersama
├── context/              # State autentikasi dan data aplikasi
├── lib/
│   ├── api.js            # Client REST API backend
│   └── firebase.js       # Firebase Client untuk autentikasi/token
└── pages/                # Halaman publik, auth, admin, dan penghuni
```

## Catatan keamanan

Firebase API key untuk aplikasi Web memang dapat terlihat di frontend, tetapi
kredensial Firebase Admin hanya boleh berada di backend. Backend memverifikasi
ID token Firebase sebelum melayani endpoint yang membutuhkan login dan
memeriksa role admin dari dokumen `users`.

File [`.gitignore`](./.gitignore) sudah mengabaikan `.env`, `.env.*`, dan file
service account. Jika private key pernah terbagi atau ter-commit, cabut key
tersebut di Google Cloud/Firebase dan generate key baru.
