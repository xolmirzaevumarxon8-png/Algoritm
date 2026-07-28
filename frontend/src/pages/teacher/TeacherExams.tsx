import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Edit, Trash2, Clock, Users, BookOpen, CheckCircle, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/axios';
import { useTranslation } from 'react-i18next';

const TeacherExams = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [exams, setExams] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentExam, setCurrentExam] = useState<any>(null);
  
  // New Exam Form
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [groupId, setGroupId] = useState('');
  
  // Questions Form
  const [questions, setQuestions] = useState([{ question_text: '', options: ['', '', '', ''], correct_index: 0 }]);

  useEffect(() => {
    fetchExams();
    fetchGroups();
  }, []);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/exams/teacher');
      setExams(res.data);
    } catch (error) {
      toast.error('Imtihonlarni yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await apiClient.get('/groups');
      const teacherGroups = res.data;
      setGroups(teacherGroups);
      if (teacherGroups.length > 0) setGroupId(teacherGroups[0].id);
    } catch (error) {
      console.error(error);
    }
  };

  const addQuestion = () => {
    if (questions.length >= 20) {
      toast.error("Maksimal 20 ta savol qo'shish mumkin!");
      return;
    }
    setQuestions([...questions, { question_text: '', options: ['', '', '', ''], correct_index: 0 }]);
  };

  const removeQuestion = (index: number) => {
    const newQ = [...questions];
    newQ.splice(index, 1);
    setQuestions(newQ);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQ = [...questions];
    if (field === 'question_text') newQ[index].question_text = value;
    if (field === 'correct_index') newQ[index].correct_index = value;
    if (field.startsWith('option_')) {
      const optIndex = parseInt(field.split('_')[1]);
      newQ[index].options[optIndex] = value;
    }
    setQuestions(newQ);
  };

  const handleCreateExam = async () => {
    if (!title) return toast.error("Imtihon nomi kiritilishi shart");
    if (questions.some(q => !q.question_text || q.options.some(o => !o))) {
      return toast.error("Barcha savollar va variantlar to'ldirilishi shart");
    }

    try {
      await apiClient.post('/exams', {
        title,
        duration,
        group_id: groupId,
        questions
      });
      toast.success("Imtihon muvaffaqiyatli yaratildi!");
      setIsModalOpen(false);
      setIsQuestionsModalOpen(false);
      resetForm();
      fetchExams();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Imtihon yaratishda xatolik yuz berdi");
    }
  };

  const resetForm = () => {
    setTitle('');
    setDuration(60);
    setQuestions([{ question_text: '', options: ['', '', '', ''], correct_index: 0 }]);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Haqiqatan ham bu imtihonni o'chirib tashlamoqchimisiz? Undan olingan natijalar ham o'chib ketadi.")) return;
    try {
      await apiClient.delete(`/exams/${id}`);
      toast.success("Imtihon muvaffaqiyatli o'chirildi!");
      fetchExams();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Imtihonni o'chirishda xatolik yuz berdi");
    }
  };

  const filteredExams = exams.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <FileText className="w-8 h-8 mr-3 text-indigo-500" />
            Imtihonlar boshqaruvi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Testlar, viktorinalar va yakuniy imtihonlarni yaratish hamda boshqarish</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" /> Imtihon yaratish
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" placeholder="Imtihonlarni qidirish..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8 text-slate-500">Imtihonlar yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map(exam => (
            <div key={exam.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 hover:border-indigo-500 transition-all duration-300 group hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${exam.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                  {exam.status === 'ACTIVE' ? 'FAOL' : exam.status}
                </span>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(exam.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{exam.title}</h3>
              <p className="text-sm text-slate-500 flex items-center dark:text-slate-400"><BookOpen className="w-4 h-4 mr-1.5 text-indigo-500"/> Guruh: {exam.group?.name}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                  <Clock className="w-4 h-4 mr-2 text-indigo-500"/> {exam.duration} daqiqa
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                  <FileText className="w-4 h-4 mr-2 text-indigo-500"/> {exam.questions?.length} ta savol
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 col-span-2">
                  <Users className="w-4 h-4 mr-2 text-indigo-500"/> {exam.results?.length} ta o'quvchi topshirdi
                </div>
              </div>
            </div>
          ))}
          {filteredExams.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-500 bg-slate-50/50 dark:bg-slate-850/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              Imtihonlar topilmadi.
            </div>
          )}
        </div>
      )}

      {/* Step 1: Create Exam Details */}
      {isModalOpen && !isQuestionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Yangi imtihon yaratish</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Imtihon nomi</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500" placeholder="Masalan: Midterm Test" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Davomiyligi (daqiqa)</label>
                  <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full mt-1 p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500" placeholder="60" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Guruhni tanlang</label>
                  <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full mt-1 p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-semibold">
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium dark:text-slate-300">Bekor qilish</button>
              <button onClick={() => { 
                if(!title) return toast.error('Imtihon nomi kiritilishi shart'); 
                if(!groupId) return toast.error('Guruh tanlanishi shart');
                setIsQuestionsModalOpen(true); 
              }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium">Keyingisi: Savollar qo'shish</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Add Questions */}
      {isQuestionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                Savollar qo'shish ({questions.length}/20)
              </h2>
              <button onClick={() => setIsQuestionsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 relative">
                  <div className="absolute top-4 right-4">
                    <button onClick={() => removeQuestion(qIndex)} disabled={questions.length === 1} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded disabled:opacity-50"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Savol {qIndex + 1}</h3>
                  <textarea 
                    value={q.question_text}
                    onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 mb-3 focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Savol matnini kiriting..." rows={2} 
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`correct_${qIndex}`} 
                          checked={q.correct_index === optIndex} 
                          onChange={() => updateQuestion(qIndex, 'correct_index', optIndex)}
                          className="w-4 h-4 text-indigo-605"
                        />
                        <input 
                          type="text" 
                          value={opt}
                          onChange={(e) => updateQuestion(qIndex, `option_${optIndex}`, e.target.value)}
                          className={`w-full p-2 border rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 ${q.correct_index === optIndex ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700'}`} 
                          placeholder={`Variant ${String.fromCharCode(65 + optIndex)}`} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {questions.length < 20 && (
                <button onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-indigo-650 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center font-medium">
                  <Plus className="w-5 h-5 mr-2" /> Keyingi savolni qo'shish
                </button>
              )}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => { setIsQuestionsModalOpen(false); setIsModalOpen(true); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl font-medium">Orqaga</button>
              <button onClick={handleCreateExam} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium flex items-center">
                <Save className="w-5 h-5 mr-2"/> Imtihonni nashr etish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherExams;
