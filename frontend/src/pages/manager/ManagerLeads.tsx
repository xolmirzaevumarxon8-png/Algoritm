import { useState } from 'react';
import { Users, Plus, Phone, Search, Edit, Trash2, CheckCircle, AlertCircle, Clock, MapPin, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select } from '../../components/ui/Select';

const mockLeads = [
  { id: '1', name: 'Aziz Rahmatov', phone: '+998 90 123 45 67', course: 'Python Data Science', source: 'Instagram', comment: 'Wants evening classes', status: 'NEW', date: '2026-07-20' },
  { id: '2', name: 'Malika Karimova', phone: '+998 93 987 65 43', course: 'Frontend Web', source: 'Word of Mouth', comment: 'Has basic HTML knowledge', status: 'CONTACTED', date: '2026-07-19' },
  { id: '3', name: 'Bobur Aliyev', phone: '+998 99 111 22 33', course: 'Backend Node.js', source: 'Facebook', comment: 'Scheduled trial', status: 'TRIAL', date: '2026-07-18' },
];

const STATUSES = ['NEW', 'CONTACTED', 'TRIAL', 'REGISTERED', 'REJECTED'];

const ManagerLeads = () => {
  const [leads, setLeads] = useState(mockLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-full">NEW</span>;
      case 'CONTACTED': return <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full">CONTACTED</span>;
      case 'TRIAL': return <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold text-xs rounded-full">TRIAL LESSON</span>;
      case 'REGISTERED': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">REGISTERED</span>;
      case 'REJECTED': return <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full">REJECTED</span>;
      default: return null;
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (filterStatus === 'ALL' || l.status === filterStatus)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <Briefcase className="w-8 h-8 mr-3 text-indigo-500" />
            CRM Lead Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track prospective students and manage trial conversions</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors font-medium">
          <Plus className="w-5 h-5 mr-2" /> Create Lead
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STATUSES.map(s => (
          <div key={s} onClick={() => setFilterStatus(s)} className={`p-4 rounded-xl border cursor-pointer transition-colors ${filterStatus === s ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-100 hover:border-indigo-100'}`}>
            <p className="text-xs font-bold text-slate-500 mb-1 dark:text-slate-400">{s}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{leads.filter(l => l.status === s).length}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" placeholder="Search by name or phone..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none"
          />
        </div>
        {filterStatus !== 'ALL' && (
          <button onClick={() => setFilterStatus('ALL')} className="text-sm font-medium text-indigo-600">Clear Filters</button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 text-sm dark:text-slate-400">
                <th className="p-4 font-medium">Lead Info</th>
                <th className="p-4 font-medium">Target Course</th>
                <th className="p-4 font-medium">Source / Date</th>
                <th className="p-4 font-medium">Pipeline Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800 dark:text-white">{lead.name}</p>
                    <p className="text-sm text-slate-500 flex items-center mt-1 dark:text-slate-400"><Phone className="w-3 h-3 mr-1"/> {lead.phone}</p>
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{lead.course}</td>
                  <td className="p-4">
                    <p className="text-sm text-slate-700 font-medium dark:text-slate-200">{lead.source}</p>
                    <p className="text-xs text-slate-400">{lead.date}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(lead.status)}
                      <Select 
                        value={lead.status}
                        onChange={(val) => {
                          setLeads(leads.map(l => l.id === lead.id ? { ...l, status: val } : l));
                          toast.success('Lead status updated!');
                        }}
                        options={STATUSES.map(s => ({ value: s, label: s }))}
                        className="w-32"
                      />
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"><Phone className="w-4 h-4"/></button>
                      <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerLeads;
