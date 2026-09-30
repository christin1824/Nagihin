import { useState, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';

export default function TagihanAdmin() {
  const { kamarData, setKamarData, bulanSemasa, generateTagihanBulanan } = useContext(AdminContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedKamar, setSelectedKamar] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ metode: 'Transfer', tanggalBayar: '', nominal: '', referensi: '', catatan: '' });

  const tagihanAktif = kamarData.filter(k => k.status === 'Terisi');

  const filteredTagihan = tagihanAktif.filter((row) => {
    const matchesSearch = row.nama.toLowerCase().includes(searchQuery.toLowerCase()) || row.kamar.includes(searchQuery);
    const matchesStatus = statusFilter === 'Semua Status' || row.bayar === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const bukaModalPembayaran = (kamarObj) => {
    setSelectedKamar(kamarObj);
    const today = new Date().toISOString().split('T')[0];
    setPaymentForm({ metode: 'Transfer', tanggalBayar: today, nominal: kamarObj.jumlah, referensi: '', catatan: '' });
    setIsPaymentModalOpen(true);
  };

  const handleSimpanPembayaran = (e) => {
    e.preventDefault();
    setKamarData(kamarData.map(k => {
      if (k.kamar === selectedKamar.kamar) {
        const historiBaru = {
          id: Date.now(),
          bulan: bulanSemasa,
          ...paymentForm
        };
        return { 
          ...k, 
          bayar: 'Lunas',
          riwayatPembayaran: [...(k.riwayatPembayaran || []), historiBaru]
        };
      }
      return k;
    }));
    setIsPaymentModalOpen(false);
    alert(`Pembayaran kamar ${selectedKamar.kamar} berhasil diverifikasi dan dicatat!`);
  };

  const handleKirimWA = (nama, hp, jumlah, kamar, tempo) => {
    if (!hp || hp === '-') return alert('Nomor HP tidak valid!');
    const waNumber = hp.startsWith('0') ? '62' + hp.slice(1) : hp;
    const tempoFormatted = new Date(tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const pesan = `Halo ${nama},\n\nIni adalah pengingat bahwa tagihan kamar ${kamar} Anda untuk bulan ${bulanSemasa} sebesar Rp ${jumlah.toLocaleString('id-ID')} telah terbit.\n\nJatuh tempo pada: *${tempoFormatted}*.\nMohon segera melakukan pembayaran.\n\nTerima kasih.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`, '_blank');
  };

  const handleGenerate = () => {
    if(window.confirm(`Anda yakin ingin menerbitkan tagihan bulan ${bulanSemasa} untuk SEMUA penghuni aktif? Status mereka akan berubah menjadi Belum Bayar.`)){
      generateTagihanBulanan();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Lunas': return 'bg-[#8ce69f] text-[#228b3a] border border-[#228b3a]/30';
      case 'Belum Bayar': return 'bg-[#fc9292] text-[#a12020] border border-[#a12020]/30';
      case 'Jatuh Tempo': return 'bg-[#fcd385] text-[#a16b10] border border-[#a16b10]/30';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const getInitials = (name) => {
    if (!name || name === '-') return '-';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  const formatTanggal = (isoDate) => {
    if (!isoDate || isoDate === '-') return '-';
    return new Date(isoDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <>
      {/* KONTEN UTAMA */}
      <div className="max-w-5xl mx-auto drop-shadow-sm relative">
        <div className="mb-6 text-white">
          <h2 className="text-4xl font-bold mb-1 tracking-wide">Tagihan Penghuni</h2>
          <p className="text-lg text-white/90 font-medium">Kelola Invoice Bulanan - {bulanSemasa}</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <select 
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-[#5b738c] bg-[#e6ecef] text-gray-700 font-medium outline-none shadow-sm cursor-pointer"
            >
              <option>Semua Status</option>
              <option>Lunas</option>
              <option>Belum Bayar</option>
              <option>Jatuh Tempo</option>
            </select>
            <input 
              type="text" placeholder="Cari Nama / Kamar" 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-4 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-[#5b738c] bg-[#e6ecef] text-gray-700 placeholder-gray-400 outline-none shadow-sm"
            />
          </div>

          <button 
            onClick={handleGenerate}
            className="bg-gradient-to-r from-[#1d3557] to-[#3b5a82] hover:from-[#152740] hover:to-[#1d3557] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-[#1d3557]/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <span>📄</span> Generate Tagihan Baru
          </button>
        </div>

        <div className="bg-[#f4f7fa] rounded-[20px] shadow-2xl border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#d9e2e8] text-gray-600 text-sm border-b border-gray-300">
                  <th className="py-4 px-6 font-semibold w-1/3">Penghuni</th>
                  <th className="py-4 px-6 font-semibold">Kamar</th>
                  <th className="py-4 px-6 font-semibold">Jumlah</th>
                  <th className="py-4 px-6 font-semibold">Jatuh Tempo</th>
                  <th className="py-4 px-6 font-semibold text-center">Status</th>
                  <th className="py-4 px-6 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTagihan.length > 0 ? (
                  filteredTagihan.map((row) => (
                    <tr key={row.kamar} className="hover:bg-white/60 transition-colors">
                      <td className="py-3 px-6 flex items-center gap-3 whitespace-nowrap">
                        <div className="w-9 h-9 shrink-0 rounded-full bg-[#415a77] text-white flex items-center justify-center font-bold text-sm shadow-inner">
                          {getInitials(row.nama)}
                        </div>
                        <span className="font-semibold text-gray-700 text-sm">{row.nama}</span>
                      </td>
                      <td className="py-3 px-6 font-bold text-gray-700 text-sm">{row.kamar}</td>
                      <td className="py-3 px-6 font-semibold text-gray-700 text-sm whitespace-nowrap">
                        Rp {row.jumlah?.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-6 font-semibold text-gray-700 text-sm whitespace-nowrap">{formatTanggal(row.tempo)}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-inner whitespace-nowrap ${getStatusBadge(row.bayar)}`}>
                          {row.bayar}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex justify-center items-center gap-2 whitespace-nowrap">
                          {row.bayar !== 'Lunas' ? (
                            <button 
                              onClick={() => bukaModalPembayaran(row)} 
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#8ce69f] text-[#1c7830] border border-[#228b3a]/30 hover:bg-[#7add90] transition-colors shadow-sm"
                            >
                              Tandai Lunas
                            </button>
                          ) : (
                            <button disabled className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#e2e8f0] text-gray-400 border border-gray-300 cursor-not-allowed">
                              Lunas
                            </button>
                          )}
                          <button 
                            onClick={() => handleKirimWA(row.nama, row.hp, row.jumlah, row.kamar, row.tempo)} 
                            disabled={row.bayar === 'Lunas'}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-sm flex items-center gap-1
                              ${row.bayar === 'Lunas' ? 'bg-[#e2e8f0] text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-[#25D366] text-white border-[#1ebe5d] hover:bg-[#1ebe5d]'}`}
                          >
                            WA
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500 font-medium">
                      Tidak ada data tagihan yang sesuai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL VERIFIKASI PEMBAYARAN (KINI DI LUAR KONTEN UTAMA) */}
      {isPaymentModalOpen && selectedKamar && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-[#1d3557]">Verifikasi Pembayaran</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Kamar {selectedKamar.kamar} - {selectedKamar.nama}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-colors">
                <span className="text-lg font-bold">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSimpanPembayaran} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Metode Bayar</label>
                  <select 
                    value={paymentForm.metode} onChange={(e) => setPaymentForm({...paymentForm, metode: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5b738c] focus:ring-4 focus:ring-[#5b738c]/10 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                  >
                    <option>Transfer</option>
                    <option>Tunai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Bayar</label>
                  <input 
                    type="date" required 
                    value={paymentForm.tanggalBayar} onChange={(e) => setPaymentForm({...paymentForm, tanggalBayar: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5b738c] focus:ring-4 focus:ring-[#5b738c]/10 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nominal Diterima (Rp)</label>
                <input 
                  type="number" required 
                  value={paymentForm.nominal} onChange={(e) => setPaymentForm({...paymentForm, nominal: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5b738c] focus:ring-4 focus:ring-[#5b738c]/10 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">No. Referensi / Bukti (Opsional)</label>
                <input 
                  type="text" placeholder="Contoh: INV-001 atau TRF BCA"
                  value={paymentForm.referensi} onChange={(e) => setPaymentForm({...paymentForm, referensi: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5b738c] focus:ring-4 focus:ring-[#5b738c]/10 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Tambahan (Opsional)</label>
                <textarea 
                  rows="2" placeholder="Catatan admin..."
                  value={paymentForm.catatan} onChange={(e) => setPaymentForm({...paymentForm, catatan: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5b738c] focus:ring-4 focus:ring-[#5b738c]/10 rounded-xl px-4 py-2.5 text-sm font-medium outline-none resize-none"
                ></textarea>
              </div>

              <button type="submit" className="w-full bg-[#8ce69f] hover:bg-[#7add90] text-[#1c7830] border border-[#228b3a]/30 font-bold py-3.5 rounded-xl mt-6 shadow-md transition-all active:scale-[0.98]">
                Konfirmasi & Tandai Lunas
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}