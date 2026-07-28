import { Calendar as CalendarIcon, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const weekdaysList = [
  { id: 1, name: 'Dushanba' },
  { id: 2, name: 'Seshanba' },
  { id: 3, name: 'Chorshanba' },
  { id: 4, name: 'Payshanba' },
  { id: 5, name: 'Juma' },
  { id: 6, name: 'Shanba' },
];

const StudentSchedule = () => {
  const { data: scheduleList = [], isLoading } = useQuery({
    queryKey: ['student-schedule'],
    queryFn: async () => {
      const res = await apiClient.get('/students/schedule');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <CalendarIcon className="w-8 h-8 mr-3 text-indigo-500" />
            Haftalik Dars Jadvali
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Guruhlaringiz bo'yicha haftalik o'quv taqvimi va dars vaqtlari</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weekdaysList.map((day) => {
          const daySchedules = scheduleList.filter((s: any) => s.weekday === day.id);

          return (
            <div 
              key={day.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 p-6 flex flex-col justify-between transition-all hover:border-indigo-500/40"
            >
              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    {day.name}
                  </h3>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full">
                    {daySchedules.length} dars
                  </span>
                </div>

                {isLoading ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">Yuklanmoqda...</div>
                ) : daySchedules.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium bg-slate-50/50 dark:bg-slate-850/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    Dars belgilanmagan
                  </div>
                ) : (
                  <div className="space-y-3">
                    {daySchedules.map((item: any) => (
                      <div 
                        key={item.id} 
                        className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.courseName}</h4>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> {item.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center font-medium">
                          <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Guruh: {item.groupName}
                        </p>
                        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-indigo-500/10">
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {item.roomName}
                          </span>
                          <span className="flex items-center font-medium text-slate-700 dark:text-slate-300">
                            <User className="w-3.5 h-3.5 mr-1 text-slate-400" /> {item.teacherName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentSchedule;
