import { useContext, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { KAMAR_PENGHUNI } from '../../context/session';
import { Field, inputClass, primaryBtn } from '../../components/Modal';
import { IconPlus, IconCheck } from '../../components/Icons';

const KATEGORI = ['AC', 'Listrik', 'Air', 'Lainnya'];
const LANGKAH = ['Menunggu', 'Diproses', 'Selesai'];

const badge = (status) =>
  status === 'Selesai'
    ? 'bg-[#8ce69f] text-[#228b3a] border-[#228b3a]/30'
    : status === 'Diproses'
      ? 'bg-[#cbd5e1] text-gray-700 border-gray-400'
      : 'bg-[#fc9292] text-[#a12020] border-[#a12020]/30';

export default function KomplainPenghuni() {
  const { tiketData, setTiketData, showToast } = useContext(AdminContext);
  const [form, setForm] = useState({ kategori: 'AC', deskripsi: '' });
  const [filter, setFilter] = useState('Semua');

  const riwayat = tiketData
    .filter((t) => t.kamar === KAMAR_PENGHUNI)
    .filter((t) => filter === 'Semua' || t.status === filter)
    .sort((a, b) => b.id - a.id);

  const handleKirim = (e) => {
    e.preventDefault();
    if (!form.deskripsi.trim()) return;
    const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    setTiketData([...tiketData, { id: Date.now(), kamar: KAMAR_PENGHUNI, ...form, tanggal, status: 'Menunggu' }]);
    setForm({ kategori: 'AC', deskripsi: '' });
    showToast('Laporan komplain berhasil dikirim. Pengelola akan segera menindaklanjuti.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto drop-shadow-sm">

      <div className="mb-8 text-white">
        <h2 className="text-4xl font-bold mb-1 tracking-wide">Lapor Komplain</h2>
        <p className="text-lg text-white/90 font-medium">Laporkan kerusakan dan pantau status perbaikannya</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form laporan baru */}
        <form onSubmit={handleKirim} className="bg-[#f4f7fa] rounded-[24px] p-8 shadow-2xl border border-white/50 space-y-4 h-fit">
          <h3 className="text-xl font-extrabold text-[#1d3557]">Buat Laporan Baru</h3>
          <Field label="Kategori">
            <div className="grid grid-cols-2 gap-2">
              {KATEGORI.map((k) => (
                <button
                  type="button" key={k}
                  onClick={() => setForm({ ...form, kategori: k })}
                  className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${form.kategori === k ? 'bg-[#1d3557] text-white border-[#1d3557]' : 'bg-white text-gray-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {k}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Deskripsi Masalah">
            <textarea
              required rows="5" placeholder="Contoh: AC bocor dan meneteskan air sejak semalam"
              className={inputClass + ' resize-none'}
              value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </Field>
          <button type="submit" className={primaryBtn + ' w-full justify-center'}>
            <IconPlus className="w-4 h-4" /> Kirim Laporan
          </button>
        </form>

        {/* Riwayat & status */}
        <div className="lg:col-span-2 bg-[#f4f7fa] rounded-[24px] p-8 shadow-2xl border border-white/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-extrabold text-[#1d3557]">Riwayat Laporan</h3>
            <div className="flex gap-1 bg-[#e6ecef] p-1 rounded-xl">
              {['Semua', ...LANGKAH].map((s) => (
                <button
                  key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === s ? 'bg-white text-[#1d3557] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {riwayat.length === 0 ? (
            <p className="text-center text-gray-400 font-medium py-12">Belum ada laporan.</p>
          ) : (
            <div className="space-y-4">
              {riwayat.map((t) => {
                const idx = LANGKAH.indexOf(t.status);
                return (
                  <div key={t.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#e2e8f0] text-gray-600 px-2.5 py-0.5 rounded-md text-xs font-bold border border-gray-300">{t.kategori}</span>
                          <span className="text-xs text-gray-400 font-semibold">{t.tanggal}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{t.deskripsi}</p>
                      </div>
                      <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border ${badge(t.status)}`}>{t.status}</span>
                    </div>

                    {/* Progres status */}
                    <div className="flex items-center mt-5">
                      {LANGKAH.map((l, i) => (
                        <div key={l} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${i <= idx ? 'bg-[#1d3557]' : 'bg-gray-300'}`}>
                              {i <= idx && <IconCheck className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-[11px] mt-1 font-bold ${i <= idx ? 'text-[#1d3557]' : 'text-gray-400'}`}>{l}</span>
                          </div>
                          {i < LANGKAH.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 mb-4 rounded-full ${i < idx ? 'bg-[#1d3557]' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

