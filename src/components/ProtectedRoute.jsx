import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, roleRequired }) {
  // Simulasi sesi login: peran disimpan di localStorage saat login
  const userRole = localStorage.getItem('role');
  const isAuth = !!userRole;

  if (!isAuth) return <Navigate to="/login" replace />;
  // Jika peran tidak sesuai, arahkan ke dashboard milik perannya sendiri
  if (roleRequired && userRole !== roleRequired) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/penghuni'} replace />;
  }

  return children;
}