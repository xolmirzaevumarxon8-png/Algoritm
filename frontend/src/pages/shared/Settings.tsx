import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Mail, Smartphone, Shield, Key, User, Globe, Moon, Sun, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const Settings = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'notifications' | 'profile' | 'password'>('notifications');

  // Notification states
  const [telegramId, setTelegramId] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Fetch Student Profile details if user is Student
  const { data: studentProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/students/${user?.id}`);
      return res.data;
    },
    enabled: user?.role === 'STUDENT' && !!user?.id
  });

  const handleSaveNotifications = () => {
    toast.success('Bildirishnoma sozlamalari muvaffaqiyatli saqlandi');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Yangi parollar mos kelmadi');
      return;
    }
    if (newPassword.length < 4) {
      toast.error('Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    try {
      setIsSubmittingPassword(true);
      await apiClient.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Parolingiz muvaffaqiyatli o\'zgartirildi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Parolni o\'zgartirishda xatolik yuz berdi');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const isAccessToDbBackup = user?.role === 'SUPER_ADMIN' || user?.role === 'DIRECTOR';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
          <SettingsIcon className="w-8 h-8 mr-3 text-slate-500 dark:text-slate-400" />
          Sozlamalar va Integratsiyalar
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Shaxsiy hisobingiz sozlamalari va xizmatlar bilan integratsiya qilish</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'notifications' ? 'bg-indigo-605 text-white shadow-md shadow-indigo-500/10 bg-indigo-600' : 'text-slate-650 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-805/40 text-slate-600'}`}
          >
            <Bell className="w-5 h-5 mr-3"/> Bildirishnomalar
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'profile' ? 'bg-indigo-605 text-white shadow-md shadow-indigo-500/10 bg-indigo-600' : 'text-slate-650 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-805/40 text-slate-600'}`}
          >
            <User className="w-5 h-5 mr-3"/> Mening profilim
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`w-full flex items-center px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'password' ? 'bg-indigo-605 text-white shadow-md shadow-indigo-500/10 bg-indigo-600' : 'text-slate-650 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-805/40 text-slate-600'}`}
          >
            <Shield className="w-5 h-5 mr-3"/> Parol va xavfsizlik
          </button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* TAB 1: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Telegram Integration */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 p-6">
                <h2 className="text-lg font-bold flex items-center mb-6 dark:text-white"><Smartphone className="w-5 h-5 mr-2 text-indigo-505"/> Telegram integratsiyasi</h2>
                <div className="bg-indigo-500/5 dark:bg-indigo-950/10 p-4 rounded-2xl border border-indigo-500/10 mb-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  To'lovlar, uy vazifalari va dars jadvalidagi o'zgarishlar haqida tezkor xabarlarni Telegram orqali olish uchun hisobingizni ulang.
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Ulanish yo'riqnomasi:</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      1. Telegram-da <a href="https://t.me/algorithmit_bot" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">@algorithmit_bot</a> botiga kiring.<br />
                      2. Botga quyidagi ulanish kodini yuboring:
                    </p>
                    <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-900 rounded-xl font-mono text-center text-sm font-bold text-slate-800 dark:text-slate-202 border border-slate-200/50 select-all cursor-pointer">
                      /start {user?.role === 'STUDENT' ? `student_${user?.id}` : `user_${user?.id}`}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-805">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Telegram ogohlantirishlarini yoqish</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Telegram bot orqali xabarlarni qabul qilish.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={telegramNotifications} onChange={() => setTelegramNotifications(!telegramNotifications)} />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Email & System Settings */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 p-6">
                <h2 className="text-lg font-bold flex items-center mb-6 dark:text-white"><Mail className="w-5 h-5 mr-2 text-emerald-500"/> Tizim xabarnomalari</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Email xabarnomalar</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Kunlik hisobotlar va to'lov kvitansiyalarini pochtaga olish.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-550 peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Tizim ichidagi bildirishnomalar</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Yuqori panelda qizil nishon (badge) ko'rsatish.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={systemAlerts} onChange={() => setSystemAlerts(!systemAlerts)} />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-550 peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Database Backup & Restore - strictly shown to Super Admin and Director only */}
              {isAccessToDbBackup && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-red-500/10 dark:border-red-500/20 p-6">
                  <h2 className="text-lg font-bold flex items-center mb-6 text-red-600"><Shield className="w-5 h-5 mr-2"/> Ma'lumotlar bazasini zaxiralash va tiklash</h2>
                  <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10 mb-6">
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">Ogohlantirish: Zaxira faylidan tiklash hozirgi tizimdagi barcha ma'lumotlarni o'chirib yuboradi.</p>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Har kunlik avtomatik zaxiralash</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Ma'lumotlarni har kuni 00:00 UTC da AWS S3 bulutiga saqlash.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-550 peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <div className="flex gap-4 mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                    <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm transition-colors">Manual zaxira nusxa yaratish</button>
                    <button className="px-6 py-2.5 border border-red-200 dark:border-red-900/50 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-sm font-bold transition-colors">Zaxiradan qayta tiklash</button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button onClick={handleSaveNotifications} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/10 transition-all">
                  Sozlamalarni saqlash
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 p-6 space-y-6">
              <h2 className="text-lg font-bold flex items-center mb-6 dark:text-white"><User className="w-5 h-5 mr-2 text-indigo-500"/> Profil ma'lumotlari</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Foydalanuvchi ismi (F.I.SH):</p>
                  <p className="text-base font-bold text-slate-800 dark:text-white mt-1">{user?.fullname || studentProfile?.fullname || 'Noma\'lum'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wide">Telefon raqam:</p>
                  <p className="text-base font-bold text-slate-800 dark:text-white mt-1">{user?.phone || studentProfile?.phone || 'Kiritilmagan'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tizimdagi rolingiz:</p>
                  <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-full mt-2">
                    {user?.role === 'STUDENT' ? 'Talaba' : user?.role === 'TEACHER' ? 'O\'qituvchi' : user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'ADMIN' ? 'Admin' : user?.role}
                  </span>
                </div>
                {user?.branchName && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Filial:</p>
                    <p className="text-base font-bold text-slate-800 dark:text-white mt-1">{user.branchName}</p>
                  </div>
                )}
              </div>

              {/* Student specific fields */}
              {user?.role === 'STUDENT' && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
                  <h3 className="text-md font-bold text-slate-700 dark:text-slate-300">O'quv va Oila ma'lumotlari</h3>
                  
                  {isProfileLoading ? (
                    <div className="text-center py-4 text-slate-500 text-sm">Ma'lumotlar yuklanmoqda...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Jinsi:</p>
                        <p className="text-base font-bold text-slate-800 dark:text-white mt-1">
                          {studentProfile?.gender === 'Male' ? 'Erkak' : studentProfile?.gender === 'Female' ? 'Ayol' : 'Belgilanmagan'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-405 uppercase tracking-wide">Tug'ilgan kuni:</p>
                        <p className="text-base font-bold text-slate-800 dark:text-white mt-1">
                          {studentProfile?.birthday ? new Date(studentProfile.birthday).toLocaleDateString('uz-UZ') : 'Kiritilmagan'}
                        </p>
                      </div>
                      {studentProfile?.parent && (
                        <>
                          <div className="col-span-full border-t border-dashed border-slate-200/50 dark:border-slate-800/50 my-2"></div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ota-onasi ismi:</p>
                            <p className="text-base font-bold text-slate-800 dark:text-white mt-1">{studentProfile.parent.fullname}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ota-onasi telefoni:</p>
                            <p className="text-base font-bold text-slate-800 dark:text-white mt-1">{studentProfile.parent.phone}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PASSWORD CHANGE */}
          {activeTab === 'password' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 p-6">
              <h2 className="text-lg font-bold flex items-center mb-6 dark:text-white"><Lock className="w-5 h-5 mr-2 text-indigo-500"/> Tizimga kirish paroli</h2>
              
              {user?.role === 'STUDENT' || user?.role === 'PARENT' ? (
                <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10 space-y-3">
                  <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm flex items-center">
                    <Key className="w-4 h-4 mr-2"/> Talabalar va Ota-onalar paroli cheklangan
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Sizning parolingiz ro'yxatdan o'tgan telefon raqamingizning oxirgi 4 ta raqami hisoblanadi. Parolni o'zgartirish faqat ma'muriyat (adminlar) tomonidan amalga oshiriladi.
                  </p>
                  <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-center text-xs font-semibold text-slate-650 dark:text-slate-450">
                    Telefon raqam: {user?.phone || 'Kiritilmagan'}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">Joriy parol</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full mt-1.5 p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white"
                      placeholder="Joriy parolingizni kiriting"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">Yangi parol</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full mt-1.5 p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white"
                      placeholder="Kamida 4 ta belgidan iborat yangi parol"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">Yangi parolni tasdiqlash</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full mt-1.5 p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm dark:text-white"
                      placeholder="Yangi parolni qayta kiriting"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isSubmittingPassword}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/10 transition-all disabled:opacity-50"
                    >
                      {isSubmittingPassword ? 'O\'zgartirilmoqda...' : 'Parolni yangilash'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
