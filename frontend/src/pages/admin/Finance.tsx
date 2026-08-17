import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Search, Filter, Plus, TrendingUp, AlertCircle, CheckCircle, Clock, Trash2, Edit, XCircle, FileText, Check, X, Printer, User, History } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { usePaymentStore } from '../../store/paymentStore';
import { useAuthStore } from '../../store/authStore';
import FinanceGroups from './FinanceGroups';

export interface PaymentRecord {
  id: string;
  studentId?: string;
  student: string;
  course: string;
  group: string;
  amount: number;
  date: string;
  method: string;
  status: 'PAID' | 'PARTIAL' | 'DEBT' | 'CANCELLED';
  cashierName?: string;
}

export interface DebtRecord {
  id: string;
  studentId?: string;
  student: string;
  group: string;
  totalFee: number;
  paid: number;
  debt: number;
  deadline: string;
}

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PAYMENTS' | 'DEBTS' | 'RECEIPTS' | 'GROUPS'>('PAYMENTS');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { receipts, approveReceipt, rejectReceipt } = usePaymentStore();
  
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [validStudents, setValidStudents] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Transfer'>('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student Profile modal state
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any | null>(null);

  // Print Receipt modal state
  const [printedReceipt, setPrintedReceipt] = useState<any | null>(null);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

  const user = useAuthStore(state => state.user);

  const fetchFinanceData = async () => {
    try {
      setIsLoading(true);
      const [paymentsRes, debtsRes, studentsRes, branchesRes] = await Promise.all([
        apiClient.get('/finance/payments').catch(() => ({ data: [] })),
        apiClient.get('/finance/debts').catch(() => ({ data: [] })),
        apiClient.get('/students').catch(() => ({ data: [] })),
        apiClient.get('/branches').catch(() => ({ data: [] }))
      ]);
      
      setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
      setDebts(Array.isArray(debtsRes.data) ? debtsRes.data : []);
      setValidStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);
    } catch (error) {
      console.error("Failed to load finance data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Iltimos, o'quvchini tanlang");
      return;
    }
    const numAmount = Number(paymentAmount.replace(/[^0-9]/g, ''));
    if (!numAmount || numAmount < 1000) {
      toast.error("Iltimos, to'g'ri to'lov summasini kiriting");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.post('/finance/payments', {
        studentId: selectedStudentId,
        amount: numAmount,
        method: paymentMethod
      });

      const selectedStudentObj = validStudents.find(s => s.id === selectedStudentId);

      toast.success("To'lov muvaffaqiyatli qabul qilindi!");
      setIsAddModalOpen(false);

      // Open print receipt modal
      setPrintedReceipt({
        id: res.data?.id || `REC-${Date.now().toString().slice(-6)}`,
        studentName: selectedStudentObj?.fullname || 'O\'quvchi',
        groupName: selectedStudentObj?.student_groups?.[0]?.group?.name || 'Guruh',
        amount: numAmount,
        method: paymentMethod === 'Cash' ? 'Naqd' : paymentMethod === 'Card' ? 'Karta' : 'O\'tkazma',
        date: new Date().toLocaleString('uz-UZ'),
        cashierName: user?.fullname || 'Kassir'
      });

      // Reset form
      setSelectedStudentId('');
      setPaymentAmount('');
      setPaymentMethod('Cash');

      fetchFinanceData();
    } catch (error) {
      toast.error("To'lovni saqlashda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStudentProfile = (studentName: string) => {
    const studentPayments = payments.filter(p => p.student.toLowerCase().trim() === studentName.toLowerCase().trim());
    const studentDebtObj = debts.find(d => d.student.toLowerCase().trim() === studentName.toLowerCase().trim());
    const studentObj = validStudents.find(s => s.fullname.toLowerCase().trim() === studentName.toLowerCase().trim());

    setSelectedStudentProfile({
      name: studentName,
      phone: studentObj?.phone || 'Tel ko\'rsatilmagan',
      group: studentPayments[0]?.group || studentDebtObj?.group || 'Guruh',
      totalPaid: studentPayments.reduce((sum, p) => sum + p.amount, 0),
      currentDebt: studentDebtObj?.debt || 0,
      payments: studentPayments
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center w-max"><CheckCircle className="w-3 h-3 mr-1"/> TO'LANDI</span>;
      case 'PARTIAL': return <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full flex items-center w-max"><Clock className="w-3 h-3 mr-1"/> QISMAN</span>;
      case 'DEBT': return <span className="px-3 py-1 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-bold rounded-full flex items-center w-max"><AlertCircle className="w-3 h-3 mr-1"/> QARZDOR</span>;
      default: return <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full flex items-center w-max"><CheckCircle className="w-3 h-3 mr-1"/> QABUL QILINDI</span>;
    }
  };

  const filteredPayments = payments.filter(p => 
    p.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDebts = debts.filter(d =>
    d.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalDebt = debts.reduce((acc, curr) => acc + (curr.debt || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50 flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-blue-500" />
            Moliyaviy Boshqaruv va Kassa
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">To'lovlarni qabul qilish, qarzdorliklar va kvitansiyalar hisobi</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all font-bold text-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yangi to'lov qabul qilish
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Umumiy tushum</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-50 mt-1">
                {totalIncome.toLocaleString()}<span className="text-xs text-slate-400 dark:text-slate-500 ml-1">UZS</span>
              </h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Shu oylik tushum</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {totalIncome.toLocaleString()}<span className="text-xs text-emerald-400 ml-1">UZS</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jami qarzdorlik</p>
              <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                {totalDebt.toLocaleString()}<span className="text-xs text-red-400 ml-1">UZS</span>
              </h3>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl"><AlertCircle className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To'lov qilganlar</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-50 mt-1">{payments.length} ta</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl"><CheckCircle className="w-6 h-6" /></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setActiveTab('PAYMENTS')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'PAYMENTS' ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
          To'lovlar tarixi
        </button>
        <button onClick={() => setActiveTab('DEBTS')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'DEBTS' ? 'border-red-600 text-red-600 dark:border-red-500 dark:text-red-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
          Qarzdorlar ro'yxati
        </button>
        <button onClick={() => setActiveTab('RECEIPTS')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'RECEIPTS' ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
          Cheklarni tasdiqlash
          {receipts.filter(r => r.status === 'PENDING').length > 0 && (
            <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{receipts.filter(r => r.status === 'PENDING').length}</span>
          )}
        </button>
        <button onClick={() => setActiveTab('GROUPS')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'GROUPS' ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
          Guruhlar kesimida
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" placeholder="O'quvchi F.I.SH. yoki guruh bo'yicha qidirish..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700/80 rounded-xl bg-slate-50 dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/80 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">Ma'lumotlar yuklanmoqda...</div>
        ) : activeTab === 'PAYMENTS' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">O'quvchi F.I.SH.</th>
                  <th className="p-4">Guruh / Yo'nalish</th>
                  <th className="p-4">To'lov summasi</th>
                  <th className="p-4">To'lov turi va Sana</th>
                  <th className="p-4">Holati</th>
                  <th className="p-4 text-right">Chek chop etish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-500">To'lovlar topilmadi.</td></tr>
                ) : filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <button 
                        onClick={() => openStudentProfile(payment.student)}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center text-left"
                      >
                        <User className="w-4 h-4 mr-1.5 shrink-0 text-slate-400" />
                        {payment.student}
                      </button>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-700 dark:text-slate-300">{payment.group}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{payment.course}</p>
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      +{payment.amount.toLocaleString()} UZS
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{payment.method}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{payment.date}</p>
                    </td>
                    <td className="p-4">{getStatusBadge(payment.status)}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                          setPrintedReceipt({
                            id: payment.id,
                            studentName: payment.student,
                            groupName: payment.group,
                            amount: payment.amount,
                            method: payment.method,
                            date: payment.date,
                            cashierName: payment.cashierName || user?.fullname || 'Kassir'
                          });
                        }}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all flex items-center ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" /> Chek
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'DEBTS' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">O'quvchi F.I.SH.</th>
                  <th className="p-4">Guruh</th>
                  <th className="p-4">Umumiy to'lov</th>
                  <th className="p-4">To'langan</th>
                  <th className="p-4 text-red-600 dark:text-red-400">Qolgan qarzdorlik</th>
                  <th className="p-4">Muddati</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredDebts.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-500">Qarzdor o'quvchilar mavjud emas.</td></tr>
                ) : filteredDebts.map((debt) => (
                  <tr key={debt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <button 
                        onClick={() => openStudentProfile(debt.student)}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center text-left"
                      >
                        <User className="w-4 h-4 mr-1.5 shrink-0 text-slate-400" />
                        {debt.student}
                      </button>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{debt.group}</td>
                    <td className="p-4 text-sm text-slate-500">{debt.totalFee.toLocaleString()} UZS</td>
                    <td className="p-4 text-sm text-emerald-600 font-bold">{debt.paid.toLocaleString()} UZS</td>
                    <td className="p-4 font-bold text-red-600 bg-red-50/30 dark:bg-red-950/20">{debt.debt.toLocaleString()} UZS</td>
                    <td className="p-4 text-xs font-bold text-amber-600 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1"/> {debt.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'RECEIPTS' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/30 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">O'quvchi F.I.SH.</th>
                  <th className="p-4">Summa</th>
                  <th className="p-4">Oy</th>
                  <th className="p-4">Yuklangan sana</th>
                  <th className="p-4">Chek rasmi</th>
                  <th className="p-4">Holati</th>
                  <th className="p-4 text-right">Tasdiqlash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{receipt.studentName}</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{receipt.amount}</td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300">{receipt.month}</td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{receipt.uploadDate}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => {
                          if (receipt.fileData) {
                            setViewImageUrl(receipt.fileData);
                          } else {
                            toast.error("Rasm topilmadi");
                          }
                        }}
                        className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <FileText className="w-4 h-4 mr-1" /> Rasmni ko'rish
                      </button>
                    </td>
                    <td className="p-4">
                      {receipt.status === 'PENDING' && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center w-max"><Clock className="w-3 h-3 mr-1"/> KUTILMOQDA</span>}
                      {receipt.status === 'PAID' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center w-max"><CheckCircle className="w-3 h-3 mr-1"/> TO'LANDI</span>}
                      {receipt.status === 'REJECTED' && <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center w-max"><XCircle className="w-3 h-3 mr-1"/> RAD ETILDI</span>}
                    </td>
                    <td className="p-4 text-right">
                      {receipt.status === 'PENDING' ? (
                        <div className="flex justify-end space-x-2">
                          <button onClick={async () => { 
                            try {
                              await apiClient.post('/finance/payments/accept', {
                                studentName: receipt.studentName,
                                amount: receipt.amount,
                                branchId: receipt.branchId,
                                cashierId: user?.id
                              });
                              approveReceipt(receipt.id); 
                              toast.success("To'lov tasdiqlandi!"); 
                            } catch(err) {
                              toast.error("Xatolik yuz berdi. To'lov tasdiqlanmadi.");
                            }
                          }} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors" title="Tasdiqlash">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => { rejectReceipt(receipt.id); toast.error("To'lov rad etildi!"); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" title="Rad etish">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Bajarilgan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'GROUPS' ? (
          <div className="p-6">
            <FinanceGroups payments={payments} />
          </div>
        ) : null}
      </div>

      {/* Student Profile Modal */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-lg mr-3">
                  {selectedStudentProfile.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">{selectedStudentProfile.name}</h3>
                  <p className="text-xs text-slate-400">{selectedStudentProfile.phone} • {selectedStudentProfile.group}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudentProfile(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Jami To'lagan</p>
                <p className="text-lg font-black text-emerald-600 mt-1">{selectedStudentProfile.totalPaid.toLocaleString()} UZS</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-slate-400 uppercase">Joriy Qarzdorlik</p>
                <p className="text-lg font-black text-red-600 mt-1">{selectedStudentProfile.currentDebt.toLocaleString()} UZS</p>
              </div>
            </div>

            <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2 flex items-center">
              <History className="w-4 h-4 mr-1 text-blue-500" /> To'lovlar Tarixi
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedStudentProfile.payments.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">Hali to'lovlar kiritilmagan.</p>
              ) : selectedStudentProfile.payments.map((p: any) => (
                <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">{p.method}</span>
                    <span className="text-slate-400 ml-2">{p.date}</span>
                  </div>
                  <span className="font-black text-emerald-600">+{p.amount.toLocaleString()} UZS</span>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setSelectedStudentProfile(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl text-xs font-bold"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Add Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                <CreditCard className="w-6 h-6 mr-2.5 text-blue-600" />
                Yangi to'lov qabul qilish
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">O'quvchini qidirish va tanlash</label>
                
                {selectedStudentId ? (
                  <div className="flex items-center justify-between p-3.5 border border-blue-500/50 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold text-sm">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{validStudents.find(s => s.id === selectedStudentId)?.fullname} ({validStudents.find(s => s.id === selectedStudentId)?.phone || 'Tel yo\'q'})</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setSelectedStudentId(''); setStudentSearchQuery(''); }}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ismi yoki telefon raqami bo'yicha qidiring..."
                      value={studentSearchQuery}
                      onFocus={() => setIsStudentDropdownOpen(true)}
                      onChange={(e) => {
                        setStudentSearchQuery(e.target.value);
                        setIsStudentDropdownOpen(true);
                      }}
                      className="w-full pl-10 pr-4 py-3.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Dropdown Options List */}
                {!selectedStudentId && isStudentDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {validStudents.filter((st: any) => 
                      st.fullname.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                      (st.phone && st.phone.includes(studentSearchQuery))
                    ).length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">O'quvchi topilmadi</div>
                    ) : (
                      validStudents
                        .filter((st: any) => 
                          st.fullname.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                          (st.phone && st.phone.includes(studentSearchQuery))
                        )
                        .map((st: any) => (
                          <div
                            key={st.id}
                            onClick={() => {
                              setSelectedStudentId(st.id);
                              setIsStudentDropdownOpen(false);
                            }}
                            className="p-3 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{st.fullname}</p>
                              <p className="text-xs text-slate-400">{st.phone || 'Tel raqam kiritilmagan'}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">
                              {st.student_groups?.[0]?.group?.name || 'Guruh'}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">To'lov summasi (UZS)</label>
                <input 
                  type="number"
                  step="50000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Masalan: 500000"
                  className="w-full p-3.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">To'lov usuli</label>
                <select 
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full p-3.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Cash">Naqd pul (Cash)</option>
                  <option value="Card">Plastik karta / Terminal (Card)</option>
                  <option value="Transfer">Bank o'tkazmasi / Click / Payme (Transfer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Chek / Izoh raqami (Opsional)</label>
                <input 
                  type="text"
                  placeholder="Masalan: Terminal chek №4982 yoki Click tranzaksiya"
                  className="w-full p-3.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
                <div className="flex items-center">
                  <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Avtomatik Chek chiqarish</p>
                    <p className="text-[10px] text-slate-400">To'lov saqlangach, bosib chiqariluvchi kvitansiya oynasi ochiladi</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl font-bold text-sm">Bekor qilish</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center">
                  <Printer className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saqlanmoqda...' : "To'lovni saqlash & Chek chiqarish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {printedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-200 dark:border-slate-800">
            <div className="text-center pb-6 border-b border-dashed border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400">Algoritm IT</h2>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">O'quv Markazi To'lov Kvitansiyasi</p>
              <p className="text-[10px] text-slate-400 mt-1">Kvitansiya ID: {printedReceipt.id}</p>
            </div>

            <div className="py-6 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Sana va vaqt:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{printedReceipt.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">O'quvchi F.I.SH.:</span>
                <span className="text-slate-500 font-medium">O'quvchi (Talaba):</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{printedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Guruh:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{printedReceipt.groupName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">To'lov turi:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{printedReceipt.method}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-800 dark:text-white font-bold text-base">To'langan summa:</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {Number(printedReceipt.amount).toLocaleString()} UZS
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400 text-xs font-medium">Qabul qildi (Kassir):</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{printedReceipt.cashierName}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center print:hidden">
              <button 
                onClick={() => setPrintedReceipt(null)}
                className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl font-bold text-sm"
              >
                Yopish
              </button>
              <button 
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center"
              >
                <Printer className="w-4 h-4 mr-2" /> Chop etish (Print)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
