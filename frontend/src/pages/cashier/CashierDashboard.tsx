import { useState } from 'react';
import { CreditCard, DollarSign, TrendingUp, AlertCircle, CheckCircle2, Wallet, ArrowUpRight, Clock, Plus, ArrowRight, Calendar, Printer, MinusCircle, FileText, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';

const weeklyData = [
  { day: 'Dush', amount: 1200000 },
  { day: 'Sesh', amount: 1800000 },
  { day: 'Chor', amount: 1500000 },
  { day: 'Pay', amount: 2400000 },
  { day: 'Jum', amount: 2100000 },
  { day: 'Shan', amount: 3200000 },
];

const CashierDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fullName = user ? user.fullname || user.username : 'Kassir';

  // Expense modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('Kantselyariya');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');

  // Z-Report modal state
  const [isZReportOpen, setIsZReportOpen] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['cashier-dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/dashboard-stats');
      return res.data;
    }
  });

  const expenseMutation = useMutation({
    mutationFn: async (data: { category: string, amount: number, description: string }) => {
      const res = await apiClient.post('/finance/expenses', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Kassa chiqimi (xarajat) saqlandi!");
      queryClient.invalidateQueries({ queryKey: ['cashier-dashboard-stats'] });
      setIsExpenseModalOpen(false);
      setExpenseAmount('');
      setExpenseDesc('');
    },
    onError: () => {
      toast.error("Xarajatni saqlashda xatolik yuz berdi");
    }
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(expenseAmount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Iltimos, to'g'ri xarajat summasini kiriting");
      return;
    }
    expenseMutation.mutate({
      category: expenseCategory,
      amount: numAmount,
      description: expenseDesc
    });
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Xayrli tong' : currentHour < 18 ? 'Xayrli kun' : 'Xayrli kech';

  return (
    <div className="space-y-6">
      {/* 1. Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/10 border border-blue-500/20 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner shrink-0">
              <Wallet className="w-10 h-10 text-blue-100" />
            </div>
            <div className="text-center md:text-left space-y-1">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-wide backdrop-blur-sm border border-white/10">
                {greeting}, {fullName}
              </span>
              <h1 className="text-3xl font-black tracking-tight mt-1">Kassa Boshqaruv Paneli 💼</h1>
              <p className="text-blue-100/90 text-sm max-w-xl">
                Algoritm IT o'quv markazi kassa hisoblari va bugungi tushumlar va chiqimlarni kuzatib boring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsZReportOpen(true)}
              className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl shadow-lg font-extrabold text-sm transition-all flex items-center shrink-0"
            >
              <Printer className="w-4 h-4 mr-2" /> Kassani Yopish (Z-Report)
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Bugungi Jami Kassa</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                {isLoading ? '...' : `${Number(stats?.todayTotal || 0).toLocaleString()} UZS`}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl border border-blue-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-4 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Bugun {stats?.todayPaymentsCount || 0} ta to'lov kiritildi
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Sof Naqd Kassa Qoldig'i</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {isLoading ? '...' : `${Number(stats?.netCashBalance || 0).toLocaleString()} UZS`}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Naqd tushum - Chiqimlar = Kassadagi sof pul</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Plastik Karta Kassasi</p>
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {isLoading ? '...' : `${Number(stats?.todayCard || 0).toLocaleString()} UZS`}
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl border border-indigo-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Terminal va karta to'lovlari</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Bugungi Chiqimlar</p>
              <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                {isLoading ? '...' : `${Number(stats?.todayExpenses || 0).toLocaleString()} UZS`}
              </h3>
            </div>
            <div className="p-3 bg-red-500/10 text-red-600 rounded-2xl border border-red-500/20">
              <MinusCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-red-500 font-bold mt-4">Bugun kassadan berilgan xarajatlar</p>
        </div>
      </div>

      {/* 3. Main Action Section & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" /> Tushumlar Dinamikasi (Haftalik)
            </h3>
            <button 
              onClick={() => navigate('/finance/payments')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
            >
              Kassaga o'tish &rarr;
            </button>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.1)', backgroundColor: 'rgba(15, 23, 42, 0.95)', color: '#fff' }}/>
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Recent Transactions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Tezkor Amallar</h3>
            <button 
              onClick={() => navigate('/finance/payments')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-between text-sm"
            >
              <span className="flex items-center"><Plus className="w-5 h-5 mr-2" /> Yangi To'lov Qabul Qilish</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-2xl border border-red-500/20 transition-all flex items-center justify-between text-sm"
            >
              <span className="flex items-center"><MinusCircle className="w-5 h-5 mr-2 text-red-500" /> Kassa Chiqimi (Xarajat kiritish)</span>
              <ArrowRight className="w-4 h-4 text-red-400" />
            </button>
          </div>

          {/* Today's Transactions Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-emerald-500" /> Bugungi Oxirgi To'lovlar
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="text-center py-4 text-slate-400 text-xs">Yuklanmoqda...</div>
              ) : !stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-850 rounded-2xl">
                  Bugun hozircha to'lovlar kiritilmadi
                </div>
              ) : (
                stats.recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-xs text-slate-800 dark:text-white">{tx.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{tx.method} • {tx.time}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      +{Number(tx.amount).toLocaleString()} UZS
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                <MinusCircle className="w-6 h-6 mr-2.5 text-red-500" />
                Kassa Chiqimi (Xarajat)
              </h2>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Xarajat turkumiga oid</label>
                <select 
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full p-3.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Kantselyariya">Kantselyariya va qog'ozlar</option>
                  <option value="Internet">Internet va aloqa</option>
                  <option value="Kommunal">Kommunal to'lovlar</option>
                  <option value="Tozalash">Tozalash va gigiyena vositalari</option>
                  <option value="Boshqa">Boshqa xarajatlar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Summa (UZS)</label>
                <input 
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="Masalan: 50000"
                  className="w-full p-3.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-red-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Izoh / Sabab</label>
                <textarea 
                  rows={2}
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Xarajat sababini yozing..."
                  className="w-full p-3.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl font-bold text-sm">Bekor qilish</button>
                <button type="submit" disabled={expenseMutation.isPending} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-500/20">
                  {expenseMutation.isPending ? 'Saqlanmoqda...' : 'Chiqimni Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Z-Report Printable Modal */}
      {isZReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-200 dark:border-slate-800">
            <div className="text-center pb-6 border-b border-dashed border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400">Algoritm IT</h2>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-extrabold">Kassa Yopilish Hisoboti (Z-REPORT)</p>
              <p className="text-[10px] text-slate-400 mt-1">Sana: {new Date().toLocaleDateString('uz-UZ')}</p>
            </div>

            <div className="py-6 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Kassir:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Jami to'lovlar soni:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{stats?.todayPaymentsCount || 0} ta</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Jami Naqd tushum:</span>
                <span className="font-bold text-emerald-600">+{Number(stats?.todayCash || 0).toLocaleString()} UZS</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Jami Karta tushum:</span>
                <span className="font-bold text-indigo-600">+{Number(stats?.todayCard || 0).toLocaleString()} UZS</span>
              </div>
              <div className="flex justify-between items-center text-red-500">
                <span>Jami Kassa Chiqimi:</span>
                <span className="font-bold">-{Number(stats?.todayExpenses || 0).toLocaleString()} UZS</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-base font-bold text-slate-800 dark:text-white">Topshiriladigan Sof Naqd Pul:</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                  {Number(stats?.netCashBalance || 0).toLocaleString()} UZS
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <button 
                onClick={() => setIsZReportOpen(false)}
                className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl font-bold text-sm"
              >
                Yopish
              </button>
              <button 
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center"
              >
                <Printer className="w-4 h-4 mr-2" /> Chop etish (Print Z-Report)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierDashboard;
