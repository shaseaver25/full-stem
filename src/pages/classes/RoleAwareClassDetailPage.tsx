import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import TeacherClassDetailPage from '@/pages/ClassDetailPage';
import StudentClassDetailPage from '@/pages/classes/ClassDetailPage';

export default function RoleAwareClassDetailPage() {
  const { roles, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show teacher version for teachers and developers
  if (roles.includes('teacher') || roles.includes('developer') || roles.includes('super_admin')) {
    return <TeacherClassDetailPage />;
  }

  // Show student version for students
  if (roles.includes('student')) {
    return <StudentClassDetailPage />;
  }

  // Redirect to auth if no valid role
  return <Navigate to="/auth" replace />;
}
