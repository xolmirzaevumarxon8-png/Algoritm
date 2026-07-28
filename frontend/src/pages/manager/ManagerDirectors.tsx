import { useState } from 'react';
import { Search, Plus, ShieldAlert, Key, UserX, Check, Edit, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const ManagerDirectors = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullname: '', phone: '' });

  const { data: directors = [], isLoading } = useQuery({
    queryKey: ['directors'],
    queryFn: async () => {
      const res = await apiClient.get('/directors');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newDirector: any) => {
      const res = await apiClient.post('/directors', newDirector);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directors'] });
      setIsAddModalOpen(false);
      setFormData({ fullname: '', phone: '' });
      toast.success('Direktor muvaffaqiyatli yaratildi!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/directors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directors'] });
      toast.success('Direktor muvaffaqiyatli o\'chirildi!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, phone }: { id: string, phone: string }) => {
      const res = await apiClient.put(`/directors/${id}`, { phone });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directors'] });
      toast.success('Telefon raqam o\'zgartirildi va yangi parol o\'rnatildi!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  });

  const filtered = directors.filter((d: any) => d.fullname.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAction = (action: string, director: any) => {
    if (action === 'delete') {
      if (window.confirm(`${director.fullname} ismli direktorni o'chirishga ishonchingiz komilmi?`)) {
        deleteMutation.mutate(director.id);
      }
    } else if (action === 'reset') {
      const newPhone = window.prompt(`${director.fullname} uchun yangi telefon raqamini kiriting:\n(Ushbu raqamning oxirgi 4 tasi yangi parol bo'ladi)`);
      if (newPhone) {
        resetPasswordMutation.mutate({ id: director.id, phone: newPhone });
      }
    }
    setActionMenuOpen(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Direktorlar (Directors)</h1>
          <p className="text-slate-500 dark:text-slate-400">O'quv markaz direktorlarini tizimga qo'shish va boshqarish</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm text-sm font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Yangi Direktor
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Direktorlarni izlash..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                <th className="p-4 font-medium">Direktor</th>
                <th className="p-4 font-medium">Telefon</th>
                <th className="p-4 font-medium">Holati</th>
                <th className="p-4 font-medium text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Yuklanmoqda...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Direktorlar topilmadi.</td></tr>
              ) : filtered.map((director: any) => (
                <tr key={director.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800 dark:text-white">{director.fullname}</p>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {director.phone}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      FAOL
                    </span>
                  </td>
                  <td className="p-4 text-right relative">
                    <button 
                      onClick={() => setActionMenuOpen(actionMenuOpen === director.id ? null : director.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    <AnimatePresence>
                      {actionMenuOpen === director.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-8 top-10 z-10 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 overflow-hidden"
                        >
                          <button onClick={() => handleAction('reset', director)} className="w-full flex items-center px-4 py-2 text-sm text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <Key className="w-4 h-4 mr-2" /> Parolni tiklash
                          </button>
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                          <button onClick={() => handleAction('delete', director)} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <UserX className="w-4 h-4 mr-2" /> Direktorni o'chirish
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Director Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Yangi Direktor Qo'shish</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Check className="w-5 h-5 rotate-45" /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ism Familiya</label>
                  <input required type="text" placeholder="Masalan: Murodjon" value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefon raqam</label>
                  <input required type="text" placeholder="+998901234567" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white" />
                  <p className="text-xs text-slate-500 mt-1">Parol avtomatik telefon raqam oxirgi 4 tasi bo'ladi</p>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium dark:text-slate-300">Bekor qilish</button>
                  <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm font-medium">
                    {createMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
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

export default ManagerDirectors;
