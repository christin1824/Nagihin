import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ children, roleRequired }) {
  const { user, profile, loading, authError } = useAuth();

  if (loading) return <div className="min-h-screen grid place-items-center">Memuatkan sesi...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (authError) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <p className="font-semibold text-red-600">{authError}</p>
          <p className="mt-2 text-gray-600">
            Pastikan Firestore Rules sudah di-publish dan dokumen users/{user.uid} tersedia.
          </p>
        </div>
      </div>
    );
  }
  if (roleRequired && !profile) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <p className="font-semibold text-red-600">Profil akun belum ditemukan.</p>
          <p className="mt-2 text-gray-600">
            Buat dokumen users/{user.uid} dan isi role dengan &quot;admin&quot; di Firestore.
          </p>
        </div>
      </div>
    );
  }
  if (roleRequired && profile.role !== roleRequired) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <p className="font-semibold text-red-600">Akun ini belum memiliki akses admin.</p>
          <p className="mt-2 text-gray-600">
            Ubah field role pada users/{user.uid} menjadi &quot;admin&quot;.
          </p>
        </div>
      </div>
    );
  }
  
  return children;
}