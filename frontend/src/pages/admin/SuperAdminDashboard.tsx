import { Users, FileText, Globe, DollarSign, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const incomeData = [
  { name: 'Jan', income: 0, expense: 0 },
  { name: 'Feb', income: 0, expense: 0 },
  { name: 'Mar', income: 0, expense: 0 },
  { name: 'Apr', income: 0, expense: 0 },
  { name: 'May', income: 0, expense: 0 },
  { name: 'Jun', income: 0, expense: 0 },
  { name: 'Jul', income: 0, expense: 0 },
];

const SuperAdminDashboard = () => {
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await apiClient.get('/branches');
      return res.data;
    }
  });

  const branchIncomeData = branches.map((b: any) => ({
    name: b.name,
    income: b.income
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Global system overview, finance, and academics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Total Students</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">4,250</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Active Teachers</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">124</h3>
            <GraduationCap className="w-5 h-5 text-indigo-500" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Total Groups</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">312</h3>
            <Users className="w-5 h-5 text-amber-500" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Active Courses</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">45</h3>
            <BookOpen className="w-5 h-5 text-emerald-500" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Monthly Revenue</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">142M</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Income vs Expense (YTD)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}M`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Filiallar bo'yicha daromad (UZS)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchIncomeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000000 ? (val / 1000000) + 'M' : val} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: any) => new Intl.NumberFormat('uz-UZ').format(Number(value || 0)) + ' UZS'} />
                <Legend />
                <Bar dataKey="income" name="Daromad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
