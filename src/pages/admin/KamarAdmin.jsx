import { useContext, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import Modal, { Field, inputClass, primaryBtn } from '../../components/Modal';
import { IconPlus, IconSearch, IconEdit, IconTrash } from '../../components/Icons';

const emptyForm = { kamar: '', tipe: 'Reguler', hargaBaku: '', lantai: 'Lantai 1', fasilitas: '' };

export default function KamarAdmin() {
  const { kamarData, setKamarData, showToast } = useContext(AdminContext);
  const [search, setSearch] = useState('');
  const [tipeFilter, setTipeFilter] = useState('Semua Tipe');
  const [modal, setModal] = useState(null); // null | 'tambah' | 'edit'
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const filteredKamar = kamarData
    .filter((k) => {
      const matchSearch =
        k.kamar.includes(search) || k.tipe.toLowerCase().includes(search.toLowerCase());
      const matchTipe = tipeFilter === 'Semua Tipe' || k.tipe === tipeFilter;
      return matchSearch && matchTipe;
    })
    .sort((a, b) => {
      const numberA = Number(a.kamar);
      const numberB = Number(b.kamar);

      if (Number.isNaN(numberA) || Number.isNaN(numberB)) {
        return a.kamar.localeCompare(b.kamar, 'id', { numeric: true });
      }

      return numberA - numberB;
    });

  const bukaTambah = () => {
    setForm(emptyForm);
    setModal('tambah');
  };

  const bukaEdit = (row) => {
    setForm({
      kamar: row.kamar,
      tipe: row.tipe,
      hargaBaku: row.hargaBaku,
      lantai: row.lantai,
      fasilitas: row.fasilitas.join(', '),
    });
    setModal('edit');
  };

  const parseFasilitas = (s) =>
    s
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const harga = Number(form.hargaBaku);
    const fasilitas = parseFasilitas(form.fasilitas);

    if (modal === 'tambah') {
      const nomor = form.kamar.trim();
      if (kamarData.some((k) => k.kamar === nomor)) {
        showToast(`Kamar ${nomor} sudah terdaftar di sistem!`, 'error');
        return;
      }
      setIsSaving(true);
      try {
        await setKamarData([
          ...kamarData,
          {
            kamar: nomor,
            tipe: form.tipe,
            hargaBaku: harga,
            lantai: form.lantai,
            fasilitas,
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
        setModal(null);
        showToast(`Kamar ${nomor} berhasil ditambahkan!`, 'success');
      } catch (saveError) {
        showToast(`Kamar gagal disimpan: ${saveError.message}`, 'error');
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(true);
      try {
        await setKamarData(
          kamarData.map((k) =>
            k.kamar === form.kamar
              ? {
                  ...k,
                  tipe: form.tipe,
                  hargaBaku: harga,
                  lantai: form.lantai,
                  fasilitas,
                  jumlah:
                    k.status === 'Terisi' && (k.bayar === 'Belum Bayar' || k.bayar === 'Jatuh Tempo')
                      ? harga
                      : k.jumlah,
                }
              : k
          )
        );
        setModal(null);
        showToast(`Perubahan data Kamar ${form.kamar} berhasil disimpan!`, 'success');
      } catch (saveError) {
        showToast(`Perubahan gagal disimpan: ${saveError.message}`, 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleHapus = (row) => {
    if (row.status === 'Terisi') {
      showToast('Kamar masih terisi! Check out penghuni terlebih dahulu sebelum menghapus kamar.', 'error');
      return;
    }
    if (window.confirm(`Hapus kamar ${row.kamar}?`)) {
      setKamarData(kamarData.filter((k) => k.kamar !== row.kamar));
      showToast(`Kamar ${row.kamar} telah dihapus.`, 'info');
    }
  };

  return (
    <div className="max-w-6xl mx-auto drop-shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
        <div>
          <h2 className="text-4xl font-bold mb-1 tracking-wide">Manajemen Kamar</h2>
          <p className="text-lg text-white/90 font-medium">
            Atur properti, tipe, lantai, harga baku, dan fasilitas kost
          </p>
        </div>
        <button onClick={bukaTambah} className={primaryBtn}>
          <IconPlus className="w-4 h-4" /> Tambah Kamar Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#f4f7fa] rounded-[20px] p-5 shadow-xl border border-white/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={tipeFilter}
            onChange={(e) => setTipeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#5b738c] bg-white text-gray-700 font-semibold outline-none shadow-sm cursor-pointer text-sm"
          >
            <option>Semua Tipe</option>
            <option>Reguler</option>
            <option>VIP</option>
          </select>

          <div className="relative flex-1 md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <IconSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari Nomor Kamar atau Tipe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#5b738c] bg-white text-gray-700 placeholder-gray-400 outline-none text-sm font-medium shadow-sm"
            />
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500 self-end md:self-center">
          Total {filteredKamar.length} Kamar Terdaftar
        </div>
      </div>

      {/* Tabel Kamar */}
      <div className="bg-[#f4f7fa] rounded-[20px] shadow-2xl border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-200/80 text-slate-700 text-xs uppercase tracking-wider font-extrabold border-b border-slate-300">
                <th className="py-4 px-6 text-center w-24">Kamar</th>
                <th className="py-4 px-6 w-36">Tipe & Lantai</th>
                <th className="py-4 px-6 w-40">Harga Baku</th>
                <th className="py-4 px-6">Fasilitas Kamar</th>
                <th className="py-4 px-6 text-center w-28">Status</th>
                <th className="py-4 px-6 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white/40">
              {filteredKamar.length > 0 ? (
                filteredKamar.map((row) => (
                  <tr key={row.kamar} className="hover:bg-white/80 transition-colors">
                    <td className="py-3.5 px-6 text-center font-black text-[#1d3557] text-xl">
                      {row.kamar}
                    </td>
                    <td className="py-3.5 px-6">
                      <p className="font-bold text-gray-800 text-sm">{row.tipe}</p>
                      <p className="text-xs font-semibold text-slate-500">{row.lantai}</p>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-emerald-700 text-sm whitespace-nowrap">
                      Rp {row.hargaBaku.toLocaleString('id-ID')}
                      <span className="block text-[10px] text-slate-400 font-normal">per bulan</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {row.fasilitas.map((fas, i) => (
                          <span
                            key={i}
                            className="bg-white text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200 shadow-2xs"
                          >
                            {fas}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          row.status === 'Terisi'
                            ? 'bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-[#8ce69f] text-[#1c7830] border-[#228b3a]/30'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => bukaEdit(row)}
                          className="px-3 py-1.5 rounded-lg border border-blue-200 text-xs text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm flex items-center gap-1"
                        >
                          <IconEdit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleHapus(row)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-600 font-bold bg-red-50 hover:bg-red-100 transition-colors shadow-sm flex items-center gap-1"
                        >
                          <IconTrash className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                    Tidak ada data kamar yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal === 'tambah' ? 'Tambah Kamar Baru' : `Edit Kamar ${form.kamar}`}
          subtitle="Atur tipe kamar, lantai, harga sewa, dan fasilitas"
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          submitLabel={isSaving ? 'Menyimpan...' : modal === 'tambah' ? 'Simpan Kamar' : 'Simpan Perubahan'}
        >
          <Field label="Nomor Kamar">
            <input
              required
              disabled={modal === 'edit'}
              className={inputClass + (modal === 'edit' ? ' opacity-60' : '')}
              value={form.kamar}
              onChange={(e) => setForm({ ...form, kamar: e.target.value })}
              placeholder="Contoh: 107"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipe Kamar">
              <select
                className={inputClass}
                value={form.tipe}
                onChange={(e) => setForm({ ...form, tipe: e.target.value })}
              >
                <option>Reguler</option>
                <option>VIP</option>
              </select>
            </Field>
            <Field label="Lantai">
              <input
                required
                className={inputClass}
                value={form.lantai}
                onChange={(e) => setForm({ ...form, lantai: e.target.value })}
                placeholder="Contoh: Lantai 2"
              />
            </Field>
          </div>

          <Field label="Harga Baku per Bulan (Rp)">
            <input
              required
              type="number"
              min="0"
              className={inputClass}
              value={form.hargaBaku}
              onChange={(e) => setForm({ ...form, hargaBaku: e.target.value })}
            />
          </Field>

          <Field label="Fasilitas (pisahkan dengan koma)">
            <textarea
              rows="3"
              className={inputClass + ' resize-none'}
              value={form.fasilitas}
              onChange={(e) => setForm({ ...form, fasilitas: e.target.value })}
              placeholder="Contoh: AC, WiFi, Kasur Single, Lemari"
            />
          </Field>
        </Modal>
      )}
    </div>
  );
}