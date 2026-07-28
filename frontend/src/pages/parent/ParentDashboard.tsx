import { useState } from 'react';
import { BookOpen, Users, CheckSquare, Calendar, Award, TrendingUp, CreditCard, Star, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const gradeData = [
  { name: 'Sep', grade: 80 },
  { name: 'Oct', grade: 85 },
  { name: 'Nov', grade: 88 },
  { name: 'Dec', grade: 92 },
  { name: 'Jan', grade: 95 },
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

  // Effect to set initial active child when data loads
  import('react').then(React => {
    React.useEffect(() => {
      if (children.length > 0 && !activeChildId) {
        setActiveChildId(children[0].id);
      }
    }, [children, activeChildId]);
  });

  if (isLoading) {
    return <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (children.length === 0) {
    return <div className="text-center py-12 text-slate-500">Hozircha farzandlar biriktirilmagan.</div>;
  }

  const activeChild = children.find((c: any) => c.id === activeChildId) || children[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Parent Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitor your children's academic progress</p>
        </div>
        
        {/* Multi-Child Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center font-bold mr-3">
              {activeChild.name.charAt(0)}
            </div>
            <div className="text-left mr-4">
              <p className="text-sm font-bold text-slate-800 dark:text-white">{activeChild.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Viewing Student</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-10"
              >
                {children.map((child: any) => (
                  <button 
                    key={child.id}
                    onClick={() => { setActiveChildId(child.id); setIsDropdownOpen(false); }}
                    className={`w-full flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${activeChildId === child.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold mr-3">
                      {child.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{child.name}</p>
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
        <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center text-4xl font-bold">
          {activeChild.name.charAt(0)}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{activeChild.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
            <span className="flex items-center text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full"><BookOpen className="w-4 h-4 mr-2" /> {activeChild.course}</span>
            <span className="flex items-center text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full"><Users className="w-4 h-4 mr-2" /> {activeChild.group}</span>
            <span className="flex items-center text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full"><Star className="w-4 h-4 mr-2 text-yellow-500" /> Teacher: {activeChild.teacher}</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Attendance', value: `${activeChild.attendance}%`, icon: CheckSquare, color: 'text-emerald-500' },
          { label: 'Average Grade', value: activeChild.avgGrade, icon: Award, color: 'text-blue-500' },
          { label: 'Class Rank', value: `#${activeChild.rank}`, icon: TrendingUp, color: 'text-purple-500' },
          { label: 'Total XP', value: activeChild.xp, icon: Star, color: 'text-yellow-500' },
          { label: 'Payment', value: activeChild.status, icon: CreditCard, color: activeChild.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500' },
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate">{stat.label}</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grade Growth Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Grade Growth</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={gradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="grade" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorGrade)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default ParentDashboard;
