import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoNagihin from '../../assets/logo.png'; 
import { useAuth } from '../../context/useAuth';

export default function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', phone: '', room: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password harus sama.');
      return;
    }
    setIsSubmitting(true);
    try {
      await register(formData);
      navigate('/login');
    } catch (signUpError) {
      setError(signUpError.code === 'auth/email-already-in-use'
        ? 'Email sudah terdaftar.'
        : signUpError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f4f7f8] overflow-hidden py-10">
      
      {/* --- EFEK BLUR BACKGROUND (Sama dengan Login) --- */}
      <div className="absolute top-[15%] left-[15%] w-80 h-80 bg-[#90a0b6] rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      <div className="absolute top-[-5%] right-[5%] w-96 h-96 bg-[#57a898] rounded-full mix-blend-multiply filter blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#53a496] rounded-full mix-blend-multiply filter blur-[120px] opacity-70"></div>
      <div className="absolute bottom-[10%] right-[15%] w-80 h-80 bg-[#8b9cb6] rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>

      {/* --- KOTAK KARTU SIGN UP --- */}
      {/* Kotak dibuat sedikit lebih lebar (max-w-[500px]) untuk mengakomodasi 2 kolom */}
      <div className="relative z-10 w-full max-w-[500px] bg-white rounded-[24px] shadow-2xl p-8 mx-4">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logoNagihin} alt="Nagih.in" className="w-28" />
        </div>

        {/* Judul Form */}
        <h2 className="text-sm font-bold text-gray-800 mb-4">Create Your Account</h2>

        {/* Form Grid */}
        <form onSubmit={handleSignUp} className="space-y-4">
          
          {/* Baris 1: Full Name & Phone sejajar */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
              <input 
                type="text" 
                placeholder="Devanka Raditanti" value={formData.name} onChange={updateField('name')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4d5776] text-sm placeholder-gray-400" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone *</label>
              <input 
                type="tel" 
                placeholder="0813********" value={formData.phone} onChange={updateField('phone')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4d5776] text-sm placeholder-gray-400" 
                required 
              />
            </div>
          </div>

          {/* Baris 2: Room Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Room Number *</label>
            <input 
              type="text" 
              placeholder="1001" value={formData.room} onChange={updateField('room')}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4d5776] text-sm placeholder-gray-400" 
              required 
            />
          </div>

          {/* Baris 3: Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
            <input 
              type="email" 
              placeholder="admin@gmail.com" value={formData.email} onChange={updateField('email')}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4d5776] text-sm placeholder-gray-400" 
              required 
            />
          </div>

          {/* Baris 4: Password & Confirm Password sejajar */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password *</label>
              <input 
                type="password" 
                placeholder="********" value={formData.password} onChange={updateField('password')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4d5776] text-sm placeholder-gray-400" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password *</label>
              <input 
                type="password" 
                placeholder="********" value={formData.confirmPassword} onChange={updateField('confirmPassword')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4d5776] text-sm placeholder-gray-400" 
                required 
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Tombol Sign Up */}
          <button 
            type="submit" 
            className="w-full bg-[#4d5776] hover:bg-[#3d4560] text-white font-bold py-3 rounded-xl transition-colors duration-200 mt-2 text-sm"
          >
            {isSubmitting ? 'Memproses...' : 'Sign Up'}
          </button>
        </form>

        {/* Link Sign In */}
        <p className="mt-5 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#2563eb] hover:underline">
            Sign In
          </Link>
        </p>
      </div>

    </div>
  );
}