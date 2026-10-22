import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import {
  batchUpdate,
  createDocument,
  getCollection,
  updateDocument,
} from '../lib/api';
import { AdminContext } from './admin-context';

export { AdminContext };

const initialKamarData = [
  { kamar: '101', tipe: 'Reguler', hargaBaku: 1500000, status: 'Terisi', bayar: 'Belum Bayar', nama: 'Devanka Raditanti', hp: '08123456789', masuk: '2026-01-01', jumlah: 1500000, tempo: '2026-10-20', riwayatPembayaran: [] },
  { kamar: '102', tipe: 'Reguler', hargaBaku: 1500000, status: 'Terisi', bayar: 'Lunas', nama: 'Budi Santoso', hp: '08111111111', masuk: '2026-01-10', jumlah: 1500000, tempo: '2026-10-20', riwayatPembayaran: [] },
  { kamar: '103', tipe: 'VIP', hargaBaku: 2000000, status: 'Terisi', bayar: 'Lunas', nama: 'Kadek Candra', hp: '08198765432', masuk: '2026-02-15', jumlah: 2000000, tempo: '2026-10-20', riwayatPembayaran: [] },
  { kamar: '104', tipe: 'VIP', hargaBaku: 2000000, status: 'Terisi', bayar: 'Lunas', nama: 'Siti Aminah', hp: '08122222222', masuk: '2026-02-20', jumlah: 2000000, tempo: '2026-10-20', riwayatPembayaran: [] },
  { kamar: '105', tipe: 'Reguler', hargaBaku: 1500000, status: 'Kosong', bayar: 'Kosong', nama: '-', hp: '-', masuk: '-', jumlah: 0, tempo: '-', riwayatPembayaran: [] },
  { kamar: '106', tipe: 'Reguler', hargaBaku: 1500000, status: 'Kosong', bayar: 'Kosong', nama: '-', hp: '-', masuk: '-', jumlah: 0, tempo: '-', riwayatPembayaran: [] },
];

function normalizeRoom(data) {
  const rawStatus = data.status ?? data.status_kamar;
  const normalizedStatus = String(rawStatus ?? '').toLowerCase();
  return {
    ...data,
    _docId: data.id,
    kamar: String(
      data.kamar
      ?? data.nomor_kamar
      ?? data.room
      ?? data.kamar_id
      ?? data.id
    ),
    status: normalizedStatus === 'terisi'
      ? 'Terisi'
      : normalizedStatus === 'kosong'
        ? 'Kosong'
        : 'Kosong',
    bayar: data.bayar ?? 'Kosong',
    nama: data.nama ?? '-',
    hp: data.hp ?? '-',
    tipe: data.tipe ?? 'Reguler',
    hargaBaku: Number(data.hargaBaku ?? data.harga ?? 1500000),
    lantai: data.lantai ?? 'Lantai 1',
    fasilitas: Array.isArray(data.fasilitas) ? data.fasilitas : [],
    foto: data.foto ?? '',
    galeri: Array.isArray(data.galeri) ? data.galeri : [],
    deskripsi: data.deskripsi ?? '',
    masuk: data.masuk ?? '-',
    jumlah: Number(data.jumlah ?? 0),
    tempo: data.tempo ?? '-',
    riwayatPembayaran: data.riwayatPembayaran ?? [],
  };
}

function normalizeMessage(data) {
  return {
    ...data,
    _docId: data.id,
    id: data.id,
    nama: data.nama ?? 'Pengunjung',
    hp: data.hp ?? '-',
    pesan: data.pesan ?? '',
    waktu: data.waktu ?? '-',
    status: data.status ?? 'Baru',
    balasan: Array.isArray(data.balasan) ? data.balasan : [],
  };
}

async function saveCollection(collectionName, items, idField = '_docId') {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  await batchUpdate(collectionName, items.map((item) => ({
    ...item,
    id: item[idField] || item.id || item.kamar,
  })));
}

export function AdminProvider({ children }) {
  const bulanSemasa = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const [kamarData, setKamarState] = useState([]);
  const [tiketData, setTiketState] = useState([]);
  const [arsipPenghuni, setArsipPenghuni] = useState([]);
  const [tagihanData, setTagihanState] = useState([]); 
  const [penghuniData, setPenghuniState] = useState([]); // State koleksi penghuni
  const [akunPenghuniData, setAkunPenghuniState] = useState([]);
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

  const [loading, setLoading] = useState(Boolean(db));
  const [error, setError] = useState(db ? '' : 'Firebase belum dikonfigurasi.');
  const seededRooms = useRef(false);
  const [messageListenerReady, setMessageListenerReady] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!db) return undefined;

    let cancelled = false;
    const loadData = async (currentUser) => {
      if (!currentUser || cancelled) return;
      try {
        const profileResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/me`, {
          headers: { Authorization: `Bearer ${await currentUser.getIdToken()}` },
        });
        if (!profileResponse.ok) return;
        const { profile } = await profileResponse.json();
        if (!profile) return;

        const [rooms, tickets, bills, tenants] = await Promise.all([
          getCollection('kamar'),
          getCollection('tiket_perbaikan'),
          profile.role === 'admin' ? getCollection('tagihan') : Promise.resolve([]),
          profile.role === 'admin' ? getCollection('penghuni') : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setKamarState(rooms.map(normalizeRoom));
        setTiketState(tickets);
        setTagihanState(bills);
        setPenghuniState(tenants);

        if (profile.role === 'admin') {
          const [accounts, messages] = await Promise.all([
            getCollection('users', { field: 'role', value: 'penghuni' }),
            getCollection('pesan'),
          ]);
          if (accounts.length === 0 && !seededRooms.current) {
            seededRooms.current = true;
            await saveCollection('kamar', initialKamarData);
            setKamarState(initialKamarData.map((item) => ({ ...item, _docId: item.kamar })));
          }
          if (!cancelled) {
            setAkunPenghuniState(accounts);
            setPesanData(messages.map(normalizeMessage));
            setMessageListenerReady(true);
          }
        }
        setLoading(false);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, loadData);
    const intervalId = window.setInterval(() => {
      if (auth.currentUser) loadData(auth.currentUser);
    }, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      unsubscribeAuth();
    };
  }, []);

  const setKamarData = (nextValue) => {
    const nextData = typeof nextValue === 'function' ? nextValue(kamarData) : nextValue;
    setKamarState(nextData);
    return saveCollection('kamar', nextData).catch((err) => {
      setError(err.message);
      throw err;
    });
  };

  const addKamar = async (room) => {
    await saveCollection('kamar', [room]);
  };

  const setTiketData = (nextValue) => {
    const nextData = typeof nextValue === 'function' ? nextValue(tiketData) : nextValue;
    setTiketState(nextData);
    return saveCollection('tiket_perbaikan', nextData, 'id').catch((err) => {
      setError(err.message);
      throw err;
    });
  };

  const buatLaporanKomplain = async (laporan) => {
    if (!db) throw new Error('Firebase belum dikonfigurasi.');
    const laporanResponse = await createDocument('tiket_perbaikan', laporan);
    return laporanResponse.id;
  };

  const generateTagihanBulanan = () => {
    const today = new Date();
    const nextTempo = new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0];
    setKamarData((previousData) => previousData.map((room) => room.status === 'Terisi'
      ? { ...room, bayar: 'Belum Bayar', jumlah: room.hargaBaku, tempo: nextTempo }
      : room));
  };

  const bayarTagihan = async (nomorKamar, dataPembayaran) => {
    try {
      await createDocument('tagihan', {
        kamar_id: nomorKamar,
        ...dataPembayaran,
        waktu_dibuat: new Date().toISOString()
      });
      const kamarUpdate = kamarData.find(k => k.kamar === nomorKamar);
      if(kamarUpdate) await saveCollection('kamar', [{ ...kamarUpdate, bayar: 'Lunas' }]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fungsi Tambah Penghuni (Tersimpan di koleksi 'penghuni' dan 'kamar')
  const tambahPenghuni = async (nomorKamar, dataPenghuni) => {
    try {
      await createDocument('penghuni', {
        kamar_id: nomorKamar,
        ...dataPenghuni,
        status_sewa: 'Aktif',
        waktu_didaftarkan: new Date().toISOString()
      });

      const kamarUpdate = kamarData.find(k => k.kamar === nomorKamar);
      if(kamarUpdate) {
        await saveCollection('kamar', [{
           ...kamarUpdate,
           status: 'Terisi',
           bayar: 'Belum Bayar',
           nama: dataPenghuni.nama,
           hp: dataPenghuni.hp,
           masuk: dataPenghuni.tanggalMasuk,
           jumlah: kamarUpdate.hargaBaku || 1500000,
           tempo: dataPenghuni.tempo
        }]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Fungsi Check Out
  const checkOutPenghuni = async (nomorKamar) => {
    try {
      const kamarUpdate = kamarData.find(k => k.kamar === nomorKamar);
      if(kamarUpdate) {
        await saveCollection('kamar', [{
           ...kamarUpdate,
           status: 'Kosong',
           bayar: 'Kosong',
           nama: '-',
           hp: '-',
           masuk: '-',
           jumlah: 0,
           tempo: '-'
        }]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const updatePesanData = (nextValue) => {
    const nextData = typeof nextValue === 'function' ? nextValue(pesanData) : nextValue;
    setPesanData(nextData);

    if (!db || !messageListenerReady) return;

    nextData.forEach((message) => {
      const documentId = message._docId || String(message.id);
      const data = { ...message };
      delete data._docId;
      updateDocument('pesan', documentId, data).catch((err) => setError(err.message));
    });
  };

  const kirimPesanPublik = async ({ nama, hp, pesan }) => {
    if (!db) throw new Error('Firebase belum dikonfigurasi.');
    if (!auth) throw new Error('Firebase Authentication belum dikonfigurasi.');
    const currentUser = auth.currentUser || (await signInAnonymously(auth)).user;

    await createDocument('pesan', {
      clientUid: currentUser.uid,
      nama,
      hp,
      pesan,
      waktu: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Baru',
      balasan: [],
      createdAt: new Date().toISOString(),
    });
  };

  const sewaKamarPublik = ({ nomorKamar, nama, hp, tanggalMasuk, catatan }) => {
    kirimPesanPublik({
      nama,
      hp,
      pesan: `[Pengajuan Sewa] Halo, saya mengajukan sewa untuk Kamar ${nomorKamar}. Tanggal masuk: ${tanggalMasuk}.${catatan ? ` Catatan: ${catatan}` : ''}`,
    });
  };

  return (
    <AdminContext.Provider value={{
      kamarData, setKamarData,
      tiketData, setTiketData,
      buatLaporanKomplain,
      arsipPenghuni, setArsipPenghuni,
      tagihanData, penghuniData, akunPenghuniData,
      pesanData, setPesanData: updatePesanData,
      bayarTagihan, tambahPenghuni, checkOutPenghuni,
      kirimPesanPublik, sewaKamarPublik,
      bulanSemasa, generateTagihanBulanan,
      loading, error,
      showToast,
      addKamar,
    }}>
      {children}
      {toast && (
        <div
          role="status"
          className={`fixed right-6 top-6 z-[1000] max-w-sm rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${
            toast.type === 'error'
              ? 'bg-red-600'
              : toast.type === 'success'
                ? 'bg-emerald-600'
                : 'bg-[#1d3557]'
          }`}
        >
          {toast.message}
        </div>
      )}
    </AdminContext.Provider>
  );
}