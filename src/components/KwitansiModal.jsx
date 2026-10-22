import { createPortal } from 'react-dom';
import logoNagihin from '../assets/logo.png';
import { IconCheck, IconPrinter, IconX, IconShield } from './Icons';

export default function KwitansiModal({ open = true, kamar, bulanSemasa, onClose }) {
  if (!open || !kamar) return null;

  // Ambil pembayaran terakhir dari riwayat jika ada, atau gunakan nilai default
  const pembayaranTerakhir =
    kamar.riwayatPembayaran && kamar.riwayatPembayaran.length > 0
      ? kamar.riwayatPembayaran[kamar.riwayatPembayaran.length - 1]
      : null;

  const nominal = Number(
    pembayaranTerakhir?.nominal ||
      pembayaranTerakhir?.jumlahBayar ||
      kamar.jumlah ||
      kamar.hargaBaku ||
      0
  );
  const metode = pembayaranTerakhir?.metode || 'Transfer Bank';
  const tanggalBayarRaw = pembayaranTerakhir?.tanggalBayar || new Date().toISOString().split('T')[0];
  const parsedDate = new Date(tanggalBayarRaw);
  const tanggalBayarFormatted = isNaN(parsedDate.getTime())
    ? tanggalBayarRaw
    : parsedDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
  const periode = pembayaranTerakhir?.bulan || bulanSemasa;
  const nomorReferensi =
    pembayaranTerakhir?.referensi || `TRX-${kamar.kamar}-${String(pembayaranTerakhir?.id || 202610).slice(-5)}`;
  const nomorKwitansi = `INV/${new Date().getFullYear()}/KMR-${kamar.kamar}/${String(
    pembayaranTerakhir?.id || 1084
  ).slice(-4)}`;

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div
      onClick={onClose}
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:p-0 print:bg-white"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-card bg-white rounded-[24px] shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] overflow-y-auto flex flex-col print:shadow-none print:border-none print:max-w-full print:rounded-none"
      >
        {/* Top Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 rounded-t-[24px] print:hidden">
          <div className="flex items-center gap-2">
            <IconShield className="w-4 h-4 text-[#1d3557]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1d3557]">
              Bukti Pembayaran Digital Resmi
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Content */}
        <div id="area-kwitansi" className="p-7 space-y-6 text-slate-800">
          {/* Header Kwitansi */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <img src={logoNagihin} alt="Nagih.in Logo" className="w-12" />
              <div>
                <h3 className="text-xl font-black text-[#1d3557] leading-tight">Nagih.in Kost</h3>
                <p className="text-[11px] font-semibold text-slate-500">
                  Jl. Raya ITS, Sukolilo, Surabaya 60111
                </p>
                <p className="text-[11px] font-medium text-slate-400">WA Pengelola: +62 812-3456-7890</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#8ce69f]/40 text-[#1c7830] border border-[#228b3a]/30">
                <IconCheck className="w-3.5 h-3.5" /> LUNAS
              </span>
              <p className="text-[11px] font-bold text-slate-400 mt-1.5">{nomorKwitansi}</p>
            </div>
          </div>

          {/* Informasi Utama Transaksi */}
          <div className="grid grid-cols-2 gap-4 bg-[#f4f7fa] p-4 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Diterima Dari (Penghuni)</p>
              <p className="text-sm font-extrabold text-[#1d3557] mt-0.5">{kamar.nama}</p>
              <p className="text-slate-500 font-medium">{kamar.hp}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 font-bold uppercase text-[10px]">Tanggal Pembayaran</p>
              <p className="text-sm font-extrabold text-[#1d3557] mt-0.5">{tanggalBayarFormatted}</p>
              <p className="text-slate-500 font-medium">Metode: {metode}</p>
            </div>
          </div>

          {/* Tabel Rincian Sewa */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Deskripsi Tagihan</th>
                  <th className="py-3 px-4 text-center">Periode</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3.5 px-4">
                    <p className="font-extrabold text-[#1d3557] text-sm">
                      Sewa Kamar {kamar.kamar} ({kamar.tipe})
                    </p>
                    <p className="text-slate-500 font-medium mt-0.5">
                      {kamar.lantai} · Fasilitas: {kamar.fasilitas?.join(', ')}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700 whitespace-nowrap">
                    {periode}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-[#1d3557] whitespace-nowrap text-sm">
                    Rp {nominal.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-[#1d3557] text-white">
                  <td colSpan="2" className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider">
                    Total Dibayar
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-base whitespace-nowrap">
                    Rp {nominal.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Info Referensi & Stempel Digital */}
          <div className="flex items-end justify-between pt-2 text-xs text-slate-500">
            <div className="space-y-1">
              <p>
                <span className="font-bold text-slate-600">No. Referensi:</span> {nomorReferensi}
              </p>
              {pembayaranTerakhir?.catatan && (
                <p>
                  <span className="font-bold text-slate-600">Catatan:</span> {pembayaranTerakhir.catatan}
                </p>
              )}
              <p className="text-[11px] text-slate-400 pt-1">
                Kwitansi ini diterbitkan secara sah oleh sistem manajemen Nagih.in Kost.
              </p>
            </div>

            <div className="text-center shrink-0 pl-4">
              <div className="inline-block border-2 border-emerald-600/40 text-emerald-700 px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest -rotate-6 mb-1">
                TERVERIFIKASI
              </div>
              <p className="text-[11px] font-extrabold text-[#1d3557]">Pengelola Nagih.in</p>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden when printing) */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-[24px] print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-200/80 hover:bg-gray-300/80 text-gray-700 font-bold text-xs transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-[#1d3557] hover:bg-[#152740] text-white font-bold text-xs shadow-md transition-colors inline-flex items-center gap-2"
          >
            <IconPrinter className="w-4 h-4" /> Cetak / Simpan PDF
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

