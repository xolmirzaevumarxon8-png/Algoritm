import { useState } from 'react';
import { Users, Calendar as CalendarIcon, Clock, MapPin, BookOpen, User, Bell, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const days = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

const dayMapReverse: Record<number, string> = {
  1: 'Dushanba', 2: 'Seshanba', 3: 'Chorshanba', 4: 'Payshanba', 5: 'Juma', 6: 'Shanba'
};

const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(() => {
    const currentDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
    return days[currentDayIndex - 1] || 'Dushanba';
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['teacher-dashboard-groups'],
    queryFn: async () => {
      const res = await apiClient.get('/groups');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const assignedCoursesCount = new Set(groups.map((g: any) => g.courseName || g.course?.name)).size;
  const totalStudentsCount = groups.reduce((acc: number, g: any) => acc + (g.studentCount || 0), 0);

  // Jadvalni real ma'lumotlardan yig'ish
  const allSchedules = groups.flatMap((g: any) => {
    return (g.schedules || []).map((s: any) => {
      // Timezone UTC to prevent +5 hours offset bug!
      const startTimeStr = new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
      const endTimeStr = new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
      return {
        id: s.id,
        groupId: g.id,
        group: g.name,
        course: g.courseName || g.course?.name || 'Unknown',
        room: g.room_id || g.room || 'N/A',
        day: dayMapReverse[s.weekday] || 'Noma\'lum',
        time: `${startTimeStr} - ${endTimeStr}`,
        students: g.studentCount || 0,
        stage: g.stage || 'HTML'
      };
    });
  });

  const todaysClasses = allSchedules.filter((s: any) => s.day === selectedDay);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Xayrli tong' : currentHour < 18 ? 'Xayrli kun' : 'Xayrli kech';
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() || user.username : 'O\'qituvchi';

  return (
    <div className="space-y-6">
      
      {/* 1. Welcoming Banner with gradients & blur blobs */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/10 border border-indigo-500/20 dark:border-slate-800/80">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-white/10 dark:bg-slate-800/60 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 dark:border-slate-700 shadow-inner shrink-0">
              <GraduationCap className="w-10 h-10 text-indigo-200" />
            </div>
            <div className="text-center md:text-left space-y-1">
              <span className="px-3 py-1 bg-white/10 dark:bg-slate-800/60 rounded-full text-xs font-semibold tracking-wide backdrop-blur-sm border border-white/10 dark:border-slate-700">
                {greeting}, {fullName}
              </span>
              <h1 className="text-3xl font-black tracking-tight mt-1">Xush kelibsiz! 👋</h1>
              <p className="text-indigo-100/90 dark:text-slate-400 text-sm max-w-xl">
                O'quvchilaringizning davomati, baholari va dars jadvallarini ushbu boshqaruv paneli orqali nazorat qiling.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-white/10 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10 dark:border-slate-700 flex-1 md:flex-initial min-w-[120px]">
              <p className="text-indigo-200 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Kurslaringiz</p>
              <p className="text-3xl font-black mt-1">{assignedCoursesCount}</p>
            </div>
            <div className="bg-white/10 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10 dark:border-slate-700 flex-1 md:flex-initial min-w-[120px]">
              <p className="text-indigo-200 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">O'quvchilar</p>
              <p className="text-3xl font-black mt-1">{totalStudentsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Schedule Section */}
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2 text-indigo-500" /> Mening dars jadvalim
          </h2>
        </div>

        {/* Day Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-4 custom-scrollbar">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                selectedDay === day 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' 
                  : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200/40 dark:border-slate-800/60'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Classes List */}
        <div className="mt-6 space-y-4">
          {todaysClasses.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-850/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Bugun darslar yo'q</h3>
              <p className="text-slate-500 mt-1 dark:text-slate-400 text-sm">Bo'sh vaqtingizdan bahramand bo'ling yoki dars materiallarini tayyorlang.</p>
            </div>
          ) : (
            todaysClasses.map(cls => (
              <div key={cls.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl hover:border-indigo-500/50 dark:hover:border-indigo-500/55 transition-all duration-350 hover:shadow-lg hover:shadow-slate-150/10 dark:hover:shadow-slate-950/20 group">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-inner shadow-indigo-500/5">
                    {cls.group.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg transition-colors group-hover:text-indigo-500">{cls.group}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {cls.course} <span className="mx-1.5 text-slate-300 dark:text-slate-700">•</span> <span className="font-semibold text-indigo-600 dark:text-indigo-400">Bosqich: {cls.stage}</span>
                    </p>
                    <div className="flex items-center gap-4 mt-2.5">
                      <span className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg"><Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> {cls.time}</span>
                      <span className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {cls.room}-xona</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-5 w-full md:w-auto">
                  <div className="text-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 rounded-2xl border border-slate-200/30 dark:border-slate-700/30 min-w-[90px]">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">O'quvchilar</p>
                    <p className="font-black text-indigo-600 dark:text-indigo-400 text-lg mt-0.5">{cls.students}</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/teacher/groups?groupId=${cls.groupId}&tab=attendance`)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 w-full md:w-auto"
                  >
                    Darsni boshlash
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
