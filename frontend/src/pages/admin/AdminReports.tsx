import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Calendar, Download, Users, GraduationCap, BookOpen, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const incomeData = [
  { name: 'Jan', income: 0 }, { name: 'Feb', income: 0 }, { name: 'Mar', income: 0 },
  { name: 'Apr', income: 0 }, { name: 'May', income: 0 }, { name: 'Jun', income: 0 },
];

const studentData = [
  { name: 'Graduated', value: 0, color: '#10b981' },
  { name: 'Active', value: 0, color: '#3b82f6' },
  { name: 'Dropped', value: 0, color: '#ef4444' },
];

const teacherData: any[] = [];

import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const AdminReports = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('FINANCE');
  const [dateRange, setDateRange] = useState('monthly');

  const { data: branches = [] } = useQuery({
    queryKey: ['branches-reports'],
    queryFn: async () => {
      const res = await apiClient.get('/branches');
      return res.data;
    }
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['admin-payments-reports'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/payments');
      return res.data;
    }
  });

  const branchIncomeData = branches.map((b: any) => ({
    name: b.name,
    revenue: b.income
  }));

  const totalRevenue = branches.reduce((acc: number, curr: any) => acc + (Number(curr.income) || 0), 0);

  const handleExport = (format: string) => {
    toast.success(`Exporting ${activeTab.toLowerCase()} report to ${format}...`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'FINANCE':
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white">
                <p className="text-emerald-100 font-medium">{t('reports.total_revenue')}</p>
                <h3 className="text-3xl font-bold mt-2">{totalRevenue.toLocaleString('uz-UZ')} <span className="text-sm">UZS</span></h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border">
                <p className="text-slate-500 font-medium dark:text-slate-400">{t('reports.paid_students')}</p>
                <h3 className="text-3xl font-bold mt-2 text-emerald-600">0%</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl border">
                <p className="text-slate-500 font-medium dark:text-slate-400">{t('reports.pending_debt')}</p>
                <h3 className="text-3xl font-bold mt-2 text-red-500">0 <span className="text-sm">UZS</span></h3>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border h-[400px]">
                <h3 className="font-bold mb-4">{t('reports.income_trend')}</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={incomeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-2xl border h-[400px] dark:bg-slate-900 dark:border-slate-800">
                <h3 className="font-bold mb-4 dark:text-white">{t('reports.revenue_by_branch')}</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchIncomeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000000 ? (val / 1000000) + 'M' : val} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: any) => new Intl.NumberFormat('uz-UZ').format(Number(value || 0)) + ' UZS'} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mt-6">
              <h3 className="font-bold mb-4 dark:text-white">Oxirgi To'lovlar (Kassirlar qabul qilgan)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                      <th className="p-4 font-medium">O'quvchi</th>
                      <th className="p-4 font-medium">To'lov miqdori</th>
                      <th className="p-4 font-medium">Sana</th>
                      <th className="p-4 font-medium">Kassir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments.slice(0, 10).map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{p.finance_account?.student?.fullname || 'Noma\'lum'}</td>
                        <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{Number(p.amount).toLocaleString('uz-UZ')} UZS</td>
                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{new Date(p.paid_at).toLocaleString()}</td>
                        <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">{p.cashier_user?.fullname || 'Noma\'lum'}</td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">Hech qanday to'lov mavjud emas</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'STUDENTS':
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border h-[300px] flex flex-col items-center">
                <h3 className="font-bold mb-4 self-start">Student Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={studentData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {studentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-4 text-sm">
                  {studentData.map(s => (
                    <div key={s.name} className="flex items-center"><span className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: s.color}}></span>{s.name}</div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border">
                <h3 className="font-bold mb-4">Academic Performance Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                    <span className="font-medium">Average Global Grade</span>
                    <span className="text-xl font-bold text-indigo-600">0%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                    <span className="font-medium">Homework Completion Rate</span>
                    <span className="text-xl font-bold text-emerald-600">0%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                    <span className="font-medium">Exam Pass Rate</span>
                    <span className="text-xl font-bold text-blue-600">0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'TEACHERS':
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl border h-[400px]">
              <h3 className="font-bold mb-4">Teacher Performance (Avg Student Score)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teacherData} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" />
                  <RechartsTooltip />
                  <Bar dataKey="score" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'ATTENDANCE':
        return (
          <div className="bg-white p-6 rounded-2xl border text-center py-12">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Global Attendance Rate: 0%</h3>
            <p className="text-slate-500 dark:text-slate-400">Attendance is stable across all active groups.</p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-indigo-500" />
            {t('sidebar.reports')}
          </h1>
        </div>
        <div className="flex gap-2">
          {/* Global Filter */}
          <select className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white outline-none text-sm">
            <option>All Courses</option>
            <option>Frontend</option>
            <option>Backend</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white outline-none text-sm">
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
          <button onClick={() => handleExport('Excel')} className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm text-sm font-medium">
            <Download className="w-4 h-4 mr-2" /> Excel
          </button>
          <button onClick={() => handleExport('PDF')} className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm text-sm font-medium">
            <Download className="w-4 h-4 mr-2" /> PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar">
        {[
          { id: 'FINANCE', label: t('reports.tab_finance'), icon: DollarSign },
          { id: 'STUDENTS', label: t('reports.tab_students'), icon: Users },
          { id: 'TEACHERS', label: t('reports.tab_teachers'), icon: GraduationCap },
          { id: 'ATTENDANCE', label: t('reports.tab_attendance'), icon: CheckCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminReports;
