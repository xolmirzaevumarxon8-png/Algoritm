import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const processLogin = async (u: string, p: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const success = await login(u, p);
      if (success) {
        toast.success('Xush kelibsiz!');
        const user = useAuthStore.getState().user;
        switch (user?.role) {
          case 'SUPER_ADMIN': navigate('/admin'); break;
          case 'DIRECTOR': navigate('/admin'); break;
          case 'ADMIN': navigate('/admin'); break;
          case 'CASHIER': navigate('/finance/payments'); break;
          case 'CALL_CENTER': navigate('/call-center'); break;
          case 'TEACHER': navigate('/teacher'); break;
          case 'STUDENT': navigate('/student'); break;
          case 'PARENT': navigate('/parent'); break;
          default: navigate('/login');
        }
      } else {
        toast.error('Login yoki parol xato');
      }
    } catch (error) {
      toast.error('Ulanishda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-[#131b2f] flex flex-col items-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Glowing Orb */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] bg-cyan-400/40 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* Network Lines Effect (Subtle background pattern) */}
      <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Small Star/Sparkle Bottom Right */}
      <div className="absolute bottom-16 right-[15%] md:right-[30%] opacity-50 z-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="#a5b4fc" />
        </svg>
      </div>

      <div className="w-full max-w-md flex flex-col flex-grow pt-10 z-10">
        
        {/* Header / Logo */}
        <div className="flex items-center mb-10">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgpkMI4Lp3EQVxfL2vGkRRnmud5r1s1XxmH-BQnroDDw&s=10" 
            alt="Logo" 
            className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-2xl bg-white p-1.5 shadow-lg"
          />
          <h1 className="text-white text-2xl md:text-3xl font-bold ml-4 tracking-tight">Algoritm IT Markaz</h1>
        </div>
        {/* Texts */}
        <h2 className="text-white text-[32px] md:text-5xl font-black leading-[1.1] mb-4">
          Zamonaviy ta'lim<br/>platformasi
        </h2>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-10 max-w-[90%]">
          Adminlar, o'qituvchilar, talabalar va ota-onalar<br className="hidden md:block" /> uchun yagona boshqaruv tizimi.
        </p>
        
        {/* Form Container */}
        <div className="bg-white rounded-2xl p-6 md:p-8 w-full shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors text-slate-800 placeholder-slate-400 text-sm font-medium"
                placeholder="Foydalanuvchi nomi (admin, teacher...)"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors text-slate-800 placeholder-slate-400 text-sm font-medium"
                placeholder="Parol"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-1">
              <a href="#" className="text-xs text-slate-500 hover:text-slate-700 underline decoration-slate-300 underline-offset-2">
                Parolni unutdingizmi?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-[#ffc107] hover:bg-[#ffb300] text-black font-bold text-[15px] rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Kirish
            </button>

            {/* Register Link */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-600">
                Hisobingiz yo'qmi? <a href="#" className="text-slate-800 font-bold underline decoration-slate-400 underline-offset-2">Ro'yxatdan o'tish</a>
              </p>
            </div>
          </form>
        </div>

      </div>

      {/* Footer */}
      <div className="w-full max-w-md mt-10 mb-4 z-10 text-slate-400/80 text-[11px] md:text-xs text-left">
        &copy; {new Date().getFullYear()} Algoritm IT Markaz. Barcha huquqlar himoyalangan.
      </div>

    </div>
  );
};

export default Login;

