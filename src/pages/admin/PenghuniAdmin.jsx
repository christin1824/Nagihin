import { useState, useContext } from 'react';
import { AdminContext } from '../../context/admin-context';

export default function PenghuniAdmin() {
  // Ambil fungsi tambahPenghuni & checkOutPenghuni
  const {
    kamarData,
    akunPenghuniData,
    bulanSemasa,
    error: dataError,
    tambahPenghuni,
    checkOutPenghuni,
  } = useContext(AdminContext);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ kamar: '', nama: '', hp: '' });

  const handleTambahPenghuni = async (e) => {
    e.preventDefault();
    const tanggalHariIni = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const dataBaru = {
      nama: formData.nama,
      hp: formData.hp,
      tanggalMasuk: tanggalHariIni,
      tempo: `20 ${bulanSemasa}`
    };

    try {
      // Panggil fungsi context untuk menyimpan ke 2 koleksi
      await tambahPenghuni(formData.kamar, dataBaru);
      
      setIsModalOpen(false); 
      setFormData({ kamar: '', nama: '', hp: '' }); 
      alert(`Penghuni atas nama ${formData.nama} berhasil ditambahkan ke kamar ${formData.kamar}!`);
    } catch (err) {
      alert(`Gagal menambah penghuni: ${err.message}`);
    }
  };

  const handleCheckOut = async (kamar) => {
    if(window.confirm(`Adakah anda pasti mahu mengeluarkan penghuni dari bilik ${kamar}?`)) {
      try {
        await checkOutPenghuni(kamar);
      } catch (err) {
        alert(`Gagal check out: ${err.message}`);
      }
    }
  };

  const sortedKamarData = [...kamarData].sort((a, b) => {
    const numberA = Number(a.kamar);
    const numberB = Number(b.kamar);

    if (Number.isNaN(numberA) || Number.isNaN(numberB)) {
      return a.kamar.localeCompare(b.kamar, 'id', { numeric: true });
    }

    return numberA - numberB;
  });

  return (
    <>
      <div className="max-w-5xl mx-auto drop-shadow-sm relative">
        {dataError && (
          <div className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
            {dataError}
          </div>
        )}
        
        <div className="flex justify-between items-end mb-8 text-white">
          <div>
            <h2 className="text-4xl font-bold mb-1 tracking-wide">Data Penghuni</h2>
            <p className="text-lg text-white/90 font-medium">Manajemen alokasi kamar dan kontak penyewa</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1d3557] hover:bg-[#152740] text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              <span>➕</span> Tambah Penghuni
            </button>
          </div>
        </div>

        <div className="bg-[#f4f7fa] rounded-[20px] shadow-2xl border border-white/50 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#d9e2e8] text-gray-600 text-sm border-b border-gray-300">
                <th className="py-4 px-6 font-semibold w-24">Kamar</th>
                <th className="py-4 px-6 font-semibold">Nama Lengkap</th>
                <th className="py-4 px-6 font-semibold">No. WhatsApp</th>
                <th className="py-4 px-6 font-semibold">Email</th>
                <th className="py-4 px-6 font-semibold">Tanggal Masuk</th>
                <th className="py-4 px-6 font-semibold text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedKamarData.map((row) => (
                <tr key={row.kamar} className="hover:bg-white/60 transition-colors">
                  {(() => {
                    const akun = akunPenghuniData.find((item) => {
                      const nomorAkun = String(
                        item.kamar ?? item.room ?? item.kamar_id ?? item.nomor_kamar ?? ''
                      ).trim().replace(/^kamar\s+/i, '');
                      return nomorAkun === row.kamar;
                    });
                    return (
                      <>
                  <td className="py-4 px-6 font-extrabold text-[#1d3557]">{row.kamar}</td>
                  <td className={`py-4 px-6 font-semibold ${row.status === 'Kosong' ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                    {row.nama}
                  </td>
                  <td className={`py-4 px-6 font-medium ${row.status === 'Kosong' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {row.hp}
                  </td>
                  <td className={`py-4 px-6 font-medium ${row.status === 'Kosong' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {row.status === 'Kosong' ? '-' : akun?.email || 'Belum terhubung'}
                  </td>
                  <td className={`py-4 px-6 font-medium ${row.status === 'Kosong' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {row.masuk}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {row.status === 'Terisi' ? (
                      <button 
                        onClick={() => handleCheckOut(row.kamar)} 
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-600 font-bold bg-red-50 hover:bg-red-100 transition-colors shadow-sm"
                      >
                        Check Out
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                        Kosong
                      </span>
                    )}
                  </td>
                      </>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-[#1d3557] tracking-tight">Registrasi Penghuni</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Masukkan data penyewa kamar baru</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-colors"
              >
                <span className="text-lg font-bold">&times;</span>
              </button>
            </div>
            <form onSubmit={handleTambahPenghuni} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Kamar</label>
                <select 
                  required
                  value={formData.kamar} 
                  onChange={(e) => setFormData({...formData, kamar: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5b738c] focus:ring-4 focus:ring-[#5b738c]/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all outline-none cursor-pointer"
                >
                  <option value="" disabled>Pilih kamar kosong...</option>
                  {kamarData.filter(k => k.status === 'Kosong').map(k => (
                    <option key={k.kamar} value={k.kamar}>Kamar {k.kamar}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                <input 
                  type="text" required placeholder="Sesuai kartu identitas"
                  value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5b738c] focus:ring-4 focus:ring-[#5b738c]/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all outline-none placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nomor WhatsApp</label>
                <input 
                  type="tel" 
                  pattern="[0-9]{10,13}" 
                  required 
                  title="Sila masukkan 10 hingga 13 digit nombor"
                  placeholder="Contoh: 081234567890"
                  value={formData.hp} 
                  onChange={(e) => setFormData({...formData, hp: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5b738c] focus:ring-4 focus:ring-[#5b738c]/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all outline-none placeholder-gray-400"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#1d3557] to-[#3b5a82] hover:from-[#152740] hover:to-[#1d3557] text-white font-bold py-3.5 rounded-xl mt-6 shadow-lg shadow-[#1d3557]/30 transition-all active:scale-[0.98]"
              >
                Simpan Data Penghuni
              </button>
            </form>
          </div>
        </div>
      )}

    </>
  );
}