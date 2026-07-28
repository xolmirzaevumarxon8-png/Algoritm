import { useState, useEffect } from 'react';
import { CreditCard, UploadCloud, CheckCircle, Clock, FileText, Download, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { usePaymentStore } from '../../store/paymentStore';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const ParentPayments = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  
  const { data: children = [], isLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: async () => {
      const res = await apiClient.get('/students/parent/children');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const res = await apiClient.get('/branches');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const [selectedBranch, setSelectedBranch] = useState<string>('');

  // Set initial selected student
  useEffect(() => {
    if (children.length > 0 && !selectedStudent) {
      // Prefer fullname if available, otherwise name
      const childName = children[0].fullname || children[0].name;
      if (childName) setSelectedStudent(childName);
    }
  }, [children, selectedStudent]);

  const { receipts, uploadReceipt } = usePaymentStore();
  const myReceipts = receipts.filter(r => r.studentName === selectedStudent);
  const latestReceipt = myReceipts[0];

  const handleUpload = () => {
    if (!file) {
      toast.error("Iltimos, avval chek rasmini yuklang");
      return;
    }
    if (!selectedBranch) {
      toast.error("Iltimos, filialni tanlang");
      return;
    }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error("Iltimos, faqat rasm (JPG, PNG) yoki PDF yuklang!");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setTimeout(() => {
        uploadReceipt({
          studentName: selectedStudent,
          amount: '720,000 UZS',
          month: 'July 2026',
          fileName: file.name,
          fileData: base64,
          branchId: selectedBranch
        });
        toast.success("Chek yuborildi! Admin tasdig'i kutilmoqda.");
        setIsUploading(false);
        setFile(null);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">To'lovlar (Tuition Payments)</h1>
          <p className="text-slate-500 dark:text-slate-400">Oylik to'lovlarni amalga oshiring va cheklarni yuklang</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Farzandni tanlang:</label>
          <select 
            value={selectedStudent} 
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 dark:text-slate-100"
          >
            {isLoading ? <option>Yuklanmoqda...</option> : null}
            {children.map((child: any) => (
              <option key={child.id} value={child.fullname || child.name}>{child.fullname || child.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Card & Payment Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-lg font-bold">O'quv Markazi Filiali</h2>
              <CreditCard className="w-8 h-8 opacity-80" />
            </div>
            <div className="relative z-10">
              <p className="text-blue-100 text-xs uppercase tracking-widest mb-1">Karta Raqami</p>
              <h3 className="text-2xl font-mono tracking-widest mb-6">**** **** **** ****</h3>
              <div className="flex justify-between">
                <div>
                  <p className="text-blue-100 text-xs uppercase tracking-widest mb-1">Karta Egasi</p>
                  <p className="font-medium">O'QUV MARKAZI</p>
                </div>
                <div>
                  <p className="text-blue-100 text-xs uppercase tracking-widest mb-1">Bank</p>
                  <p className="font-medium">Bank nomi</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Joriy To'lov Holati</h3>
            
            {latestReceipt && latestReceipt.status === 'PENDING' ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center">
                <Clock className="w-6 h-6 text-amber-500 mr-3" />
                <div>
                  <p className="font-bold text-amber-800 dark:text-amber-500">Kutilmoqda (Pending)</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Admin tasdig'i kutilmoqda. Tasdiqlangach to'lov yopiladi.</p>
                </div>
              </div>
            ) : latestReceipt && latestReceipt.status === 'PAID' ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-500 mr-3" />
                <div>
                  <p className="font-bold text-emerald-800 dark:text-emerald-500">To'lov qabul qilindi</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">Keyingi to'lov: <b>{latestReceipt.nextPaymentDate}</b> (30 kundan keyin)</p>
                </div>
              </div>
            ) : (
               <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                <div>
                  <p className="font-bold text-red-800 dark:text-red-500">To'lov qilinmagan!</p>
                  <p className="text-sm text-red-600 dark:text-red-400">Iltimos chekni yuklang.</p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800 mt-4">
              <span className="text-slate-500 dark:text-slate-400">O'quvchi</span>
              <span className="font-medium text-slate-800 dark:text-white">{selectedStudent}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Oy</span>
              <span className="font-medium text-slate-800 dark:text-white">July 2026</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-500 dark:text-slate-400">Summa</span>
              <span className="text-xl font-bold text-slate-800 dark:text-white">720,000 UZS</span>
            </div>
          </div>
        </div>

        {/* Upload Receipt */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Chek yuklash (Upload Receipt)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Bank ilovasidan olingan chekni skrinshot qilib shu yerga yuklang.</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filialni tanlang</label>
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Filialni tanlang --</option>
              {branches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 mb-6">
            <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rasm tanlash uchun bosing</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Support PDF, JPG, PNG (Max 5MB)</p>
            <input 
              type="file" 
              accept=".pdf,image/*" 
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-800 mb-6 text-sm">
              <div className="flex items-center truncate">
                <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate max-w-[200px]">{file.name}</span>
              </div>
              <button onClick={() => setFile(null)} className="text-blue-500 hover:text-blue-700">O'chirish</button>
            </div>
          )}

          <button 
            onClick={handleUpload}
            disabled={isUploading || (latestReceipt?.status === 'PENDING')}
            className={`w-full py-3 rounded-xl text-white font-medium transition-colors ${file && latestReceipt?.status !== 'PENDING' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'}`}
          >
            {isUploading ? 'Yuklanmoqda...' : latestReceipt?.status === 'PENDING' ? 'Chek tasdiqlanishi kutilmoqda' : "Chekni jo'natish"}
          </button>
        </div>

      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">To'lovlar Tarixi (History)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 text-sm dark:text-slate-400">
                <th className="p-4 font-medium">Sana</th>
                <th className="p-4 font-medium">Summa</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Chek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myReceipts.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-medium text-slate-800 dark:text-white">{h.uploadDate}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{h.amount}</td>
                  <td className="p-4">
                    {h.status === 'PAID' && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center w-max">
                        <CheckCircle className="w-3 h-3 mr-1" /> To'landi
                      </span>
                    )}
                    {h.status === 'PENDING' && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center w-max">
                        <Clock className="w-3 h-3 mr-1" /> Kutilmoqda
                      </span>
                    )}
                     {h.status === 'REJECTED' && (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center w-max">
                        <AlertCircle className="w-3 h-3 mr-1" /> Rad etildi
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-blue-600 hover:text-blue-700 flex items-center justify-end w-full text-sm font-medium">
                      <Download className="w-4 h-4 mr-1" /> {h.fileName}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParentPayments;
