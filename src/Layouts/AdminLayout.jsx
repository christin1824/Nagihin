import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  IconGrid,
  IconDollar,
  IconTicket,
  IconUsers,
  IconBuilding,
  IconMessage,
  IconSidebar,
  IconLogout,
} from '../components/Icons';
import logoNagihin from '../assets/logo.png';

const menus = [
  { to: '/admin', label: 'Dashboard', icon: <IconGrid /> },
  { to: '/admin/tagihan', label: 'Tagihan', icon: <IconDollar /> },
  { to: '/admin/tiket', label: 'Ticketing', icon: <IconTicket /> },
  { to: '/admin/penghuni', label: 'Penghuni', icon: <IconUsers /> },
  { to: '/admin/kamar', label: 'Kamar', icon: <IconBuilding /> },
  { to: '/admin/pesan', label: 'Pesan', icon: <IconMessage /> },
];

const Tooltip = ({ text, show }) =>
  show ? (
    <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-black px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 z-50">
      <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-black" />
      {text}
    </span>
  ) : null;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* --- SIDEBAR --- */}
      <aside
        className={`${
          collapsed ? 'w-[76px]' : 'w-[260px]'
        } bg-white flex flex-col shadow-lg z-10 transition-[width] duration-300`}
      >
        {/* Logo & Toggle */}
        <div
          className={`border-b border-gray-100 flex items-center ${
            collapsed ? 'flex-col gap-3 py-4' : 'justify-between p-4'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={logoNagihin} alt="Nagih.in" className={collapsed ? 'w-10' : 'w-12'} />
            {!collapsed && (
              <div className="whitespace-nowrap">
                <h1 className="text-lg font-bold text-[#1d3557] leading-tight">Nagih.in</h1>
                <p className="text-[10px] text-gray-500 font-medium">Management System</p>
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

        {/* Menu Navigasi */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {menus.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              aria-label={m.label}
              className={`group relative flex items-center gap-3 py-3 rounded-xl font-semibold transition-all ${
                collapsed ? 'justify-center px-0' : 'px-4'
              } ${
                isActive(m.to)
                  ? 'bg-[#e2e8f0] text-[#1d3557] shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="shrink-0">{m.icon}</span>
              {!collapsed && <span>{m.label}</span>}
              <Tooltip text={m.label} show={collapsed} />
            </Link>
          ))}
        </nav>

        {/* Profil Singkat & Logout */}
        <div className="px-3 pb-4 space-y-2 border-t border-gray-100 pt-3">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-full bg-[#1d3557] text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                A
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-[#1d3557] truncate leading-tight">Juragan Kost</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            aria-label="Keluar"
            className={`group relative w-full flex items-center gap-3 py-2.5 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors ${
              collapsed ? 'justify-center px-0' : 'px-4'
            }`}
          >
            <IconLogout />
            {!collapsed && <span>Keluar</span>}
            <Tooltip text="Keluar" show={collapsed} />
          </button>
        </div>
      </aside>

      {/* --- AREA KONTEN UTAMA --- */}
      <main className="flex-1 app-bg p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}