import { CheckSquare, BookOpen, Clock, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import { useState } from 'react';

const ParentAcademic = () => {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const { data: children = [], isLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: async () => {
      const res = await apiClient.get('/students/parent/children');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  import('react').then(React => {
    React.useEffect(() => {
      if (children.length > 0 && !selectedChildId) {
        setSelectedChildId(children[0].id);
      }
    }, [children, selectedChildId]);
  });

  if (isLoading) {
    return <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (children.length === 0) {
    return <div className="text-center py-12 text-slate-500">Hozircha farzandlar biriktirilmagan.</div>;
  }

  const activeChild = children.find((c: any) => c.id === selectedChildId) || children[0];

  const mockAttendance = activeChild.attendanceDetails?.length > 0 ? activeChild.attendanceDetails : [];
  const mockHomework = activeChild.ratingsDetails?.length > 0 ? activeChild.ratingsDetails : [];

  const getStatus = (score: number) => {
    if (score < 5) return { text: 'yomon', color: 'bg-red-100 text-red-700' };
    if (score >= 5 && score <= 7) return { text: "o'rtacha", color: 'bg-amber-100 text-amber-700' };
    return { text: "a'lo darajada", color: 'bg-emerald-100 text-emerald-700' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Academic Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400">Detailed view of {activeChild.name}'s attendance and homework assignments</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Farzandni tanlang:</label>
          <select 
            value={activeChild.id} 
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 dark:text-slate-100"
          >
            {children.map((child: any) => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance Log */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-blue-500" /> Recent Attendance
            </h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">95% Overall</span>
          </div>
          
            <div className="space-y-3">
            {mockAttendance.length === 0 ? <p className="text-slate-500">Ma'lumot topilmadi.</p> : null}
            {mockAttendance.map((rec: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">Dars jadvali</p>
                  <p className="text-xs text-slate-500 flex items-center mt-1 dark:text-slate-400"><Clock className="w-3 h-3 mr-1"/> {new Date(rec.date).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${rec.status === 'PRESENT' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                  {rec.status === 'PRESENT' ? 'Keldi' : 'Kelmadi'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Homework Log */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center mb-6">
            <BookOpen className="w-5 h-5 mr-2 text-purple-500" /> Homework & Grades
          </h2>
          
          <div className="space-y-4">
            {mockHomework.length === 0 ? <p className="text-slate-500">Ma'lumot topilmadi.</p> : null}
            {mockHomework.map((hw: any, i: number) => {
              const st = getStatus(hw.score);
              return (
              <div key={i} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 dark:text-white">Dars bahosi</h3>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${st.color}`}>
                    {st.text}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sana: {new Date(hw.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wide dark:text-slate-400">Score</p>
                    <p className="text-lg font-bold text-emerald-600">{hw.score}/10</p>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentAcademic;
