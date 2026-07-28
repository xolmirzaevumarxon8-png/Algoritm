import { useState } from 'react';
import { Search, Plus, MapPin, Phone, Mail, Clock, MoreVertical, Edit, Power, Eye, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const ManagerBranches = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', managerName: '', managerPhone: '' });
  const { t } = useTranslation();

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await apiClient.get('/branches');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newBranch: any) => {
      const res = await apiClient.post('/branches', newBranch);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setIsAddModalOpen(false);
      setFormData({ name: '', address: '', managerName: '', managerPhone: '' });
      toast.success(t('manager_branches.toast_applied', { action: 'Created', branch: 'Branch' }));
    }
  });

  const handleAction = (action: string, branchName: string) => {
    toast.success(t('manager_branches.toast_applied', { action, branch: branchName }));
    setActionMenuOpen(null);
  };

  const filtered = branches.filter((b: any) => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('manager_branches.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('manager_branches.subtitle')}</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm text-sm font-medium">
          <Plus className="w-4 h-4 mr-2" />
          {t('manager_branches.create_branch')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dynamically Loaded Branches */}
        {filtered.map((branch: any) => (
          <div key={branch.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="h-48 overflow-hidden relative">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGoBiaOYKbaT08bLuXlCBapcEQwnUwgf69h5JzNEHNwA&s=10" 
                alt="Filial Rasmi" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                Filial
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{branch.name}</h3>
              <div className="flex items-start text-slate-500 dark:text-slate-400 mb-4">
                <MapPin className="w-5 h-5 mr-2 shrink-0 mt-0.5 text-blue-500" />
                <p className="leading-relaxed">{branch.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-medium">Boshqaruvchi</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">{branch.manager || 'Kiritilmagan'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-medium">Holat</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">{branch.status || 'ACTIVE'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Add Branch Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Filial Yaratish</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Power className="w-5 h-5 rotate-45" /></button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Filial nomi</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Manzili</label>
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Boshqaruvchi (Admin) Ismi</label>
                  <input required type="text" placeholder="Masalan: Ali Valiyev" value={formData.managerName} onChange={e => setFormData({...formData, managerName: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Boshqaruvchi Telefon raqami</label>
                  <input required type="text" placeholder="+998 90 123 45 67" value={formData.managerPhone} onChange={e => setFormData({...formData, managerPhone: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white" />
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

export default ManagerBranches;
