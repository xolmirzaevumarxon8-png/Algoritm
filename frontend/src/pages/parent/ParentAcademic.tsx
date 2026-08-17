import { useState, useEffect } from 'react';
import { CheckSquare, BookOpen, Clock, Award, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const ParentAcademic = () => {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const { data: children = [], isLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: async () => {
      const res = await apiClient.get('/students/parent/children');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
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

  const activeChild = children.find((c: any) => c.id === selectedChildId) || children[0];

  const mockAttendance = activeChild.attendanceDetails?.length > 0 ? activeChild.attendanceDetails : [];
  const mockHomework = activeChild.ratingsDetails?.length > 0 ? activeChild.ratingsDetails : [];

  const getStatus = (score: number) => {
    if (score < 5) return { text: "Past o'zlashtirish", color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' };
    if (score >= 5 && score <= 7) return { text: "O'rtacha daraja", color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    return { text: "A'lo darajada", color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Akademik Ko'rsatkichlar va Davomat</h1>
          <p className="text-slate-500 dark:text-slate-400">{activeChild.name}ning darslardagi qatnashuvi va vazifa baholari</p>
        </div>
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Farzandni tanlang:</label>
          <select 
            value={activeChild.id} 
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-800 dark:text-slate-100"
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
              <CheckSquare className="w-5 h-5 mr-2 text-blue-500" /> So'nggi Davomat Tarixi
            </h2>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              {activeChild.attendance}% Davomat
            </span>
          </div>
          
          <div className="space-y-3">
            {mockAttendance.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">Davomat ma'lumotlari topilmadi.</p>
            ) : null}
            {mockAttendance.map((rec: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">Dars mashg'uloti</p>
                  <p className="text-xs text-slate-500 flex items-center mt-1 dark:text-slate-400"><Clock className="w-3 h-3 mr-1"/> {new Date(rec.date).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${rec.status === 'PRESENT' ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800'}`}>
                  {rec.status === 'PRESENT' ? 'Keldi' : 'Kelmadi'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Homework Log */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-purple-500" /> Uy Vazifalari va Baholar
            </h2>
            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800">
              GPA: {activeChild.avgGrade}
            </span>
          </div>
          
          <div className="space-y-4">
            {mockHomework.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">Vazifalar ma'lumotlari topilmadi.</p>
            ) : null}
            {mockHomework.map((hw: any, i: number) => {
              const status = getStatus(hw.score || 0);
              return (
                <div key={i} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm">Amaliy Topshiriq #{i + 1}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1"><Clock className="w-3 h-3 mr-1" /> {new Date(hw.created_at || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Qo'yilgan ball:</span>
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center"><Award className="w-4 h-4 mr-1 text-amber-500" /> {hw.score} / 10 XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentAcademic;
