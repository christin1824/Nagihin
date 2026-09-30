import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext'; 
import ProtectedRoute from './components/ProtectedRoute'; 

// Import halaman Auth
import SplashScreen from './pages/auth/SplashScreen';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';

// Import halaman Admin yang SUDAH ADA
import AdminLayout from './layouts/AdminLayout';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import TagihanAdmin from './pages/admin/TagihanAdmin';
import TiketAdmin from './pages/admin/TiketAdmin';
import PenghuniAdmin from './pages/admin/PenghuniAdmin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Rute admin diproteksi dan dibungkus AdminProvider agar datanya sinkron */}
        <Route path="/admin" element={
          <ProtectedRoute roleRequired="admin">
            <AdminProvider>
              <AdminLayout />
            </AdminProvider>
          </ProtectedRoute>
        }>
          <Route index element={<DashboardAdmin />} />
          <Route path="tagihan" element={<TagihanAdmin />} />
          <Route path="tiket" element={<TiketAdmin />} />
          <Route path="penghuni" element={<PenghuniAdmin />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}