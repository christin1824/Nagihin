import { useContext, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { useAuth } from '../../context/useAuth';
import { Field, inputClass, primaryBtn } from '../../components/Modal';
import { IconCheck } from '../../components/Icons';

const Alert = ({ m }) =>
  m ? (
    <p className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl ${m.type === 'ok' ? 'bg-[#8ce69f]/30 text-[#228b3a]' : 'bg-[#fc9292]/30 text-[#a12020]'}`}>
      {m.type === 'ok' && <IconCheck className="w-4 h-4" />} {m.text}
    </p>
  ) : null;

export default function AkunPenghuni() {
  const { kamarData, setKamarData, showToast } = useContext(AdminContext);
  const { profile, updatePhone, changePassword } = useAuth();
  const kamarPenghuni = String(
    profile?.kamar ?? profile?.room ?? profile?.kamar_id ?? profile?.nomor_kamar ?? ''
  ).trim().replace(/^kamar\s+/i, '');
  const saya = kamarData.find((k) => k.kamar === kamarPenghuni);

  const [hp, setHp] = useState(() => saya?.hp || profile?.hp || '');
  const [pwd, setPwd] = useState({ lama: '', baru: '', konfirmasi: '' });
  const [pesan, setPesan] = useState({ hp: null, pwd: null }); // { type: 'ok' | 'err', text }

  const simpanHp = async (e) => {
    e.preventDefault();
    try {
      await updatePhone(hp);
      await setKamarData(kamarData.map((k) => (k.kamar === kamarPenghuni ? { ...k, hp } : k)));
      setPesan((previousPesan) => ({ ...previousPesan, hp: { type: 'ok', text: 'Nomor telepon berhasil diperbarui.' } }));
      showToast('Nomor WhatsApp Anda berhasil diperbarui!', 'success');
    } catch (saveError) {
      const message = saveError.code === 'permission-denied'
        ? 'Izin ditolak. Publish firestore.rules terbaru, lalu logout dan login kembali.'
        : saveError.message;
      setPesan((previousPesan) => ({ ...previousPesan, hp: { type: 'err', text: message } }));
      showToast(`Gagal menyimpan nomor: ${message}`, 'error');
    }
  };

  const simpanPwd = async (e) => {
    e.preventDefault();
    if (pwd.baru.length < 6) {
      setPesan((previousPesan) => ({ ...previousPesan, pwd: { type: 'err', text: 'Password baru minimal 6 karakter.' } }));
      showToast('Password baru minimal 6 karakter.', 'error');
      return;
    }
    if (pwd.baru !== pwd.konfirmasi) {
      setPesan((previousPesan) => ({ ...previousPesan, pwd: { type: 'err', text: 'Konfirmasi password tidak cocok.' } }));
      showToast('Konfirmasi password tidak cocok.', 'error');
      return;
    }
    try {
      await changePassword(pwd.lama, pwd.baru);
      setPwd({ lama: '', baru: '', konfirmasi: '' });
      setPesan((previousPesan) => ({ ...previousPesan, pwd: { type: 'ok', text: 'Password berhasil diubah.' } }));
      showToast('Password akun berhasil diperbarui!', 'success');
    } catch (saveError) {
      const message = saveError.code === 'auth/invalid-credential'
        || saveError.code === 'auth/wrong-password'
        ? 'Password lama salah. Gunakan password yang dipakai saat login ke akun ini.'
        : saveError.code === 'auth/requires-recent-login'
          ? 'Sesi login sudah lama. Silakan logout lalu login kembali sebelum mengganti password.'
          : saveError.code === 'auth/weak-password'
            ? 'Password baru terlalu lemah.'
            : saveError.message;
      setPesan((previousPesan) => ({ ...previousPesan, pwd: { type: 'err', text: message } }));
      showToast(message, 'error');
    }
  };



  return (
    <div className="max-w-6xl mx-auto drop-shadow-sm">
      <div className="mb-8 text-white">
        <h2 className="text-4xl font-bold mb-1 tracking-wide">Akun Saya</h2>
        <p className="text-lg text-white/90 font-medium">Kelola nomor telepon dan password</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nomor Telepon */}
        <form onSubmit={simpanHp} className="bg-[#f4f7fa] rounded-[24px] p-8 shadow-2xl border border-white/50 space-y-4 h-fit">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
            <div className="w-14 h-14 rounded-full bg-[#415a77] text-white flex items-center justify-center font-bold text-xl">
              {saya?.nama?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-extrabold text-[#1d3557]">{saya?.nama}</p>
              <p className="text-sm text-gray-500 font-medium">Kamar {kamarPenghuni} · {profile?.email || '-'}</p>
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-[#1d3557]">Nomor Telepon</h3>
          <Field label="Nomor WhatsApp">
            <input
              type="tel" required pattern="[0-9]{10,13}" title="10 hingga 13 digit angka"
              className={inputClass} value={hp} onChange={(e) => setHp(e.target.value)}
            />
          </Field>
          <Alert m={pesan.hp} />
          <button type="submit" className={primaryBtn}>Simpan Nomor</button>
        </form>

        {/* Password */}
        <form onSubmit={simpanPwd} className="bg-[#f4f7fa] rounded-[24px] p-8 shadow-2xl border border-white/50 space-y-4 h-fit">
          <h3 className="text-xl font-extrabold text-[#1d3557]">Ubah Password</h3>
          <Field label="Password Lama">
            <input type="password" required className={inputClass} value={pwd.lama} onChange={(e) => setPwd({ ...pwd, lama: e.target.value })} />
          </Field>
          <Field label="Password Baru">
            <input type="password" required className={inputClass} value={pwd.baru} onChange={(e) => setPwd({ ...pwd, baru: e.target.value })} />
          </Field>
          <Field label="Konfirmasi Password Baru">
            <input type="password" required className={inputClass} value={pwd.konfirmasi} onChange={(e) => setPwd({ ...pwd, konfirmasi: e.target.value })} />
          </Field>
          <Alert m={pesan.pwd} />
          <button type="submit" className={primaryBtn}>Ubah Password</button>
        </form>
      </div>
    </div>
  );
}
