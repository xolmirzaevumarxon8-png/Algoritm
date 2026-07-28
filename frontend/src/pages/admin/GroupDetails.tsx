import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Clock, MapPin, UserCheck, Plus, UserMinus, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const weekdaysUz = ["", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // 1. Fetch Group Details
  const { data: group, isLoading } = useQuery({
    queryKey: ['group-details', id],
    queryFn: async () => {
      const res = await apiClient.get(`/groups/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  // 2. Fetch All Students (for assignment select list)
  const { data: allStudents = [] } = useQuery({
    queryKey: ['all-students-select'],
    queryFn: async () => {
      const res = await apiClient.get('/students');
      return res.data;
    },
    enabled: isAssignModalOpen
  });

  // 3. Assign Student Mutation
  const assignMutation = useMutation({
    mutationFn: async (studentId: string) => {
      await apiClient.post(`/groups/${id}/students`, { studentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-details', id] });
      setIsAssignModalOpen(false);
      setSelectedStudentId('');
      toast.success("O'quvchi guruhga biriktirildi!");
    },
    onError: () => toast.error("O'quvchini biriktirishda xatolik yuz berdi")
  });

  // 4. Remove Student Mutation
  const removeMutation = useMutation({
    mutationFn: async (studentId: string) => {
      await apiClient.delete(`/groups/${id}/students/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-details', id] });
      toast.success("O'quvchi guruhdan o'chirildi!");
    },
    onError: () => toast.error("O'quvchini o'chirishda xatolik yuz berdi")
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Guruh ma'lumotlari yuklanmoqda...</div>;
  }

  if (!group) {
    return <div className="p-8 text-center text-slate-500">Guruh topilmadi.</div>;
  }

  // Formatting schedules
  const scheduleDays = group.schedules?.map((s: any) => weekdaysUz[s.weekday]).join(', ') || 'Belgilanmagan';
  const scheduleTime = group.schedules?.[0] 
    ? `${new Date(group.schedules[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} - ${new Date(group.schedules[0].end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}`
    : 'Belgilanmagan';

  const studentsList = group.student_groups || [];

  // Filter students who are not already in this group
  const assignableStudents = allStudents.filter((s: any) => 
    !studentsList.some((sg: any) => sg.student_id === s.id)
  );

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/groups')} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400">
        <ArrowLeft className="w-4 h-4 mr-1" /> Guruhlarga qaytish
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{group.name}</h1>
            <p className="text-slate-500 text-sm mt-1 dark:text-slate-400">{group.course?.name || 'Kurs nomi kiritilmagan'}</p>
          </div>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${group.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
            {group.status || 'INACTIVE'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <UserCheck className="w-5 h-5 mr-3 text-blue-500" />
            <div>
              <p className="text-xs text-slate-400">O'qituvchi</p>
              <p className="font-semibold text-slate-800 dark:text-slate-50">{group.teacher?.user?.fullname || 'Biriktirilmagan'}</p>
            </div>
          </div>
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <Calendar className="w-5 h-5 mr-3 text-blue-500" />
            <div>
              <p className="text-xs text-slate-400">Kunlar</p>
              <p className="font-semibold text-slate-800 dark:text-slate-50">{scheduleDays}</p>
            </div>
          </div>
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <Clock className="w-5 h-5 mr-3 text-blue-500" />
            <div>
              <p className="text-xs text-slate-400">Dars vaqti</p>
              <p className="font-semibold text-slate-800 dark:text-slate-50">{scheduleTime}</p>
            </div>
          </div>
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <MapPin className="w-5 h-5 mr-3 text-blue-500" />
            <div>
              <p className="text-xs text-slate-400">Dars xonasi</p>
              <p className="font-semibold text-slate-800 dark:text-slate-50">{group.room?.name || 'Biriktirilmagan'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-50">Guruh o'quvchilari ({studentsList.length})</h3>
          <button 
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> O'quvchi biriktirish
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 text-sm dark:text-slate-400">
                <th className="pb-3 font-medium">O'quvchi ismi</th>
                <th className="pb-3 font-medium">Telefon raqami</th>
                <th className="pb-3 font-medium text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {studentsList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500 dark:text-slate-400">Guruhda hali o'quvchilar yo'q.</td>
                </tr>
              ) : (
                studentsList.map((sg: any) => (
                  <tr key={sg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-50">{sg.student?.fullname}</td>
                    <td className="py-3 text-sm text-slate-500 dark:text-slate-400">{sg.student?.phone || '-'}</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => {
                          if(confirm("Rostdan ham ushbu o'quvchini guruhdan chiqarmoqchimisiz?")) {
                            removeMutation.mutate(sg.student_id);
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Guruhdan o'chirish"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Student Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-transparent dark:border-slate-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">O'quvchini guruhga biriktirish</h2>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">O'quvchini tanlang</label>
                  <select 
                    value={selectedStudentId} 
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="">-- O'quvchini tanlang --</option>
                    {assignableStudents.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.fullname}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">Bekor qilish</button>
                  <button 
                    onClick={() => {
                      if (selectedStudentId) {
                        assignMutation.mutate(selectedStudentId);
                      } else {
                        toast.error("Iltimos, o'quvchini tanlang");
                      }
                    }} 
                    disabled={assignMutation.isPending}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors font-medium"
                  >
                    {assignMutation.isPending ? 'Biriktirilmoqda...' : 'Biriktirish'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupDetails;
