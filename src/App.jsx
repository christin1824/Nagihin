import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext'; 
import ProtectedRoute from './components/ProtectedRoute'; 

// Import halaman Publik (Untuk khalayak umum / penyewa)
import KatalogPublik from './pages/public/KatalogPublik';

// Import halaman Auth
import SplashScreen from './pages/auth/SplashScreen';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';

// Import halaman Admin
import AdminLayout from './Layouts/AdminLayout';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import TagihanAdmin from './pages/admin/TagihanAdmin';
import TiketAdmin from './pages/admin/TiketAdmin';
import PenghuniAdmin from './pages/admin/PenghuniAdmin';
import KamarAdmin from './pages/admin/KamarAdmin';
import PesanAdmin from './pages/admin/PesanAdmin';

// Import halaman Penghuni
import PenghuniLayout from './Layouts/PenghuniLayout';
import DashboardPenghuni from './pages/penghuni/DashboardPenghuni';
import KomplainPenghuni from './pages/penghuni/KomplainPenghuni';
import PeraturanPenghuni from './pages/penghuni/PeraturanPenghuni';
import AkunPenghuni from './pages/penghuni/AkunPenghuni';

export default function App() {
  return (
    <BrowserRouter>
      {/* Satu provider pusat agar data kamar, sewa publik, pesan chat, tagihan, dan tiket sinkron realtime */}
      <AdminProvider>
        <Routes>
          {/* --- RUTE PUBLIK (KHALAYAK UMUM) --- */}
          <Route path="/" element={<KatalogPublik />} />
          <Route path="/katalog" element={<KatalogPublik />} />

          {/* --- RUTE AUTH & SPLASH --- */}
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* --- RUTE ADMIN (JURAGAN KOST) --- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardAdmin />} />
            <Route path="tagihan" element={<TagihanAdmin />} />
            <Route path="tiket" element={<TiketAdmin />} />
            <Route path="penghuni" element={<PenghuniAdmin />} />
            <Route path="kamar" element={<KamarAdmin />} />
            <Route path="pesan" element={<PesanAdmin />} />
          </Route>

          {/* --- RUTE PENGHUNI --- */}
          <Route
            path="/penghuni"
            element={
              <ProtectedRoute roleRequired="penghuni">
                <PenghuniLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPenghuni />} />
            <Route path="komplain" element={<KomplainPenghuni />} />
            <Route path="peraturan" element={<PeraturanPenghuni />} />
            <Route path="akun" element={<AkunPenghuni />} />
          </Route>
        </Routes>
      </AdminProvider>
    </BrowserRouter>
  );
}