import { createContext, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { IconCheck, IconAlert, IconInfo, IconX } from '../components/Icons';

export const AdminContext = createContext();

export function AdminProvider({ children }) {
  const bulanSemasa = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // 1. DATA KAMAR: Dilengkapi foto, galeri, ukuran, deskripsi, lantai, fasilitas
  const [kamarData, setKamarData] = useState([
    {
      kamar: '101',
      tipe: 'Reguler',
      hargaBaku: 1500000,
      lantai: 'Lantai 1',
      ukuran: '3 x 4 m',
      foto: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      galeri: [
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      ],
      deskripsi:
        'Kamar nyaman dan bersih dengan pencahayaan alami, dilengkapi kasur single empuk, lemari pakaian 2 pintu, dan meja belajar.',
      fasilitas: ['Kipas Angin', 'Kasur Single', 'Lemari', 'Meja Belajar'],
      status: 'Terisi',
      bayar: 'Belum Bayar',
      nama: 'Devanka Raditanti',
      hp: '08123456789',
      masuk: '2026-01-01',
      jumlah: 1500000,
      tempo: '2026-10-20',
      riwayatPembayaran: [],
    },
    {
      kamar: '102',
      tipe: 'Reguler',
      hargaBaku: 1500000,
      lantai: 'Lantai 1',
      ukuran: '3 x 4 m',
      foto: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      galeri: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?auto=format&fit=crop&w=800&q=80',
      ],
      deskripsi:
        'Kamar bernuansa hangat dengan lantai bersih, kasur single berkualitas, meja kerja dan sirkulasi udara baik.',
      fasilitas: ['Kipas Angin', 'Kasur Single', 'Lemari'],
      status: 'Terisi',
      bayar: 'Lunas',
      nama: 'Budi Santoso',
      hp: '08111111111',
      masuk: '2026-01-10',
      jumlah: 1500000,
      tempo: '2026-10-20',
      riwayatPembayaran: [],
    },
    {
      kamar: '103',
      tipe: 'VIP',
      hargaBaku: 2000000,
      lantai: 'Lantai 1',
      ukuran: '4 x 5 m',
      foto: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      galeri: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
      ],
      deskripsi:
        'Kamar tipe VIP eksklusif dengan AC dingin, WiFi kencang, kasur Queen Size, kamar mandi dalam dengan shower, dan balkon pribadi.',
      fasilitas: ['AC', 'WiFi', 'Kasur Queen', 'Kamar Mandi Dalam', 'Balkon', 'Water Heater'],
      status: 'Terisi',
      bayar: 'Lunas',
      nama: 'Kadek Candra',
      hp: '08198765432',
      masuk: '2026-02-15',
      jumlah: 2000000,
      tempo: '2026-10-20',
      riwayatPembayaran: [],
    },
    {
      kamar: '104',
      tipe: 'VIP',
      hargaBaku: 2000000,
      lantai: 'Lantai 2',
      ukuran: '4 x 5 m',
      foto: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
      galeri: [
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      ],
      deskripsi:
        'Kamar VIP di lantai 2 yang tenang dan terang. Dilengkapi AC, internet cepat, kamar mandi pribadi, serta interior minimalis modern.',
      fasilitas: ['AC', 'WiFi', 'Kasur Queen', 'Kamar Mandi Dalam', 'Meja Kerja'],
      status: 'Terisi',
      bayar: 'Lunas',
      nama: 'Siti Aminah',
      hp: '08122222222',
      masuk: '2026-02-20',
      jumlah: 2000000,
      tempo: '2026-10-20',
      riwayatPembayaran: [],
    },
    {
      kamar: '105',
      tipe: 'Reguler',
      hargaBaku: 1500000,
      lantai: 'Lantai 2',
      ukuran: '3 x 4 m',
      foto: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      galeri: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      ],
      deskripsi:
        'Kamar Reguler siap huni di lantai 2. Kondisi bersih terawat, ventilasi segar, kasur single baru, siap disewa sekarang.',
      fasilitas: ['Kipas Angin', 'Kasur Single', 'Lemari', 'Jendela Luas'],
      status: 'Kosong',
      bayar: 'Kosong',
      nama: '-',
      hp: '-',
      masuk: '-',
      jumlah: 0,
      tempo: '-',
      riwayatPembayaran: [],
    },
    {
      kamar: '106',
      tipe: 'Reguler',
      hargaBaku: 1500000,
      lantai: 'Lantai 2',
      ukuran: '3 x 4 m',
      foto: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      galeri: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      ],
      deskripsi:
        'Kamar Reguler lantai 2 dengan pencahayaan optimal, tenang, aman dan sangat nyaman untuk istirahat.',
      fasilitas: ['Kipas Angin', 'Kasur Single', 'Lemari'],
      status: 'Kosong',
      bayar: 'Kosong',
      nama: '-',
      hp: '-',
      masuk: '-',
      jumlah: 0,
      tempo: '-',
      riwayatPembayaran: [],
    },
  ]);

  const [tiketData, setTiketData] = useState([
    { id: 1, kamar: '101', kategori: 'AC', deskripsi: 'AC tidak dingin', tanggal: `14 Okt 2026`, status: 'Diproses' },
  ]);

  const [arsipPenghuni, setArsipPenghuni] = useState([]);

  // 2. DATA KOTAK MASUK (Chat publik & inkuiri)
  const [pesanData, setPesanData] = useState([
    {
      id: 1,
      nama: 'Bima',
      hp: '08122334455',
      pesan: 'Halo min, untuk kamar 105 apakah masih tersedia bulan ini?',
      waktu: '10:30',
      status: 'Baru',
      balasan: [],
    },
    {
      id: 2,
      nama: 'Siska',
      hp: '08998877665',
      pesan: 'Kamar VIP ada water heater tidak ya?',
      waktu: 'Kemarin',
      status: 'Dibaca',
      balasan: [],
    },
  ]);

  // 3. DATA PAPAN PENGUMUMAN KOST (Broadcast Admin -> Penghuni)
  const [pengumumanData, setPengumumanData] = useState([
    {
      id: 1,
      judul: 'Pemeliharaan Rutin Tandon Air & Pompa',
      kategori: 'Pemeliharaan',
      isi: 'Akan dilakukan pengurasan tandon air utama pada hari Sabtu pukul 09.00 - 11.00 WIB. Mohon menampung air secukupnya.',
      tanggal: '15 Okt 2026',
      aktif: true,
    },
    {
      id: 2,
      judul: 'Upgrade Bandwidth WiFi Kost ITS',
      kategori: 'Info Kost',
      isi: 'Jaringan WiFi Lantai 1 dan Lantai 2 kini telah ditingkatkan ke 150 Mbps. Password tetap sama seperti sebelumnya.',
      tanggal: '12 Okt 2026',
      aktif: true,
    },
  ]);

  // 4. SISTEM TOAST NOTIFICATION MODERN
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((pesan, tipe = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, pesan, tipe }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const tutupToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const tambahPengumuman = ({ judul, kategori, isi }) => {
    const baru = {
      id: Date.now(),
      judul,
      kategori: kategori || 'Info Kost',
      isi,
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      aktif: true,
    };
    setPengumumanData((prev) => [baru, ...prev]);
  };

  const togglePengumumanAktif = (id) => {
    setPengumumanData((prev) =>
      prev.map((p) => (p.id === id ? { ...p, aktif: !p.aktif } : p))
    );
  };

  const hapusPengumuman = (id) => {
    setPengumumanData((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    const today = new Date();
    setKamarData((prevData) =>
      prevData.map((k) => {
        if (k.status === 'Terisi' && k.bayar === 'Belum Bayar') {
          const tempoDate = new Date(k.tempo);
          if (today > tempoDate) {
            return { ...k, bayar: 'Jatuh Tempo' };
          }
        }
        return k;
      })
    );
  }, []);

  const generateTagihanBulanan = () => {
    const today = new Date();
    const nextTempo = new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0];

    setKamarData((prevData) =>
      prevData.map((k) => {
        if (k.status === 'Terisi') {
          return {
            ...k,
            bayar: 'Belum Bayar',
            jumlah: k.hargaBaku,
            tempo: nextTempo,
          };
        }
        return k;
      })
    );
  };

  // Fungsi untuk calon penyewa publik menyewa kamar secara online
  const sewaKamarPublik = ({ nomorKamar, nama, hp, tanggalMasuk, catatan }) => {
    const today = new Date();
    const tempo = new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0];

    setKamarData((prev) =>
      prev.map((k) => {
        if (k.kamar === nomorKamar) {
          return {
            ...k,
            status: 'Terisi',
            bayar: 'Belum Bayar',
            nama,
            hp,
            masuk: tanggalMasuk,
            jumlah: k.hargaBaku,
            tempo,
            catatan,
          };
        }
        return k;
      })
    );

    // Otomatis kirim notifikasi/pesan masuk ke admin
    const pesanBaru = {
      id: Date.now(),
      nama,
      hp,
      pesan: `[Pengajuan Sewa] Halo, saya baru saja mengajukan sewa untuk Kamar ${nomorKamar}. Tanggal masuk: ${tanggalMasuk}. ${catatan ? `Catatan: ${catatan}` : ''}`,
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'Baru',
      balasan: [],
    };
    setPesanData((prev) => [pesanBaru, ...prev]);
  };

  // Fungsi untuk calon penyewa publik mengirim pesan chat ke admin
  const kirimPesanPublik = ({ nama, hp, pesan }) => {
    const pesanBaru = {
      id: Date.now(),
      nama,
      hp,
      pesan,
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'Baru',
      balasan: [],
    };
    setPesanData((prev) => [pesanBaru, ...prev]);
  };

  return (
    <AdminContext.Provider
      value={{
        kamarData,
        setKamarData,
        tiketData,
        setTiketData,
        arsipPenghuni,
        setArsipPenghuni,
        pesanData,
        setPesanData,
        pengumumanData,
        setPengumumanData,
        tambahPengumuman,
        togglePengumumanAktif,
        hapusPengumuman,
        showToast,
        bulanSemasa,
        generateTagihanBulanan,
        sewaKamarPublik,
        kirimPesanPublik,
      }}
    >
      {children}

      {/* GLOBAL FLOATING TOAST PORTAL */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0 print:hidden">
            {toasts.map((t) => {
              const isError = t.tipe === 'error';
              const isInfo = t.tipe === 'info';
              return (
                <div
                  key={t.id}
                  className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-fade-in ${
                    isError
                      ? 'bg-red-950/95 border-red-500/40 text-white'
                      : isInfo
                      ? 'bg-[#000f22]/95 border-[#5b86b6]/50 text-white'
                      : 'bg-emerald-950/95 border-emerald-500/40 text-white'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      isError
                        ? 'bg-red-500/20 border-red-500/40 text-red-300'
                        : isInfo
                        ? 'bg-[#3f6593]/30 border-[#80aad3]/40 text-[#c0e6fd]'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    {isError ? (
                      <IconAlert className="w-4 h-4" />
                    ) : isInfo ? (
                      <IconInfo className="w-4 h-4" />
                    ) : (
                      <IconCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-75 mb-0.5">
                      {isError ? 'Perhatian' : isInfo ? 'Informasi Sistem' : 'Berhasil'}
                    </p>
                    <p className="text-xs font-medium leading-relaxed text-white/95">{t.pesan}</p>
                  </div>
                  <button
                    onClick={() => tutupToast(t.id)}
                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition shrink-0"
                  >
                    <IconX className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </AdminContext.Provider>
  );
}