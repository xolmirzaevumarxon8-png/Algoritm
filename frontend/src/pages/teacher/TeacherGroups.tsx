import { useState, useEffect } from 'react';
import { Search, Users, Calendar, Clock, Star, MoreVertical, Eye, Download, MessageSquare, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import { useSearchParams } from 'react-router-dom';

const TeacherGroups = () => {
  const [searchParams] = useSearchParams();
  const paramGroupId = searchParams.get('groupId');
  const paramTab = searchParams.get('tab') as 'students' | 'attendance' | 'homework' | null;

  const [activeGroup, setActiveGroup] = useState<string | null>(paramGroupId || null);
  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'homework'>(paramTab || 'students');
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: 'Keldi' | 'Kelmadi' | null, grade: number | '' }>>({});
  const [homeworkTopic, setHomeworkTopic] = useState('');
  const [assignedHomework, setAssignedHomework] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (paramGroupId) {
      setActiveGroup(paramGroupId);
    }
    if (paramTab) {
      setActiveTab(paramTab);
    }
  }, [paramGroupId, paramTab]);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['teacher-groups'],
    queryFn: async () => {
      const res = await apiClient.get('/groups');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const { data: activeGroupDetails, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['group', activeGroup],
    queryFn: async () => {
      if (!activeGroup) return null;
      const res = await apiClient.get(`/groups/${activeGroup}`);
      return res.data;
    },
    enabled: !!activeGroup
  });

  const students = activeGroupDetails?.student_groups?.map((sg: any) => ({
    id: sg.student.id,
    name: sg.student.fullname,
    phone: sg.student.phone,
    attendance: 100, // Replace with real stats later
    avg: 90, // Replace with real stats later
  })) || [];

  const handleAttendanceChange = (studentId: string, status: 'Keldi' | 'Kelmadi') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleGradeChange = (studentId: string, gradeStr: string) => {
    const num = parseInt(gradeStr);
    const validGrade = isNaN(num) ? '' : num > 10 ? 10 : num < 1 ? 1 : num;
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], grade: validGrade }
    }));
  };

  const attendanceMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiClient.post('/teacher/attendance', data);
    },
    onSuccess: () => {
      toast.success("Davomat va baholar muvaffaqiyatli saqlandi!");
      setAttendanceRecords({});
    },
    onError: () => toast.error("Saqlashda xatolik yuz berdi")
  });

  const homeworkMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiClient.post('/teacher/homework', data);
    },
    onSuccess: (_, variables) => {
      setAssignedHomework(variables.title);
      setHomeworkTopic('');
      toast.success("Uy vazifasi guruhga yuborildi!");
    },
    onError: () => toast.error("Uy vazifasini yuborishda xatolik yuz berdi")
  });

  const stageMutation = useMutation({
    mutationFn: async (data: { groupId: string, stage: string }) => {
      const res = await apiClient.patch(`/groups/${data.groupId}/stage`, { stage: data.stage });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', activeGroup] });
      queryClient.invalidateQueries({ queryKey: ['teacher-groups'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard-groups'] });
      toast.success("Guruh etapi muvaffaqiyatli o'zgartirildi!");
    },
    onError: () => toast.error("Etapni o'zgartirishda xatolik yuz berdi")
  });

  const saveAttendance = () => {
    if (!activeGroup) return;
    
    // Check if there's any record
    if (Object.keys(attendanceRecords).length === 0) {
      toast.error("Hech qanday o'zgarish kiritilmadi");
      return;
    }

    // Map 'Keldi' -> 'PRESENT' and 'Kelmadi' -> 'ABSENT' for DB consistency
    const mappedRecords = Object.fromEntries(
      Object.entries(attendanceRecords).map(([studentId, record]) => [
        studentId,
        {
          status: record.status === 'Keldi' ? 'PRESENT' : 'ABSENT',
          grade: record.grade
        }
      ])
    );

    attendanceMutation.mutate({
      groupId: activeGroup,
      date: new Date().toISOString(),
      attendanceRecords: mappedRecords
    });
  };

  const assignHomework = () => {
    if (!homeworkTopic.trim()) {
      toast.error("Iltimos, uy vazifasi mavzusini kiriting!");
      return;
    }
    
    if (!activeGroup) return;

    homeworkMutation.mutate({
      groupId: activeGroup,
      title: homeworkTopic
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mening guruhlarim</h1>
        <p className="text-slate-500 dark:text-slate-400">Sizga biriktirilgan guruhlar, davomat va baholashni boshqaring</p>
      </div>

      {!activeGroup ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
             <div className="col-span-full py-12 flex justify-center items-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             </div>
          ) : groups.length === 0 ? (
             <div className="col-span-full py-12 text-center text-slate-500">
               Sizga biriktirilgan guruhlar yo'q.
             </div>
          ) : groups.map((group: any) => (
            <motion.div key={group.id} whileHover={{ y: -4 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{group.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {group.courseName || (group.course && group.course.name) || 'Noma\'lum'} <span className="mx-1">•</span> <span className="font-semibold text-indigo-600 dark:text-indigo-400">Bosqich: {group.stage || 'HTML'}</span>
                  </p>
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" /> {group.scheduleSummary || 'Jadval yo\'q'}
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" /> O'rtacha reyting: TBD
                </div>
              </div>

              <button 
                onClick={() => setActiveGroup(group.id)}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl transition-all"
              >
                Sinfni boshqarish
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => { setActiveGroup(null); searchParams.delete('groupId'); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors text-sm font-medium">
                ← Orqaga
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{activeGroupDetails?.name || 'Yuklanmoqda...'}</h2>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-slate-500 mr-2">Bosqich:</span>
                  <select 
                    className="text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-600 dark:text-indigo-400"
                    value={activeGroupDetails?.stage || 'HTML'}
                    onChange={(e) => {
                      if (activeGroup) {
                        stageMutation.mutate({ groupId: activeGroup, stage: e.target.value });
                      }
                    }}
                    disabled={stageMutation.isPending}
                  >
                    <option value="HTML">HTML</option>
                    <option value="CSS">CSS</option>
                    <option value="Java Script">Java Script</option>
                    <option value="React">React</option>
                    <option value="Backend">Backend</option>
                    <option value="Finished">Tugatilgan (Finished)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setActiveTab('students')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'students' ? 'bg-white shadow dark:bg-slate-700 text-slate-800 dark:text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>O'quvchilar</button>
              <button onClick={() => setActiveTab('attendance')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'attendance' ? 'bg-white shadow dark:bg-slate-700 text-slate-800 dark:text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Davomat</button>
              <button onClick={() => setActiveTab('homework')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'homework' ? 'bg-white shadow dark:bg-slate-700 text-slate-800 dark:text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Uy vazifasi</button>
            </div>
          </div>

          <div className="p-0">
            {activeTab === 'students' && (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 text-sm dark:text-slate-400">
                    <th className="p-4 font-medium">O'quvchi</th>
                    <th className="p-4 font-medium">Telefon</th>
                    <th className="p-4 font-medium">O'rtacha bahosi</th>
                    <th className="p-4 font-medium text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoadingGroup ? (
                     <tr><td colSpan={4} className="p-4 text-center">Yuklanmoqda...</td></tr>
                  ) : students.length === 0 ? (
                     <tr><td colSpan={4} className="p-4 text-center text-slate-500">Bu guruhda o'quvchilar yo'q.</td></tr>
                  ) : students.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="p-4 font-medium text-slate-800 dark:text-white">{s.name}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">{s.phone}</td>
                      <td className="p-4 text-emerald-600 font-semibold">{s.avg}/100</td>
                      <td className="p-4 text-right">
                        <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"><MessageSquare className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'attendance' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Bugungi dars davomati</h3>
                  <button onClick={saveAttendance} disabled={attendanceMutation.isPending} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50">{attendanceMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}</button>
                </div>
                <div className="space-y-4">
                  {isLoadingGroup ? (
                     <div className="text-center py-4">Yuklanmoqda...</div>
                  ) : students.length === 0 ? (
                     <div className="text-center py-4 text-slate-500">O'quvchilar yo'q</div>
                  ) : students.map((s: any) => {
                    const record = attendanceRecords[s.id] || { status: null, grade: '' };
                    return (
                      <div key={s.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-slate-150 dark:border-slate-800 rounded-2xl gap-4 bg-slate-50/50 dark:bg-slate-900/30">
                        <span className="font-semibold text-slate-800 dark:text-white flex-1">{s.name}</span>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button 
                              onClick={() => handleAttendanceChange(s.id, 'Keldi')}
                              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${record.status === 'Keldi' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-700'}`}
                            >
                              Keldi
                            </button>
                            <button 
                              onClick={() => handleAttendanceChange(s.id, 'Kelmadi')}
                              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${record.status === 'Kelmadi' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-700'}`}
                            >
                              Kelmadi
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-500 font-medium">Baho:</span>
                            <input 
                              type="number" 
                              min="1" 
                              max="10" 
                              value={record.grade}
                              onChange={(e) => handleGradeChange(s.id, e.target.value)}
                              disabled={record.status === 'Kelmadi'}
                              placeholder="1-10"
                              className={`w-20 px-3 py-1.5 text-center text-sm font-bold border rounded-lg outline-none transition-colors ${record.status === 'Kelmadi' ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-200 focus:border-indigo-500 text-indigo-700 dark:bg-slate-900 dark:border-slate-700'}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'homework' && (
              <div className="p-6">
                {!assignedHomework ? (
                  <div className="max-w-xl mx-auto bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                    <FileText className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Yangi uy vazifasi</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Guruh uchun bugungi uy vazifasi mavzusini kiriting.</p>
                    
                    <div className="space-y-4 text-left">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mavzu nomi</label>
                        <input 
                          type="text" 
                          value={homeworkTopic}
                          onChange={(e) => setHomeworkTopic(e.target.value)}
                          placeholder="Masalan: If/else shart operatorlari bo'yicha amaliyot"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                        />
                      </div>
                      <button 
                        onClick={assignHomework}
                        disabled={homeworkMutation.isPending}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                      >
                        {homeworkMutation.isPending ? 'Yuborilmoqda...' : 'Vazifani yuborish'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-xl mx-auto bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Uy vazifasi yuborildi!</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      Guruhdagi barcha talabalarga bildirishnoma yuborildi.
                    </p>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 mb-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Berilgan mavzu:</p>
                      <p className="font-bold text-slate-800 dark:text-white">{assignedHomework}</p>
                    </div>
                    <button 
                      onClick={() => setAssignedHomework(null)}
                      className="px-6 py-2 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                    >
                      Boshqa vazifa berish
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherGroups;
