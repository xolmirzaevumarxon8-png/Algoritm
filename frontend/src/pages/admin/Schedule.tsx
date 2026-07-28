import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayMapReverse: Record<number, string> = {
  1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday'
};

const colors = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-pink-100 text-pink-700 border-pink-200',
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
      const startTimeStr = new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const endTimeStr = new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      return {
        id: s.id,
        group: g.name,
        teacher: g.teacherName || 'No Teacher',
        room: g.room_id || 'Room N/A',
        day: dayMapReverse[s.weekday] || 'Unknown',
        time: `${startTimeStr} - ${endTimeStr}`,
        color: colors[index % colors.length]
      };
    });
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <CalendarIcon className="w-8 h-8 mr-3 text-blue-500" />
            Class Schedule
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Weekly master schedule across all rooms</p>
        </div>
        <div className="flex space-x-2 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 dark:text-slate-400"><ChevronLeft className="w-5 h-5"/></button>
          <div className="px-4 py-2 font-medium text-slate-800 dark:text-white">July 20 - July 26</div>
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 dark:text-slate-400"><ChevronRight className="w-5 h-5"/></button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          {daysOfWeek.map(day => (
            <div key={day} className="min-h-[500px] bg-slate-50/50 dark:bg-slate-900">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 text-center font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800">
                {day}
              </div>
              <div className="p-3 space-y-3">
                {isLoading && <div className="text-center text-xs text-slate-500 py-4">Loading...</div>}
                {allSchedules.filter((s: any) => s.day === day).map((s: any) => (
                  <div key={s.id} className={`p-3 rounded-xl border shadow-sm ${s.color}`}>
                    <div className="font-bold text-sm mb-1">{s.group}</div>
                    <div className="flex items-center text-xs opacity-80 mb-1"><Clock className="w-3 h-3 mr-1"/> {s.time}</div>
                    <div className="flex items-center text-xs opacity-80 mb-1"><Users className="w-3 h-3 mr-1"/> {s.teacher}</div>
                    <div className="flex items-center text-xs opacity-80"><MapPin className="w-3 h-3 mr-1"/> {s.room}</div>
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

export default Schedule;
