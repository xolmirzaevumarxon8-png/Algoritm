import { Users, BookOpen, Building2, TrendingUp, DollarSign, Activity, UserCheck, GraduationCap, Calendar, CreditCard, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const fullName = user ? `${user.firstName} ${user.lastName}` : "Admin";

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin-dashboard/stats');
      return res.data;
    }
  });

  const growthData = stats?.growthChart || [
    { name: t('admin_dashboard.mon'), students: 0 },
    { name: t('admin_dashboard.tue'), students: 0 },
    { name: t('admin_dashboard.wed'), students: 0 },
    { name: t('admin_dashboard.thu'), students: 0 },
    { name: t('admin_dashboard.fri'), students: 0 },
    { name: t('admin_dashboard.sat'), students: 0 },
    { name: t('admin_dashboard.sun'), students: 0 },
  ];

  const { data: payments = [] } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/payments');
      return res.data;
    }
  });

  const totalIncome = payments.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

  const recentPayments = payments.slice(0, 5).map((p: any) => ({
    title: `To'lov qabul qilindi: ${p.amount.toLocaleString('uz-UZ')} UZS`,
    desc: `O'quvchi: ${p.finance_account?.student?.fullname || 'Noma\'lum'}, Kassir: ${p.cashier_user?.fullname || 'Noma\'lum'}`,
    time: new Date(p.paid_at).toLocaleString(),
    color: 'bg-emerald-500'
  }));

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Xayrli tong' : currentHour < 18 ? 'Xayrli kun' : 'Xayrli kech';

  return (
    <div className="space-y-6">
      
      {/* 1. Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/10 border border-indigo-500/20 dark:border-slate-800/80">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <span className="px-3.5 py-1.5 bg-white/10 dark:bg-slate-800/60 rounded-full text-xs font-semibold tracking-wide backdrop-blur-sm border border-white/10 dark:border-slate-700">
              {greeting}, {fullName}
            </span>
            <h1 className="text-3xl font-black tracking-tight">{t('admin_dashboard.title')}</h1>
            <p className="text-indigo-100/90 dark:text-slate-400 text-sm max-w-xl">
              Ta'lim markazingizning bugungi ko'rsatkichlari, o'quvchi va o'qituvchilar faolligini ushbu markaz orqali to'liq nazorat qiling.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 dark:bg-slate-800/60 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10 dark:border-slate-700 font-semibold text-sm">
            <Clock className="w-5 h-5 text-indigo-200 dark:text-indigo-400" />
            <span>{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>

      {/* 2. Glassmorphism KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          { label: t('admin_dashboard.total_students'), value: statsLoading ? '...' : String(stats?.totalStudents || 0), icon: Users, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', hover: 'hover:shadow-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/5' },
          { label: t('admin_dashboard.total_teachers'), value: statsLoading ? '...' : String(stats?.totalTeachers || 0), icon: GraduationCap, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', hover: 'hover:shadow-indigo-500/10 hover:border-indigo-500/40 hover:bg-indigo-500/5' },
          { label: t('admin_dashboard.total_rooms'), value: statsLoading ? '...' : String(stats?.totalRooms || 0), icon: Building2, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', hover: 'hover:shadow-purple-500/10 hover:border-purple-500/40 hover:bg-purple-500/5' },
          { label: t('admin_dashboard.active_courses'), value: statsLoading ? '...' : String(stats?.activeCourses || 0), icon: BookOpen, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', hover: 'hover:shadow-orange-500/10 hover:border-orange-500/40 hover:bg-orange-500/5' },
          { label: t('admin_dashboard.active_groups'), value: statsLoading ? '...' : String(stats?.activeGroups || 0), icon: UserCheck, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', hover: 'hover:shadow-emerald-500/10 hover:border-emerald-500/40 hover:bg-emerald-500/5' },
        ].map((stat, i) => (
          <div key={i} className={`relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl ${stat.hover}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} border shrink-0`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Financial & Attendance Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Income Card with Rich Mesh Gradient */}
        <div className="bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 p-6 rounded-3xl shadow-lg shadow-blue-500/5 text-white relative overflow-hidden border border-blue-500/20 dark:border-slate-800/80 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <p className="text-blue-100 dark:text-slate-400 font-semibold flex items-center relative z-10"><DollarSign className="w-4 h-4 mr-1 text-blue-200 dark:text-blue-400"/> {t('admin_dashboard.total_income_ytd')}</p>
          <h3 className="text-4xl font-black mt-3 relative z-10 tracking-tight">{totalIncome.toLocaleString('uz-UZ')} <span className="text-lg font-medium text-blue-200 dark:text-slate-400">UZS</span></h3>
          <div className="mt-5 flex items-center text-xs font-semibold bg-white/10 dark:bg-slate-800/60 w-max px-3 py-1.5 rounded-full border border-white/10 dark:border-slate-700 backdrop-blur-sm relative z-10">
            <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-300"/> 0% {t('admin_dashboard.vs_last_year')}
          </div>
        </div>

        {/* Pending Payments Card with glowing effect */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5 hover:border-red-500/20 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold flex items-center"><CreditCard className="w-4 h-4 mr-1.5"/> {t('admin_dashboard.pending_payments')}</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-3 tracking-tight">
                {statsLoading ? '...' : (stats?.pendingPaymentsAmount || 0).toLocaleString('uz-UZ')}{' '}
                <span className="text-sm font-medium text-slate-400">UZS</span>
              </h3>
            </div>
            <div className="p-3.5 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 transition-all duration-300 group-hover:scale-110"><Activity className="w-5 h-5"/></div>
          </div>
          <div className="flex items-center text-sm text-red-500 font-bold mt-5 gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            {statsLoading ? '...' : stats?.studentsInDebt} {t('admin_dashboard.students_in_debt')}
          </div>
        </div>

        {/* Global Attendance Card */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/20 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold flex items-center"><Calendar className="w-4 h-4 mr-1.5"/> {t('admin_dashboard.global_attendance')}</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-3 tracking-tight">{statsLoading ? '...' : `${stats?.globalAttendance || 0}%`}</h3>
            </div>
            <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 transition-all duration-300 group-hover:scale-110"><UserCheck className="w-5 h-5"/></div>
          </div>
          <p className="text-sm text-emerald-500 font-bold mt-5">
            {t('admin_dashboard.healthy_rate', { count: stats?.globalAttendance || 0 })}
          </p>
        </div>
      </div>

      {/* 4. Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Growth area chart */}
        <div className="lg:col-span-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 transition-all duration-500 hover:shadow-lg">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">{t('admin_dashboard.student_growth')}</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.1)', backgroundColor: 'rgba(15, 23, 42, 0.95)', color: '#fff', backdropFilter: 'blur(10px)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
                <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent activities container */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 transition-all duration-500 hover:shadow-lg">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">{t('admin_dashboard.recent_activity')}</h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {recentPayments.map((log: any, i: number) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${log.color} border-2 border-white dark:border-slate-900 mt-1.5 transition-transform duration-300 group-hover:scale-125 shadow-sm`}></div>
                  {i !== recentPayments.length - 1 && <div className="w-0.5 h-full bg-slate-200/80 dark:bg-slate-800/60 mt-1.5"></div>}
                </div>
                <div className="pb-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors group-hover:text-blue-500">{log.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 dark:text-slate-400/90 leading-relaxed">{log.desc}</p>
                  <span className="text-[10px] font-semibold text-slate-400 mt-1.5 block">{log.time}</span>
                </div>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
                <Activity className="w-8 h-8 mb-2 opacity-35" />
                <p className="text-sm font-medium">{t('admin_dashboard.no_activity_yet', 'Faolliklar mavjud emas')}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
