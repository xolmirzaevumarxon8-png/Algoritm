import { useState } from 'react';
import { Bell, CheckCircle, Trash2, BookOpen, FileText, AlertCircle, Info, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const Notifications = () => {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  // Fetch real student notifications if role === 'STUDENT'
  const { data: realNotifications = [], isLoading } = useQuery({
    queryKey: ['student-notifications', user?.id],
    queryFn: async () => {
      if (user?.role === 'STUDENT') {
        const res = await apiClient.get('/students/notifications');
        return Array.isArray(res.data) ? res.data : [];
      }
      return [];
    },
    enabled: user?.role === 'STUDENT'
  });

  const [localNotifs, setLocalNotifs] = useState<any[]>([]);

  // Sync or fallback
  const notificationsList = user?.role === 'STUDENT' ? realNotifications : localNotifs;

  const markAllRead = () => {
    toast.success('Barcha xabarlar o\'qilgan deb belgilandi');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'HOMEWORK': return <BookOpen className="w-5 h-5 text-orange-500" />;
      case 'EXAM': return <FileText className="w-5 h-5 text-indigo-500" />;
      case 'ATTENDANCE': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <Bell className="w-8 h-8 mr-3 text-red-500" />
            Xabarnomalar markazi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Tizimdagi barcha muhim bildirishnomalar va xabarlar ro'yxati</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={markAllRead} 
            className="flex items-center px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-2xl shadow-sm font-bold text-sm text-slate-700 dark:text-slate-200 transition-all"
          >
            <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Barchasini o'qilgan qilish
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Xabarnomalar yuklanmoqda...</div>
        ) : notificationsList.length === 0 ? (
          <div className="text-center py-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-8">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Hozircha xabarnomalar mavjud emas</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sizda yangi bildirishnomalar kelishi bilan bu yerda ko'rinadi.</p>
          </div>
        ) : (
          notificationsList.map((notif: any) => (
            <div key={notif.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-start gap-4 transition-all hover:border-indigo-500/50">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-sm shrink-0 border border-slate-100 dark:border-slate-700">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base text-slate-800 dark:text-white">
                    {notif.title}
                  </h3>
                  <span className="text-xs font-semibold text-slate-400 whitespace-nowrap ml-4 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {new Date(notif.date).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
