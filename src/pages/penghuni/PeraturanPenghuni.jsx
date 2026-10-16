const PERATURAN = [
  {
    judul: 'Pembayaran',
    isi: [
      'Uang sewa dibayar paling lambat tanggal 20 setiap bulan.',
      'Keterlambatan lebih dari 7 hari akan mendapat teguran tertulis.',
      'Pembayaran dapat dilakukan via transfer atau tunai ke pengelola.',
    ],
  },
  {
    judul: 'Jam Malam & Tamu',
    isi: [
      'Pintu gerbang ditutup pukul 22.00 WIB.',
      'Tamu wajib melapor kepada pengelola dan hanya boleh berkunjung hingga pukul 21.00 WIB.',
      'Tamu lawan jenis dilarang masuk ke dalam kamar.',
      'Tamu dilarang menginap tanpa izin pengelola.',
    ],
  },
  {
    judul: 'Kebersihan & Ketertiban',
    isi: [
      'Jaga kebersihan kamar dan area bersama.',
      'Buang sampah pada tempat yang telah disediakan.',
      'Dilarang membuat kegaduhan, terutama setelah pukul 22.00 WIB.',
      'Dilarang merokok di dalam kamar.',
    ],
  },
  {
    judul: 'Fasilitas & Keamanan',
    isi: [
      'Matikan listrik, AC, dan air saat meninggalkan kamar.',
      'Kerusakan fasilitas akibat kelalaian penghuni menjadi tanggung jawab penghuni.',
      'Laporkan kerusakan melalui menu Lapor Komplain.',
      'Dilarang membawa senjata tajam, narkoba, dan minuman keras.',
      'Dilarang memelihara hewan peliharaan.',
    ],
  },
  {
    judul: 'Keluar Kost',
    isi: [
      'Pemberitahuan keluar kost paling lambat 2 minggu sebelumnya.',
      'Kamar harus dikembalikan dalam keadaan bersih dan kunci diserahkan ke pengelola.',
    ],
  },
];

export default function PeraturanPenghuni() {
  return (
    <div className="max-w-6xl mx-auto drop-shadow-sm">
      <div className="mb-8 text-white">
        <h2 className="text-4xl font-bold mb-1 tracking-wide">Peraturan Kost</h2>
        <p className="text-lg text-white/90 font-medium">Mohon dipatuhi demi kenyamanan bersama</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PERATURAN.map((bagian, i) => (
          <div key={bagian.judul} className="bg-[#f4f7fa] rounded-[24px] p-8 shadow-2xl border border-white/50">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#1d3557] text-white flex items-center justify-center font-extrabold">{i + 1}</div>
              <h3 className="text-xl font-extrabold text-[#1d3557]">{bagian.judul}</h3>
            </div>
            <ul className="space-y-3">
              {bagian.isi.map((r) => (
                <li key={r} className="flex gap-3 text-sm font-medium text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#73bba7] shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

