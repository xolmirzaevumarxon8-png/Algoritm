import { CreditCard, DollarSign, Calendar, CheckCircle2, AlertCircle, FileText, ArrowDownRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const StudentPayments = () => {
  const { data: finData, isLoading } = useQuery({
    queryKey: ['student-payments'],
    queryFn: async () => {
      const res = await apiClient.get('/students/payments');
      return res.data;
    }
  });

  const balance = finData?.balance || 0;
  const debt = finData?.debt || 0;
  const dueDay = finData?.dueDay || 5;
  const payments = finData?.payments || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-emerald-500" />
            Mening to'lovlarim va Balans
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Oylik to'lovlar hisobi va kvitansiyalar tarixi</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Hozirgi balans</p>
              <h3 className="text-3xl font-black mt-1">
                {isLoading ? '...' : `${Number(balance).toLocaleString()} UZS`}
              </h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-emerald-100/90 mt-4 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> To'lov holati ijobiy
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qarzdorlik</p>
              <h3 className={`text-3xl font-black mt-1 ${debt > 0 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                {isLoading ? '...' : `${Number(debt).toLocaleString()} UZS`}
              </h3>
            </div>
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            {debt > 0 ? 'Iltimos, oylik to\'lovni o\'z vaqtida amalga oshiring' : 'Qarzdorlik mavjud emas'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Navbatdagi to'lov kuni</p>
              <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                Har oyning {dueDay}-sana
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl border border-indigo-500/20">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Shu kunga qadar oylik to'lov kiritilishi lozim
          </p>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-emerald-500" /> To'lov Kvitansiyalari Tarixi
          </h3>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 dark:text-slate-400">
              <th className="p-4 font-bold">To'langan sana</th>
              <th className="p-4 font-bold">Summa</th>
              <th className="p-4 font-bold">To'lov turi</th>
              <th className="p-4 font-bold">Kassir</th>
              <th className="p-4 font-bold text-right">Holati</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8">Yuklanmoqda...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500">To'lov kvitansiyalari mavjud emas.</td></tr>
            ) : payments.map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-medium text-slate-800 dark:text-white">
                  {p.paid_at ? new Date(p.paid_at).toLocaleDateString('uz-UZ') : 'Noma\'lum'}
                </td>
                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <ArrowDownRight className="w-4 h-4 mr-1 text-emerald-500" />
                  +{Number(p.amount || 0).toLocaleString()} UZS
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                  {p.payment_type || 'Naqd / Karta'}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                  {p.cashier_user?.fullname || 'Tizim kassiri'}
                </td>
                <td className="p-4 text-right">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full">
                    Qabul qilindi
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentPayments;
