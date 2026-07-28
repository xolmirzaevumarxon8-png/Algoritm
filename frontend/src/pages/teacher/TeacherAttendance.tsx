import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import { Users, Calendar, ArrowRight, ShieldAlert } from 'lucide-react';

const TeacherAttendance = () => {
  const navigate = useNavigate();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['teacher-attendance-groups'],
    queryFn: async () => {
      const res = await apiClient.get('/groups');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
          <Calendar className="w-8 h-8 mr-3 text-indigo-500" />
          Davomat boshqaruvi
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Davomat qilish uchun quyidagi guruhlardan birini tanlang</p>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <ShieldAlert className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          Sizga biriktirilgan faol guruhlar topilmadi.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group: any) => (
            <div 
              key={group.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
                  {group.courseName || group.course?.name || 'Kurs'}
                </span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-3">{group.name}</h3>
                <div className="flex items-center gap-2 mt-4 text-sm text-slate-500 dark:text-slate-400">
                  <Users className="w-4 h-4 text-slate-450" />
                  <span>O'quvchilar soni: {group.studentCount || 0} ta</span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/teacher/groups?groupId=${group.id}&tab=attendance`)}
                className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center transition-all group shadow-md shadow-indigo-500/5"
              >
                Davomat qilish
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
