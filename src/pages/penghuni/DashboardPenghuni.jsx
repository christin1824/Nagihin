import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import { useAuth } from '../../context/useAuth';
import { IconDollar, IconBed, IconWrench, IconBook, IconCheck, IconMegaphone, IconPrinter } from '../../components/Icons';
import KwitansiModal from '../../components/KwitansiModal';

// Selisih hari dari hari ini ke tanggal tempo (positif = masih ada waktu)
const hitungSisaHari = (tempo) => {
  if (!tempo || tempo === '-') return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(tempo);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
};

const formatTanggal = (iso) =>
  !iso || iso === '-' ? '-' : new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

// Kartu dasar: tinggi seragam, konten di tengah
const card =
  'bg-[#f4f7fa]/95 rounded-[24px] p-7 shadow-xl border border-white/60 flex flex-col items-center justify-center text-center';

const CardHeader = ({ icon, title }) => (
  <div className="flex items-center justify-center gap-2.5 mb-4">
    <div className="bg-[#aebad3] w-10 h-10 rounded-xl flex items-center justify-center text-[#1d3557]">{icon}</div>
    <h3 className="text-gray-600 font-bold">{title}</h3>
  </div>
);

export default function DashboardPenghuni() {
  const { kamarData, tiketData, pengumumanData, showToast, bulanSemasa } = useContext(AdminContext);
  const { profile } = useAuth();
  const [bukaKwitansi, setBukaKwitansi] = useState(false);
  const kamarPenghuni = String(
    profile?.kamar ?? profile?.room ?? profile?.kamar_id ?? profile?.nomor_kamar ?? ''
  ).trim().replace(/^kamar\s+/i, '');

  const saya = kamarData.find((k) => k.kamar === kamarPenghuni);

  if (!saya || saya.status !== 'Terisi') {
    return (
      <div className="max-w-5xl mx-auto bg-[#f4f7fa] rounded-[20px] p-10 shadow-2xl text-center text-gray-500 font-medium">
        Data kamar Anda tidak ditemukan. Hubungi pengelola kost.
      </div>
    );
  }

  const lunas = saya.bayar === 'Lunas';
  const sisaHari = hitungSisaHari(saya.tempo);
  const terlambat = !lunas && sisaHari !== null && sisaHari < 0;
  const tiketSaya = tiketData.filter((t) => String(t.kamar ?? t.kamar_id ?? '') === kamarPenghuni);
  const tiketAktif = tiketSaya.filter((t) => t.status !== 'Selesai').length;
  const pengumumanAktif = (pengumumanData || []).filter((p) => p.aktif);

  const tema = lunas
    ? { text: 'text-[#228b3a]', soft: 'bg-[#8ce69f]/25 border-[#228b3a]/20', label: 'Lunas' }
    : terlambat
      ? { text: 'text-[#a16b10]', soft: 'bg-[#fcd385]/35 border-[#a16b10]/20', label: 'Terlambat' }
      : { text: 'text-[#a12020]', soft: 'bg-[#fc9292]/20 border-[#a12020]/20', label: 'Belum Bayar' };

  const handleBayarSekarang = () => {
    const jumlahTagihan = Number(saya.jumlah || saya.hargaBaku || 0).toLocaleString('id-ID');
    const pesanWhatsApp = [
      'Halo Pengelola Nagih.in Kost,',
      '',
      'Saya ingin mengirim bukti pembayaran sewa:',
      `Nama: ${saya.nama}`,
      `Nomor kamar: ${saya.kamar}`,
      `Periode: ${bulanSemasa}`,
      `Nominal: Rp ${jumlahTagihan}`,
      '',
      'Bukti pembayaran saya lampirkan di chat ini. Mohon dikonfirmasi, terima kasih.',
    ].join('\n');
    const nomorPengelola = '6281943376024';
    window.open(`https://wa.me/${nomorPengelola}?text=${encodeURIComponent(pesanWhatsApp)}`, '_blank');
    showToast('WhatsApp pengelola dibuka. Silakan lampirkan bukti pembayaran sebelum mengirim.', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto min-h-full flex flex-col justify-center gap-6 py-2">
      {/* Sapaan */}
      <div className="text-center text-white">
        <h2 className="text-4xl font-bold tracking-wide drop-shadow-sm">Halo, {saya.nama.split(' ')[0]}!</h2>
        <p className="mt-1 text-lg text-white/90 font-medium">Portal Kamar {saya.kamar} · {bulanSemasa}</p>
      </div>

      {/* PAPAN PENGUMUMAN KOST (DARI ADMIN) */}
      {pengumumanAktif.length > 0 && (
        <div className="bg-[#f4f7fa]/95 rounded-[24px] p-5 shadow-xl border border-white/60">
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-8 h-8 rounded-xl bg-[#1d3557] text-white flex items-center justify-center shrink-0">
              <IconMegaphone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-extrabold text-[#1d3557] leading-tight">Papan Pengumuman Kost</h3>
              <p className="text-[11px] font-medium text-slate-500">Informasi resmi dari Pengelola Kost Nagih.in</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pengumumanAktif.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
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
                    <span className="text-[11px] font-semibold text-slate-400">{item.tanggal}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800 mb-1">{item.judul}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.isi}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kartu utama: status tagihan, dibagi 3 kolom sama lebar */}
      <div className={`${card} p-8`}>
        <CardHeader icon={<IconDollar />} title="Status Tagihan Bulan Ini" />
        <div className="w-full grid grid-cols-1 md:grid-cols-3 items-center gap-6 md:divide-x divide-gray-200">
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500 font-semibold mb-1">Status</p>
            <p className={`text-3xl font-extrabold ${tema.text}`}>{tema.label}</p>
            {lunas ? (
              <button
                onClick={() => setBukaKwitansi(true)}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1d3557] hover:bg-[#152843] text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <IconPrinter className="w-3.5 h-3.5" /> Lihat Kwitansi Resmi
              </button>
            ) : (
              <button
                onClick={handleBayarSekarang}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <IconCheck className="w-3.5 h-3.5" /> Konfirmasi Bayar
              </button>
            )}
          </div>

          <div className="flex justify-center">
            {!lunas && sisaHari !== null ? (
              <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center ${tema.soft}`}>
                <p className={`text-5xl font-extrabold leading-none ${tema.text}`}>{Math.abs(sisaHari)}</p>
                <p className="mt-1 text-xs font-bold text-gray-600 px-3">
                  {terlambat ? 'hari terlambat' : sisaHari === 0 ? 'hari terakhir' : 'hari lagi'}
                </p>
              </div>
            ) : (
              <div className={`w-36 h-36 rounded-full border-4 flex items-center justify-center ${tema.soft}`}>
                <IconCheck className={`w-14 h-14 ${tema.text}`} />
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 font-semibold mb-1">Total Tagihan</p>
            <p className="text-3xl font-extrabold text-gray-700">Rp {saya.jumlah?.toLocaleString('id-ID')}</p>
            <p className="mt-1 text-sm text-gray-500 font-medium">
              Jatuh tempo <span className="font-bold text-gray-700">{formatTanggal(saya.tempo)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3 kartu sama besar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${card} !justify-between min-h-[230px]`}>
          <CardHeader icon={<IconBed />} title="Informasi Kamar" />
          <p className="text-4xl font-extrabold text-[#1d3557]">{saya.kamar}</p>
          <p className="mt-1 text-sm text-gray-500 font-semibold">{saya.tipe} · {saya.lantai}</p>
          <div className="mt-4 flex gap-1.5 flex-wrap justify-center">
            {saya.fasilitas.map((f) => (
              <span key={f} className="bg-[#e2e8f0] text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-300">{f}</span>
            ))}
          </div>
        </div>

        <Link to="/penghuni/komplain" className={`${card} !justify-between min-h-[230px] hover:-translate-y-1 transition-transform`}>
          <CardHeader icon={<IconWrench />} title="Laporan Komplain" />
          <p className="text-4xl font-extrabold text-[#1d3557]">{tiketAktif}</p>
          <p className="mt-1 text-sm text-gray-500 font-semibold">sedang berjalan · {tiketSaya.length} total</p>
          <p className="mt-4 text-sm text-[#2563eb] font-semibold">Buat / lihat laporan →</p>
        </Link>

        <Link to="/penghuni/peraturan" className={`${card} !justify-between min-h-[230px] hover:-translate-y-1 transition-transform`}>
          <CardHeader icon={<IconBook />} title="Peraturan Kost" />
          <ul className="space-y-1.5 text-sm font-semibold text-gray-700">
            <li>Jam malam 22.00 WIB</li>
            <li>Tamu wajib lapor</li>
            <li>Bayar maks. tanggal 20</li>
          </ul>
          <p className="mt-4 text-sm text-[#2563eb] font-semibold">Lihat semua →</p>
        </Link>
      </div>

      {/* MODAL KWITANSI PEMBAYARAN DIGITAL */}
      <KwitansiModal
        open={bukaKwitansi}
        onClose={() => setBukaKwitansi(false)}
        kamar={saya}
        bulanSemasa={bulanSemasa}
      />
    </div>
  );
}
