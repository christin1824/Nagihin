import { useState, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import Modal, { Field, inputClass, primaryBtn } from '../../components/Modal';
import { IconPlus, IconSearch, IconEdit, IconDoorOpen } from '../../components/Icons';

const formatTanggal = (iso) => {
  if (!iso || iso === '-') return '-';
  const d = new Date(iso);
  return isNaN(d)
    ? iso
    : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitials = (name) => {
  if (!name || name === '-') return '-';
  const parts = name.split(' ');
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
};

export default function PenghuniAdmin() {
  const { kamarData, setKamarData, showToast } = useContext(AdminContext);

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'tambah' | 'edit'
  const [formData, setFormData] = useState({ kamar: '', nama: '', hp: '', masuk: '' });

  const today = () => new Date().toISOString().split('T')[0];

  const filteredData = kamarData.filter((row) => {
    return (
      row.nama.toLowerCase().includes(search.toLowerCase()) ||
      row.kamar.includes(search) ||
      row.hp.includes(search)
    );
  });

  const penghuniAktifCount = kamarData.filter((k) => k.status === 'Terisi').length;
  const kamarKosongCount = kamarData.filter((k) => k.status === 'Kosong').length;

  const bukaTambah = () => {
    setFormData({ kamar: '', nama: '', hp: '', masuk: today() });
    setModal('tambah');
  };

  const bukaEdit = (row) => {
    setFormData({ kamar: row.kamar, nama: row.nama, hp: row.hp, masuk: row.masuk });
    setModal('edit');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modal === 'tambah') {
      const now = new Date();
      const tempo = new Date(now.getFullYear(), now.getMonth(), 20).toISOString().split('T')[0];
      setKamarData(
        kamarData.map((k) =>
          k.kamar === formData.kamar
            ? {
                ...k,
                status: 'Terisi',
                bayar: 'Belum Bayar',
                nama: formData.nama,
                hp: formData.hp,
                masuk: formData.masuk,
                jumlah: k.hargaBaku || 1500000,
                tempo,
              }
            : k
        )
      );
      showToast(`Penghuni ${formData.nama} berhasil didaftarkan di Kamar ${formData.kamar}!`, 'success');
    } else {
      setKamarData(
        kamarData.map((k) =>
          k.kamar === formData.kamar
            ? { ...k, nama: formData.nama, hp: formData.hp, masuk: formData.masuk }
            : k
        )
      );
      showToast(`Data penghuni Kamar ${formData.kamar} berhasil diperbarui!`, 'success');
    }
    setModal(null);
  };

  const handleCheckOut = (kamar) => {
    if (window.confirm(`Yakin ingin mengeluarkan penghuni dari kamar ${kamar}?`)) {
      setKamarData(
        kamarData.map((k) =>
          k.kamar === kamar
            ? {
                ...k,
                status: 'Kosong',
                bayar: 'Kosong',
                nama: '-',
                hp: '-',
                masuk: '-',
                jumlah: 0,
                tempo: '-',
              }
            : k
        )
      );
      showToast(`Penghuni Kamar ${kamar} telah check-out. Status kamar kini Kosong.`, 'info');
    }
  };

  return (
    <div className="max-w-6xl mx-auto drop-shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
        <div>
          <h2 className="text-4xl font-bold mb-1 tracking-wide">Data Penghuni</h2>
          <p className="text-lg text-white/90 font-medium">
            Manajemen alokasi kamar, data kontrak, dan kontak penyewa
          </p>
        </div>
        <button onClick={bukaTambah} className={primaryBtn}>
          <IconPlus className="w-4 h-4" /> Registrasi Penghuni Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#f4f7fa] rounded-[20px] p-5 shadow-xl border border-white/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <IconSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Cari Nama, No. Kamar, WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#5b738c] bg-white text-gray-700 placeholder-gray-400 outline-none text-sm font-medium shadow-sm"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
            {penghuniAktifCount} Penghuni Aktif
          </span>
          <span className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300">
            {kamarKosongCount} Kamar Kosong
          </span>
        </div>
      </div>

      {/* Tabel Penghuni */}
      <div className="bg-[#f4f7fa] rounded-[20px] shadow-2xl border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-200/80 text-slate-700 text-xs uppercase tracking-wider font-extrabold border-b border-slate-300">
                <th className="py-4 px-6 text-center w-24">Kamar</th>
                <th className="py-4 px-6">Nama Lengkap</th>
                <th className="py-4 px-6">No. WhatsApp</th>
                <th className="py-4 px-6">Tanggal Masuk</th>
                <th className="py-4 px-6 text-center w-28">Status</th>
                <th className="py-4 px-6 text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white/40">
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.kamar} className="hover:bg-white/80 transition-colors">
                    <td className="py-3.5 px-6 text-center font-black text-[#1d3557] text-base">
                      {row.kamar}
                    </td>
                    <td className="py-3.5 px-6 flex items-center gap-3">
                      {row.status === 'Terisi' ? (
                        <>
                          <div className="w-9 h-9 shrink-0 rounded-full bg-[#415a77] text-white flex items-center justify-center font-bold text-xs shadow-inner">
                            {getInitials(row.nama)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{row.nama}</p>
                            <p className="text-xs text-slate-400 font-medium">{row.tipe} · {row.lantai}</p>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-gray-400 italic">
                          Belum berpenghuni
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-3.5 px-6 font-semibold text-sm ${
                        row.status === 'Kosong' ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {row.hp}
                    </td>
                    <td
                      className={`py-3.5 px-6 font-medium text-sm ${
                        row.status === 'Kosong' ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {formatTanggal(row.masuk)}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          row.status === 'Terisi'
                            ? 'bg-[#8ce69f] text-[#228b3a] border-[#228b3a]/30'
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {row.status === 'Terisi' ? (
                        <div className="flex justify-center gap-2 whitespace-nowrap">
                          <button
                            onClick={() => bukaEdit(row)}
                            className="px-3 py-1.5 rounded-lg border border-blue-200 text-xs text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm flex items-center gap-1"
                          >
                            <IconEdit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleCheckOut(row.kamar)}
                            className="px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-600 font-bold bg-red-50 hover:bg-red-100 transition-colors shadow-sm flex items-center gap-1"
                          >
                            <IconDoorOpen className="w-3.5 h-3.5" /> Check Out
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setFormData({ kamar: row.kamar, nama: '', hp: '', masuk: today() });
                            setModal('tambah');
                          }}
                          className="px-3 py-1 text-xs font-bold text-[#1d3557] bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
                        >
                          + Isi Kamar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                    Tidak ada data penghuni yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal === 'tambah' ? 'Registrasi Penghuni Baru' : `Edit Data Penghuni — Kamar ${formData.kamar}`}
          subtitle={
            modal === 'tambah'
              ? 'Masukkan data penyewa untuk kamar kosong'
              : 'Perbarui kontak atau tanggal sewa'
          }
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          submitLabel={modal === 'tambah' ? 'Simpan Penghuni' : 'Simpan Perubahan'}
        >
          {modal === 'tambah' && (
            <Field label="Pilih Kamar">
              <select
                required
                className={inputClass}
                value={formData.kamar}
                onChange={(e) => setFormData({ ...formData, kamar: e.target.value })}
              >
                <option value="" disabled>
                  Pilih kamar kosong...
                </option>
                {kamarData
                  .filter((k) => k.status === 'Kosong')
                  .map((k) => (
                    <option key={k.kamar} value={k.kamar}>
                      Kamar {k.kamar} ({k.tipe} — {k.lantai})
                    </option>
                  ))}
              </select>
            </Field>
          )}

          <Field label="Nama Lengkap">
            <input
              type="text"
              required
              placeholder="Sesuai KTP / Identitas"
              className={inputClass}
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
          </Field>

          <Field label="Nomor WhatsApp">
            <input
              type="tel"
              pattern="[0-9]{10,13}"
              required
              title="Masukkan 10 hingga 13 digit angka"
              placeholder="Contoh: 081234567890"
              className={inputClass}
              value={formData.hp}
              onChange={(e) => setFormData({ ...formData, hp: e.target.value })}
            />
          </Field>

          <Field label="Tanggal Masuk">
            <input
              type="date"
              required
              className={inputClass}
              value={formData.masuk}
              onChange={(e) => setFormData({ ...formData, masuk: e.target.value })}
            />
          </Field>
        </Modal>
      )}
    </div>
  );
}