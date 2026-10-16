import { useContext, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import {
  IconBed,
  IconDoorOpen,
  IconDollar,
  IconWhatsApp,
  IconCheck,
  IconMegaphone,
  IconPrinter,
  IconPlus,
  IconTrash,
} from '../../components/Icons';
import Modal, { Field, inputClass } from '../../components/Modal';
import KwitansiModal from '../../components/KwitansiModal';

export default function DashboardAdmin() {
  const {
    kamarData,
    setKamarData,
    pengumumanData,
    tambahPengumuman,
    togglePengumumanAktif,
    hapusPengumuman,
    showToast,
    bulanSemasa,
  } = useContext(AdminContext);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [kwitansiRoom, setKwitansiRoom] = useState(null);
  const [modalPengumuman, setModalPengumuman] = useState(false);
  const [formPengumuman, setFormPengumuman] = useState({
    judul: '',
    kategori: 'Info Kost',
    isi: '',
  });

  const totalKamar = kamarData.length;
  const kamarKosong = kamarData.filter((k) => k.status === 'Kosong').length;
  const kamarTerisi = kamarData.filter((k) => k.status === 'Terisi').length;
  const belumBayar = kamarData.filter((k) => k.bayar === 'Belum Bayar' || k.bayar === 'Jatuh Tempo').length;
  const lunasCount = kamarData.filter((k) => k.bayar === 'Lunas').length;

  const totalPendapatanMasuk = kamarData
    .filter((k) => k.bayar === 'Lunas')
    .reduce((sum, k) => sum + (k.jumlah || 0), 0);

  const getStatusStyle = (bayarStatus) => {
    switch (bayarStatus) {
      case 'Lunas':
        return 'bg-[#8ce69f] text-[#228b3a] border border-[#228b3a]/30 shadow-sm';
      case 'Belum Bayar':
        return 'bg-[#fc9292] text-[#a12020] border border-[#a12020]/30 shadow-sm';
      case 'Jatuh Tempo':
        return 'bg-[#fcd385] text-[#a16b10] border border-[#a16b10]/30 shadow-sm';
      case 'Kosong':
        return 'bg-[#cbd5e1] text-[#475569] border border-[#475569]/20 shadow-sm';
      case 'Tidak Ada':
        return 'bg-[#e2e8f0] text-[#64748b] border border-[#64748b]/20 shadow-sm';
      default:
        return 'bg-white text-gray-700';
    }
  };

  const handleTandaiLunas = (kamarObj) => {
    const recordBaru = {
      id: Date.now(),
      bulan: bulanSemasa,
      metode: 'Langsung / Tunai',
      tanggalBayar: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      jumlahBayar: kamarObj.jumlah,
      nominal: kamarObj.jumlah,
      referensi: 'Verifikasi Cepat Dashboard',
      catatan: `Pelunasan sewa periode ${bulanSemasa}`,
    };

    setKamarData(
      kamarData.map((k) =>
        k.kamar === kamarObj.kamar
          ? {
              ...k,
              bayar: 'Lunas',
              riwayatPembayaran: [...(k.riwayatPembayaran || []), recordBaru],
            }
          : k
      )
    );
    setSelectedRoom((prev) =>
      prev
        ? {
            ...prev,
            bayar: 'Lunas',
            riwayatPembayaran: [...(prev.riwayatPembayaran || []), recordBaru],
          }
        : null
    );
    showToast(`Tagihan Kamar ${kamarObj.kamar} (${kamarObj.nama}) berhasil ditandai Lunas!`, 'success');
  };

  const handleKirimWA = (kamarObj) => {
    if (!kamarObj.hp || kamarObj.hp === '-') {
      showToast('Nomor WhatsApp penghuni tidak valid!', 'error');
      return;
    }
    const waNumber = kamarObj.hp.startsWith('0') ? '62' + kamarObj.hp.slice(1) : kamarObj.hp;
    const tempoFormatted =
      kamarObj.tempo && kamarObj.tempo !== '-'
        ? new Date(kamarObj.tempo).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '-';
    const pesan = `Halo ${kamarObj.nama},\n\nPengingat tagihan kamar ${kamarObj.kamar} bulan ${bulanSemasa} sebesar Rp ${kamarObj.jumlah?.toLocaleString(
      'id-ID'
    )}.\nJatuh tempo: *${tempoFormatted}*.\n\nTerima kasih.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`, '_blank');
  };

  const handleSimpanPengumuman = (e) => {
    e.preventDefault();
    if (!formPengumuman.judul.trim() || !formPengumuman.isi.trim()) {
      showToast('Judul dan isi pengumuman wajib diisi!', 'error');
      return;
    }
    tambahPengumuman(formPengumuman);
    setFormPengumuman({ judul: '', kategori: 'Info Kost', isi: '' });
    setModalPengumuman(false);
    showToast('Pengumuman baru berhasil diterbitkan ke Portal Penghuni!', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto drop-shadow-sm space-y-8">
      {/* Header */}
      <div className="text-white">
        <h2 className="text-4xl font-bold mb-1 tracking-wide">Dashboard Overview</h2>
        <p className="text-lg text-white/90 font-medium">
          Ringkasan Operasional Kost Bulan {bulanSemasa}
        </p>
      </div>

      {/* Statistik Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: 'Total Kamar',
            count: totalKamar,
            sub: `${kamarTerisi} Terisi · ${kamarKosong} Kosong`,
            icon: <IconBed className="w-6 h-6 text-[#1d3557]" />,
          },
          {
            title: 'Kamar Kosong',
            count: kamarKosong,
            sub: 'Tersedia untuk disewa',
            icon: <IconDoorOpen className="w-6 h-6 text-[#1d3557]" />,
          },
          {
            title: 'Sudah Lunas',
            count: lunasCount,
            sub: `Terkumpul Rp ${totalPendapatanMasuk.toLocaleString('id-ID')}`,
            icon: <IconCheck className="w-6 h-6 text-[#228b3a]" />,
          },
          {
            title: 'Perlu Ditagih',
            count: belumBayar,
            sub: 'Belum bayar / Jatuh tempo',
            icon: <IconDollar className="w-6 h-6 text-[#a12020]" />,
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-[#f4f7fa] rounded-2xl p-6 shadow-xl flex flex-col justify-between border border-white/60 hover:translate-y-[-2px] transition-transform duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-600 font-bold text-sm">{stat.title}</span>
              <div className="bg-[#aebad3]/40 w-11 h-11 rounded-xl flex items-center justify-center shadow-inner">
                {stat.icon}
              </div>
            </div>
            <div>
              <p className="text-[#1d3557] font-black text-3xl mb-1">{stat.count}</p>
              <p className="text-xs font-semibold text-slate-500">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status Denah / Kamar */}
      <div className="bg-[#f4f7fa] rounded-[24px] p-8 shadow-2xl border border-white/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-[#1d3557] text-white p-2.5 rounded-xl">
              <IconBed className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#1d3557]">Denah & Status Kamar</h3>
              <p className="text-xs text-slate-500 font-medium">Klik pada kamar untuk melihat info lengkap, cetak kwitansi & tindakan cepat</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#8ce69f] border border-[#228b3a]/30"></span>
              Lunas
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#fc9292] border border-[#a12020]/30"></span>
              Belum Bayar
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#fcd385] border border-[#a16b10]/30"></span>
              Jatuh Tempo
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#cbd5e1] border border-[#475569]/30"></span>
              Kosong
            </div>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {kamarData.map((room) => (
            <button
              key={room.kamar}
              onClick={() => setSelectedRoom(room)}
              className={`${getStatusStyle(
                room.bayar
              )} rounded-2xl p-4 flex flex-col items-center justify-center min-h-[105px] transition-all duration-200 hover:scale-105 active:scale-95 shadow-md group cursor-pointer`}
            >
              <span className="font-black text-2xl tracking-tight mb-1 group-hover:scale-110 transition-transform">
                {room.kamar}
              </span>
              <span className="text-[11px] font-extrabold tracking-wide uppercase">
                {room.bayar === 'Kosong' ? 'Kosong' : room.bayar}
              </span>
              <span className="text-[10px] opacity-75 font-medium truncate max-w-full">
                {room.status === 'Terisi' ? room.nama.split(' ')[0] : room.tipe}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* PAPAN PENGUMUMAN KOST (BROADCAST KE PENGHUNI) */}
      <div className="bg-[#f4f7fa] rounded-[24px] p-8 shadow-2xl border border-white/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-[#1d3557] text-white p-2.5 rounded-xl">
              <IconMegaphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#1d3557]">Papan Pengumuman Kost</h3>
              <p className="text-xs text-slate-500 font-medium">
                Kirim pengumuman penting yang langsung tampil di atas Dashboard seluruh Penghuni
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalPengumuman(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1d3557] hover:bg-[#152843] text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            <IconPlus className="w-4 h-4" /> Buat Pengumuman
          </button>
        </div>

        {pengumumanData.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm font-medium">
            Belum ada pengumuman kost. Klik &ldquo;Buat Pengumuman&rdquo; untuk menyiarkan info ke penghuni.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pengumumanData.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between gap-4 ${
                  item.aktif
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-slate-100/70 border-slate-200/60 opacity-65'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          item.kategori === 'Pemeliharaan'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : item.kategori === 'Penting'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-[#1d3557] border-blue-200'
                        }`}
                      >
                        {item.kategori}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.aktif
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {item.aktif ? 'Ditampilkan' : 'Disembunyikan'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{item.tanggal}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-[#1d3557] mb-1">{item.judul}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.isi}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      togglePengumumanAktif(item.id);
                      showToast(
                        item.aktif
                          ? 'Pengumuman disembunyikan dari Portal Penghuni.'
                          : 'Pengumuman kembali ditampilkan di Portal Penghuni.',
                        'info'
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    {item.aktif ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      hapusPengumuman(item.id);
                      showToast('Pengumuman berhasil dihapus.', 'info');
                    }}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Hapus Pengumuman"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Buat Pengumuman Baru */}
      {modalPengumuman && (
        <Modal
          title="Buat Pengumuman Kost"
          subtitle="Pengumuman aktif akan otomatis muncul di atas Dashboard Penghuni"
          onClose={() => setModalPengumuman(false)}
          onSubmit={handleSimpanPengumuman}
          submitLabel="Terbitkan Pengumuman"
        >
          <Field label="Judul Pengumuman">
            <input
              type="text"
              required
              placeholder="Contoh: Pemeliharaan Pompa Air Lantai 2"
              className={inputClass}
              value={formPengumuman.judul}
              onChange={(e) => setFormPengumuman({ ...formPengumuman, judul: e.target.value })}
            />
          </Field>
          <Field label="Kategori">
            <select
              className={inputClass}
              value={formPengumuman.kategori}
              onChange={(e) => setFormPengumuman({ ...formPengumuman, kategori: e.target.value })}
            >
              <option value="Info Kost">Info Kost</option>
              <option value="Pemeliharaan">Pemeliharaan</option>
              <option value="Penting">Penting</option>
            </select>
          </Field>
          <Field label="Isi Pengumuman">
            <textarea
              rows="4"
              required
              placeholder="Tuliskan detail waktu atau instruksi untuk penghuni..."
              className={inputClass + ' resize-none'}
              value={formPengumuman.isi}
              onChange={(e) => setFormPengumuman({ ...formPengumuman, isi: e.target.value })}
            />
          </Field>
        </Modal>
      )}

      {/* Modal Detail Kamar Cepat */}
      {selectedRoom && (
        <Modal
          title={`Detail Kamar ${selectedRoom.kamar}`}
          subtitle={`Tipe ${selectedRoom.tipe} · ${selectedRoom.lantai}`}
          onClose={() => setSelectedRoom(null)}
          onSubmit={(e) => {
            e.preventDefault();
            setSelectedRoom(null);
          }}
          submitLabel="Tutup Detail"
        >
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-500">Status Pembayaran:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusStyle(
                  selectedRoom.bayar
                )}`}
              >
                {selectedRoom.bayar}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Harga Baku</p>
                <p className="font-extrabold text-[#1d3557]">
                  Rp {selectedRoom.hargaBaku?.toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Status Kamar</p>
                <p className="font-extrabold text-[#1d3557]">{selectedRoom.status}</p>
              </div>
            </div>

            {selectedRoom.status === 'Terisi' ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs text-slate-400 font-bold uppercase">Penghuni Saat Ini</p>
                <p className="text-base font-black text-[#1d3557]">{selectedRoom.nama}</p>
                <p className="text-xs font-semibold text-slate-500">No. WhatsApp: {selectedRoom.hp}</p>
                <p className="text-xs font-semibold text-slate-500">Tanggal Masuk: {selectedRoom.masuk}</p>
                {selectedRoom.tempo && selectedRoom.tempo !== '-' && (
                  <p className="text-xs font-semibold text-slate-500">
                    Jatuh Tempo: {selectedRoom.tempo}
                  </p>
                )}

                <div className="pt-2 flex flex-wrap gap-2">
                  {selectedRoom.bayar !== 'Lunas' ? (
                    <button
                      type="button"
                      onClick={() => handleTandaiLunas(selectedRoom)}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#8ce69f] hover:bg-[#78db8d] text-[#1c7830] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <IconCheck className="w-4 h-4" /> Tandai Lunas
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setKwitansiRoom(selectedRoom)}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#1d3557] hover:bg-[#152843] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <IconPrinter className="w-4 h-4" /> Lihat Kwitansi
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleKirimWA(selectedRoom)}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <IconWhatsApp className="w-4 h-4" /> Hubungi WA
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-semibold text-xs">
                Kamar ini siap disewakan kepada penghuni baru.
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 font-bold mb-2">Fasilitas Kamar:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedRoom.fasilitas && selectedRoom.fasilitas.length > 0 ? (
                  selectedRoom.fasilitas.map((f, i) => (
                    <span
                      key={i}
                      className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold"
                    >
                      {f}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Tidak ada data fasilitas</span>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Kwitansi Digital */}
      <KwitansiModal
        open={Boolean(kwitansiRoom)}
        onClose={() => setKwitansiRoom(null)}
        kamar={kwitansiRoom}
        bulanSemasa={bulanSemasa}
      />
    </div>
  );
}