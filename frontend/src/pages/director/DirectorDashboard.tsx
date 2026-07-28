import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, TrendingUp, DollarSign, Activity, Users, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DirectorDashboard = () => {
  const { t } = useTranslation();
  const [selectedBranch, setSelectedBranch] = useState('all');

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await apiClient.get('/branches');
      return res.data;
    }
  }); 

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['director-dashboard', selectedBranch],
    queryFn: async () => {
      const res = await apiClient.get(`/director/dashboard?branchId=${selectedBranch}`);
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Yuklanmoqda...</div>;
  }

  const { financials, auditLogs, adminKPIs, churnData } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Header & Global Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Boshqaruv Markazi (Direktor)</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Strategik ko'rsatkichlar va moliyaviy nazorat</p>
        </div>
        <div className="flex items-center space-x-3">
          <Building2 className="w-5 h-5 text-slate-400" />
          <select 
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none shadow-sm text-sm font-medium dark:text-white min-w-[200px]"
          >
            <option value="all">Barcha filiallar</option>
            {branches.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Financial Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase flex items-center"><TrendingUp className="w-4 h-4 mr-2" /> Umumiy Daromad</p>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-3">
            {financials?.totalIncome?.toLocaleString()} <span className="text-sm font-normal text-slate-400">UZS</span>
          </h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase flex items-center"><Activity className="w-4 h-4 mr-2" /> Umumiy Xarajatlar</p>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-3">
            {financials?.totalExpenses?.toLocaleString()} <span className="text-sm font-normal text-slate-400">UZS</span>
          </h3>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-sm text-white">
          <p className="text-blue-100 font-medium uppercase flex items-center"><DollarSign className="w-4 h-4 mr-2" /> Sof Foyda (Net Profit)</p>
          <h3 className="text-4xl font-black mt-3">
            {financials?.netProfit?.toLocaleString()} <span className="text-lg font-normal text-blue-200">UZS</span>
          </h3>
        </div>
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Churn Rate and Leads Conversion Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Yangi Mijozlar va Ketganlar (Churn Rate)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={churnData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}/>
                <Area type="monotone" dataKey="newLeads" name="Yangi o'quvchilar" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="churn" name="Ketganlar (%)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorChurn)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Admin KPI Leaderboard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 overflow-hidden flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-500" /> Adminlar KPI Reytingi</h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {adminKPIs?.map((admin: any, idx: number) => (
              <div key={admin.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center">
                      <span className="w-5 h-5 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs mr-2">{idx + 1}</span>
                      {admin.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{admin.role}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
                    {admin.conversionRate} Conv.
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Ro'yxatdan o'tkazdi</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{admin.studentsRegistered}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">To'lovlar</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{admin.paymentsConfirmed}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-rose-500" /> Tizim Audit Jurnali (Kritik Amallar)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
                <th className="p-4 font-medium">Sana & Vaqt</th>
                <th className="p-4 font-medium">Foydalanuvchi</th>
                <th className="p-4 font-medium">Amal</th>
                <th className="p-4 font-medium">Obyekt</th>
                <th className="p-4 font-medium">Batafsil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditLogs?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Hech qanday kritik amallar topilmadi.
                  </td>
                </tr>
              ) : (
                auditLogs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{log.user?.fullname || 'Noma\'lum'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{log.user?.role?.name || ''}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                        log.action.includes('DELETE') ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                        log.action.includes('UPDATE') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300">
                      {log.target}
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;
