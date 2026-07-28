import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Users, BookOpen, Settings, LayoutDashboard, Building2, UserCheck, BarChart3, ShieldCheck, CreditCard, Calendar, Cpu, LogOut, CheckCircle, Briefcase, FileText, Folder, DollarSign } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return [
          { name: 'Super Admin Portal', path: '/super-admin', icon: ShieldCheck },
          { name: t('sidebar.dashboard'), path: '/admin', icon: Home },
          { name: t('sidebar.branches'), path: '/manager/branches', icon: Building2 },
          { name: t('sidebar.admins'), path: '/admin/admins', icon: UserCheck },
          { name: t('sidebar.cashiers'), path: '/admin/cashiers', icon: CreditCard },
          { name: t('sidebar.finance'), path: '/finance/payments', icon: DollarSign },
          { name: t('sidebar.reports'), path: '/admin/reports', icon: BarChart3 },
          { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
        ];
      case 'DIRECTOR':
        return [
          { name: t('sidebar.dashboard'), path: '/director', icon: Home },
          { name: t('sidebar.branches'), path: '/manager/branches', icon: Building2 },
          { name: t('sidebar.rooms'), path: '/admin/rooms', icon: Building2 },
          { name: t('sidebar.finance'), path: '/finance/payments', icon: CreditCard },
          { name: t('sidebar.reports'), path: '/admin/reports', icon: BarChart3 },
          { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
        ];
      case 'ADMIN':
        return [
          { name: t('sidebar.dashboard'), path: '/admin', icon: Home },
          { name: t('sidebar.courses'), path: '/admin/courses', icon: BookOpen },
          { name: t('sidebar.groups'), path: '/admin/groups', icon: Users },
          { name: t('sidebar.rooms'), path: '/admin/rooms', icon: Building2 },
          { name: t('sidebar.students'), path: '/admin/students', icon: Users },
          { name: t('sidebar.teachers'), path: '/admin/teachers', icon: UserCheck },
          { name: t('sidebar.exams'), path: '/admin/exams', icon: FileText },
          { name: t('sidebar.schedule'), path: '/admin/schedule', icon: Calendar },
          { name: t('sidebar.reports'), path: '/admin/reports', icon: BarChart3 },
          { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
        ];
      case 'CASHIER':
        return [
          { name: t('sidebar.dashboard'), path: '/finance', icon: Home },
          { name: 'To\'lovlar va Kassa', path: '/finance/payments', icon: CreditCard },
          { name: t('sidebar.reports'), path: '/finance/reports', icon: BarChart3 },
        ];
      case 'CALL_CENTER':
        return [
          { name: t('sidebar.dashboard'), path: '/call-center', icon: Home },
          { name: t('sidebar.crm_leads'), path: '/call-center/leads', icon: Briefcase },
        ];
      case 'TEACHER':
        return [
          { name: t('sidebar.dashboard'), path: '/teacher', icon: Home },
          { name: t('sidebar.my_groups'), path: '/teacher/groups', icon: Users },
          { name: t('sidebar.schedule'), path: '/teacher/schedule', icon: Calendar },
          { name: t('sidebar.exams'), path: '/teacher/exams', icon: FileText },
          { name: t('sidebar.materials'), path: '/teacher/materials', icon: Folder },
          { name: t('sidebar.ai_assistant'), path: '/teacher/ai', icon: Cpu },
        ];
      case 'PARENT':
        return [
          { name: t('sidebar.dashboard'), path: '/parent', icon: Home },
          { name: t('sidebar.academic_progress'), path: '/parent/academic', icon: BarChart3 },
          { name: t('sidebar.payments'), path: '/parent/payments', icon: CreditCard },
          { name: t('sidebar.ai_insights'), path: '/parent/ai', icon: Cpu },
        ];
      case 'STUDENT':
        return [
          { name: t('sidebar.dashboard'), path: '/student', icon: Home },
          { name: 'Dars jadvali', path: '/student/schedule', icon: Calendar },
          { name: t('sidebar.attendance'), path: '/student/attendance', icon: CheckCircle },
          { name: t('sidebar.my_exams'), path: '/student/exams', icon: FileText },
          { name: t('sidebar.my_homework'), path: '/student/homework', icon: BookOpen },
          { name: 'To\'lovlarim', path: '/student/payments', icon: CreditCard },
          { name: t('sidebar.materials'), path: '/student/materials', icon: Folder },
        ];
      default:
        return [{ name: t('sidebar.dashboard'), icon: Home, path: '/' }];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-20 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-blue-400">Algoritm IT</h1>
        </div>

        <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto pb-20">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <div
                key={link.name}
                onClick={() => {
                  navigate(link.path);
                  setIsOpen(false);
                }}
                className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <link.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="font-medium">{link.name}</span>
              </div>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
