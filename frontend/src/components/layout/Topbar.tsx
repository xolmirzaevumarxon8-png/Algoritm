import { useEffect, useState, useRef } from 'react';
import { Menu, Bell, User as UserIcon, Search, MessageSquare, Globe, BookOpen, FileText, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

interface TopbarProps {
  toggleSidebar: () => void;
  user: any;
}

const Topbar = ({ toggleSidebar, user }: TopbarProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const rolePrefix = user?.role ? `/${user.role.toLowerCase()}` : '/login';

  const toggleLanguage = () => {
    const newLang = i18n.language === 'uz' ? 'en' : 'uz';
    i18n.changeLanguage(newLang);
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch student notifications if role === 'STUDENT'
  const { data: notifications = [] } = useQuery({
    queryKey: ['topbar-notifications', user?.id],
    queryFn: async () => {
      if (user?.role === 'STUDENT') {
        const res = await apiClient.get('/students/notifications');
        return Array.isArray(res.data) ? res.data : [];
      }
      return [];
    },
    enabled: user?.role === 'STUDENT'
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'HOMEWORK': return <BookOpen className="w-4 h-4 text-orange-500" />;
      case 'EXAM': return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'ATTENDANCE': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-4 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden transition-colors dark:text-slate-400"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden sm:flex items-center max-w-md w-full relative">
          <Search className="w-5 h-5 absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('topbar.search_placeholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-6">
        {/* Language Switcher */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Globe className="w-4 h-4" />
          {i18n.language === 'uz' ? 'UZ' : 'EN'}
        </button>

        <button 
          onClick={() => navigate(`${rolePrefix}/messages`)}
          title={t('topbar.messages')}
          className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-slate-400"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        {/* Bell Icon & Notification Dropdown Popover */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title={t('topbar.notifications')}
            className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-slate-400"
          >
            <Bell className="w-6 h-6" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center">
                  <Bell className="w-4 h-4 mr-2 text-red-500" />
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">Xabarnomalar</h4>
                  {notifications.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-extrabold rounded-full">
                      {notifications.length} yangi
                    </span>
                  )}
                </div>
              </div>

              <div className="py-2 max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">
                    Yangi xabarnomalar mavjud emas
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif: any) => (
                    <div key={notif.id} className="p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-start gap-3 border border-slate-100/60 dark:border-slate-800/60">
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 shrink-0">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-slate-800 dark:text-white truncate">{notif.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                          {new Date(notif.date).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate(`${rolePrefix}/notifications`);
                  }}
                  className="w-full py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  Barchasini ko'rish &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center pl-3 sm:pl-6 border-l border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`${rolePrefix}/settings`)} title={t('topbar.settings')}>
          <div className="hidden sm:block text-right mr-3">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{user?.fullname || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Foydalanuvchi'}</p>
            <p className="text-xs text-slate-500 font-medium dark:text-slate-400">
              {user?.role === 'ADMIN' && user?.branchName ? `${user.role} (${user.branchName})` : (user?.role || '')}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white dark:border-slate-800">
            <UserIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
