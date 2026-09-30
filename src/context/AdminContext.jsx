import { createContext, useState, useEffect } from 'react';

export const AdminContext = createContext();

export function AdminProvider({ children }) {
  const bulanSemasa = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Data diperluas: Tambah harga baku kamar, tipe, dan array riwayatPembayaran
  const [kamarData, setKamarData] = useState([
    { kamar: '101', tipe: 'Reguler', hargaBaku: 1500000, status: 'Terisi', bayar: 'Belum Bayar', nama: 'Devanka Raditanti', hp: '08123456789', masuk: '2026-01-01', jumlah: 1500000, tempo: '2026-10-20', riwayatPembayaran: [] },
    { kamar: '102', tipe: 'Reguler', hargaBaku: 1500000, status: 'Terisi', bayar: 'Lunas', nama: 'Budi Santoso', hp: '08111111111', masuk: '2026-01-10', jumlah: 1500000, tempo: '2026-10-20', riwayatPembayaran: [] },
    { kamar: '103', tipe: 'VIP', hargaBaku: 2000000, status: 'Terisi', bayar: 'Lunas', nama: 'Kadek Candra', hp: '08198765432', masuk: '2026-02-15', jumlah: 2000000, tempo: '2026-10-20', riwayatPembayaran: [] },
    { kamar: '104', tipe: 'VIP', hargaBaku: 2000000, status: 'Terisi', bayar: 'Lunas', nama: 'Siti Aminah', hp: '08122222222', masuk: '2026-02-20', jumlah: 2000000, tempo: '2026-10-20', riwayatPembayaran: [] },
    { kamar: '105', tipe: 'Reguler', hargaBaku: 1500000, status: 'Kosong', bayar: 'Kosong', nama: '-', hp: '-', masuk: '-', jumlah: 0, tempo: '-', riwayatPembayaran: [] },
    { kamar: '106', tipe: 'Reguler', hargaBaku: 1500000, status: 'Kosong', bayar: 'Kosong', nama: '-', hp: '-', masuk: '-', jumlah: 0, tempo: '-', riwayatPembayaran: [] },
  ]);

  const [tiketData, setTiketData] = useState([
    { id: 1, kamar: '101', kategori: 'AC', deskripsi: 'AC tidak dingin', tanggal: `14 Okt 2026`, status: 'Diproses' },
  ]);

  // State baru untuk menyimpan arsip penghuni yang sudah check-out (Fitur 2)
  const [arsipPenghuni, setArsipPenghuni] = useState([]);

  // FITUR 7: Cek Status Jatuh Tempo Otomatis saat aplikasi dimuat
  useEffect(() => {
    const today = new Date();
    setKamarData(prevData => prevData.map(k => {
      if (k.status === 'Terisi' && k.bayar === 'Belum Bayar') {
        const tempoDate = new Date(k.tempo);
        if (today > tempoDate) {
          return { ...k, bayar: 'Jatuh Tempo' };
        }
      }
      return k;
    }));
  }, []);

  // FITUR 3: Fungsi Generate Tagihan Bulanan Otomatis
  const generateTagihanBulanan = () => {
    const today = new Date();
    const nextTempo = new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0]; // Set tempo tanggal 20 bulan ini

    setKamarData(prevData => prevData.map(k => {
      if (k.status === 'Terisi') {
        return { 
          ...k, 
          bayar: 'Belum Bayar', 
          jumlah: k.hargaBaku, // Mengambil harga dari master data kamar
          tempo: nextTempo
        };
      }
      return k;
    }));
  };

  return (
    <AdminContext.Provider value={{ 
      kamarData, setKamarData, 
      tiketData, setTiketData, 
      arsipPenghuni, setArsipPenghuni,
      bulanSemasa, generateTagihanBulanan 
    }}>
      {children}
    </AdminContext.Provider>
  );
}