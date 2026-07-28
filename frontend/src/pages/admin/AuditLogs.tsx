import { useState } from 'react';
import { History, Search, Calendar, User, Info, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const actionColors: Record<string, string> = {
  'CREATE': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'UPDATE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'DELETE': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'EXPORT': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'IMPORT': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

const actionLabels: Record<string, string> = {
  'CREATE': 'Yaratildi',
  'UPDATE': 'Tahrirlandi',
  'DELETE': 'Arxivlandi',
  'EXPORT': 'Eksport',
  'IMPORT': 'Import',
};

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const res = await apiClient.get('/audit');
      return res.data;
    }
  });

  const filteredLogs = logs.filter((log: any) => 
    log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <History className="w-8 h-8 mr-3 text-blue-500" />
            Harakatlar Tarixi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Tizimdagi barcha o'zgarishlar va muhim amallar qaydi</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" placeholder="Qidirish (Xodim, Amal, Tafsilot)..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 text-sm dark:text-slate-400">
                <th className="p-4 font-medium">Sana & Vaqt</th>
                <th className="p-4 font-medium">Xodim</th>
                <th className="p-4 font-medium">Amal turi</th>
                <th className="p-4 font-medium">Obyekt</th>
                <th className="p-4 font-medium">Tafsilot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Yuklanmoqda...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Tarix topilmadi.</td></tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        {new Date(log.date).toLocaleString('uz-UZ')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">{log.user}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{log.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                      {log.target}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">
                      <div className="flex items-center">
                        <Info className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                        <span>{log.details || '-'}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
