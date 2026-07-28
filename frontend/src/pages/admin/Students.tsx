import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, X, Eye, CheckCircle, AlertCircle, Camera, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';

const Students = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('ALL');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [newGroupId, setNewGroupId] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', email: '', 
    birthDate: '', gender: 'Male', address: '', parentPhone: '',
    courseId: '', groupId: ''
  });

  // React Query: Fetch Students
  const { data: students = [], isLoading: loading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await apiClient.get('/students');
      return res.data;
    }
  });

  // React Query: Fetch Groups
  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await apiClient.get('/groups');
      return res.data;
    }
  });

  // React Query: Fetch Courses
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await apiClient.get('/courses');
      return res.data;
    }
  });

  // React Query: Create Student Mutation
  const createMutation = useMutation({
    mutationFn: async (newStudent: any) => {
      const res = await apiClient.post('/students', newStudent);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsAddModalOpen(false);
      toast.success("Student created successfully!");
      setFormData({firstName: '', lastName: '', phone: '', email: '', birthDate: '', gender: 'Male', address: '', parentPhone: '', courseId: '', groupId: ''});
    },
    onError: () => toast.error("Failed to create student")
  });

  // React Query: Delete Student Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/students/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsDeleteModalOpen(false);
      setSelectedStudentId(null);
      toast.success("Student removed successfully!");
    },
    onError: () => toast.error("Failed to delete student")
  });

  // React Query: Transfer Student Mutation
  const transferMutation = useMutation({
    mutationFn: async ({id, groupId}: {id: string, groupId: string}) => {
      await apiClient.put(`/students/${id}/transfer`, { groupId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsTransferModalOpen(false);
      setSelectedStudentId(null);
      setNewGroupId('');
      toast.success("Student transferred to new group successfully!");
    },
    onError: () => toast.error("Failed to transfer student")
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 12) {
      toast.error("Telefon raqamini to'liq kiriting (+998XXXXXXXXX)");
      return;
    }

    if (formData.parentPhone) {
      const cleanParent = formData.parentPhone.replace(/\D/g, '');
      if (cleanParent.length < 12) {
        toast.error("Ota-ona telefon raqamini to'liq kiriting (+998XXXXXXXXX)");
        return;
      }
    }

    const newStudent = {
      fullname: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
      birthday: formData.birthDate || null,
      gender: formData.gender,
      groupId: formData.groupId || null,
      parentPhone: formData.parentPhone || null,
    };
    createMutation.mutate(newStudent);
  };

  const handleExportExcel = async () => {
    try {
      const response = await apiClient.get('/students/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'oquvchilar.xlsx');
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
      const res = await apiClient.post('/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message, { id: toastId });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Import qilishda xatolik yuz berdi', { id: toastId });
    }
    e.target.value = ''; // Reset input
  };

  const handleDelete = () => {
    if (selectedStudentId) {
      deleteMutation.mutate(selectedStudentId);
    }
  };

  const filteredStudents = students.filter((s: any) => {
    const nameMatch = s.fullname 
      ? s.fullname.toLowerCase().includes(searchTerm.toLowerCase())
      : (s.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (s.lastName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const courseMatch = filterCourse === 'ALL' || (s.course && s.course.includes(filterCourse));
    return nameMatch && courseMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">Student Management</h1>
          <p className="text-slate-500 dark:text-slate-400">View, add, edit, and archive students</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors shadow-sm font-medium cursor-pointer">
            <span className="flex items-center">
              Excel Import
            </span>
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
          </label>
          <button 
            onClick={handleExportExcel}
            className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors shadow-sm font-medium"
          >
            Excel Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-64">
          <Select 
            value={filterCourse}
            onChange={(val) => setFilterCourse(val)}
            options={[
              { value: 'ALL', label: 'All Courses' },
              { value: 'JavaScript', label: 'JavaScript' },
              { value: 'Python', label: 'Python' }
            ]}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                <th className="p-4 font-medium whitespace-nowrap">ID / Student</th>
                <th className="p-4 font-medium whitespace-nowrap">Contact Info</th>
                <th className="p-4 font-medium whitespace-nowrap">Course / Group</th>
                <th className="p-4 font-medium whitespace-nowrap">Payment Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                          {student.fullname ? student.fullname.substring(0, 2).toUpperCase() : `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{student.fullname || `${student.firstName} ${student.lastName}`}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">ID: STU-{String(student.id).padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-800 dark:text-slate-200">{student.phone}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{student.course}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{student.group}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center w-max ${
                        student.paymentStatus === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {student.paymentStatus === 'PAID' ? <CheckCircle className="w-3 h-3 mr-1"/> : <AlertCircle className="w-3 h-3 mr-1"/>}
                        {student.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => navigate(`/admin/students/${student.id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toast.success('Edit modal opening...')}
                          className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 bg-slate-50 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedStudentId(student.id); setSelectedStudentName(student.fullname || `${student.firstName} ${student.lastName}`); setIsTransferModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                          title="Transfer Group"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedStudentId(student.id); setIsDeleteModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl border border-transparent dark:border-slate-700"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50">Add New Student</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-6 h-6"/></button>
              </div>
              <form onSubmit={handleCreateStudent} className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Camera className="w-8 h-8" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Input required maskType="none" label="First Name" type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Input required maskType="none" label="Last Name" type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Input required maskType="phone" label="Phone" type="text" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Input maskType="phone" label="Parent Phone" type="text" value={formData.parentPhone} onChange={(e: any) => setFormData({...formData, parentPhone: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course</label>
                    <Select value={formData.courseId} onChange={val => setFormData({...formData, courseId: val})} options={[
                      { value: '', label: 'Select Course' },
                      ...courses.map((c: any) => ({ value: c.id, label: c.name }))
                    ]} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Group</label>
                    <Select value={formData.groupId} onChange={val => setFormData({...formData, groupId: val})} options={[
                      { value: '', label: 'Select Group' },
                      ...groups.map((g: any) => ({ value: g.id, label: g.name }))
                    ]} />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors font-medium">{createMutation.isPending ? 'Saving...' : 'Save Student'}</button>
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
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center border border-transparent dark:border-slate-700"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50 mb-2">Delete Student?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Are you sure you want to completely remove this student? This action cannot be undone and will erase their attendance and payment records.</p>
              <div className="flex space-x-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">Cancel</button>
                <button onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors font-medium">{deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transfer Group Modal */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm border border-transparent dark:border-slate-700"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-50">Transfer Student</h2>
                <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select a new group for <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudentName}</span>. They will be removed from their current group.</p>
                <Select 
                  value={newGroupId} 
                  onChange={val => setNewGroupId(val)} 
                  options={[
                    { value: '', label: 'Select New Group' },
                    ...groups.map((g: any) => ({ value: g.id, label: g.name }))
                  ]} 
                />
                <div className="mt-6 flex space-x-3">
                  <button onClick={() => setIsTransferModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">Cancel</button>
                  <button 
                    onClick={() => {
                      if (selectedStudentId && newGroupId) {
                        transferMutation.mutate({ id: selectedStudentId, groupId: newGroupId });
                      } else {
                        toast.error("Please select a group");
                      }
                    }} 
                    disabled={transferMutation.isPending} 
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors font-medium"
                  >
                    {transferMutation.isPending ? 'Saving...' : 'Transfer'}
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

export default Students;
