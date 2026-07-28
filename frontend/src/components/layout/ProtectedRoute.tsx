import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  allowedRoles: Array<'ADMIN' | 'MANAGER' | 'TEACHER' | 'PARENT' | 'STUDENT'>;
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect based on their actual role if they try to access a forbidden route
    switch (user.role) {
      case 'ADMIN': return <Navigate to="/admin" replace />;
      case 'TEACHER': return <Navigate to="/teacher" replace />;
      case 'STUDENT': return <Navigate to="/student" replace />;
      case 'MANAGER': return <Navigate to="/manager" replace />;
      case 'PARENT': return <Navigate to="/parent" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
