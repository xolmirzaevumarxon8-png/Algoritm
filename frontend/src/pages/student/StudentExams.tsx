import { useState, useEffect } from 'react';
import { FileText, Clock, PlayCircle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const StudentExams = () => {
  const { user } = useAuthStore();
  
  const [exams, setExams] = useState<any[]>([]);
  const [activeExam, setActiveExam] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number, total: number, is_passed: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/exams/student/${user?.id}`);
      setExams(res.data);
    } catch (error) {
      toast.error('Imtihonlarni yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = (exam: any) => {
    setActiveExam(exam);
    setIsSubmitted(false);
    setAnswers({});
    setResult(null);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < activeExam.questions.length) {
      if (!window.confirm("Siz hamma savollarga javob bermadingiz. Baribir yuborishni xohlaysizmi?")) {
        return;
      }
    }

    try {
      const answersArray = activeExam.questions.map((_: any, index: number) => answers[index] ?? -1);

      const res = await apiClient.post(`/exams/${activeExam.id}/submit`, {
        student_id: user?.id,
        answers: answersArray
      });

      setResult(res.data);
      setIsSubmitted(true);
      toast.success("Imtihon muvaffaqiyatli yakunlandi!");
      fetchExams(); // refresh to update results
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  if (activeExam && !isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/80 flex justify-between items-center sticky top-4 z-10">
          <div>
            <h1 className="text-xl font-bold dark:text-white">{activeExam.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Savollarga e'tibor bilan javob bering</p>
          </div>
          <div className="flex items-center text-red-500 font-bold bg-red-50 dark:bg-red-500/10 px-4 py-2 rounded-xl">
            <Clock className="w-5 h-5 mr-2 animate-pulse" /> {activeExam.duration} daqiqa
          </div>
        </div>

        {activeExam.questions.map((q: any, i: number) => {
          const options = JSON.parse(q.options);
          return (
            <div key={q.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/80">
              <h3 className="font-bold text-lg mb-4 dark:text-white">{i + 1}. {q.question_text}</h3>
              <div className="space-y-3">
                {options.map((opt: string, optIndex: number) => (
                  <label key={optIndex} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${answers[i] === optIndex ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:border-slate-700 dark:text-white'}`}>
                    <input type="radio" name={`q_${i}`} className="hidden" checked={answers[i] === optIndex} onChange={() => setAnswers({...answers, [i]: optIndex})} />
                    <span className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${answers[i] === optIndex ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-300 dark:border-slate-600'}`}>
                      {answers[i] === optIndex && <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
                    </span>
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex justify-end pt-4 pb-12">
          <button onClick={handleSubmit} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/10 transition-all">
            Imtihonni topshirish
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted && result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 mt-6 pb-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-800/80 p-8 text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${result.is_passed ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500' : 'bg-red-100 dark:bg-red-500/20 text-red-500'}`}>
            {result.is_passed ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
          </div>
          <h1 className="text-3xl font-bold mb-2 dark:text-white">
            {result.is_passed ? "Tabriklaymiz, siz imtihondan o'tdingiz!" : "Afsuski, siz imtihondan o'ta olmadingiz."}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Natijangiz avtomatik hisoblandi</p>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-405 uppercase tracking-wider mb-2">Imtihon natijasi</p>
            <p className={`text-5xl font-black ${result.is_passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{result.score} / {result.total}</p>
          </div>
          <button onClick={() => { setActiveExam(null); setIsSubmitted(false); }} className="w-full max-w-sm mx-auto block py-3.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-2xl font-bold transition-all">
            Dashboardga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
          <FileText className="w-8 h-8 mr-3 text-indigo-500" />
          Mening imtihonlarim
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Sizga biriktirilgan faol testlar va viktorinalarni topshiring.</p>
      </div>

      {isLoading ? (
        <div className="text-center p-8 text-slate-500">Imtihonlar yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map(exam => {
            const hasResult = exam.results && exam.results.length > 0;
            const myResult = hasResult ? exam.results[0] : null;

            return (
              <div key={exam.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 p-6 flex flex-col group hover:border-indigo-500 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold dark:text-white group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{exam.group?.name} | {exam.teacher?.user?.fullname}</p>
                  </div>
                  {!hasResult ? (
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> FAOL</span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-xs font-bold rounded-full flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> TOPSHIRILGAN</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Davomiyligi</p>
                    <p className="font-bold flex items-center dark:text-white text-sm mt-0.5"><Clock className="w-4 h-4 mr-1.5 text-indigo-500"/> {exam.duration}m</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Savollar soni</p>
                    <p className="font-bold flex items-center dark:text-white text-sm mt-0.5"><FileText className="w-4 h-4 mr-1.5 text-indigo-500"/> {exam.questions?.length} ta</p>
                  </div>
                </div>

                <div className="mt-auto">
                  {!hasResult ? (
                    <button onClick={() => handleStart(exam)} className="w-full flex items-center justify-center py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-500/5">
                      <PlayCircle className="w-5 h-5 mr-2" /> Imtihonni boshlash
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-slate-800/55 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Sizning natijangiz:</span>
                      <div className="text-right">
                        <span className={`text-base font-black ${myResult.is_passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {myResult.score} / {exam.questions?.length}
                        </span>
                        <p className={`text-[10px] font-bold ${myResult.is_passed ? 'text-emerald-500' : 'text-red-500'} uppercase tracking-wider`}>
                          {myResult.is_passed ? "O'tdi" : "Yiqildi"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {exams.length === 0 && (
            <div className="col-span-2 text-center py-12 text-slate-500 bg-slate-50/50 dark:bg-slate-850/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              Hech qanday imtihon mavjud emas.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentExams;
