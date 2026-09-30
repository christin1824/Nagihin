import { Outlet, Link, useLocation } from 'react-router-dom';
import logoNagihin from '../assets/logo.png'; 

export default function AdminLayout() {
  const location = useLocation();

  // Fungsi untuk mengecek menu mana yang sedang aktif
  const isActive = (path) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-[260px] bg-white flex flex-col shadow-lg z-10">
        {/* Logo & Judul */}
        <div className="p-6 flex flex-col items-center border-b border-gray-100">
          <img src={logoNagihin} alt="Nagih.in" className="w-20 mb-2" />
          <h1 className="text-xl font-bold text-[#1d3557]">Nagih.in</h1>
          <p className="text-[10px] text-gray-500">Management System</p>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            to="/admin" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin') ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <span>📄</span> Dashboard
          </Link>
          <Link 
            to="/admin/tagihan" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/tagihan') ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <span>💰</span> Tagihan
          </Link>
          <Link 
            to="/admin/tiket" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/tiket') ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <span>⚙️</span> Ticketing
          </Link>
          <Link 
            to="/admin/penghuni" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/admin/penghuni') ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <span>👥</span> Penghuni
          </Link>
        </nav>
      </aside>

      {/* --- AREA KONTEN UTAMA --- */}
      {/* Latar belakang dengan gradasi 3 warna: Hijau Tosca -> Terang -> Biru Slate */}
      <main className="flex-1 bg-gradient-to-b from-[#73bba7] via-[#d6e5e5] to-[#5b738c] p-8 overflow-y-auto">
        <Outlet />
      </main>
      
    </div>
  );
}