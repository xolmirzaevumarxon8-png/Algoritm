import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import { ArrowLeft, Building2, Calendar as CalendarIcon, Clock, Users, BookOpen } from 'lucide-react';

const daysOfWeek = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
const dayMapReverse: Record<number, string> = {
  1: 'Dushanba', 2: 'Seshanba', 3: 'Chorshanba', 4: 'Payshanba', 5: 'Juma', 6: 'Shanba', 7: 'Yakshanba'
};

const colors = [
  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
];

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: room, isLoading: isRoomLoading } = useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const res = await apiClient.get(`/rooms/${id}`);
      return res.data;
    }
  });

  const { data: scheduleGroups = [], isLoading: isScheduleLoading } = useQuery({
    queryKey: ['room-schedule', id],
    queryFn: async () => {
      const res = await apiClient.get(`/rooms/${id}/schedule`);
      return res.data;
    }
  });

  // Flat map to get all schedule blocks
  const allSchedules = scheduleGroups.flatMap((g: any, index: number) => {
    return (g.schedules || []).map((s: any) => {
      const startTimeStr = new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const endTimeStr = new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      return {
        id: s.id,
        group: g.name,
        course: g.course?.name || "Noma'lum kurs",
        teacher: g.teacher?.user?.fullname || "O'qituvchi biriktirilmagan",
        day: dayMapReverse[s.weekday] || 'Noma\'lum',
        time: `${startTimeStr} - ${endTimeStr}`,
        color: colors[index % colors.length]
      };
    });
  });

  if (isRoomLoading) {
    return <div className="p-8 text-center text-slate-500">Yuklanmoqda...</div>;
  }

  if (!room) {
    return <div className="p-8 text-center text-red-500">Xona topilmadi.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-blue-500" />
            {room.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {room.branch?.name} • Sig'imi: {room.capacity || "Noma'lum"} o'quvchi
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold flex items-center text-slate-800 dark:text-white">
            <CalendarIcon className="w-5 h-5 mr-2 text-slate-400" /> Dars Jadvali
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-7 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          {daysOfWeek.map(day => (
            <div key={day} className="min-h-[500px] bg-slate-50/50 dark:bg-slate-900">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 text-center font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 sticky top-0">
                {day}
              </div>
              <div className="p-3 space-y-3">
                {isScheduleLoading && <div className="text-center text-xs text-slate-500 py-4">Yuklanmoqda...</div>}
                {!isScheduleLoading && allSchedules.filter((s: any) => s.day === day).length === 0 && (
                  <div className="text-center text-xs text-slate-400 py-4">Darslar yo'q</div>
                )}
                {allSchedules.filter((s: any) => s.day === day).map((s: any) => (
                  <div key={s.id} className={`p-3 rounded-xl border shadow-sm ${s.color} transition-all hover:shadow-md`}>
                    <div className="font-bold text-sm mb-2">{s.group}</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center text-xs opacity-90"><Clock className="w-3.5 h-3.5 mr-1.5"/> {s.time}</div>
                      <div className="flex items-center text-xs opacity-90"><BookOpen className="w-3.5 h-3.5 mr-1.5"/> {s.course}</div>
                      <div className="flex items-center text-xs opacity-90"><Users className="w-3.5 h-3.5 mr-1.5"/> {s.teacher}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
