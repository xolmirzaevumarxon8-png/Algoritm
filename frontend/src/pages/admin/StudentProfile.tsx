import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Calendar, BookOpen, Users, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axios';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const res = await apiClient.get(`/students/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">O'quvchi ma'lumotlari yuklanmoqda...</div>;
  }

  if (!student) {
    return <div className="p-8 text-center text-slate-500">O'quvchi topilmadi.</div>;
  }

  const activeGroup = student.student_groups?.find((sg: any) => sg.status === 'ACTIVE')?.group;
  const initials = student.fullname ? student.fullname.substring(0, 2).toUpperCase() : 'ST';

  // Dynamic calculations
  const attendanceLogs = student.attendance || [];
  const totalLessons = attendanceLogs.length;
  const attended = attendanceLogs.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = totalLessons > 0 ? Math.round((attended / totalLessons) * 100) : 0;

  const examResults = student.exam_results || [];
  const avgScore = examResults.length > 0
    ? Math.round(examResults.reduce((acc: number, curr: any) => acc + curr.score, 0) / examResults.length)
    : 0;

  const balance = student.finance_accounts?.[0]?.balance || 0;
  const debt = balance < 0 ? Math.abs(Number(balance)) : 0;
  const paymentsList = student.finance_accounts?.[0]?.payments || [];

  // Map last 5 attendance logs for chart
  const trendData = [...attendanceLogs].reverse().slice(-5).map((log: any) => ({
    name: new Date(log.created_at || Date.now()).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
    rate: log.status === 'PRESENT' || log.status === 'LATE' ? 100 : 0
  }));

  const paymentStatus = balance >= 0 ? 'PAID' : 'UNPAID';

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/students')} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors dark:text-slate-400">
        <ArrowLeft className="w-4 h-4 mr-1" /> O'quvchilarga qaytish
      </button>

      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{student.fullname}</h1>
              <p className="text-slate-500 mt-1 flex items-center text-sm dark:text-slate-400">
                <BookOpen className="w-4 h-4 mr-1"/> {activeGroup?.course?.name || 'Kurs biriktirilmagan'} • 
                <Users className="w-4 h-4 ml-3 mr-1"/> {activeGroup?.name || 'Guruh biriktirilmagan'}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${student.is_deleted ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {student.is_deleted ? 'DELETED' : 'ACTIVE'}
              </span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center ${paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {paymentStatus === 'PAID' ? <CheckCircle className="w-3 h-3 mr-1"/> : <AlertCircle className="w-3 h-3 mr-1"/>}
                {paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto">
        {['overview', 'attendance', 'finance', 'results'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {tab === 'overview' ? 'Umumiy' : tab === 'attendance' ? 'Davomat' : tab === 'finance' ? 'Moliya' : 'Imtihonlar'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Shaxsiy ma'lumotlar</h3>
            <div className="space-y-4">
              <div className="flex items-center text-sm"><Phone className="w-4 h-4 text-slate-400 mr-3"/> <span className="text-slate-700 dark:text-slate-300">{student.phone || 'Kiritilmagan'}</span></div>
              <div className="flex items-center text-sm"><Mail className="w-4 h-4 text-slate-400 mr-3"/> <span className="text-slate-700 dark:text-slate-300">{student.email || 'Kiritilmagan'}</span></div>
              <div className="flex items-center text-sm"><Calendar className="w-4 h-4 text-slate-400 mr-3"/> <span className="text-slate-700 dark:text-slate-300">{student.birthday ? new Date(student.birthday).toLocaleDateString('uz-UZ') : 'Kiritilmagan'}</span></div>
              <div className="flex items-center text-sm"><User className="w-4 h-4 text-slate-400 mr-3"/> <span className="text-slate-700 dark:text-slate-300">{student.gender || 'Kiritilmagan'}</span></div>
            </div>
            
            <h3 className="font-bold text-slate-800 dark:text-white mt-6 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Ota-ona bilan aloqa</h3>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{student.parentPhone ? 'Ota-onasi' : 'Kiritilmagan'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{student.parentPhone || 'Kiritilmagan'}</p>
              </div>
              {student.parentPhone && (
                <a href={`tel:${student.parentPhone}`} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Phone className="w-4 h-4"/></a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex items-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mr-4"><CheckCircle className="w-6 h-6"/></div>
                <div><p className="text-sm text-slate-500 dark:text-slate-400">Davomat</p><p className="text-2xl font-bold">{attendanceRate}%</p></div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex items-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4"><Award className="w-6 h-6"/></div>
                <div><p className="text-sm text-slate-500 dark:text-slate-400">O'rtacha ball</p><p className="text-2xl font-bold">{avgScore}/100</p></div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6">Davomat grafigi (Oxirgi 5 dars)</h3>
              <div className="h-64 mb-6">
                {trendData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500">Davomat tarixi mavjud emas</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      <Area type="monotone" dataKey="rate" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Oxirgi qaydlar</h3>
              <div className="space-y-3">
                {attendanceLogs.length === 0 ? (
                  <p className="text-slate-500 text-sm">Qaydlar topilmadi</p>
                ) : (
                  attendanceLogs.slice(0, 10).map((log: any) => (
                    <div key={log.id} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">Dars mashg'uloti</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(log.created_at).toLocaleString('uz-UZ')}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg ${log.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : log.status === 'LATE' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {log.status === 'PRESENT' ? 'Qatnashdi' : log.status === 'LATE' ? 'Kechikdi' : 'Kelmagan'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-white">To'lovlar tarixi</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Mavjud qarzdorlik: <span className={`${debt > 0 ? 'text-red-500' : 'text-emerald-600'} font-bold`}>{debt.toLocaleString('uz-UZ')} UZS</span></p>
              </div>
              
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-sm dark:text-slate-400">
                    <th className="p-3 font-medium">Sana</th>
                    <th className="p-3 font-medium">To'lov turi</th>
                    <th className="p-3 font-medium">Miqdor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paymentsList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-500">To'lovlar topilmadi</td>
                    </tr>
                  ) : (
                    paymentsList.map((p: any) => (
                      <tr key={p.id}>
                        <td className="p-3 text-sm">{new Date(p.paid_at).toLocaleDateString('uz-UZ')}</td>
                        <td className="p-3 text-sm">{p.type || 'Naqd/Karta'}</td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{Number(p.amount).toLocaleString('uz-UZ')} UZS</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Imtihon natijalari</h3>
              <div className="space-y-3">
                {examResults.length === 0 ? (
                  <p className="text-slate-500 text-sm">Imtihon topshirilmagan</p>
                ) : (
                  examResults.map((r: any) => (
                    <div key={r.id} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{r.exam?.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Sana: {new Date(r.submitted_at).toLocaleDateString('uz-UZ')}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg ${r.is_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        Ball: {r.score} ({r.is_passed ? 'O\'tdi' : 'Yiqildi'})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
