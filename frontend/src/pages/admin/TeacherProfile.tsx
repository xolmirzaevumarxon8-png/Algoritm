import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, MapPin, BookOpen, Clock, Award, Star } from 'lucide-react';

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [groups] = useState([
    { id: '1', name: 'JS-101', course: 'Frontend Web Development', students: 12, schedule: 'Mon/Wed/Fri 18:00', room: 'Room 404' },
    { id: '2', name: 'PY-202', course: 'Python Data Science', students: 8, schedule: 'Tue/Thu/Sat 15:00', room: 'Room 302' },
  ]);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/teachers')} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Teachers
      </button>

      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-bold shrink-0">
          OR
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Olim Rustamov</h1>
              <p className="text-slate-500 mt-1 flex items-center text-sm dark:text-slate-400"><BookOpen className="w-4 h-4 mr-1"/> Senior Instructor • <Star className="w-4 h-4 ml-3 mr-1 text-amber-400 fill-amber-400"/> 4.8 Rating</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: KPI & Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 dark:text-slate-50">Performance KPI</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm"><span className="text-slate-500 dark:text-slate-400">Student Satisfaction</span> <span className="font-bold text-slate-800 dark:text-slate-50">96%</span></div>
              <div className="flex justify-between items-center text-sm"><span className="text-slate-500 dark:text-slate-400">Attendance Rate</span> <span className="font-bold text-slate-800 dark:text-slate-50">100%</span></div>
              <div className="flex justify-between items-center text-sm"><span className="text-slate-500 dark:text-slate-400">Total Students</span> <span className="font-bold text-blue-600">20</span></div>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Groups */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-6 dark:text-slate-50">Assigned Groups</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map(group => (
                <div key={group.id} className="p-4 border border-slate-100 rounded-xl hover:border-blue-500 transition-colors cursor-pointer" onClick={() => navigate(`/admin/groups/${group.id}`)}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-50">{group.name}</h4>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{group.students} Students</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 dark:text-slate-400">{group.course}</p>
                  <div className="flex items-center text-xs text-slate-400 mb-1"><Calendar className="w-3 h-3 mr-2"/> {group.schedule}</div>
                  <div className="flex items-center text-xs text-slate-400"><MapPin className="w-3 h-3 mr-2"/> {group.room}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
