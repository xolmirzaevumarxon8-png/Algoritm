import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullname?: string;
  phone?: string;
  branchName?: string;
  role: 'SUPER_ADMIN' | 'DIRECTOR' | 'ADMIN' | 'TEACHER' | 'CASHIER' | 'CALL_CENTER' | 'STUDENT' | 'PARENT';
  branchId?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      login: async (username: string, password: string) => {
        try {
          // Import apiClient locally to avoid circular dependency
          const apiClient = (await import('../api/axios')).default;
          
          const response = await apiClient.post('/auth/login', {
            username,
            password
          });
          
          if (response.data && response.data.accessToken) {
            const token = response.data.accessToken;
            const userData = response.data.user;
            
            const user: User = {
              id: userData.id,
              username: username,
              firstName: userData.fullname.split(' ')[0] || '',
              lastName: userData.fullname.split(' ')[1] || '',
              role: userData.role
            };
            
            localStorage.setItem('token', token);
            set({ user, token });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Login failed:", error);
          return false;
        }
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage', // key in localStorage
    }
  )
);
