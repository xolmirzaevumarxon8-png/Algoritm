import { useState } from 'react';
import { Folder, FileText, Download, Plus, Search, Trash2, FileArchive, Image, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const mockMaterials: any[] = [];

const Materials = () => {
  const { user } = useAuthStore();
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const [materials, setMaterials] = useState(mockMaterials);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
    toast.success('Material deleted');
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'PDF': return <FileText className="w-8 h-8 text-red-500" />;
      case 'DOC': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'VIDEO': return <Video className="w-8 h-8 text-purple-500" />;
      case 'IMAGE': return <Image className="w-8 h-8 text-emerald-500" />;
      default: return <FileArchive className="w-8 h-8 text-slate-500 dark:text-slate-400" />;
    }
  };

  const filteredMaterials = materials.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <Folder className="w-8 h-8 mr-3 text-emerald-500" />
            Course Materials
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Access lecture notes, presentations, and resources.</p>
        </div>
        {isTeacher && (
          <button className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors font-medium">
            <Plus className="w-5 h-5 mr-2" /> Upload Material
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" placeholder="Search materials..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMaterials.map(m => (
          <div key={m.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 hover:shadow-md transition-shadow group flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                {getIcon(m.type)}
              </div>
              {isTeacher && (
                <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4"/>
                </button>
              )}
            </div>
            
            <h3 className="font-bold text-slate-800 dark:text-white leading-tight mb-2 line-clamp-2">{m.title}</h3>
            <p className="text-xs text-slate-500 mb-6 dark:text-slate-400">{m.course}</p>
            
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-400">{m.size} • {m.date}</span>
              <button className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors">
                <Download className="w-5 h-5"/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Materials;
