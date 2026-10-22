import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import logoNagihin from '../../assets/logo.png';
import {
  IconSearch,
  IconBed,
  IconMapPin,
  IconWifi,
  IconWhatsApp,
  IconMessage,
  IconCheck,
  IconX,
  IconStar,
  IconShield,
  IconSend,
  IconChevronLeft,
  IconChevronRight,
  IconUser,
  IconHeart,
  IconLock,
  IconInfo,
} from '../../components/Icons';
import Modal, { Field, inputClass } from '../../components/Modal';

export default function KatalogPublik() {
  const { kamarData, sewaKamarPublik, kirimPesanPublik } = useContext(AdminContext);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [tipeFilter, setTipeFilter] = useState('Semua'); // 'Semua' | 'Reguler' | 'VIP'
  const [statusFilter, setStatusFilter] = useState('Semua'); // 'Semua' | 'Kosong'
  const [maxHarga] = useState(2500000);

  // Modal states
  const [selectedKamarDetail, setSelectedKamarDetail] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const [bookingKamar, setBookingKamar] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    nama: '',
    hp: '',
    tanggalMasuk: new Date().toISOString().split('T')[0],
    catatan: '',
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Floating Chat Widget state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatForm, setChatForm] = useState({
    nama: '',
    hp: '',
    pesan: '',
  });
  const [chatSuccess, setChatSuccess] = useState(false);

  // Likes / Favorites simulation
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (nomor) => {
    setFavorites((prev) => ({ ...prev, [nomor]: !prev[nomor] }));
  };

  // Filter logic
  const filteredKamar = kamarData.filter((k) => {
    const matchSearch =
      k.kamar.toLowerCase().includes(search.toLowerCase()) ||
      k.tipe.toLowerCase().includes(search.toLowerCase()) ||
      k.lantai.toLowerCase().includes(search.toLowerCase()) ||
      k.fasilitas.some((f) => f.toLowerCase().includes(search.toLowerCase()));

    const matchTipe = tipeFilter === 'Semua' || k.tipe === tipeFilter;
    const matchStatus = statusFilter === 'Semua' || (statusFilter === 'Kosong' && k.status === 'Kosong');
    const matchHarga = (k.hargaBaku || 1500000) <= maxHarga;

    return matchSearch && matchTipe && matchStatus && matchHarga;
  });

  const kamarKosongCount = kamarData.filter((k) => k.status === 'Kosong').length;

  // Handler Sewa
  const handleBukaSewa = (kamarObj) => {
    setBookingKamar(kamarObj);
    setBookingSuccess(false);
    setBookingForm({
      nama: '',
      hp: '',
      tanggalMasuk: new Date().toISOString().split('T')[0],
      catatan: '',
    });
  };

  const handleSubmitSewa = (e) => {
    e.preventDefault();
    if (!bookingForm.nama || !bookingForm.hp) return;

    sewaKamarPublik({
      nomorKamar: bookingKamar.kamar,
      nama: bookingForm.nama,
      hp: bookingForm.hp,
      tanggalMasuk: bookingForm.tanggalMasuk,
      catatan: bookingForm.catatan,
    });

    setBookingSuccess(true);
  };

  // Handler Chat
  const handleSubmitChat = (e) => {
    e.preventDefault();
    if (!chatForm.pesan.trim() || !chatForm.nama.trim()) return;

    kirimPesanPublik({
      nama: chatForm.nama,
      hp: chatForm.hp || '08123456789',
      pesan: chatForm.pesan,
    });

    setChatSuccess(true);
    setTimeout(() => {
      setChatForm({ nama: '', hp: '', pesan: '' });
      setChatSuccess(false);
      setIsChatOpen(false);
    }, 2500);
  };

  const bukaChatDenganKamar = (kamarNomor) => {
    setChatForm((prev) => ({
      ...prev,
      pesan: `Halo Admin Nagih.in, saya tertarik dengan Kamar ${kamarNomor}. Apakah masih bisa disurvei atau dibooking?`,
    }));
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen public-bg text-slate-800 font-sans flex flex-col selection:bg-[#80aad3]/30">
      {/* --- TOP NAVBAR --- */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#80aad3]/30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img src={logoNagihin} alt="Nagih.in Logo" className="w-10 sm:w-12 transition-transform group-hover:scale-105" />
            <div>
              <span className="text-xl font-extrabold text-[#000f22] tracking-tight block leading-none">
                Nagih<span className="text-[#3f6593]">.in</span> Kost
              </span>
              <span className="text-[10px] font-bold text-[#5b86b6] uppercase tracking-wider">
                Eksklusif & Nyaman · ITS Surabaya
              </span>
            </div>
          </Link>

          {/* Quick Location Badge */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 text-[#1b3554] text-xs font-semibold border border-[#80aad3]/50 shadow-2xs backdrop-blur-xs">
            <IconMapPin className="w-3.5 h-3.5 text-[#3f6593]" />
            <span>Komp. Kampus ITS Sukolilo, Surabaya, Jawa Timur</span>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsChatOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#1b3554] bg-[#c0e6fd]/30 hover:bg-[#c0e6fd]/60 transition-colors border border-[#80aad3]/40"
            >
              <IconMessage className="w-4 h-4 text-[#3f6593]" />
              <span>Tanya Pengelola</span>
            </button>

            <Link
              to="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1b3554] via-[#3f6593] to-[#5b86b6] hover:from-[#000f22] hover:to-[#3f6593] shadow-md hover:shadow-cyan-950/20 transition-all active:scale-95 border border-[#80aad3]/30"
            >
              <IconUser className="w-4 h-4 text-[#c0e6fd]" />
              <span>Masuk Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* --- HERO BANNER (DIPADUKAN BIRU GRADASI PALETTE DENGAN PUTIH & LIGHT ACCENT) --- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#000f22] via-[#1b3554] to-[#3f6593] text-white py-16 px-4 sm:px-6 lg:px-8 shadow-inner border-b border-[#3f6593]/40">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[#c0e6fd] text-xs font-extrabold border border-white/25 shadow-sm">
            <IconStar className="w-4 h-4 text-[#c0e6fd]" />
            <span>Hunian Kost Premium Dekat Kampus ITS · Booking Online Praktis</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-md">
            Temukan Kamar Kost Idamanmu di <span className="text-[#c0e6fd] underline decoration-[#80aad3]/60 underline-offset-8">Nagih.in</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-100 max-w-2xl mx-auto font-medium">
            Hunian kost strategis di kawasan Institut Teknologi Sepuluh Nopember (ITS) Sukolilo Surabaya dengan fasilitas lengkap, WiFi kencang, dan manajemen pintar.
          </p>

          {/* Quick Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 text-xs font-bold text-slate-100">
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20">
              <IconCheck className="w-4 h-4 text-[#c0e6fd]" /> Bebas Biaya Admin
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20">
              <IconWifi className="w-4 h-4 text-[#c0e6fd]" /> WiFi High Speed Gratis
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20">
              <IconShield className="w-4 h-4 text-[#c0e6fd]" /> Keamanan 24 Jam & Nyaman
            </span>
          </div>
        </div>
      </section>

      {/* --- SEARCH & FILTER BAR (BERSIH DENGAN WARNA PUTIH + AKSEN PALET BIRU) --- */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-[#80aad3]/40 flex flex-col lg:flex-row items-center gap-4">
          {/* Input Search */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5b86b6]">
              <IconSearch className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Cari kamar (contoh: 105, AC, VIP, Lantai 2)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#f0f7fd] hover:bg-white focus:bg-white text-[#000f22] placeholder-[#5b86b6]/70 rounded-xl border border-[#80aad3]/40 focus:border-[#3f6593] focus:ring-4 focus:ring-[#80aad3]/20 outline-none transition-all text-sm font-semibold"
            />
          </div>

          {/* Tipe Filter Tabs */}
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            {['Semua', 'VIP', 'Reguler'].map((tipe) => (
              <button
                key={tipe}
                onClick={() => setTipeFilter(tipe)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  tipeFilter === tipe
                    ? 'bg-gradient-to-r from-[#1b3554] to-[#3f6593] text-white font-black shadow-md'
                    : 'bg-[#f0f7fd] text-[#1b3554] hover:bg-[#c0e6fd]/50 border border-[#80aad3]/30'
                }`}
              >
                {tipe === 'Semua' ? 'Semua Tipe' : `Tipe ${tipe}`}
              </button>
            ))}
          </div>

          {/* Status Filter Tab */}
          <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setStatusFilter(statusFilter === 'Kosong' ? 'Semua' : 'Kosong')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 w-full lg:w-auto justify-center ${
                statusFilter === 'Kosong'
                  ? 'bg-[#c0e6fd] text-[#000f22] border-[#80aad3] font-black ring-2 ring-[#80aad3]/50 shadow-md'
                  : 'bg-[#f0f7fd] text-[#1b3554] border-[#80aad3]/30 hover:bg-[#c0e6fd]/50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${statusFilter === 'Kosong' ? 'bg-[#1b3554]' : 'bg-[#5b86b6]'}`}></span>
              <span>Hanya Kamar Kosong ({kamarKosongCount})</span>
            </button>
          </div>
        </div>
      </section>

      {/* --- ROOM LISTINGS GRID --- */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#000f22] tracking-tight">
              Katalog Kamar Tersedia
            </h2>
            <p className="text-sm text-[#3f6593] font-medium">
              Menampilkan {filteredKamar.length} pilihan kamar siap huni dengan fasilitas terawat di sekitar Kampus ITS
            </p>
          </div>

          {/* Quick info tag */}
          <div className="flex items-center gap-2 text-xs font-bold text-[#1b3554] bg-white/80 px-3.5 py-1.5 rounded-full border border-[#80aad3]/40 shadow-xs backdrop-blur-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3f6593]"></span>
            <span>{kamarKosongCount} Kamar Siap Huni</span>
          </div>
        </div>

        {filteredKamar.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-12 text-center border border-[#80aad3]/40 shadow-lg max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#f0f7fd] text-[#3f6593] flex items-center justify-center mx-auto">
              <IconBed className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#000f22]">Tidak ada kamar yang cocok</h3>
            <p className="text-xs text-[#5b86b6]">
              Coba sesuaikan kata kunci pencarian atau ubah filter untuk menemukan pilihan kamar lain.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setTipeFilter('Semua');
                setStatusFilter('Semua');
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#1b3554] to-[#3f6593] text-white rounded-xl text-xs font-bold hover:from-[#000f22] hover:to-[#1b3554] transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredKamar.map((room) => {
              const isKosong = room.status === 'Kosong';
              const coverFoto =
                room.foto ||
                'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={room.kamar}
                  className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#80aad3]/30 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1 hover:border-[#5b86b6]"
                >
                  {/* Photo Thumbnail Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={coverFoto}
                      alt={`Kamar ${room.kamar}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay for badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                    {/* Status Badge */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${
                          isKosong
                            ? 'bg-[#3f6593] text-white'
                            : 'bg-[#000f22]/80 backdrop-blur-md text-[#c0e6fd]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isKosong ? 'bg-[#c0e6fd]' : 'bg-[#80aad3]'}`}></span>
                        {isKosong ? 'Tersedia' : 'Penuh'}
                      </span>

                      {room.tipe === 'VIP' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#c0e6fd] text-[#000f22] shadow-sm flex items-center gap-1 border border-[#80aad3]/60">
                          <IconStar className="w-3 h-3 text-[#1b3554]" /> VIP
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(room.kamar)}
                      aria-label="Simpan Favorit"
                      className={`absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                        favorites[room.kamar]
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white hover:text-rose-500'
                      }`}
                    >
                      <IconHeart className={`w-4 h-4 ${favorites[room.kamar] ? 'fill-current' : ''}`} />
                    </button>

                    {/* Room Number & Floor banner */}
                    <div className="absolute bottom-3.5 left-3.5 text-white">
                      <p className="text-xl font-black leading-tight drop-shadow-md">
                        Kamar {room.kamar}
                      </p>
                      <p className="text-xs text-slate-200 font-medium drop-shadow-sm">
                        {room.lantai} {room.ukuran ? `· ${room.ukuran}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Price Tag */}
                      <div className="flex items-baseline justify-between mb-2">
                        <div>
                          <span className="text-2xl font-black text-[#000f22]">
                            Rp {room.hargaBaku?.toLocaleString('id-ID')}
                          </span>
                          <span className="text-xs font-semibold text-slate-400"> / bulan</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#1b3554] bg-[#f0f7fd] px-2.5 py-0.5 rounded-md border border-[#80aad3]/30">
                          {room.tipe}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed mb-3">
                        {room.deskripsi ||
                          'Kamar kost bersih, rapi, dan siap huni dengan ventilasi alami serta fasilitas pendukung yang lengkap.'}
                      </p>

                      {/* Facilities Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {room.fasilitas?.slice(0, 4).map((f, i) => (
                          <span
                            key={i}
                            className="bg-[#f0f7fd] text-[#1b3554] px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-[#80aad3]/30"
                          >
                            {f}
                          </span>
                        ))}
                        {room.fasilitas?.length > 4 && (
                          <span className="text-[10px] font-bold text-slate-400 self-center">
                            +{room.fasilitas.length - 4} lainnya
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedKamarDetail(room);
                          setActivePhotoIndex(0);
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-[#80aad3] bg-white hover:bg-[#f0f7fd] text-[#1b3554] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        Lihat Detail
                      </button>

                      {isKosong ? (
                        <button
                          onClick={() => handleBukaSewa(room)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#1b3554] via-[#3f6593] to-[#5b86b6] hover:from-[#000f22] hover:to-[#1b3554] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1 border border-[#80aad3]/30"
                        >
                          Sewa Kamar
                        </button>
                      ) : (
                        <button
                          onClick={() => bukaChatDenganKamar(room.kamar)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-[#c0e6fd]/40 text-[#1b3554] font-bold text-xs transition-colors flex items-center justify-center gap-1 border border-slate-200"
                        >
                          <IconMessage className="w-3.5 h-3.5" /> Antre Info
                        </button>
                      )}

                      <button
                        onClick={() => bukaChatDenganKamar(room.kamar)}
                        title="Tanya ketersediaan kamar ini"
                        className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors shrink-0 border border-emerald-200"
                      >
                        <IconWhatsApp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#000f22] text-white border-t border-[#1b3554] mt-16 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logoNagihin} alt="Nagih.in" className="w-9 brightness-200" />
              <h3 className="text-xl font-bold">Nagih.in Kost</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Platform persewaan dan manajemen hunian kost pintar di sekitar Kampus ITS Sukolilo Surabaya. Menyediakan hunian nyaman, aman, dan berkualitas dengan sistem billing dan penanganan komplain transparan.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#c0e6fd] mb-3">Lokasi & Kontak</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-2.5 flex items-start gap-2">
              <IconMapPin className="w-4 h-4 text-[#80aad3] shrink-0 mt-0.5" />
              <span>Jl. Raya ITS, Sukolilo, Surabaya, Jawa Timur 60111 (Dekat Asrama & Gedung Rektorat ITS)</span>
            </p>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <IconWhatsApp className="w-4 h-4 text-[#80aad3] shrink-0" />
              <span>WhatsApp Pengelola: +62 812-3456-7890</span>
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-[#1b3554]/70 text-center text-xs text-[#80aad3]/70">
          © 2026 Nagih.in Kost Management System · Institut Teknologi Sepuluh Nopember (ITS). Hak Cipta Dilindungi.
        </div>
      </footer>

      {/* --- MODAL DETAIL & GALERI KAMAR --- */}
      {selectedKamarDetail && (
        <Modal
          title={`Detail Kamar ${selectedKamarDetail.kamar}`}
          subtitle={`${selectedKamarDetail.tipe} · ${selectedKamarDetail.lantai}`}
          onClose={() => setSelectedKamarDetail(null)}
          onSubmit={(e) => {
            e.preventDefault();
            handleBukaSewa(selectedKamarDetail);
            setSelectedKamarDetail(null);
          }}
          submitLabel={selectedKamarDetail.status === 'Kosong' ? 'Lanjut Sewa Kamar Ini' : 'Tutup'}
        >
          <div className="space-y-5 text-sm text-slate-700">
            {/* Gallery Big Photo & Thumbnails */}
            <div>
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 shadow-md mb-2">
                <img
                  src={
                    selectedKamarDetail.galeri?.[activePhotoIndex] ||
                    selectedKamarDetail.foto ||
                    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={`Kamar ${selectedKamarDetail.kamar}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover transition-all"
                />

                {selectedKamarDetail.galeri && selectedKamarDetail.galeri.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIndex((prev) =>
                          prev === 0 ? selectedKamarDetail.galeri.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                    >
                      <IconChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIndex((prev) =>
                          prev === selectedKamarDetail.galeri.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                    >
                      <IconChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {selectedKamarDetail.galeri && selectedKamarDetail.galeri.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedKamarDetail.galeri.map((g, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        activePhotoIndex === idx ? 'border-[#3f6593] scale-105 shadow-md' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={g} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Specs */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#000f22]/5 border border-[#3f6593]/20">
              <div>
                <p className="text-xs text-[#3f6593] font-bold uppercase">Harga Sewa</p>
                <p className="text-2xl font-black text-[#1b3554]">
                  Rp {selectedKamarDetail.hargaBaku?.toLocaleString('id-ID')}
                  <span className="text-xs font-semibold text-slate-500"> / bulan</span>
                </p>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-black ${
                  selectedKamarDetail.status === 'Kosong'
                    ? 'bg-[#c0e6fd] text-[#000f22] border border-[#80aad3]'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {selectedKamarDetail.status === 'Kosong' ? 'Kamar Kosong' : 'Sudah Terisi'}
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-extrabold text-[#1b3554] mb-1.5">Deskripsi Kamar</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {selectedKamarDetail.deskripsi ||
                  'Kamar ini siap huni dengan ventilasi yang baik, lingkungan tenang, dan fasilitas lengkap.'}
              </p>
            </div>

            {/* Facilities */}
            <div>
              <h4 className="font-extrabold text-[#1b3554] mb-2">Fasilitas Lengkap</h4>
              <div className="flex flex-wrap gap-2">
                {selectedKamarDetail.fasilitas?.map((f, i) => (
                  <span
                    key={i}
                    className="bg-white text-[#1b3554] px-3 py-1.5 rounded-xl text-xs font-bold border border-[#80aad3]/40 shadow-2xs flex items-center gap-1.5"
                  >
                    <IconCheck className="w-3.5 h-3.5 text-[#3f6593]" /> {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Note */}
            <div className="p-3.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium flex items-center gap-2">
              <IconInfo className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Tips:</strong> Anda dapat mengajukan sewa langsung secara online atau menghubungi pengelola untuk survei lokasi terlebih dahulu.
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* --- MODAL SEWA / BOOKING KAMAR --- */}
      {bookingKamar && (
        <Modal
          title={bookingSuccess ? 'Pengajuan Berhasil!' : `Sewa Kamar ${bookingKamar.kamar}`}
          subtitle={
            bookingSuccess
              ? 'Data sewa Anda telah dicatat oleh sistem'
              : `Tipe ${bookingKamar.tipe} · Rp ${bookingKamar.hargaBaku?.toLocaleString('id-ID')} / bulan`
          }
          onClose={() => setBookingKamar(null)}
          onSubmit={bookingSuccess ? () => setBookingKamar(null) : handleSubmitSewa}
          submitLabel={bookingSuccess ? 'Selesai & Tutup' : 'Konfirmasi & Ajukan Sewa'}
        >
          {bookingSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <IconCheck className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-[#1d3557]">Selamat, Pengajuan Berhasil!</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kamar <strong>{bookingKamar.kamar}</strong> telah dicatat atas nama{' '}
                <strong>{bookingForm.nama}</strong>. Data pengajuan telah masuk ke sistem pengelola kost.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const pesan = `Halo Admin Nagih.in, saya baru saja mengajukan sewa untuk Kamar ${bookingKamar.kamar} atas nama ${bookingForm.nama}. Mohon konfirmasi ketersediaan dan cara pembayarannya. Terima kasih!`;
                    window.open(`https://wa.me/628123456789?text=${encodeURIComponent(pesan)}`, '_blank');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <IconWhatsApp className="w-4 h-4" /> Konfirmasi Cepat via WhatsApp
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Nama Lengkap Calon Penghuni">
                <input
                  type="text"
                  required
                  placeholder="Sesuai KTP / Kartu Mahasiswa"
                  className={inputClass}
                  value={bookingForm.nama}
                  onChange={(e) => setBookingForm({ ...bookingForm, nama: e.target.value })}
                />
              </Field>

              <Field label="Nomor WhatsApp">
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  className={inputClass}
                  value={bookingForm.hp}
                  onChange={(e) => setBookingForm({ ...bookingForm, hp: e.target.value })}
                />
              </Field>

              <Field label="Rencana Tanggal Mulai Masuk">
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={bookingForm.tanggalMasuk}
                  onChange={(e) => setBookingForm({ ...bookingForm, tanggalMasuk: e.target.value })}
                />
              </Field>

              <Field label="Catatan Tambahan (Opsional)">
                <textarea
                  rows="2"
                  placeholder="Contoh: Membawa laptop & motor, butuh info parkir..."
                  className={inputClass + ' resize-none'}
                  value={bookingForm.catatan}
                  onChange={(e) => setBookingForm({ ...bookingForm, catatan: e.target.value })}
                />
              </Field>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <IconLock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Data Anda aman dan langsung terhubung dengan pengelola resmi Nagih.in Kost.</span>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* --- FLOATING CHAT WIDGET --- */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Button Toggle */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            aria-label="Tanya Pengelola Kost"
            className="group flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#1b3554] via-[#3f6593] to-[#5b86b6] hover:from-[#000f22] hover:to-[#3f6593] text-[#c0e6fd] font-extrabold text-sm shadow-2xl hover:shadow-cyan-900/50 transition-all duration-300 hover:scale-105 active:scale-95 border border-[#80aad3]/40"
          >
            <div className="relative">
              <IconMessage className="w-5 h-5 text-[#c0e6fd]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#80aad3] animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#80aad3]"></span>
            </div>
            <span>Tanya Kost / Chat</span>
          </button>
        )}

        {/* Chat Box Modal / Popup */}
        {isChatOpen && (
          <div className="bg-[#000f22] w-[350px] sm:w-[380px] rounded-[28px] shadow-2xl border border-[#3f6593] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Chat Header */}
            <div className="bg-[#1b3554] text-white p-4.5 flex items-center justify-between border-b border-[#3f6593]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3f6593] to-[#80aad3] text-[#000f22] flex items-center justify-center font-black shadow-inner">
                  N
                </div>
                <div>
                  <h4 className="font-extrabold text-sm leading-tight text-[#c0e6fd]">Pengelola Nagih.in Kost</h4>
                  <p className="text-[11px] text-[#80aad3] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#80aad3] animate-pulse"></span> Kampus ITS Surabaya · Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#c0e6fd] flex items-center justify-center transition-colors"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body & Quick Prompts */}
            <div className="p-4 bg-[#071322] flex-1 max-h-[380px] overflow-y-auto space-y-3">
              <div className="bg-[#1b3554] p-3 rounded-2xl rounded-tl-xs shadow-xs text-xs text-[#c0e6fd] border border-[#3f6593]/50">
                Halo! Selamat datang di layanan informasi <strong>Nagih.in Kost ITS</strong>. Ada yang bisa kami bantu seputar ketersediaan kamar, survei lokasi, atau fasilitas?
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-bold text-[#80aad3] uppercase tracking-wider">Pertanyaan Cepat:</p>
                {[
                  'Kamar apa saja yang masih kosong di ITS?',
                  'Apakah kamar VIP ada water heater?',
                  'Bisa bayar sewa per semester/3 bulan?',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setChatForm((prev) => ({ ...prev, pesan: prompt }))}
                    className="block w-full text-left p-2 rounded-xl bg-[#1b3554]/60 hover:bg-[#1b3554] text-[#c0e6fd] text-xs font-semibold border border-[#3f6593]/60 transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>

              {chatSuccess && (
                <div className="p-3 rounded-xl bg-[#1b3554] border border-[#80aad3] text-[#c0e6fd] text-xs font-bold text-center animate-in fade-in flex items-center justify-center gap-1.5">
                  <IconCheck className="w-4 h-4 text-[#80aad3] shrink-0" />
                  <span>Pesan terkirim! Admin pengelola segera merespons.</span>
                </div>
              )}
            </div>

            {/* Chat Form Inputs */}
            <form onSubmit={handleSubmitChat} className="p-4 bg-[#1b3554] border-t border-[#3f6593] space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nama Anda"
                  className="w-full bg-[#000f22] border border-[#3f6593] rounded-xl px-3 py-2 text-xs font-medium text-[#c0e6fd] placeholder-[#80aad3]/60 outline-none focus:border-[#80aad3]"
                  value={chatForm.nama}
                  onChange={(e) => setChatForm({ ...chatForm, nama: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="WhatsApp (Opsional)"
                  className="w-full bg-[#000f22] border border-[#3f6593] rounded-xl px-3 py-2 text-xs font-medium text-[#c0e6fd] placeholder-[#80aad3]/60 outline-none focus:border-[#80aad3]"
                  value={chatForm.hp}
                  onChange={(e) => setChatForm({ ...chatForm, hp: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Tulis pesan / pertanyaan..."
                  className="flex-1 bg-[#000f22] border border-[#3f6593] rounded-xl px-3 py-2.5 text-xs font-medium text-[#c0e6fd] placeholder-[#80aad3]/60 outline-none focus:border-[#80aad3]"
                  value={chatForm.pesan}
                  onChange={(e) => setChatForm({ ...chatForm, pesan: e.target.value })}
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#3f6593] to-[#5b86b6] hover:from-[#1b3554] hover:to-[#3f6593] text-white p-2.5 rounded-xl transition-transform active:scale-95 border border-[#80aad3]/40"
                >
                  <IconSend className="w-4 h-4 text-[#c0e6fd]" />
                </button>
              </div>

              {/* WhatsApp direct link option */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const text = chatForm.pesan || 'Halo Pengelola Nagih.in Kost ITS, saya mau tanya ketersediaan kamar.';
                    window.open(`https://wa.me/628123456789?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="text-[11px] font-bold text-[#80aad3] hover:text-[#c0e6fd] hover:underline inline-flex items-center gap-1.5"
                >
                  <IconWhatsApp className="w-3.5 h-3.5 text-[#80aad3]" /> Atau Lanjut Chat via WhatsApp
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
