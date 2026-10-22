import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Mengimpor gambar logo dari folder assets
import logoNagihin from '../../assets/logo.png';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Berpindah otomatis ke halaman katalog publik setelah 2.5 detik
    const timer = setTimeout(() => {
      navigate('/');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    // Membungkus seluruh layar dengan background putih murni
    <div className="flex h-screen w-full items-center justify-center bg-white">
      {/* Menampilkan logo dengan lebar proporsional dan efek animasi fade-in yang halus */}
      <img 
        src={logoNagihin} 
        alt="Logo Nagih.in" 
        className="w-56 md:w-72 animate-pulse duration-1000" 
      />
    </div>
  );
}