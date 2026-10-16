import { useContext } from 'react';
import { AdminContext } from '../../context/admin-context';

export default function DashboardAdmin() {
  // Mengambil data kamar dan bulan dinamis dari Database Pusat
  const { kamarData, bulanSemasa } = useContext(AdminContext);

  const totalKamar = kamarData.length;
  const kamarKosong = kamarData.filter((k) => k.status === 'Kosong').length;
  const kamarTerisi = kamarData.filter((k) => k.status === 'Terisi').length;
  const belumBayar = kamarData.filter((k) => k.bayar === 'Belum Bayar').length;

  const getStatusStyle = (bayarStatus) => {
    switch (bayarStatus) {
      case 'Lunas': return 'bg-[#8ce69f] text-[#228b3a] border border-[#228b3a]/20 shadow-sm';
      case 'Belum Bayar': return 'bg-[#fc9292] text-[#a12020] border border-[#a12020]/20 shadow-sm';
      case 'Kosong': return 'bg-[#aeb2b8] text-[#5c5f66] border border-[#5c5f66]/20 shadow-sm';
      default: return 'bg-white';
    }
  };

  return (
    <div className="max-w-5xl mx-auto drop-shadow-sm">
      <div className="mb-8 text-white">
        <h2 className="text-4xl font-bold mb-1 tracking-wide">Dashboard Overview</h2>
        {/* Teks bulan sekarang dinamis mengikuti sistem */}
        <p className="text-lg text-white/90 font-medium">Ringkasan Kost Bulan {bulanSemasa}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { title: 'Total Kamar', count: totalKamar, icon: '🛏️' },
          { title: 'Kamar Kosong', count: kamarKosong, icon: '🚪' },
          { title: 'Terisi', count: kamarTerisi, icon: '🚪' },
          { title: 'Belum Bayar', count: belumBayar, icon: '💲' },
        ].map((stat, index) => (
          <div key={index} className="bg-[#f4f7fa] rounded-xl p-5 shadow-lg flex flex-col justify-between h-32 border border-white/50">
            <div className="bg-[#aebad3] w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-2 shadow-inner">
              {stat.icon}
            </div>
            <div>
              <p className="text-[#1d3557] font-bold text-sm">{stat.title}</p>
              <p className="text-[#324b70] font-extrabold text-xl">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 text-white mb-4">
        <span className="text-3xl drop-shadow-md">🛏️</span>
        <h3 className="text-2xl font-bold drop-shadow-md">Status Kamar Bulan Ini</h3>
      </div>

      <div className="bg-[#f4f7fa] rounded-[20px] p-8 shadow-2xl border border-white/50">
        <div className="flex gap-6 mb-6">
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-[#8ce69f] border border-[#228b3a]/30 shadow-inner"></div><span className="text-gray-700 font-bold text-sm">Lunas</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-[#fc9292] border border-[#a12020]/30 shadow-inner"></div><span className="text-gray-700 font-bold text-sm">Belum Bayar</span></div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-[#aeb2b8] border border-[#5c5f66]/30 shadow-inner"></div><span className="text-gray-700 font-bold text-sm">Kosong</span></div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {kamarData.map((room) => (
            <div key={room.kamar} className={`${getStatusStyle(room.bayar)} rounded-xl p-3 flex flex-col items-center justify-center h-24 transition-all duration-200 hover:scale-105 cursor-pointer`}>
              <span className="font-extrabold text-2xl mb-0.5">{room.kamar}</span>
              <span className="text-xs font-bold tracking-wide">{room.bayar === 'Kosong' ? 'Kosong' : room.bayar}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}