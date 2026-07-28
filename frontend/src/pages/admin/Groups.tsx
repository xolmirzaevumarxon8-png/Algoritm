import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreVertical, Edit, Trash2, X, Users, Calendar, MapPin, CheckCircle, AlertCircle, Filter, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Select } from '../../components/ui/Select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const Groups = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', courseId: '', teacherId: '', startDate: '', room: '', days: 'Dushanba, Chorshanba, Juma', startTime: '12:00', endTime: '14:00', maxStudents: 15
  });

  // Modalni ochish uchun wrapper
  const openAddModal = () => {
    setFormData(prev => ({ ...prev, name: '' }));
    setIsAddModalOpen(true);
  };

  const { data: groups = [], isLoading: loading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await apiClient.get('/groups');
      return res.data;
    }
  });

  // Fetch real courses
  const { data: coursesData = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await apiClient.get('/courses');
      return res.data;
    }
  });

  // Fetch real teachers
  const { data: teachersData = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await apiClient.get('/teachers');
      return res.data;
    }
  });

  const courseOptions = [
    { value: '', label: 'Select Course...' },
    ...coursesData.map((c: any) => ({ value: c.id, label: c.name }))
  ];

  const teacherOptions = [
    { value: '', label: 'Select Teacher...' },
    ...teachersData.map((t: any) => ({ value: t.id, label: t.user?.fullname || t.fullname || 'Unknown Teacher' }))
  ];

  const createMutation = useMutation({
    mutationFn: async (newGroup: any) => {
      const res = await apiClient.post('/groups', newGroup);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsAddModalOpen(false);
      toast.success("Group created successfully!");
      setFormData(prev => ({ ...prev, name: '', courseId: '', teacherId: '', room: '' }));
    }
  });

  const handleStartTimeChange = (val: string) => {
    if (!val) return;
    const [hours, minutes] = val.split(':').map(Number);
    const endHours = (hours + 2) % 24;
    const endHoursStr = String(endHours).padStart(2, '0');
    const endMinutesStr = String(minutes).padStart(2, '0');
    const calculatedEndTime = `${endHoursStr}:${endMinutesStr}`;
    setFormData(prev => ({
      ...prev,
      startTime: val,
      endTime: calculatedEndTime
    }));
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Iltimos, guruh nomini kiriting!");
      return;
    }
    if (!formData.courseId) {
      toast.error("Iltimos, kursni tanlang!");
      return;
    }
    if (!formData.teacherId) {
      toast.error("Iltimos, o'qituvchini tanlang!");
      return;
    }
    if (!formData.room.trim()) {
      toast.error("Iltimos, xona raqamini kiriting!");
      return;
    }
    if (!formData.days) {
      toast.error("Iltimos, haftalik kunlarni tanlang!");
      return;
    }
    if (!formData.startTime) {
      toast.error("Iltimos, dars boshlanish vaqtini kiriting!");
      return;
    }
    if (!formData.endTime) {
      toast.error("Iltimos, dars tugash vaqtini kiriting!");
      return;
    }
    createMutation.mutate(formData);
  };

  const filteredGroups = groups.filter((g: any) => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-500" />
            Groups Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage active groups, teachers, and schedules</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Group
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" placeholder="Search groups..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 text-sm dark:text-slate-400">
                <th className="p-4 font-medium">Group Name & Course</th>
                <th className="p-4 font-medium">Teacher</th>
                <th className="p-4 font-medium">Students</th>
                <th className="p-4 font-medium">Schedule</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">Loading groups...</td></tr>
              ) : (
                filteredGroups.map((group: any) => (
                  <tr key={group.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-white">{group.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{group.course?.name || group.course}</p>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {group.teacher?.user?.fullname || group.teacher?.fullname || group.teacher || 'Unassigned'}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="font-bold text-slate-800 dark:text-white">{group.studentCount}</span> / {group.maxStudents}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400"/> {group.schedule}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full w-max flex items-center ${
                        group.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {group.status}
                      </span>
                    </td>
                    <td className="p-4 text-right relative">
                      <button onClick={() => setActionMenuOpen(actionMenuOpen === group.id ? null : group.id)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <AnimatePresence>
                        {actionMenuOpen === group.id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-8 top-10 z-10 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2">
                            <button onClick={() => navigate(`/admin/groups/${group.id}`)} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200"><Eye className="w-4 h-4 mr-2"/> Group Details</button>
                            <button className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200"><Edit className="w-4 h-4 mr-2"/> Edit Group</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Group Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create Group</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
              </div>
              <form onSubmit={handleCreateGroup} className="p-6 grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Group Name</label>
                  <input required type="text" placeholder="e.g. JS-101" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Course</label>
                  <Select 
                    value={formData.courseId} 
                    onChange={val => setFormData({...formData, courseId: val})} 
                    options={courseOptions} 
                  />
                </div>
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Teacher</label>
                  <Select 
                    value={formData.teacherId} 
                    onChange={val => setFormData({...formData, teacherId: val})} 
                    options={teacherOptions} 
                  />
                </div>
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Room Number</label>
                  <input required type="text" placeholder="e.g. Room 404" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Days of Week</label>
                  <Select 
                    value={formData.days} 
                    onChange={val => setFormData({...formData, days: val})} 
                    options={[
                      { value: 'Dushanba, Chorshanba, Juma', label: 'Toq kunlar' },
                      { value: 'Seshanba, Payshanba, Shanba', label: 'Juft kunlar' }
                    ]} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Start Time</label>
                  <input required type="time" value={formData.startTime} onChange={e => handleStartTimeChange(e.target.value)} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">End Time</label>
                  <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="col-span-2 mt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium dark:text-slate-300">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm font-medium">
                    {createMutation.isPending ? 'Saving...' : 'Save Group'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Groups;
