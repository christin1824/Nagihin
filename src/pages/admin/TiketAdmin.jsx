import { useState, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';

export default function TiketAdmin() {
  // 1. Mengambil data dari Context, bukan useState lokal lagi
  const { tiketData, setTiketData } = useContext(AdminContext);
  
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [kategoriFilter, setKategoriFilter] = useState('Semua Kategori');
  
  // State untuk Toast Notification kustom
  const [toast, setToast] = useState({ show: false, message: '' });

  const handleStatusChange = (id, newStatus) => {
    setTiketData(tiketData.map(ticket => 
      ticket.id === id ? { ...ticket, status: newStatus } : ticket
    ));
    
    const updatedTicket = tiketData.find(t => t.id === id);
    
    // 2. Mengganti alert() dengan Toast Notification
    setToast({ show: true, message: `Status laporan kamar ${updatedTicket.kamar} diubah menjadi "${newStatus}"` });
    
    // Toast akan hilang otomatis setelah 3 detik
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const filteredTickets = tiketData.filter(ticket => {
    const matchStatus = statusFilter === 'Semua Status' || ticket.status === statusFilter;
    const matchKategori = kategoriFilter === 'Semua Kategori' || ticket.kategori === kategoriFilter;
    return matchStatus && matchKategori;
  });

  return (
    <div className="max-w-5xl mx-auto drop-shadow-sm relative">
      
      {/* ELEMEN TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 bg-[#1d3557] text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <span className="text-green-400 text-xl">✓</span>
          <p className="font-medium text-sm">{toast.message}</p>
        </div>
      )}

      <div className="mb-6 text-white">
        <h2 className="text-4xl font-bold mb-1 tracking-wide">Ticketing Perbaikan</h2>
        <p className="text-lg text-white/90 font-medium">Laporan Kerusakan dari Penghuni</p>
      </div>

      <div className="flex gap-4 mb-6">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-[#5b738c] bg-[#e6ecef] text-gray-700 font-medium outline-none shadow-sm cursor-pointer w-48"
        >
          <option value="Semua Status">Semua Status</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Diproses">Diproses</option>
          <option value="Selesai">Selesai</option>
        </select>

        <select 
          value={kategoriFilter}
          onChange={(e) => setKategoriFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-[#5b738c] bg-[#e6ecef] text-gray-700 font-medium outline-none shadow-sm cursor-pointer w-48"
        >
          <option value="Semua Kategori">Semua Kategori</option>
          <option value="AC">AC</option>
          <option value="Listrik">Listrik</option>
          <option value="Air">Air</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </div>

      <div className="bg-[#f4f7fa] rounded-[20px] shadow-2xl border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#d9e2e8] text-gray-600 text-sm border-b border-gray-300">
                <th className="py-4 px-6 font-semibold w-24">Kamar</th>
                <th className="py-4 px-6 font-semibold w-32">Kategori</th>
                <th className="py-4 px-6 font-semibold">Deskripsi</th>
                <th className="py-4 px-6 font-semibold w-40">Tanggal</th>
                <th className="py-4 px-6 font-semibold w-48">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((row) => (
                  <tr key={row.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-700 text-sm">{row.kamar}</td>
                    <td className="py-4 px-6 font-semibold text-gray-700 text-sm">{row.kategori}</td>
                    <td className="py-4 px-6 text-gray-700 text-sm">{row.deskripsi}</td>
                    <td className="py-4 px-6 font-semibold text-gray-700 text-sm">{row.tanggal}</td>
                    <td className="py-4 px-6">
                      <select
                        value={row.status}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border shadow-inner cursor-pointer outline-none transition-colors
                          ${row.status === 'Selesai' ? 'bg-[#8ce69f] text-[#228b3a] border-[#228b3a]/30' : 
                            row.status === 'Diproses' ? 'bg-[#cbd5e1] text-gray-700 border-gray-400' : 
                            'bg-[#fc9292] text-[#a12020] border-[#a12020]/30'}`}
                      >
                        <option value="Menunggu">Menunggu</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                    Tidak ada tiket laporan yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}