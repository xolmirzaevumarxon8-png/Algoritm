import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export type UserRole = 'SUPER_ADMIN' | 'DIRECTOR' | 'ADMIN' | 'TEACHER' | 'CASHIER' | 'CALL_CENTER' | 'STUDENT' | 'PARENT' | 'MANAGER';

interface ProtectedRouteProps {
  allowedRoles: Array<UserRole>;
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    // Redirect based on their actual role if they try to access a forbidden route
    switch (user.role) {
      case 'SUPER_ADMIN': return <Navigate to="/super-admin" replace />;
      case 'DIRECTOR': return <Navigate to="/admin" replace />;
      case 'ADMIN': return <Navigate to="/admin" replace />;
      case 'CASHIER': return <Navigate to="/finance" replace />;
      case 'CALL_CENTER': return <Navigate to="/manager" replace />;
      case 'TEACHER': return <Navigate to="/teacher" replace />;
      case 'STUDENT': return <Navigate to="/student" replace />;
      case 'PARENT': return <Navigate to="/parent" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
