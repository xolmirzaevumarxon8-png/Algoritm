import React, { useState } from 'react';
import { UserCheck, Search, Plus, Filter, MoreVertical, Edit, Trash2, X, Star, Users, Phone, Mail, Award, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '../../api/axios';

// Zod schema for Teacher validation
const teacherSchema = z.object({
  firstName: z.string().min(2, "Ism kamida 2 ta harfdan iborat bo'lishi kerak"),
  lastName: z.string().min(2, "Familiya kamida 2 ta harfdan iborat bo'lishi kerak"),
  phone: z.string().regex(/^\+998\d{9}$/, "Telefon raqami +998XXXXXXXXX formatida bo'lishi lozim"),
  email: z.string().email("Yaroqli email kiriting").optional().or(z.literal('')),
  subject: z.string().min(1, "Yo'nalishni tanlang"),
  salary: z.number().min(0, "Oylik manfiy bo'lishi mumkin emas"),
});
type TeacherFormValues = z.infer<typeof teacherSchema>;

const Teachers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { salary: 3000000 }
  });

  // Fetch Teachers
  const { data: teachers = [], isLoading: loading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await apiClient.get('/teachers');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newTeacher: any) => {
      const res = await apiClient.post('/teachers', newTeacher);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['teachers'], (old: any[]) => [data, ...old]);
      setIsAddModalOpen(false);
      reset();
      toast.success("Teacher created successfully!");
    },
    onError: () => toast.error("Failed to create teacher")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/teachers/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['teachers'], (old: any[]) => old.filter(t => t.id !== id));
      setIsDeleteModalOpen(false);
      setSelectedTeacherId(null);
      toast.success("Teacher removed successfully!");
    },
    onError: () => toast.error("Failed to delete teacher")
  });

  const onSubmit = (data: TeacherFormValues) => {
    // Tizimda teacher yaratilganda, uning paroli telefon raqami oxirgi 4 tasi bo'lishi kerak.
    const newTeacher = {
      fullname: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      email: data.email,
      salaryPerStudent: data.salary,
      // branchId va boshqa fieldlar ham ulanishi mumkin
      isActive: true
    };
    createMutation.mutate(newTeacher);
  };

  const handleDelete = () => {
    if (selectedTeacherId) {
      deleteMutation.mutate(selectedTeacherId);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await apiClient.get('/teachers/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'oqituvchilar.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Export qilishda xatolik yuz berdi');
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Fayl yuklanmoqda...');
    try {
      const res = await apiClient.post('/teachers/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message, { id: toastId });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Import qilishda xatolik yuz berdi', { id: toastId });
    }
    e.target.value = ''; // Reset input
  };

  const filteredTeachers = teachers.filter(t => {
    const name = t.user?.fullname || t.firstName || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Statistics
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.is_active || t.status === 'ACTIVE').length;
  const avgRating = '4.5'; // Har bir o'qituvchini rating jadvalidan olish kerak

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50 flex items-center">
            <UserCheck className="w-8 h-8 mr-3 text-blue-500" />
            Teachers & KPI Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage teacher profiles, workloads, and performance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors shadow-sm font-medium cursor-pointer">
            <span>Excel Import</span>
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
          </label>
          <button 
            onClick={handleExportExcel}
            className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-colors font-medium text-sm"
          >
            Excel Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors font-medium text-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex items-center shadow-sm">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mr-4">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Teachers</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-50">{totalTeachers}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex items-center shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mr-4">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Instructors</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-50">{activeTeachers}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex items-center shadow-sm">
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mr-4">
            <Star className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Rating</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-50">{avgRating} <span className="text-sm text-slate-400 font-normal">/ 5.0</span></h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" placeholder="Search by name..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Filter className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          <select 
            value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            <option value="ALL">All Subjects</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
          </select>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center items-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
             No teachers found matching your criteria.
          </div>
        ) : (
          filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => setActionMenuOpen(actionMenuOpen === teacher.id ? null : teacher.id)}
                  className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-sm border border-slate-200 dark:border-slate-600"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {actionMenuOpen === teacher.id && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-10 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2">
                      <button className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"><Edit className="w-4 h-4 mr-2"/> Edit</button>
                      <button onClick={() => { setSelectedTeacherId(teacher.id); setIsDeleteModalOpen(true); setActionMenuOpen(null); }} className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800"><Trash2 className="w-4 h-4 mr-2"/> Delete</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                    {(teacher.user?.fullname || teacher.firstName || 'T')[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{teacher.user?.fullname || teacher.firstName}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                      <Award className="w-3.5 h-3.5 mr-1" /> {teacher.subject || 'O\'qituvchi'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Active Groups</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{teacher.groups?.length || 0}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Salary / St</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{teacher.salary_per_student || 0} UZS</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                    <Phone className="w-4 h-4 mr-3 text-slate-400" /> {teacher.user?.phone || teacher.phone}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 mr-3 text-slate-400" /> {teacher.user?.email || teacher.email || 'Email yo\'q'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center ${
                    (teacher.is_active || teacher.status === 'ACTIVE') ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {(teacher.is_active || teacher.status === 'ACTIVE') ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <div className="flex items-center text-amber-500 font-bold text-sm bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 mr-1 fill-current" /> {teacher.rating || 0}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Teacher Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-transparent dark:border-slate-700 my-8">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50">Add New Teacher</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-6 h-6"/></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
                    <Camera className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">First Name</label>
                    <input {...register('firstName')} type="text" className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Name</label>
                    <input {...register('lastName')} type="text" className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Phone</label>
                    <input {...register('phone')} type="text" className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email Address</label>
                    <input {...register('email')} type="email" className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Subject/Specialty</label>
                    <select {...register('subject')} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Subject</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                    </select>
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Base Salary (UZS)</label>
                    <input {...register('salary', { valueAsNumber: true })} type="number" className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary.message}</p>}
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors font-medium">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors font-medium flex items-center">
                    {isSubmitting ? 'Saving...' : 'Save Teacher Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center border border-transparent dark:border-slate-700">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50 mb-2">Delete Teacher?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Are you sure you want to remove this instructor? Their assigned groups will need new teachers.</p>
              <div className="flex space-x-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium">Cancel</button>
                <button onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl shadow-sm font-medium">
                  {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teachers;
