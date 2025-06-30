
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook for teacher authentication state management
 * 
 * @description Provides access to teacher authentication state and user information.
 * This hook wraps the general auth context and provides teacher-specific authentication logic.
 * 
 * @returns {Object} Authentication state object
 * @returns {Object|null} returns.user - The authenticated user object, null if not authenticated
 * @returns {boolean} returns.isAuthenticated - Boolean indicating if user is authenticated
 * 
 * @example
 * ```tsx
 * function TeacherDashboard() {
 *   const { user, isAuthenticated } = useTeacherAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <div>Please log in</div>;
 *   }
 *   
 *   return <div>Welcome, {user.email}!</div>;
 * }
 * ```
 * 
 * @see {@link useAuth} - The underlying auth context hook
 */
export const useTeacherAuth = () => {
  const { user } = useAuth();
  
  return {
    user,
    isAuthenticated: !!user
  };
};
