import { PhoneCall, UserPlus, Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTranslation } from 'react-i18next';

const ManagerDashboard = () => {
  const { t } = useTranslation();

  const conversionData = [
    { name: t('manager_dashboard.mon'), leads: 0, converted: 0 },
    { name: t('manager_dashboard.tue'), leads: 0, converted: 0 },
    { name: t('manager_dashboard.wed'), leads: 0, converted: 0 },
    { name: t('manager_dashboard.thu'), leads: 0, converted: 0 },
    { name: t('manager_dashboard.fri'), leads: 0, converted: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('manager_dashboard.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('manager_dashboard.subtitle')}</p>
        </div>
        <div className="flex space-x-2">
          <select className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none shadow-sm text-sm font-medium dark:text-white">
            <option>{t('manager_dashboard.this_week')}</option>
            <option>{t('manager_dashboard.this_month')}</option>
          </select>
        </div>
      </div>

      {/* CRM Funnel KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('manager_dashboard.new_leads'), value: '0', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: t('manager_dashboard.daily_calls'), value: '0', icon: PhoneCall, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: t('manager_dashboard.converted'), value: '0', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: t('manager_dashboard.conversion_pct'), value: '0%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-500 transition-colors">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
              <stat.icon className="w-24 h-24" />
            </div>
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">{t('manager_dashboard.trend_title')}</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={conversionData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                <Area type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" name={t('manager_dashboard.total_leads')} />
                <Area type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorConverted)" name={t('manager_dashboard.converted_students')} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">{t('manager_dashboard.upcoming_trials')}</h2>
          <div className="space-y-4">
            {([] as any[]).map((trial, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{trial.student}</h4>
                  <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">{trial.course}</p>
                </div>
                <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> {trial.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
