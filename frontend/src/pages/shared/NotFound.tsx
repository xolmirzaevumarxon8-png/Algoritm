import { Link } from 'react-router-dom';
import { Map, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8 inline-block">
          <Map className="w-32 h-32 text-slate-200 dark:text-slate-800 absolute -top-8 -left-8 -z-10 transform -rotate-12" />
          <h1 className="text-8xl font-black text-slate-800 dark:text-white tracking-tighter shadow-sm">404</h1>
        </div>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">Page Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30"
        >
          <Home className="w-5 h-5 mr-2" /> Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
