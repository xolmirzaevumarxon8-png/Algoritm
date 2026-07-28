import { BarChart3 } from 'lucide-react';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
          <BarChart3 className="w-8 h-8 mr-3 text-blue-500" />
          Analytics & Reports
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Generate deep academic and financial reports</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <p className="text-slate-500 dark:text-slate-400">Reports module interface will go here.</p>
      </div>
    </div>
  );
};

export default Reports;
