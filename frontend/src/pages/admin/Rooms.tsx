import { useState } from 'react';
import { Search, Plus, MoreVertical, Edit, Trash2, X, Building2, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const Rooms = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', capacity: '', branch_id: ''
  });

  const { data: rooms = [], isLoading: loading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await apiClient.get('/rooms');
      return res.data;
    }
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await apiClient.get('/branches');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newRoom: any) => {
      const res = await apiClient.post('/rooms', newRoom);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsAddModalOpen(false);
      toast.success("Xona muvaffaqiyatli qo'shildi!");
      setFormData({name: '', capacity: '', branch_id: ''});
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {id: string, room: any}) => {
      const res = await apiClient.put(`/rooms/${data.id}`, data.room);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsEditModalOpen(false);
      setSelectedRoom(null);
      toast.success("Xona ma'lumotlari yangilandi!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/rooms/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsDeleteModalOpen(false);
      setSelectedRoom(null);
      toast.success("Xona o'chirildi!");
    }
  });

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.capacity && Number(formData.capacity) < 0) {
      toast.error("Xona sig'imi manfiy bo'lishi mumkin emas");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.capacity && Number(formData.capacity) < 0) {
      toast.error("Xona sig'imi manfiy bo'lishi mumkin emas");
      return;
    }
    if (selectedRoom) {
      updateMutation.mutate({ id: selectedRoom.id, room: formData });
    }
  };

  const handleDelete = () => {
    if (selectedRoom) {
      deleteMutation.mutate(selectedRoom.id);
    }
  };

  const openEditModal = (room: any) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity?.toString() || '',
      branch_id: room.branch_id
    });
    setIsEditModalOpen(true);
    setActionMenuOpen(null);
  };

  const filteredRooms = rooms.filter((r: any) => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-blue-500" />
            Xonalar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">O'quv markazidagi barcha xonalar va ularning sig'imini boshqaring</p>
        </div>
        <button 
          onClick={() => {
            setFormData({name: '', capacity: '', branch_id: branches.length > 0 ? branches[0].id : ''});
            setIsAddModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yangi Xona
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" placeholder="Xona nomi bo'yicha qidirish..." 
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
                <th className="p-4 font-medium">Xona Nomi</th>
                <th className="p-4 font-medium">Filial</th>
                <th className="p-4 font-medium">Sig'imi</th>
                <th className="p-4 font-medium">Guruhlar Soni</th>
                <th className="p-4 font-medium text-right">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Yuklanmoqda...</td></tr>
              ) : filteredRooms.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">Xonalar topilmadi.</td></tr>
              ) : (
                filteredRooms.map((room: any) => (
                  <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-white">{room.name}</p>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">
                      {room.branch?.name || 'Biriktirilmagan'}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                      {room.capacity ? `${room.capacity} ta o'quvchi` : "Noma'lum"}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                      {room._count?.groups || 0}
                    </td>
                    <td className="p-4 text-right relative">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => navigate(`/admin/rooms/${room.id}`)}
                          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg transition-colors flex items-center"
                        >
                          <Calendar className="w-4 h-4 mr-1.5" /> Jadval
                        </button>
                        <button onClick={() => setActionMenuOpen(actionMenuOpen === room.id ? null : room.id)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {actionMenuOpen === room.id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-4 top-12 z-10 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2">
                            <button onClick={() => openEditModal(room)} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"><Edit className="w-4 h-4 mr-2"/> Tahrirlash</button>
                            <button onClick={() => { setSelectedRoom(room); setIsDeleteModalOpen(true); setActionMenuOpen(null); }} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800"><Trash2 className="w-4 h-4 mr-2"/> O'chirish</button>
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

      {/* Add Room Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Yangi Xona Qo'shish</h2>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
              </div>
              <form onSubmit={handleCreateRoom} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Xona Nomi</label>
                  <input required type="text" placeholder="Masalan: 1-Xona" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
                {user?.role !== 'ADMIN' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Filial</label>
                    <select value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                      <option value="" disabled>Filialni tanlang</option>
                      {branches.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Sig'imi (O'quvchilar soni)</label>
                  <input type="number" placeholder="Masalan: 20" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium dark:text-slate-300">Bekor qilish</button>
                  <button type="submit" disabled={createMutation.isPending} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm font-medium">
                    {createMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Room Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Xonani Tahrirlash</h2>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
              </div>
              <form onSubmit={handleUpdateRoom} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Xona Nomi</label>
                  <input required type="text" placeholder="Masalan: 1-Xona" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
                {user?.role !== 'ADMIN' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Filial</label>
                    <select value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                      <option value="" disabled>Filialni tanlang</option>
                      {branches.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Sig'imi (O'quvchilar soni)</label>
                  <input type="number" placeholder="Masalan: 20" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium dark:text-slate-300">Bekor qilish</button>
                  <button type="submit" disabled={updateMutation.isPending} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm font-medium">
                    {updateMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
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
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8" /></div>
              <h2 className="text-xl font-bold mb-2 dark:text-white">Xonani o'chirish?</h2>
              <p className="text-slate-500 text-sm mb-6 dark:text-slate-400">Rostdan ham bu xonani o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</p>
              <div className="flex space-x-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl font-medium dark:text-slate-300">Bekor qilish</button>
                <button onClick={handleDelete} disabled={deleteMutation.isPending} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-medium">
                  {deleteMutation.isPending ? 'O\'chirilmoqda...' : 'Ha, O\'chirish'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Rooms;
