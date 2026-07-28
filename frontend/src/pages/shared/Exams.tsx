import { useState } from 'react';
import { FileText, Plus, Search, Edit, Trash2, Clock, Users, BookOpen, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const mockExams: any[] = [];

const Exams = () => {
  const { user } = useAuthStore();
  const [exams, setExams] = useState(mockExams);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    setExams(exams.filter(e => e.id !== id));
    toast.success('Exam deleted');
  };

  const filteredExams = exams.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <FileText className="w-8 h-8 mr-3 text-indigo-500" />
            Exam Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create and manage tests, quizzes, and final exams</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" /> Create Exam
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" placeholder="Search exams..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map(exam => (
          <div key={exam.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 hover:border-indigo-500 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${exam.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                {exam.status}
              </span>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-blue-500 hover:bg-blue-50 p-1.5 rounded"><Edit className="w-4 h-4"/></button>
                <button onClick={() => handleDelete(exam.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{exam.title}</h3>
            <p className="text-sm text-slate-500 flex items-center dark:text-slate-400"><BookOpen className="w-4 h-4 mr-1.5"/> {exam.course}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 mr-2 text-indigo-500"/> {exam.duration} mins
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                <FileText className="w-4 h-4 mr-2 text-indigo-500"/> {exam.questions} Qs
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                <Users className="w-4 h-4 mr-2 text-indigo-500"/> {exam.group}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">Scheduled: {exam.date}</span>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Manage Questions</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Create New Exam</h2>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Exam Title</label><input type="text" className="w-full mt-1 p-2 border rounded-xl outline-none" placeholder="e.g. Midterm Test" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Duration (mins)</label><input type="number" className="w-full mt-1 p-2 border rounded-xl outline-none" placeholder="60" /></div>
                <div><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Target Group</label><input type="text" className="w-full mt-1 p-2 border rounded-xl outline-none" placeholder="JS-101" /></div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium dark:text-slate-300">Cancel</button>
              <button onClick={() => { setIsModalOpen(false); toast.success('Exam drafted'); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium">Save Draft</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
