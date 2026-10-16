import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoNagihin from '../../assets/logo.png'; 
import { useAuth } from '../../context/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (loginError) {
      setError(loginError.code === 'auth/invalid-credential'
        ? 'Email atau password salah.'
        : loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f4f7f8] overflow-hidden">
      
      {/* (BAGIAN BACKGROUND BLUR TETAP SAMA SEPERTI SEBELUMNYA) */}
      <div className="absolute top-[15%] left-[15%] w-80 h-80 bg-[#90a0b6] rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      <div className="absolute top-[-5%] right-[5%] w-96 h-96 bg-[#57a898] rounded-full mix-blend-multiply filter blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#53a496] rounded-full mix-blend-multiply filter blur-[120px] opacity-70"></div>
      <div className="absolute bottom-[10%] right-[15%] w-80 h-80 bg-[#8b9cb6] rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>

      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl p-10 mx-4">
        
        <div className="flex justify-center mb-8">
          <img src={logoNagihin} alt="Nagih.in" className="w-32" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <input 
                type="email" 
                placeholder="masukkan email anda..." 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4d5776] focus:border-transparent text-sm text-gray-800 placeholder-gray-400" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <input 
                type="password" 
                placeholder="********" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4d5776] focus:border-transparent text-sm text-gray-800 placeholder-gray-400" 
                required 
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button 
            type="submit" 
            className="w-full bg-[#4d5776] hover:bg-[#3d4560] text-white font-bold py-3.5 rounded-xl transition-colors duration-200 mt-2 text-base"
          >
            {isSubmitting ? 'Memproses...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#2563eb] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}