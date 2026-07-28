import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Edit, Trash2, X, BookOpen, Clock, Tag, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const Courses = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', duration: '', price: '', image: '', status: 'ACTIVE'
  });

  const { data: courses = [], isLoading: loading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await apiClient.get('/courses');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newCourse: any) => {
      const res = await apiClient.post('/courses', newCourse);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsAddModalOpen(false);
      toast.success("Course created successfully!");
      setFormData({name: '', duration: '', price: '', image: '', status: 'ACTIVE'});
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/courses/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsDeleteModalOpen(false);
      setSelectedCourseId(null);
      toast.success("Course deleted successfully!");
    }
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      price: Number(formData.price)
    });
  };

  const handleDelete = () => {
    if (selectedCourseId) {
      deleteMutation.mutate(selectedCourseId);
    }
  };

  const filteredCourses = courses.filter((c: any) => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-blue-500" />
            Courses Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage curriculum, pricing, and status</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Course
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" placeholder="Search courses..." 
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
                <th className="p-4 font-medium">Course Details</th>
                <th className="p-4 font-medium">Duration</th>
                <th className="p-4 font-medium">Groups</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">Loading courses...</td></tr>
              ) : filteredCourses.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500 dark:text-slate-400">No courses found.</td></tr>
              ) : (
                filteredCourses.map((course: any) => (
                  <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-white">{course.name}</p>
                    </td>
                    <td className="p-4 flex items-center text-slate-600 dark:text-slate-300 text-sm"><Clock className="w-4 h-4 mr-2 text-slate-400"/> {course.duration_month ? `${course.duration_month} months` : 'N/A'}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{course.groupCount || 0}</td>
                    <td className="p-4 text-right relative">
                      <button onClick={() => setActionMenuOpen(actionMenuOpen === course.id ? null : course.id)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <AnimatePresence>
                        {actionMenuOpen === course.id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-8 top-10 z-10 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2">
                            <button className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200"><Edit className="w-4 h-4 mr-2"/> Edit</button>
                            <button onClick={() => { setSelectedCourseId(course.id); setIsDeleteModalOpen(true); setActionMenuOpen(null); }} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-slate-50"><Trash2 className="w-4 h-4 mr-2"/> Delete</button>
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

      {/* Add Course Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create Course</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
              </div>
              <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Course Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Duration</label>
                    <input required type="text" placeholder="e.g. 6 Months" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Price (UZS)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium dark:text-slate-300">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm font-medium">
                    {createMutation.isPending ? 'Saving...' : 'Save Course'}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8" /></div>
              <h2 className="text-xl font-bold mb-2">Delete Course?</h2>
              <p className="text-slate-500 text-sm mb-6 dark:text-slate-400">Are you sure? This course will be permanently removed.</p>
              <div className="flex space-x-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 border rounded-xl font-medium">Cancel</button>
                <button onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-medium">
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

export default Courses;
