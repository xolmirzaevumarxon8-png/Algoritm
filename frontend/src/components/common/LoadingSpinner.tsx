import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading module...</p>
    </div>
  );
};

export default LoadingSpinner;
