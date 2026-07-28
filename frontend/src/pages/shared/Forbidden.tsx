import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center border border-red-100 dark:border-red-900/30">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">403</h1>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          You don't have the required permissions to view this page. If you believe this is a mistake, please contact your administrator.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-md"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
