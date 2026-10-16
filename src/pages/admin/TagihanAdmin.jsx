import { useState, useContext } from 'react';
import { AdminContext } from '../../context/AdminContext';
import {
  IconFileText,
  IconSearch,
  IconCheck,
  IconWhatsApp,
  IconRotateCcw,
  IconTrash,
  IconDollar,
  IconPrinter,
} from '../../components/Icons';
import Modal, { Field, inputClass, primaryBtn } from '../../components/Modal';
import KwitansiModal from '../../components/KwitansiModal';

export default function TagihanAdmin() {
  const { kamarData, setKamarData, bulanSemasa, generateTagihanBulanan, showToast } = useContext(AdminContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedKamar, setSelectedKamar] = useState(null);
  const [kwitansiKamar, setKwitansiKamar] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    metode: 'Transfer',
    tanggalBayar: '',
    nominal: '',
    referensi: '',
    catatan: '',
  });

  const tagihanAktif = kamarData.filter((k) => k.status === 'Terisi');

  const filteredTagihan = tagihanAktif.filter((row) => {
    const matchesSearch =
      row.nama.toLowerCase().includes(searchQuery.toLowerCase()) || row.kamar.includes(searchQuery);
    const matchesStatus = statusFilter === 'Semua Status' || row.bayar === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const bukaModalPembayaran = (kamarObj) => {
    setSelectedKamar(kamarObj);
    const today = new Date().toISOString().split('T')[0];
    setPaymentForm({
      metode: 'Transfer',
      tanggalBayar: today,
      nominal: kamarObj.jumlah,
      referensi: '',
      catatan: '',
    });
    setIsPaymentModalOpen(true);
  };

  const handleSimpanPembayaran = (e) => {
    e.preventDefault();
    setKamarData(
      kamarData.map((k) => {
        if (k.kamar === selectedKamar.kamar) {
          const historiBaru = {
            id: Date.now(),
            bulan: bulanSemasa,
            jumlahBayar: Number(paymentForm.nominal) || k.jumlah,
            ...paymentForm,
          };
          return {
            ...k,
            bayar: 'Lunas',
            riwayatPembayaran: [...(k.riwayatPembayaran || []), historiBaru],
          };
        }
        return k;
      })
    );
    setIsPaymentModalOpen(false);
    showToast(`Pembayaran Kamar ${selectedKamar.kamar} (${selectedKamar.nama}) berhasil diverifikasi!`, 'success');
  };

  const handleBatalkanLunas = (row) => {
    if (
      window.confirm(
        `Batalkan status lunas kamar ${row.kamar}? Catatan pembayaran terakhir akan dihapus.`
      )
    ) {
      setKamarData(
        kamarData.map((k) =>
          k.kamar === row.kamar
            ? { ...k, bayar: 'Belum Bayar', riwayatPembayaran: (k.riwayatPembayaran || []).slice(0, -1) }
            : k
        )
      );
      showToast(`Status lunas Kamar ${row.kamar} telah dibatalkan.`, 'info');
    }
  };

  const handleHapusTagihan = (row) => {
    if (window.confirm(`Hapus tagihan kamar ${row.kamar} bulan ${bulanSemasa}?`)) {
      setKamarData(
        kamarData.map((k) => (k.kamar === row.kamar ? { ...k, bayar: 'Tidak Ada', jumlah: 0 } : k))
      );
      showToast(`Tagihan Kamar ${row.kamar} bulan ${bulanSemasa} dihapus.`, 'info');
    }
  };

  const handleTerbitkan = (row) => {
    const now = new Date();
    const nextTempo = new Date(now.getFullYear(), now.getMonth(), 20).toISOString().split('T')[0];
    setKamarData(
      kamarData.map((k) =>
        k.kamar === row.kamar ? { ...k, bayar: 'Belum Bayar', jumlah: k.hargaBaku, tempo: nextTempo } : k
      )
    );
    showToast(`Tagihan Kamar ${row.kamar} berhasil diterbitkan!`, 'success');
  };

  const handleKirimWA = (nama, hp, jumlah, kamar, tempo) => {
    if (!hp || hp === '-') {
      showToast('Nomor WhatsApp penghuni tidak valid!', 'error');
      return;
    }
    const waNumber = hp.startsWith('0') ? '62' + hp.slice(1) : hp;
    const tempoFormatted =
      tempo && tempo !== '-'
        ? new Date(tempo).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '-';
    const pesan = `Halo ${nama},\n\nIni adalah pengingat bahwa tagihan kamar ${kamar} Anda untuk bulan ${bulanSemasa} sebesar Rp ${jumlah.toLocaleString(
      'id-ID'
    )} telah terbit.\n\nJatuh tempo pada: *${tempoFormatted}*.\nMohon segera melakukan pembayaran.\n\nTerima kasih.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`, '_blank');
  };

  const handleGenerate = () => {
    if (
      window.confirm(
        `Anda yakin ingin menerbitkan tagihan bulan ${bulanSemasa} untuk SEMUA penghuni aktif? Status mereka akan berubah menjadi Belum Bayar.`
      )
    ) {
      generateTagihanBulanan();
      showToast(`Seluruh tagihan periode ${bulanSemasa} berhasil diterbitkan!`, 'success');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Lunas':
        return 'bg-[#8ce69f] text-[#228b3a] border border-[#228b3a]/30';
      case 'Belum Bayar':
        return 'bg-[#fc9292] text-[#a12020] border border-[#a12020]/30';
      case 'Jatuh Tempo':
        return 'bg-[#fcd385] text-[#a16b10] border border-[#a16b10]/30';
      case 'Tidak Ada':
        return 'bg-[#cbd5e1] text-[#475569] border border-[#475569]/30';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getInitials = (name) => {
    if (!name || name === '-') return '-';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  const formatTanggal = (isoDate) => {
    if (!isoDate || isoDate === '-') return '-';
    return new Date(isoDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto drop-shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
        <div>
          <h2 className="text-4xl font-bold mb-1 tracking-wide">Tagihan Penghuni</h2>
          <p className="text-lg text-white/90 font-medium">
            Kelola Invoice Bulanan & Pembayaran — {bulanSemasa}
          </p>
        </div>
        <button onClick={handleGenerate} className={primaryBtn}>
          <IconFileText className="w-4 h-4" /> Generate Tagihan Baru
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
            <option>Lunas</option>
            <option>Belum Bayar</option>
            <option>Jatuh Tempo</option>
            <option>Tidak Ada</option>
          </select>

          <div className="relative flex-1 md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <IconSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari Nama atau Kamar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#5b738c] bg-white text-gray-700 placeholder-gray-400 outline-none text-sm font-medium shadow-sm"
            />
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500 self-end md:self-center">
          Menampilkan {filteredTagihan.length} dari {tagihanAktif.length} kamar aktif
        </div>
      </div>

      {/* Tabel Tagihan */}
      <div className="bg-[#f4f7fa] rounded-[20px] shadow-2xl border border-white/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-200/80 text-slate-700 text-xs uppercase tracking-wider font-extrabold border-b border-slate-300">
                <th className="py-4 px-6">Penghuni</th>
                <th className="py-4 px-6 text-center">Kamar</th>
                <th className="py-4 px-6">Jumlah Tagihan</th>
                <th className="py-4 px-6">Jatuh Tempo</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white/40">
              {filteredTagihan.length > 0 ? (
                filteredTagihan.map((row) => (
                  <tr key={row.kamar} className="hover:bg-white/80 transition-colors">
                    <td className="py-3.5 px-6 flex items-center gap-3 whitespace-nowrap">
                      <div className="w-9 h-9 shrink-0 rounded-full bg-[#1d3557] text-white flex items-center justify-center font-bold text-xs shadow-inner">
                        {getInitials(row.nama)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{row.nama}</p>
                        <p className="text-xs text-gray-500">{row.hp}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-center font-black text-gray-800 text-sm">
                      {row.kamar}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-gray-800 text-sm whitespace-nowrap">
                      {row.bayar === 'Tidak Ada' ? '-' : `Rp ${row.jumlah?.toLocaleString('id-ID')}`}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-gray-600 text-sm whitespace-nowrap">
                      {row.bayar === 'Tidak Ada' ? '-' : formatTanggal(row.tempo)}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-inner whitespace-nowrap ${getStatusBadge(
                          row.bayar
                        )}`}
                      >
                        {row.bayar}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex justify-center items-center gap-2 whitespace-nowrap">
                        {row.bayar === 'Tidak Ada' ? (
                          <button
                            onClick={() => handleTerbitkan(row)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#1d3557] text-white hover:bg-[#152740] transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <IconDollar className="w-3.5 h-3.5" /> Terbitkan
                          </button>
                        ) : row.bayar !== 'Lunas' ? (
                          <button
                            onClick={() => bukaModalPembayaran(row)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#8ce69f] text-[#1c7830] border border-[#228b3a]/30 hover:bg-[#78db8d] transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <IconCheck className="w-3.5 h-3.5" /> Tandai Lunas
                          </button>
                        ) : (
                          <button
                            onClick={() => setKwitansiKamar(row)}
                            title="Lihat & Cetak Kwitansi Pembayaran"
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#1d3557] hover:bg-[#152843] text-white transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <IconPrinter className="w-3.5 h-3.5" /> Kwitansi
                          </button>
                        )}

                        <button
                          onClick={() => handleKirimWA(row.nama, row.hp, row.jumlah, row.kamar, row.tempo)}
                          disabled={row.bayar === 'Lunas' || row.bayar === 'Tidak Ada'}
                          title="Kirim pengingat WhatsApp"
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors shadow-sm flex items-center gap-1
                            ${
                              row.bayar === 'Lunas' || row.bayar === 'Tidak Ada'
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-[#25D366] text-white border-[#1ebe5d] hover:bg-[#1ebe5d]'
                            }`}
                        >
                          <IconWhatsApp className="w-3.5 h-3.5" /> WA
                        </button>

                        {row.bayar !== 'Tidak Ada' && (
                          <>
                            {row.bayar === 'Lunas' && (
                              <button
                                onClick={() => handleBatalkanLunas(row)}
                                title="Batalkan status lunas"
                                className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm"
                              >
                                <IconRotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleHapusTagihan(row)}
                              title="Hapus tagihan bulan ini"
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors shadow-sm"
                            >
                              <IconTrash className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                    Tidak ada data tagihan yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Verifikasi Pembayaran (Shared Modal with createPortal) */}
      {isPaymentModalOpen && selectedKamar && (
        <Modal
          title="Verifikasi Pembayaran"
          subtitle={`Kamar ${selectedKamar.kamar} — ${selectedKamar.nama}`}
          onClose={() => setIsPaymentModalOpen(false)}
          onSubmit={handleSimpanPembayaran}
          submitLabel="Konfirmasi & Tandai Lunas"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Metode Bayar">
              <select
                value={paymentForm.metode}
                onChange={(e) => setPaymentForm({ ...paymentForm, metode: e.target.value })}
                className={inputClass}
              >
                <option>Transfer</option>
                <option>Tunai</option>
              </select>
            </Field>
            <Field label="Tanggal Bayar">
              <input
                type="date"
                required
                value={paymentForm.tanggalBayar}
                onChange={(e) => setPaymentForm({ ...paymentForm, tanggalBayar: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Nominal Diterima (Rp)">
            <input
              type="number"
              required
              min="0"
              value={paymentForm.nominal}
              onChange={(e) => setPaymentForm({ ...paymentForm, nominal: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="No. Referensi / Bukti Transfer">
            <input
              type="text"
              placeholder="Contoh: TRF-BCA-001"
              value={paymentForm.referensi}
              onChange={(e) => setPaymentForm({ ...paymentForm, referensi: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Catatan Tambahan (Opsional)">
            <textarea
              rows="2"
              placeholder="Catatan dari admin..."
              value={paymentForm.catatan}
              onChange={(e) => setPaymentForm({ ...paymentForm, catatan: e.target.value })}
              className={inputClass + ' resize-none'}
            ></textarea>
          </Field>
        </Modal>
      )}

      {/* Modal Kwitansi Digital */}
      <KwitansiModal
        open={Boolean(kwitansiKamar)}
        onClose={() => setKwitansiKamar(null)}
        kamar={kwitansiKamar}
        bulanSemasa={bulanSemasa}
      />
    </div>
  );
}
