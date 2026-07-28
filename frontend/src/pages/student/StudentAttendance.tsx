import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const StudentAttendance = () => {
  const { data: attendanceData = [], isLoading } = useQuery({
    queryKey: ['student-attendance'],
    queryFn: async () => {
      const res = await apiClient.get('/students/attendance');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const totalLessons = attendanceData.length;
  const presentCount = attendanceData.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length;
  const absentCount = attendanceData.filter((r: any) => r.status === 'ABSENT').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full">Kelgan</span>;
      case 'ABSENT': return <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold rounded-full">Kelmagan</span>;
      case 'LATE': return <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded-full">Kechikkan</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <CheckCircle className="w-8 h-8 mr-3 text-emerald-500" />
            Mening davomatim
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Darslardagi ishtirok tarixingizni kuzatib boring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center rounded-xl mr-4"><Calendar className="w-6 h-6"/></div>
          <div><p className="text-sm text-slate-500 dark:text-slate-400">Jami darslar</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{totalLessons}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center rounded-xl mr-4"><CheckCircle className="w-6 h-6"/></div>
          <div><p className="text-sm text-slate-500 dark:text-slate-400">Kelgan darslar</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{presentCount}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center rounded-xl mr-4"><XCircle className="w-6 h-6"/></div>
          <div><p className="text-sm text-slate-500 dark:text-slate-400">Kelmagan darslar</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{absentCount}</p></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="text-slate-500 text-sm border-b border-slate-100 dark:border-slate-800 dark:text-slate-400">
              <th className="p-4 font-medium">Sana</th>
              <th className="p-4 font-medium">Kurs / Guruh</th>
              <th className="p-4 font-medium text-right">Holati</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={3} className="text-center py-8">Yuklanmoqda...</td></tr>
            ) : attendanceData.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8 text-slate-500">Davomat ma'lumotlari mavjud emas.</td></tr>
            ) : attendanceData.map((record: any) => {
              const group = record.lesson?.group;
              const course = group?.course;
              const dateStr = record.lesson?.lesson_date 
                ? new Date(record.lesson.lesson_date).toLocaleDateString('uz-UZ') 
                : new Date(record.created_at).toLocaleDateString('uz-UZ');

              return (
                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-medium text-slate-800 dark:text-white">{dateStr}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {course?.name || 'Kurs'} <span className="text-slate-400 dark:text-slate-500">•</span> {group?.name || 'Guruh'}
                  </td>
                  <td className="p-4 text-right flex justify-end items-center">
                    {getStatusBadge(record.status)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAttendance;
