import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, roleRequired }) {
  // Simulasi semakan token login (Dalam aplikasi sebenar, periksa token dari localStorage)
  const isAuth = true; 
  const userRole = 'admin'; // Boleh diubah secara dinamik

  if (!isAuth) return <Navigate to="/login" replace />;
  if (roleRequired && userRole !== roleRequired) return <Navigate to="/" replace />;
  
  return children;
}