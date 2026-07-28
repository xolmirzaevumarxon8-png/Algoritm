import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, ArrowLeft, CheckCircle, AlertCircle, ChevronRight, UserCheck } from 'lucide-react';
import apiClient from '../../api/axios';
import { usePaymentStore } from '../../store/paymentStore';
import type { PaymentRecord } from './Finance';

interface FinanceGroupsProps {
  payments: PaymentRecord[];
}

const FinanceGroups: React.FC<FinanceGroupsProps> = ({ payments }) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { receipts } = usePaymentStore();

  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ['finance-groups'],
    queryFn: async () => {
      const res = await apiClient.get('/groups');
      return res.data;
    }
  });

  const { data: groupDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ['finance-group-details', selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return null;
      const res = await apiClient.get(`/groups/${selectedGroupId}`);
      return res.data;
    },
    enabled: !!selectedGroupId
  });

  // Calculate if a student has paid for the current month
  // Note: Since we don't have full backend payment history logic, we check local state & Zustand store
  const checkPaymentStatus = (studentName: string) => {
    // 1. Check verified receipts
    const hasVerifiedReceipt = receipts.some(r => r.studentName === studentName && r.status === 'PAID');
    // 2. Check admin recorded payments
    const hasAdminPayment = payments.some(p => p.student === studentName && p.status === 'PAID');

    return hasVerifiedReceipt || hasAdminPayment;
  };

  if (selectedGroupId && groupDetails) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button onClick={() => setSelectedGroupId(null)} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400">
          <ArrowLeft className="w-4 h-4 mr-1" /> Orqaga (Guruhlar ro'yxatiga)
        </button>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-500" /> 
                {groupDetails.name} guruh o'quvchilari
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Joriy oy uchun to'lov nazorati</p>
            </div>
            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium rounded-full text-sm">
              Jami o'quvchilar: {groupDetails.student_groups?.length || 0}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                  <th className="p-4 font-medium">O'quvchi Ism Familiyasi</th>
                  <th className="p-4 font-medium">Telefon</th>
                  <th className="p-4 font-medium text-right">To'lov Holati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {groupDetails.student_groups?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">Bu guruhda o'quvchilar yo'q.</td>
                  </tr>
                )}
                {groupDetails.student_groups?.map((sg: any) => {
                  const isPaid = checkPaymentStatus(sg.student?.fullname || 'Unknown');
                  return (
                    <tr key={sg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{sg.student?.fullname}</td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{sg.student?.phone}</td>
                      <td className="p-4 text-right">
                        {isPaid ? (
                          <span className="inline-flex items-center px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                            <CheckCircle className="w-3 h-3 mr-1" /> To'lov qilgan
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-full">
                            <AlertCircle className="w-3 h-3 mr-1" /> To'lov qilmagan
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loadingGroups ? (
        <div className="p-8 text-center text-slate-500">Guruhlar yuklanmoqda...</div>
      ) : groups.length === 0 ? (
        <div className="p-8 text-center text-slate-500">Hech qanday guruh topilmadi.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group: any) => (
            <div 
              key={group.id} 
              onClick={() => setSelectedGroupId(group.id)}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{group.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{group.courseName}</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 mb-4">
                <UserCheck className="w-4 h-4 mr-2 text-slate-400" />
                O'qituvchi: <span className="font-medium ml-1">{group.teacherName}</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {group.studentCount} o'quvchi
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinanceGroups;
