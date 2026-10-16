import { useState, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import Modal, { Field, inputClass, primaryBtn } from '../../components/Modal';
import { IconPlus, IconCheck, IconSearch, IconEdit, IconTrash } from '../../components/Icons';

const emptyForm = { kamar: '', kategori: 'AC', deskripsi: '' };

export default function TiketAdmin() {
  const { tiketData, setTiketData, kamarData, showToast } = useContext(AdminContext);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [kategoriFilter, setKategoriFilter] = useState('Semua Kategori');
  const [modal, setModal] = useState(null); // null | 'tambah' | 'edit'
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const handleStatusChange = (id, newStatus) => {
    const t = tiketData.find((x) => x.id === id);
    setTiketData(tiketData.map((x) => (x.id === id ? { ...x, status: newStatus } : x)));
    showToast(`Status laporan Kamar ${t.kamar} diubah menjadi "${newStatus}"`, 'success');
  };

  const bukaTambah = () => {
    setForm({ ...emptyForm, kamar: kamarData[0]?.kamar || '101' });
    setModal('tambah');
  };

  const bukaEdit = (t) => {
    setEditId(t.id);
    setForm({ kamar: t.kamar, kategori: t.kategori, deskripsi: t.deskripsi });
    setModal('edit');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modal === 'tambah') {
      const tanggal = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      setTiketData([...tiketData, { id: Date.now(), ...form, tanggal, status: 'Menunggu' }]);
      showToast('Tiket perbaikan baru berhasil dibuat!', 'success');
    } else {
      setTiketData(tiketData.map((t) => (t.id === editId ? { ...t, ...form } : t)));
      showToast('Tiket berhasil diperbarui!', 'success');
    }
    setModal(null);
  };

  const handleHapus = (t) => {
    if (window.confirm(`Hapus tiket laporan kamar ${t.kamar} (${t.kategori})?`)) {
      setTiketData(tiketData.filter((x) => x.id !== t.id));
      showToast('Tiket laporan telah dihapus.', 'info');
    }
  };

  const filteredTickets = tiketData.filter((ticket) => {
    const matchSearch =
      ticket.kamar.includes(search) ||
      ticket.deskripsi.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Semua Status' || ticket.status === statusFilter;
    const matchKategori = kategoriFilter === 'Semua Kategori' || ticket.kategori === kategoriFilter;
    return matchSearch && matchStatus && matchKategori;
  });

  const menungguCount = tiketData.filter((t) => t.status === 'Menunggu').length;
  const diprosesCount = tiketData.filter((t) => t.status === 'Diproses').length;
  const selesaiCount = tiketData.filter((t) => t.status === 'Selesai').length;

  return (
    <div className="max-w-6xl mx-auto drop-shadow-sm space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
        <div>
          <h2 className="text-4xl font-bold mb-1 tracking-wide">Ticketing Perbaikan</h2>
          <p className="text-lg text-white/90 font-medium">
            Laporan Kerusakan, Komplain & Tracking Perbaikan Kost
          </p>
        </div>
        <button onClick={bukaTambah} className={primaryBtn}>
          <IconPlus className="w-4 h-4" /> Buat Tiket Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#f4f7fa] rounded-[20px] p-5 shadow-xl border border-white/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#5b738c] bg-white text-gray-700 font-semibold outline-none shadow-sm cursor-pointer text-sm"
          >
            <option>Semua Status</option>
            <option>Menunggu</option>
            <option>Diproses</option>
            <option>Selesai</option>
          </select>

          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#5b738c] bg-white text-gray-700 font-semibold outline-none shadow-sm cursor-pointer text-sm"
          >
            <option>Semua Kategori</option>
            <option>AC</option>
            <option>Listrik</option>
            <option>Air</option>
            <option>Lainnya</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <IconSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari No. Kamar / Masalah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#5b738c] bg-white text-gray-700 placeholder-gray-400 outline-none text-sm font-medium shadow-sm"
            />
          </div>
        </div>

        {/* Quick badges */}
        <div className="flex items-center gap-2 text-xs font-bold self-end md:self-center">
          <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg border border-red-200">
            {menungguCount} Menunggu
          </span>
          <span className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300">
            {diprosesCount} Diproses
          </span>
          <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
            {selesaiCount} Selesai
          </span>
        </div>
      </div>

      {/* Tabel Tiket */}
      <div className="bg-[#f4f7fa] rounded-[20px] shadow-2xl border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-200/80 text-slate-700 text-xs uppercase tracking-wider font-extrabold border-b border-slate-300">
                <th className="py-4 px-6 text-center w-24">Kamar</th>
                <th className="py-4 px-6 w-32">Kategori</th>
                <th className="py-4 px-6">Deskripsi Kerusakan</th>
                <th className="py-4 px-6 w-36">Tanggal Lapor</th>
                <th className="py-4 px-6 text-center w-44">Status Tiket</th>
                <th className="py-4 px-6 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white/40">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((row) => (
                  <tr key={row.id} className="hover:bg-white/80 transition-colors">
                    <td className="py-3.5 px-6 text-center font-black text-[#1d3557] text-base">
                      {row.kamar}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold shadow-2xs">
                        {row.kategori}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <p className="text-gray-800 text-sm font-semibold">{row.deskripsi}</p>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-500 text-sm whitespace-nowrap">
                      {row.tanggal}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <select
                        value={row.status}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border shadow-xs cursor-pointer outline-none transition-all
                          ${
                            row.status === 'Selesai'
                              ? 'bg-[#8ce69f] text-[#228b3a] border-[#228b3a]/40 focus:ring-2 focus:ring-[#228b3a]/20'
                              : row.status === 'Diproses'
                              ? 'bg-[#cbd5e1] text-slate-700 border-slate-400 focus:ring-2 focus:ring-slate-300'
                              : 'bg-[#fc9292] text-[#a12020] border-[#a12020]/40 focus:ring-2 focus:ring-[#a12020]/20'
                          }`}
                      >
                        <option value="Menunggu">Menunggu</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
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
                    Tidak ada tiket laporan yang cocok dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal === 'tambah' ? 'Buat Tiket Perbaikan Baru' : 'Edit Tiket Laporan'}
          subtitle="Catat keluhan kerusakan kamar kost"
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          submitLabel={modal === 'tambah' ? 'Buat Tiket' : 'Simpan Perubahan'}
        >
          <Field label="Kamar Yang Bermasalah">
            <select
              required
              className={inputClass}
              value={form.kamar}
              onChange={(e) => setForm({ ...form, kamar: e.target.value })}
            >
              {kamarData.map((k) => (
                <option key={k.kamar} value={k.kamar}>
                  Kamar {k.kamar} ({k.tipe} — {k.status})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Kategori Masalah">
            <select
              className={inputClass}
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
            >
              <option>AC</option>
              <option>Listrik</option>
              <option>Air</option>
              <option>Lainnya</option>
            </select>
          </Field>

          <Field label="Deskripsi Kerusakan">
            <textarea
              required
              rows="3"
              className={inputClass + ' resize-none'}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Contoh: Kran air wastafel patah dan bocor..."
            />
          </Field>
        </Modal>
      )}
    </div>
  );
}