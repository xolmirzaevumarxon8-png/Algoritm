import { useState } from 'react';
import { BookOpen, Clock, CheckCircle, Upload, FileText, AlertCircle, ExternalLink, Send, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const StudentHomework = () => {
  const [activeTask, setActiveTask] = useState<any>(null);
  const [solutionUrl, setSolutionUrl] = useState('');
  const [solutionNotes, setSolutionNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: homeworks = [], isLoading } = useQuery({
    queryKey: ['student-homeworks'],
    queryFn: async () => {
      const res = await apiClient.get('/students/homework');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { homeworkId: string, solutionUrl: string, content: string }) => {
      const res = await apiClient.post(`/students/homework/${data.homeworkId}/submit`, {
        solutionUrl: data.solutionUrl,
        content: data.content
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Uy vazifasi muvaffaqiyatli topshirildi!");
      queryClient.invalidateQueries({ queryKey: ['student-homeworks'] });
      setActiveTask(null);
      setSolutionUrl('');
      setSolutionNotes('');
    },
    onError: () => {
      toast.error("Vazifani topshirishda xatolik yuz berdi");
    }
  });

  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionUrl.trim() && !solutionNotes.trim()) {
      toast.error("Iltimos, havolani yoki javob izohini kiriting");
      return;
    }
    if (activeTask) {
      submitMutation.mutate({
        homeworkId: activeTask.id,
        solutionUrl,
        content: solutionNotes
      });
    }
  };

  const openTaskModal = (hw: any) => {
    setActiveTask(hw);
    const existingSub = hw.submissions?.[0];
    if (existingSub) {
      setSolutionUrl(existingSub.solution_url || '');
      setSolutionNotes(existingSub.content || '');
    } else {
      setSolutionUrl('');
      setSolutionNotes('');
    }
  };

  if (activeTask) {
    const existingSub = activeTask.submissions?.[0];
    const isSubmitted = !!existingSub;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => setActiveTask(null)} className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 transition-colors">&larr; Ro'yxatga qaytish</button>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800/80">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold dark:text-white">{activeTask.title}</h1>
              <p className="text-slate-500 flex items-center mt-2 dark:text-slate-400 text-xs font-semibold">
                <Clock className="w-4 h-4 mr-1 text-slate-400"/> Berilgan sana: {new Date(activeTask.created_at).toLocaleDateString('uz-UZ')}
              </p>
            </div>
            {isSubmitted && (
              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5" /> TOPSHIRILGAN
              </span>
            )}
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl mb-8 border border-slate-200/40 dark:border-slate-800/40">
            <h3 className="font-bold mb-2 dark:text-white">Vazifa tavsifi</h3>
            <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-300">
              {activeTask.description || "O'qituvchi qo'shimcha izoh qoldirmagan."}
            </p>
          </div>
          
          {/* Submission Form or Result */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
              <Upload className="w-5 h-5 mr-2 text-orange-500" />
              {isSubmitted ? "Topshirilgan javobingiz" : "Vazifa javobini topshirish"}
            </h3>

            {isSubmitted && (
              <div className="bg-emerald-500/5 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-500/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Topshirilgan sana:</span>
                  <span className="text-xs text-slate-500 font-semibold">{new Date(existingSub.submitted_at).toLocaleDateString('uz-UZ')}</span>
                </div>
                {existingSub.solution_url && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Yechim havolasi:</p>
                    <a href={existingSub.solution_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                      <ExternalLink className="w-4 h-4 mr-1.5" /> {existingSub.solution_url}
                    </a>
                  </div>
                )}
                {existingSub.content && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Izoh / Yechim matni:</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{existingSub.content}</p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmitSolution} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Yechim havolasi (GitHub, Figma yoki Google Drive link):</label>
                <input
                  type="url"
                  value={solutionUrl}
                  onChange={(e) => setSolutionUrl(e.target.value)}
                  placeholder="https://github.com/username/project..."
                  className="w-full mt-1.5 p-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Izoh yoki tayyor ish matni:</label>
                <textarea
                  rows={3}
                  value={solutionNotes}
                  onChange={(e) => setSolutionNotes(e.target.value)}
                  placeholder="Vazifa bo'yicha izoh qoldiring..."
                  className="w-full mt-1.5 p-3.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitMutation.isPending ? 'Topshirilmoqda...' : isSubmitted ? 'Javobni yangilash' : 'Vazifani topshirish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
          <BookOpen className="w-8 h-8 mr-3 text-orange-500" />
          Mening uy vazifalarim
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Sizga biriktirilgan barcha topshiriqlarni ko'ring va tayyor yechimingizni topshiring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : homeworks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-850/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            Hozircha uy vazifalari mavjud emas.
          </div>
        ) : homeworks.map((hw: any) => {
          const isSubmitted = hw.submissions && hw.submissions.length > 0;

          return (
            <div key={hw.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/55 dark:border-slate-800/80 p-6 flex flex-col group hover:border-orange-500 transition-all duration-300 hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full">{hw.group?.name || 'Guruh'}</span>
                {isSubmitted ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-xs rounded-full flex items-center w-max">
                    <CheckCircle className="w-3 h-3 mr-1"/> TOPSHIRILGAN
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full flex items-center w-max">
                    <AlertCircle className="w-3 h-3 mr-1"/> YANGI
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold mb-4 dark:text-white group-hover:text-orange-500 transition-colors">{hw.title}</h3>
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-slate-500 flex items-center dark:text-slate-400">
                    <Clock className="w-4 h-4 mr-1.5 text-orange-500"/> {new Date(hw.created_at).toLocaleDateString('uz-UZ')}
                  </div>
                  <button onClick={() => openTaskModal(hw)} className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
                    {isSubmitted ? 'Ko\'rish & Edit' : 'Topshirish &rarr;'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentHomework;
