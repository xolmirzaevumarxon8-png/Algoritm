import { Calendar as CalendarIcon, Clock, MapPin, Users, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const daysOfWeek = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const dayMapReverse: Record<number, string> = {
  1: 'Dushanba', 2: 'Seshanba', 3: 'Chorshanba', 4: 'Payshanba', 5: 'Juma', 6: 'Shanba'
};

const colors = [
  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
  'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
  'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
];

const Schedule = () => {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['schedule-groups'],
    queryFn: async () => {
      const res = await apiClient.get('/groups');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const allSchedules = groups.flatMap((g: any, index: number) => {
    return (g.schedules || []).map((s: any) => {
      const startTimeStr = s.start_time ? new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '10:00';
      const endTimeStr = s.end_time ? new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '12:00';
      return {
        id: s.id || Math.random().toString(),
        group: g.name,
        teacher: g.teacherName || g.teacher?.user?.fullname || 'Biriktirilmagan',
        room: g.room?.name || g.room_id || 'Xona belgilanmagan',
        day: dayMapReverse[s.weekday] || 'Dushanba',
        time: `${startTimeStr} - ${endTimeStr}`,
        color: colors[index % colors.length]
      };
    });
  });

  // Room collision detector helper
  const isColliding = (item: any) => {
    if (item.room === 'Xona belgilanmagan') return false;
    const sameRoomAndDay = allSchedules.filter((s: any) => s.id !== item.id && s.day === item.day && s.room === item.room && s.time === item.time);
    return sameRoomAndDay.length > 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <CalendarIcon className="w-8 h-8 mr-3 text-blue-500" />
            Dars Jadvali Markazi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Barcha xonalar va guruhlar bo'yicha haftalik dars jadvali</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          {daysOfWeek.map(day => (
            <div key={day} className="min-h-[500px] bg-slate-50/50 dark:bg-slate-900">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 text-center font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 text-sm">
                {day}
              </div>
              <div className="p-3 space-y-3">
                {isLoading && <div className="text-center text-xs text-slate-500 py-4">Jadval yuklanmoqda...</div>}
                {!isLoading && allSchedules.filter((s: any) => s.day === day).length === 0 && (
                  <div className="text-center text-xs text-slate-400 py-8">Darslar yo'q</div>
                )}
                {allSchedules.filter((s: any) => s.day === day).map((s: any) => {
                  const collision = isColliding(s);
                  return (
                    <div key={s.id} className={`p-3 rounded-xl border shadow-sm transition-all hover:scale-[1.02] ${s.color}`}>
                      {collision && (
                        <div className="flex items-center text-[10px] font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded-md mb-2 animate-pulse">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Xona Toqnashuvi!
                        </div>
                      )}
                      <div className="font-bold text-sm mb-1">{s.group}</div>
                      <div className="flex items-center text-xs opacity-90 mb-1"><Clock className="w-3 h-3 mr-1"/> {s.time}</div>
                      <div className="flex items-center text-xs opacity-90 mb-1"><Users className="w-3 h-3 mr-1"/> {s.teacher}</div>
                      <div className="flex items-center text-xs opacity-90"><MapPin className="w-3 h-3 mr-1"/> {s.room}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
