# React + Vite

## Menjalankan dengan Firebase

Project ini menggunakan Firebase Authentication dan Cloud Firestore. Tidak perlu
membuat server Express terpisah untuk fitur login dan data admin.

1. Di Firebase Console, buka **Project settings > Your apps**, tambahkan aplikasi
   Web (`</>`), lalu salin konfigurasi Firebase.
2. Aktifkan **Authentication > Sign-in method > Email/Password**.
3. Pastikan Cloud Firestore sudah dibuat.
4. Salin `.env.example` menjadi `.env`, lalu isi semua nilai `VITE_FIREBASE_*`
   dari konfigurasi aplikasi Web Firebase.
5. Jalankan project:

```powershell
npm install
npm run dev
```

Pendaftaran dari halaman Sign Up membuat akun Authentication dan dokumen
`users/{uid}` dengan role `penghuni`. Untuk akun admin pertama, ubah field
`role` dokumen user tersebut menjadi `admin` di Firestore. Koleksi `kamar` dan
`tiket_perbaikan` akan dipakai langsung oleh dashboard; bila `kamar` masih
kosong, data contoh dashboard akan dibuat otomatis sekali.

Jangan memasukkan Firebase service-account JSON atau private key ke frontend.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
