import { useEffect, useState } from 'react';
import { Search, User, FileText, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const CommandPalette = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, setIsOpen]);

  const actions = [
    { name: 'Dashboard', icon: User, path: '/' },
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Reports', icon: FileText, path: '/reports' },
  ];

  const filteredActions = query === '' 
    ? actions 
    : actions.filter((action) => action.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed inset-x-4 top-20 z-50 mx-auto max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                className="flex-1 px-4 py-1 bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {filteredActions.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm dark:text-slate-400">No results found.</div>
              ) : (
                filteredActions.map((action) => (
                  <button
                    key={action.name}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    onClick={() => {
                      navigate(action.path);
                      setIsOpen(false);
                    }}
                  >
                    <action.icon className="w-5 h-5 mr-3 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{action.name}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
