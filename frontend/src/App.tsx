import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Eagerly loaded essentials
import Login from './pages/auth/Login';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Error Pages
import NotFound from './pages/shared/NotFound';
import Forbidden from './pages/shared/Forbidden';

// Lazy loaded components for maximum performance
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const Students = React.lazy(() => import('./pages/admin/Students'));
const StudentProfile = React.lazy(() => import('./pages/admin/StudentProfile'));
const Finance = React.lazy(() => import('./pages/admin/Finance'));
const AdminTeachers = React.lazy(() => import('./pages/admin/Teachers'));
const AdminGroups = React.lazy(() => import('./pages/admin/Groups'));
const GroupDetails = React.lazy(() => import('./pages/admin/GroupDetails'));
const AdminRooms = React.lazy(() => import('./pages/admin/Rooms'));
const RoomDetails = React.lazy(() => import('./pages/admin/RoomDetails'));
const AdminCourses = React.lazy(() => import('./pages/admin/Courses'));
const Schedule = React.lazy(() => import('./pages/admin/Schedule'));
const TeacherProfile = React.lazy(() => import('./pages/admin/TeacherProfile'));
const CashierDashboard = React.lazy(() => import('./pages/cashier/CashierDashboard'));
const AdminReports = React.lazy(() => import('./pages/admin/AdminReports'));
const AuditLogs = React.lazy(() => import('./pages/admin/AuditLogs')); // New Part 13
const SuperAdminDashboard = React.lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const DirectorDashboard = React.lazy(() => import('./pages/director/DirectorDashboard'));

const CallCenterDashboard = React.lazy(() => import('./pages/manager/ManagerDashboard'));
const Branches = React.lazy(() => import('./pages/manager/ManagerBranches'));
const AdminsList = React.lazy(() => import('./pages/manager/ManagerAdmins'));
const ManagerCashiers = React.lazy(() => import('./pages/manager/ManagerCashiers'));
const DirectorsList = React.lazy(() => import('./pages/manager/ManagerDirectors'));
const Leads = React.lazy(() => import('./pages/manager/ManagerLeads'));

const TeacherDashboard = React.lazy(() => import('./pages/teacher/TeacherDashboard'));
const TeacherGroups = React.lazy(() => import('./pages/teacher/TeacherGroups'));
const TeacherAI = React.lazy(() => import('./pages/teacher/TeacherAI'));

const ParentDashboard = React.lazy(() => import('./pages/parent/ParentDashboard'));
const ParentPayments = React.lazy(() => import('./pages/parent/ParentPayments'));
const ParentAcademic = React.lazy(() => import('./pages/parent/ParentAcademic'));
const ParentAI = React.lazy(() => import('./pages/parent/ParentAI'));

const StudentDashboard = React.lazy(() => import('./pages/student/StudentDashboard'));
const StudentAttendance = React.lazy(() => import('./pages/student/StudentAttendance'));
const TeacherAttendance = React.lazy(() => import('./pages/teacher/TeacherAttendance'));

const Exams = React.lazy(() => import('./pages/shared/Exams'));
const TeacherExams = React.lazy(() => import('./pages/teacher/TeacherExams'));
const Materials = React.lazy(() => import('./pages/shared/Materials'));
const TeacherHomework = React.lazy(() => import('./pages/teacher/TeacherHomework'));
const StudentExams = React.lazy(() => import('./pages/student/StudentExams'));
const StudentHomework = React.lazy(() => import('./pages/student/StudentHomework'));
const StudentPayments = React.lazy(() => import('./pages/student/StudentPayments'));
const StudentSchedule = React.lazy(() => import('./pages/student/StudentSchedule'));
const Notifications = React.lazy(() => import('./pages/shared/Notifications'));
const Messages = React.lazy(() => import('./pages/shared/Messages'));
const Settings = React.lazy(() => import('./pages/shared/Settings'));

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />
      
      {/* Global Protected Routes Wrapper (Checks token existence) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        
        {/* Wrap all internal routes with Suspense */}
        <Route element={<Suspense fallback={<LoadingSpinner />}><Outlet /></Suspense>}>
          {/* Super Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="admin/settings" element={<Settings />} />
            <Route path="admin/directors" element={<DirectorsList />} />
          </Route>

          {/* Shared Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR']} />}>
            <Route path="director" element={<DirectorDashboard />} />
          </Route>

          {/* Shared All Admin Level Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'ADMIN']} />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/schedule" element={<Schedule />} />
            <Route path="admin/students" element={<Students />} />
            <Route path="admin/students/:id" element={<StudentProfile />} />
            <Route path="admin/teachers" element={<AdminTeachers />} />
            <Route path="admin/teachers/:id" element={<TeacherProfile />} />
            <Route path="admin/groups" element={<AdminGroups />} />
            <Route path="admin/groups/:id" element={<GroupDetails />} />
            <Route path="admin/rooms" element={<AdminRooms />} />
            <Route path="admin/rooms/:id" element={<RoomDetails />} />
            <Route path="admin/courses" element={<AdminCourses />} />
            <Route path="admin/reports" element={<AdminReports />} />
            <Route path="admin/exams" element={<Exams />} />
            <Route path="admin/messages" element={<Messages />} />
            <Route path="admin/notifications" element={<Notifications />} />
            <Route path="admin/audit-logs" element={<AuditLogs />} />
          </Route>

          {/* Shared Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'ADMIN']} />}>
            <Route path="super-admin" element={<SuperAdminDashboard />} />
            <Route path="manager/branches" element={<Branches />} />
            <Route path="admin/admins" element={<AdminsList />} />
            <Route path="admin/cashiers" element={<ManagerCashiers />} />
          </Route>
          
          {/* Cashier Routes */}
          <Route element={<ProtectedRoute allowedRoles={['CASHIER', 'SUPER_ADMIN', 'DIRECTOR']} />}>
            <Route path="finance" element={<CashierDashboard />} />
            <Route path="finance/payments" element={<Finance />} />
            <Route path="finance/reports" element={<AdminReports />} />
            <Route path="finance/messages" element={<Messages />} />
            <Route path="finance/notifications" element={<Notifications />} />
            <Route path="finance/settings" element={<Settings />} />
          </Route>

          {/* Call Center Routes */}
          <Route element={<ProtectedRoute allowedRoles={['CALL_CENTER', 'SUPER_ADMIN', 'DIRECTOR']} />}>
            <Route path="call-center" element={<CallCenterDashboard />} />
            <Route path="call-center/leads" element={<Leads />} />
            <Route path="call-center/messages" element={<Messages />} />
            <Route path="call-center/notifications" element={<Notifications />} />
            <Route path="call-center/settings" element={<Settings />} />
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
            <Route path="teacher" element={<TeacherDashboard />} />
            <Route path="teacher/groups" element={<TeacherGroups />} />
            <Route path="teacher/schedule" element={<Schedule />} />
            <Route path="teacher/attendance" element={<TeacherAttendance />} />
            <Route path="teacher/exams" element={<TeacherExams />} />
            <Route path="teacher/homework" element={<TeacherHomework />} />
            <Route path="teacher/materials" element={<Materials />} />
            <Route path="teacher/ai" element={<TeacherAI />} />
            <Route path="teacher/messages" element={<Messages />} />
            <Route path="teacher/notifications" element={<Notifications />} />
            <Route path="teacher/settings" element={<Settings />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="student" element={<StudentDashboard />} />
            <Route path="student/schedule" element={<StudentSchedule />} />
            <Route path="student/attendance" element={<StudentAttendance />} />
            <Route path="student/exams" element={<StudentExams />} />
            <Route path="student/homework" element={<StudentHomework />} />
            <Route path="student/payments" element={<StudentPayments />} />
            <Route path="student/materials" element={<Materials />} />
            <Route path="student/messages" element={<Messages />} />
            <Route path="student/notifications" element={<Notifications />} />
            <Route path="student/settings" element={<Settings />} />
          </Route>

          {/* Parent Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PARENT']} />}>
            <Route path="parent" element={<ParentDashboard />} />
            <Route path="parent/academic" element={<ParentAcademic />} />
            <Route path="parent/payments" element={<ParentPayments />} />
            <Route path="parent/ai" element={<ParentAI />} />
            <Route path="parent/messages" element={<Messages />} />
            <Route path="parent/notifications" element={<Notifications />} />
            <Route path="parent/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback to 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
