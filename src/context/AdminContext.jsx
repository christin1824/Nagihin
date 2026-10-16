import { useEffect, useRef, useState } from 'react';
import { collection, doc, onSnapshot, writeBatch, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdminContext } from './admin-context';

const initialKamarData = [
  { kamar: '101', tipe: 'Reguler', hargaBaku: 1500000, status: 'Terisi', bayar: 'Belum Bayar', nama: 'Devanka Raditanti', hp: '08123456789', masuk: '2026-01-01', jumlah: 1500000, tempo: '2026-10-20', riwayatPembayaran: [] },
  { kamar: '102', tipe: 'Reguler', hargaBaku: 1500000, status: 'Terisi', bayar: 'Lunas', nama: 'Budi Santoso', hp: '08111111111', masuk: '2026-01-10', jumlah: 1500000, tempo: '2026-10-20', riwayatPembayaran: [] },
  { kamar: '103', tipe: 'VIP', hargaBaku: 2000000, status: 'Terisi', bayar: 'Lunas', nama: 'Kadek Candra', hp: '08198765432', masuk: '2026-02-15', jumlah: 2000000, tempo: '2026-10-20', riwayatPembayaran: [] },
  { kamar: '104', tipe: 'VIP', hargaBaku: 2000000, status: 'Terisi', bayar: 'Lunas', nama: 'Siti Aminah', hp: '08122222222', masuk: '2026-02-20', jumlah: 2000000, tempo: '2026-10-20', riwayatPembayaran: [] },
  { kamar: '105', tipe: 'Reguler', hargaBaku: 1500000, status: 'Kosong', bayar: 'Kosong', nama: '-', hp: '-', masuk: '-', jumlah: 0, tempo: '-', riwayatPembayaran: [] },
  { kamar: '106', tipe: 'Reguler', hargaBaku: 1500000, status: 'Kosong', bayar: 'Kosong', nama: '-', hp: '-', masuk: '-', jumlah: 0, tempo: '-', riwayatPembayaran: [] },
];

function normalizeRoom(snapshot) {
  const data = snapshot.data();
  return {
    ...data,
    _docId: snapshot.id,
    kamar: data.kamar ?? data.nomor_kamar ?? snapshot.id,
    status: data.status ?? ((data.status_kamar || '').replace(/^./, (char) => char.toUpperCase()) || 'Kosong'),
    bayar: data.bayar ?? 'Kosong',
    nama: data.nama ?? '-',
    hp: data.hp ?? '-',
    riwayatPembayaran: data.riwayatPembayaran ?? [],
  };
}

async function saveCollection(collectionName, items, idField = '_docId') {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  const batch = writeBatch(db);
  items.forEach((item) => {
    const id = item[idField] || item.id || item.kamar;
    const data = { ...item };
    delete data._docId;
    delete data.id;
    batch.set(doc(db, collectionName, String(id)), data, { merge: true });
  });
  await batch.commit();
}

export function AdminProvider({ children }) {
  const bulanSemasa = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const [kamarData, setKamarState] = useState([]);
  const [tiketData, setTiketState] = useState([]);
  const [arsipPenghuni, setArsipPenghuni] = useState([]);
  const [tagihanData, setTagihanState] = useState([]); 
  const [penghuniData, setPenghuniState] = useState([]); // State koleksi penghuni

  const [loading, setLoading] = useState(Boolean(db));
  const [error, setError] = useState(db ? '' : 'Firebase belum dikonfigurasi.');
  const seededRooms = useRef(false);

  useEffect(() => {
    if (!db) return undefined;

    const unsubscribeRooms = onSnapshot(collection(db, 'kamar'), async (snapshot) => {
      if (snapshot.empty && !seededRooms.current) {
        seededRooms.current = true;
        await saveCollection('kamar', initialKamarData);
        return;
      }
      setKamarState(snapshot.docs.map(normalizeRoom));
      setLoading(false);
    }, (err) => setError(err.message));

    const unsubscribeTickets = onSnapshot(collection(db, 'tiket_perbaikan'), (snapshot) => {
      setTiketState(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
    }, (err) => setError(err.message));

    const unsubscribeTagihan = onSnapshot(collection(db, 'tagihan'), (snapshot) => {
      setTagihanState(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }, (err) => setError(err.message));

    // Listener koleksi penghuni
    const unsubscribePenghuni = onSnapshot(collection(db, 'penghuni'), (snapshot) => {
      setPenghuniState(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }, (err) => setError(err.message));

    return () => {
      unsubscribeRooms();
      unsubscribeTickets();
      unsubscribeTagihan();
      unsubscribePenghuni();
    };
  }, []);

  const setKamarData = (nextValue) => {
    const nextData = typeof nextValue === 'function' ? nextValue(kamarData) : nextValue;
    setKamarState(nextData);
    saveCollection('kamar', nextData).catch((err) => setError(err.message));
  };

  const addKamar = async (room) => {
    await saveCollection('kamar', [room]);
  };

  const setTiketData = (nextValue) => {
    const nextData = typeof nextValue === 'function' ? nextValue(tiketData) : nextValue;
    setTiketState(nextData);
    saveCollection('tiket_perbaikan', nextData, 'id').catch((err) => setError(err.message));
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
      await addDoc(collection(db, 'tagihan'), {
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
      await addDoc(collection(db, 'penghuni'), {
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

  return (
    <AdminContext.Provider value={{
      kamarData, setKamarData,
      tiketData, setTiketData,
      arsipPenghuni, setArsipPenghuni,
      tagihanData, penghuniData,
      bayarTagihan, tambahPenghuni, checkOutPenghuni,
      bulanSemasa, generateTagihanBulanan,
      loading, error,
      addKamar,
    }}>
      {children}
    </AdminContext.Provider>
  );
}