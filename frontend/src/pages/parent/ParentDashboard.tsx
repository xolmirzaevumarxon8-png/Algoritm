import { useState, useEffect } from 'react';
import { BookOpen, Users, CheckSquare, Award, TrendingUp, CreditCard, Star, ChevronDown, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const gradeData = [
  { name: 'Sent', grade: 82 },
  { name: 'Okt', grade: 86 },
  { name: 'Noy', grade: 89 },
  { name: 'Dek', grade: 93 },
  { name: 'Yan', grade: 96 },
];

const ParentDashboard = () => {
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: children = [], isLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: async () => {
      const res = await apiClient.get('/students/parent/children');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  useEffect(() => {
    if (children.length > 0 && !activeChildId) {
      setActiveChildId(children[0].id);
    }
  }, [children, activeChildId]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
        <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Farzandlar topilmadi</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hozircha tizimga biriktirilgan farzandingiz mavjud emas.</p>
      </div>
    );
  }

  const activeChild = children.find((c: any) => c.id === activeChildId) || children[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-500/10">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Ota-onalar Paneli
          </h1>
          <p className="text-blue-100 text-sm mt-1">Farzandlaringizning o'zlashtirish va davomat ko'rsatkichlarini real vaqtda kuzating</p>
        </div>
        
        {/* Multi-Child Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-sm hover:bg-white/20 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold mr-3 shadow-md">
              {activeChild.name ? activeChild.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div className="text-left mr-4">
              <p className="text-sm font-bold text-white">{activeChild.name}</p>
              <p className="text-xs text-blue-200">Faol farzand</p>
            </div>
            <ChevronDown className="w-4 h-4 text-blue-200" />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-20 text-slate-800 dark:text-white"
              >
                {children.map((child: any) => (
                  <button 
                    key={child.id}
                    onClick={() => { setActiveChildId(child.id); setIsDropdownOpen(false); }}
                    className={`w-full flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${activeChildId === child.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mr-3">
                      {child.name ? child.name.charAt(0).toUpperCase() : 'F'}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold">{child.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{child.course}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/20">
          {activeChild.name ? activeChild.name.charAt(0).toUpperCase() : 'F'}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{activeChild.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
            <span className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl"><BookOpen className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> {activeChild.course}</span>
            <span className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl"><Users className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> {activeChild.group}</span>
            <span className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl"><UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> O'qituvchi: {activeChild.teacher}</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Davomat Foizi', value: `${activeChild.attendance}%`, icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: "O'rtacha Ball", value: activeChild.avgGrade, icon: Award, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: "Sinfdagi O'rni", value: `#${activeChild.rank}`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Jami XP Ball', value: activeChild.xp, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: "To'lov Holati", value: activeChild.status === 'Paid' ? 'To\'langan' : 'Qarzdorlik', icon: CreditCard, color: activeChild.status === 'Paid' ? 'text-emerald-500' : 'text-rose-500', bg: activeChild.status === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20' },
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate">{stat.label}</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grade Growth Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" /> O'zlashtirish Dinamikasi
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={gradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => [`${val} ball`, "O'zlashtirish"]} />
              <Area type="monotone" dataKey="grade" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorGrade)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default ParentDashboard;
