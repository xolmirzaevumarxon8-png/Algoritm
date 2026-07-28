import { BookOpen, Calendar, Clock, MapPin, Award, User, Target, BarChart3, CheckCircle, TrendingUp, Trophy, Star, Crown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const progressData = [
  { month: 'Yan', score: 75 },
  { month: 'Feb', score: 82 },
  { month: 'Mar', score: 88 },
  { month: 'Apr', score: 85 },
  { month: 'May', score: 92 },
  { month: 'Iyun', score: 95 },
  { month: 'Iyul', score: 98 },
];

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() || user.username : 'Talaba';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['student-dashboard-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/students/dashboard-stats');
      return res.data;
    }
  });

  const { data: leaderboardData, isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['student-leaderboard'],
    queryFn: async () => {
      const res = await apiClient.get('/students/leaderboard');
      return res.data;
    }
  });

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Xayrli tong' : currentHour < 18 ? 'Xayrli kun' : 'Xayrli kech';

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-505 via-teal-600 to-cyan-600 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-emerald-500/10 border border-emerald-500/20 dark:border-slate-800/80">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-white/10 dark:bg-slate-800/60 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 dark:border-slate-700 shadow-inner shrink-0">
              <User className="w-10 h-10 text-emerald-200" />
            </div>
            <div className="text-center md:text-left space-y-1">
              <span className="px-3 py-1 bg-white/10 dark:bg-slate-800/60 rounded-full text-xs font-semibold tracking-wide backdrop-blur-sm border border-white/10 dark:border-slate-700">
                {greeting}, {fullName}
              </span>
              <h1 className="text-3xl font-black tracking-tight mt-1">Xush kelibsiz! 👋</h1>
              <p className="text-emerald-100/90 dark:text-slate-400 text-sm max-w-xl">
                {isLoading ? 'Yuklanmoqda...' : `${stats?.primaryGroup || 'Guruh'} • ${stats?.primaryCourse || 'Kurs'} yo'nalishida o'qimoqdasiz. O'zlashtirish ko'rsatkichlaringizni kuzatib boring.`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 dark:bg-slate-800/60 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10 dark:border-slate-700 font-semibold text-sm">
            <Calendar className="w-5 h-5 text-emerald-250" />
            <span>{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>

      {/* 2. Glassmorphic KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'O\'rtacha baho', value: isLoading ? '...' : `${stats?.avgGrade || 0}%`, icon: Award, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', hover: 'hover:shadow-indigo-500/10 hover:border-indigo-500/40 hover:bg-indigo-500/5' },
          { label: 'Davomat foizi', value: isLoading ? '...' : `${stats?.attendanceRate || 0}%`, icon: CheckCircle, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', hover: 'hover:shadow-emerald-500/10 hover:border-emerald-500/40 hover:bg-emerald-500/5' },
          { label: 'Topshiriqlar', value: isLoading ? '...' : String(stats?.totalHomeworks || 0), icon: BookOpen, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', hover: 'hover:shadow-orange-500/10 hover:border-orange-500/40 hover:bg-orange-500/5' },
          { label: 'O\'tilgan imtihonlar', value: isLoading ? '...' : `${stats?.passedExams || 0} ta`, icon: BarChart3, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', hover: 'hover:shadow-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/5' },
        ].map((stat, i) => (
          <div key={i} className={`relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl ${stat.hover}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} border shrink-0`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Progress Chart & Leaderboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Progress Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center mb-6">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" /> O'zlashtirish ko'rsatkichlari (Trend)
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.1)', backgroundColor: 'rgba(15, 23, 42, 0.95)', color: '#fff', backdropFilter: 'blur(10px)' }}/>
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Group Leaderboard */}
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" /> Guruh Reytingi (Leaderboard)
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {leaderboardData?.groupName || 'Guruh'}
              </span>
            </div>

            <div className="space-y-3">
              {isLeaderboardLoading ? (
                <div className="text-center py-6 text-slate-400 text-sm">Yuklanmoqda...</div>
              ) : !leaderboardData?.leaderboard || leaderboardData.leaderboard.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">Reyting ma'lumotlari shakllanmadi</div>
              ) : (
                leaderboardData.leaderboard.slice(0, 5).map((peer: any) => (
                  <div 
                    key={peer.id} 
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${peer.isMe ? 'bg-indigo-500/10 border-indigo-500/30 font-bold dark:bg-indigo-950/20' : 'bg-white/50 dark:bg-slate-850/40 border-slate-200/50 dark:border-slate-800/60'}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${peer.rank === 1 ? 'bg-yellow-400 text-yellow-950 shadow-md shadow-yellow-500/20' : peer.rank === 2 ? 'bg-slate-300 text-slate-800' : peer.rank === 3 ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        {peer.rank === 1 ? <Crown className="w-4 h-4" /> : `#${peer.rank}`}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center">
                          {peer.fullname} {peer.isMe && <span className="ml-2 text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-extrabold">SIZ</span>}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">O'rtacha baho: {peer.avgGrade}% • Davomat: {peer.attendanceRate}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-end">
                        <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" /> {peer.xp} XP
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side Columns */}
        <div className="space-y-6">
          {/* Upcoming Homework Deadlines */}
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center mb-6">
              <Target className="w-5 h-5 mr-2 text-orange-500" /> Yangi uy vazifalari
            </h3>
            <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="text-center py-4 text-slate-500">Yuklanmoqda...</div>
              ) : !stats?.upcomingHomeworks || stats.upcomingHomeworks.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  Yangi topshiriqlar mavjud emas
                </div>
              ) : (
                stats.upcomingHomeworks.map((hw: any) => (
                  <div key={hw.id} className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex flex-col justify-between">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{hw.title}</h4>
                    <p className="text-xs text-orange-650 dark:text-orange-400 mt-2.5 flex items-center font-bold">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Muddati: {hw.due_date ? new Date(hw.due_date).toLocaleDateString('uz-UZ') : 'Belgilanmagan'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Classes */}
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center mb-6">
              <Calendar className="w-5 h-5 mr-2 text-emerald-500" /> Bugungi darslar
            </h3>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4 text-slate-500">Yuklanmoqda...</div>
              ) : !stats?.todaySchedules || stats.todaySchedules.length === 0 ? (
                <div className="text-center py-6 text-slate-500 bg-slate-50/50 dark:bg-slate-850/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-sm">
                  Bugun darslar mavjud emas
                </div>
              ) : (
                stats.todaySchedules.map((schedule: any) => (
                  <div key={schedule.id} className="p-4 bg-emerald-500/5 border-l-4 border-l-emerald-500 rounded-r-2xl">
                    <h4 className="font-bold text-emerald-950 dark:text-emerald-450 text-sm">{schedule.courseName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{schedule.groupName}</p>
                    <p className="text-xs text-emerald-700 font-bold mt-2.5 flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" /> {schedule.time}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
