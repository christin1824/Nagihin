import { useState, useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { useAuth } from '../context/useAuth';
import logoNagihin from '../assets/logo.png';
import { IconGrid, IconWrench, IconUser, IconBook, IconSidebar, IconLogout } from '../components/Icons';

const menus = [
  { to: '/penghuni', label: 'Beranda', icon: <IconGrid />, end: true },
  { to: '/penghuni/komplain', label: 'Lapor Komplain', icon: <IconWrench /> },
  { to: '/penghuni/peraturan', label: 'Peraturan Kost', icon: <IconBook /> },
  { to: '/penghuni/akun', label: 'Akun Saya', icon: <IconUser /> },
];

// Tooltip hitam, hanya tampil saat sidebar tertutup
const Tooltip = ({ text, show }) =>
  show ? (
    <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-black px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 z-50">
      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-black" />
      {text}
    </span>
  ) : null;

export default function PenghuniLayout() {
  const navigate = useNavigate();
  const { kamarData } = useContext(AdminContext);
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const kamarPenghuni = String(
    profile?.kamar ?? profile?.room ?? profile?.kamar_id ?? profile?.nomor_kamar ?? ''
  ).trim().replace(/^kamar\s+/i, '');
  const saya = kamarData.find((k) => k.kamar === kamarPenghuni);

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className={`${collapsed ? 'w-[76px]' : 'w-[260px]'} bg-white flex flex-col shadow-lg z-10 transition-[width] duration-300`}>
        {/* Logo & Toggle */}
        <div className={`border-b border-gray-100 flex items-center ${collapsed ? 'flex-col gap-3 py-4' : 'justify-between p-4'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={logoNagihin} alt="Nagih.in" className={collapsed ? 'w-10' : 'w-12'} />
            {!collapsed && (
              <div className="whitespace-nowrap">
                <h1 className="text-lg font-bold text-[#1d3557] leading-tight">Nagih.in</h1>
                <p className="text-[10px] text-gray-500">Portal Penghuni</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
            className="group relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <IconSidebar />
            <Tooltip text={collapsed ? 'Buka sidebar' : 'Tutup sidebar'} show={collapsed} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {menus.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              aria-label={m.label}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 py-3 rounded-lg font-medium transition-colors ${
                  collapsed ? 'justify-center px-0' : 'px-4'
                } ${isActive ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              {m.icon}
              {!collapsed && <span>{m.label}</span>}
              <Tooltip text={m.label} show={collapsed} />
            </NavLink>
          ))}
        </nav>

        {/* Profil singkat & Logout */}
        <div className="px-3 pb-4 space-y-2">
          {!collapsed && saya && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
              <div className="w-9 h-9 rounded-full bg-[#415a77] text-white flex items-center justify-center font-bold text-sm">
                {saya.nama[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-[#1d3557] truncate">{saya.nama}</p>
                <p className="text-xs text-gray-500">Kamar {saya.kamar}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            aria-label="Keluar"
            className={`group relative w-full flex items-center gap-3 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center px-0' : 'px-4'}`}
          >
            <IconLogout />
            {!collapsed && <span>Keluar</span>}
            <Tooltip text="Keluar" show={collapsed} />
          </button>
        </div>
      </aside>

      <main className="flex-1 app-bg p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}