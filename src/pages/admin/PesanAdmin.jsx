import { useContext, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { IconSearch, IconTrash, IconWhatsApp, IconSend } from '../../components/Icons';

export default function PesanAdmin() {
  const { pesanData, setPesanData } = useContext(AdminContext);
  const [activeId, setActiveId] = useState(pesanData[0]?.id ?? null);
  const [reply, setReply] = useState('');
  const [search, setSearch] = useState('');

  const activeChat = pesanData.find((c) => c.id === activeId) || null;
  const filtered = pesanData.filter(
    (c) =>
      c.nama.toLowerCase().includes(search.toLowerCase()) ||
      c.pesan.toLowerCase().includes(search.toLowerCase())
  );

  const jam = () =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const bukaChat = (chat) => {
    setActiveId(chat.id);
    if (chat.status === 'Baru') {
      setPesanData(pesanData.map((c) => (c.id === chat.id ? { ...c, status: 'Dibaca' } : c)));
    }
  };

  const handleBalas = (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeChat) return;
    const waNumber = activeChat.hp.startsWith('0') ? '62' + activeChat.hp.slice(1) : activeChat.hp;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(reply)}`, '_blank');
    setPesanData(
      pesanData.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              balasan: [...(c.balasan || []), { id: Date.now(), teks: reply, waktu: jam() }],
            }
          : c
      )
    );
    setReply('');
  };

  const handleHapus = (e, chat) => {
    e.stopPropagation();
    if (window.confirm(`Hapus percakapan dengan ${chat.nama}?`)) {
      const sisa = pesanData.filter((c) => c.id !== chat.id);
      setPesanData(sisa);
      if (activeId === chat.id) setActiveId(sisa[0]?.id ?? null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto drop-shadow-sm h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="mb-5 text-white shrink-0">
        <h2 className="text-4xl font-bold mb-1 tracking-wide">Pesan Masuk</h2>
        <p className="text-lg text-white/90 font-medium">
          Inkuiri dan konsultasi calon penghuni melalui platform
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-1 border border-white/60 min-h-0">
        {/* Kolom Kontak Kiri */}
        <div className="w-full sm:w-80 md:w-96 border-r border-slate-200 bg-[#f4f7fa] flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <IconSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Cari percakapan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#5b738c] focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-gray-400 font-semibold py-12">
                Tidak ada percakapan ditemukan.
              </p>
            ) : (
              filtered.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => bukaChat(chat)}
                  className={`group relative p-3.5 rounded-2xl cursor-pointer transition-all border ${
                    activeId === chat.id
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'border-transparent hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1d3557] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                      {chat.nama[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="font-extrabold text-[#1d3557] text-sm truncate flex items-center gap-1.5">
                          {chat.nama}
                          {chat.status === 'Baru' && (
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          )}
                        </h4>
                        <span className="text-[11px] font-bold text-slate-400 shrink-0">
                          {chat.waktu}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-medium">{chat.pesan}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleHapus(e, chat)}
                    aria-label={`Hapus percakapan ${chat.nama}`}
                    title="Hapus percakapan"
                    className="absolute right-2.5 bottom-2.5 p-1.5 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom Chat Kanan */}
        <div className="hidden sm:flex flex-1 bg-slate-100 flex-col relative min-w-0">
          {activeChat ? (
            <>
              {/* Header Chat */}
              <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#1d3557] text-white flex items-center justify-center font-bold text-base shadow-inner">
                    {activeChat.nama[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#1d3557] text-base leading-tight">
                      {activeChat.nama}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">{activeChat.hp}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const waNumber = activeChat.hp.startsWith('0')
                        ? '62' + activeChat.hp.slice(1)
                        : activeChat.hp;
                      window.open(`https://wa.me/${waNumber}`, '_blank');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    <IconWhatsApp className="w-4 h-4" /> Buka di WA
                  </button>
                </div>
              </div>

              {/* Area Bubble Percakapan */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                {/* Pesan Masuk dari Calon Penyewa */}
                <div className="bg-white p-4.5 rounded-2xl rounded-tl-xs shadow-sm max-w-[80%] self-start border border-slate-200/80">
                  <p className="text-xs font-bold text-[#1d3557] mb-1">{activeChat.nama}</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {activeChat.pesan}
                  </p>
                  <span className="text-[10px] text-slate-400 font-bold block mt-2 text-right">
                    {activeChat.waktu}
                  </span>
                </div>

                {/* Balasan Admin */}
                {(activeChat.balasan || []).map((b) => (
                  <div
                    key={b.id}
                    className="bg-[#dcf8c6] p-4.5 rounded-2xl rounded-tr-xs shadow-sm max-w-[80%] self-end border border-emerald-200/60"
                  >
                    <p className="text-xs font-bold text-emerald-800 mb-1">Anda (Admin)</p>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">{b.teks}</p>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-2 text-right">
                      {b.waktu}
                    </span>
                  </div>
                ))}
              </div>

              {/* Form Input Balas */}
              <form
                onSubmit={handleBalas}
                className="p-4 bg-white border-t border-slate-200 flex items-center gap-3 shrink-0"
              >
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Ketik balasan untuk dikirimkan melalui WhatsApp..."
                  className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium outline-none border border-slate-200 focus:border-[#5b738c] focus:bg-white transition-all text-slate-800"
                />
                <button
                  type="submit"
                  className="bg-[#25D366] hover:bg-[#1ebe5d] text-white px-5 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 text-sm"
                >
                  <IconSend className="w-4 h-4" /> Balas WA
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-semibold text-sm">
              Pilih percakapan di sebelah kiri untuk mulai merespons.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}