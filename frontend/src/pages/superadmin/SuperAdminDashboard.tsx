import { useState } from 'react';
import { ShieldCheck, Building2, Users, DollarSign, Download, Plus, Settings, MessageSquare, Send, Save, CheckCircle2, TrendingUp, Cpu, Server, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SuperAdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'BRANCHES' | 'SETTINGS'>('BRANCHES');

  // Branch creation modal
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');

  // Settings form state
  const [centerName, setCenterName] = useState("Algoritm IT O'quv Markazi");
  const [smsApiKey, setSmsApiKey] = useState("eskiz_secret_api_key_884920");
  const [telegramToken, setTelegramToken] = useState("7129481023:AAHx8491-09238401924");
  const [smsEnabled, setSmsEnabled] = useState(true);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/super-admin/dashboard-stats');
      return res.data;
    }
  });

  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['branches-list'],
    queryFn: async () => {
      const res = await apiClient.get('/branches');
      return res.data;
    }
  });

  const createBranchMutation = useMutation({
    mutationFn: async (newBranch: { name: string, address: string }) => {
      const res = await apiClient.post('/branches', newBranch);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Yangi filial muvaffaqiyatli yaratildi!");
      queryClient.invalidateQueries({ queryKey: ['branches-list'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] });
      setIsBranchModalOpen(false);
      setBranchName('');
      setBranchAddress('');
    },
    onError: () => {
      toast.error("Filialni yaratishda xatolik yuz berdi");
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      const res = await apiClient.post('/super-admin/settings', settingsData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Tizim sozlamalari muvaffaqiyatli saqlandi!");
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] });
    },
    onError: () => {
      toast.error("Sozlamalarni saqlashda xatolik");
    }
  });

  const handleDownloadBackup = async () => {
    try {
      toast.loading("Tizim zaxira nusxasi tayyorlanmoqda...", { id: 'backup' });
      const res = await apiClient.get('/super-admin/backup', { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lms_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Ma'lumotlar bazasi zaxira nusxasi (Backup) yuklab olindi!", { id: 'backup' });
    } catch (error) {
      toast.error("Zaxira nusxasini yuklashda xatolik", { id: 'backup' });
    }
  };

  const handleCreateBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) {
      toast.error("Iltimos, filial nomini kiriting");
      return;
    }
    createBranchMutation.mutate({ name: branchName, address: branchAddress });
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate({
      centerName,
      smsApiKey,
      telegramBotToken: telegramToken,
      smsNotificationEnabled: smsEnabled
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Super Admin Crown Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 dark:from-slate-900 dark:via-amber-950/40 dark:to-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-amber-500/10 border border-amber-500/20 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner shrink-0">
              <ShieldCheck className="w-10 h-10 text-amber-100" />
            </div>
            <div className="space-y-1">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-wide backdrop-blur-sm border border-white/10">
                Super Admin Portal • SaaS Master
              </span>
              <h1 className="text-3xl font-black tracking-tight mt-1">Platforma Boshqaruv Markazi 👑</h1>
              <p className="text-amber-100/90 text-sm max-w-xl">
                Barcha filiallar, tizim sozlamalari hamda ma'lumotlar bazasi xavfsizlik zaxiralarini markaziy boshqaring.
              </p>
            </div>
          </div>

          <button 
            onClick={handleDownloadBackup}
            className="px-6 py-3.5 bg-white text-amber-900 hover:bg-amber-50 rounded-2xl shadow-xl font-black text-sm transition-all flex items-center shrink-0"
          >
            <Download className="w-5 h-5 mr-2 text-amber-600" /> Bazani Yuklab Olish (Backup JSON)
          </button>
        </div>
      </div>

      {/* 2. Global KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Faol Filiallar</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                {isLoading ? '...' : `${stats?.branchesCount || 0} ta`}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-4 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Barcha filiallarning barqaror faoliyati
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Jami O'quvchilar</p>
              <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {isLoading ? '...' : `${stats?.studentsCount || 0} ta`}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl border border-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Platformadagi umumiy o'quvchilar kenti</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">O'qituvchilar Tarkibi</p>
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {isLoading ? '...' : `${stats?.teachersCount || 0} ta`}
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl border border-indigo-500/20">
              <Cpu className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Faol ustozlar va pedagoglar</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Jami Tizim Daromadi</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {isLoading ? '...' : `${Number(stats?.totalRevenue || 0).toLocaleString()} UZS`}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-500 font-bold mt-4">Konsolidatsiyalangan sof tushum</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('BRANCHES')} 
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center ${activeTab === 'BRANCHES' ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        >
          <Building2 className="w-4 h-4 mr-2" /> Filiallar Boshqaruvi
        </button>
        <button 
          onClick={() => setActiveTab('SETTINGS')} 
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center ${activeTab === 'SETTINGS' ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        >
          <Settings className="w-4 h-4 mr-2" /> Tizim & SMS Sozlamalari
        </button>
      </div>

      {/* TAB 1: BRANCHES MANAGEMENT */}
      {activeTab === 'BRANCHES' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Filiallar Ro'yxati</h2>
              <p className="text-xs text-slate-500">O'quv markazining barcha faol va yangi filiallari</p>
            </div>
            <button 
              onClick={() => setIsBranchModalOpen(true)}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-lg shadow-amber-500/20 font-bold text-sm transition-all flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" /> Yangi Filial Qo'shish
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 overflow-hidden">
            {loadingBranches ? (
              <div className="p-8 text-center text-slate-400 text-sm">Yuklanmoqda...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4">Filial Nomi</th>
                      <th className="p-4">Manzil</th>
                      <th className="p-4">Bosh Menejer</th>
                      <th className="p-4">O'quvchilar Soni</th>
                      <th className="p-4">Jami Daromad</th>
                      <th className="p-4">Holati</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {branches.map((b: any) => (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-100 flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-amber-500" /> {b.name}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">{b.address}</td>
                        <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{b.manager}</td>
                        <td className="p-4 font-bold text-blue-600 dark:text-blue-400">{b.students} ta o'quvchi</td>
                        <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">{Number(b.income || 0).toLocaleString()} UZS</td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">FAOL</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Branch Revenue Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-amber-500" /> Filiallar Bo'yicha Daromad Taqqoslashi
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.branchComparison || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.1)', backgroundColor: 'rgba(15, 23, 42, 0.95)', color: '#fff' }}/>
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-8 shadow-sm max-w-3xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <Settings className="w-6 h-6 mr-2.5 text-amber-500" /> Tizim & SMS Gateway Sozlamalari
          </h2>

          <form onSubmit={handleSaveSettingsSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">O'quv Markazi Nomi</label>
              <input 
                type="text" 
                value={centerName} 
                onChange={(e) => setCenterName(e.target.value)} 
                className="w-full p-3.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Eskiz.uz SMS Provayder API Kaliti</label>
                <input 
                  type="password" 
                  value={smsApiKey} 
                  onChange={(e) => setSmsApiKey(e.target.value)} 
                  className="w-full p-3.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Telegram Bot Token</label>
                <input 
                  type="password" 
                  value={telegramToken} 
                  onChange={(e) => setTelegramToken(e.target.value)} 
                  className="w-full p-3.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-100">SMS Bildirishnomalar</p>
                <p className="text-xs text-slate-400">Darsga kelmaganlarga va to'lov eslatmalariga SMS yuborish</p>
              </div>
              <input 
                type="checkbox" 
                checked={smsEnabled} 
                onChange={(e) => setSmsEnabled(e.target.checked)} 
                className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={saveSettingsMutation.isPending}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveSettingsMutation.isPending ? 'Saqlanmoqda...' : 'Sozlamalarni Saqlash'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                <Building2 className="w-6 h-6 mr-2.5 text-amber-600" />
                Yangi Filial Qo'shish
              </h2>
              <button onClick={() => setIsBranchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Filial Nomi</label>
                <input 
                  type="text" 
                  value={branchName} 
                  onChange={(e) => setBranchName(e.target.value)} 
                  placeholder="Masalan: Samarqand Filiali" 
                  className="w-full p-3.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Manzil</label>
                <input 
                  type="text" 
                  value={branchAddress} 
                  onChange={(e) => setBranchAddress(e.target.value)} 
                  placeholder="Masalan: Registon ko'chasi 15-uy" 
                  className="w-full p-3.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsBranchModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl font-bold text-sm">Bekor qilish</button>
                <button type="submit" disabled={createBranchMutation.isPending} className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-amber-500/20">
                  {createBranchMutation.isPending ? 'Saqlanmoqda...' : 'Filialni Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
