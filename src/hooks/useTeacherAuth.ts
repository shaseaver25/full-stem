
import { useAuth } from '@/contexts/AuthContext';

export const useTeacherAuth = () => {
  const { user } = useAuth();
  
  return {
    user,
    isAuthenticated: !!user
  };
};
