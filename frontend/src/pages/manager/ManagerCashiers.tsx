import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import { Plus, Trash2, Shield, MapPin, Loader2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

interface Branch {
  id: string;
  name: string;
}

interface Cashier {
  id: string;
  fullname: string;
  phone: string;
  branches_managed: Branch[];
}

const ManagerCashiers = () => {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [branchId, setBranchId] = useState('');

  const { data: cashiers = [], isLoading } = useQuery({
    queryKey: ['cashiers'],
    queryFn: async () => {
      const res = await apiClient.get('/cashiers');
      return res.data as Cashier[];
    }
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await apiClient.get('/branches');
      return res.data as Branch[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: { fullname: string, phone: string, branchId: string }) => {
      return await apiClient.post('/cashiers', data);
    },
    onSuccess: () => {
      toast.success('Kassir muvaffaqiyatli qo\'shildi!');
      queryClient.invalidateQueries({ queryKey: ['cashiers'] });
      setIsAddModalOpen(false);
      setFullname('');
      setPhone('');
      setBranchId('');
    },
    onError: () => toast.error('Kassir qo\'shishda xatolik yuz berdi')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/cashiers/${id}`);
    },
    onSuccess: () => {
      toast.success('Kassir o\'chirildi!');
      queryClient.invalidateQueries({ queryKey: ['cashiers'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ fullname, phone, branchId });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-emerald-500" />
            Kassirlarni Boshqarish
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Filiallar uchun kassirlar qo'shish va ularni filialga biriktirish</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Kassir qo'shish
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yuklanmoqda...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                  <th className="p-4 font-medium">Ism Familiya</th>
                  <th className="p-4 font-medium">Telefon</th>
                  <th className="p-4 font-medium">Biriktirilgan Filial</th>
                  <th className="p-4 font-medium text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cashiers.map((cashier) => (
                  <tr key={cashier.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{cashier.fullname}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <span className="flex items-center"><Phone className="w-4 h-4 mr-2 text-slate-400" /> {cashier.phone}</span>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <span className="flex items-center bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full w-max text-sm font-medium">
                        <MapPin className="w-4 h-4 mr-1" /> {cashier.branches_managed?.[0]?.name || 'Biriktirilmagan'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                          if (window.confirm("Rostdan ham ushbu kassirni o'chirmoqchimisiz?")) {
                            deleteMutation.mutate(cashier.id);
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                ))}
                {cashiers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">Hech qanday kassir topilmadi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Yangi Kassir Qo'shish</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">To'liq ismi</label>
                <input 
                  type="text" 
                  value={fullname}
                  onChange={e => setFullname(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefon raqami</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+998"
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filialni tanlang</label>
                <select 
                  value={branchId}
                  onChange={e => setBranchId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" 
                  required
                >
                  <option value="">Filial tanlang...</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium">Bekor qilish</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium disabled:opacity-50">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerCashiers;
