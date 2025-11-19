import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import TeacherClassDetailPage from '@/pages/ClassDetailPage';
import StudentClassDetailPage from '@/pages/classes/ClassDetailPage';

export default function RoleAwareClassDetailPage() {
  const { roles, isLoading } = useUserRole();

  console.log('RoleAwareClassDetailPage - roles:', roles, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show teacher version for teachers and developers
  if (roles.includes('teacher') || roles.includes('developer') || roles.includes('super_admin')) {
    console.log('Showing teacher version');
    return <TeacherClassDetailPage />;
  }

  // Show student version for students
  if (roles.includes('student')) {
    console.log('Showing student version');
    return <StudentClassDetailPage />;
  }

  // Redirect to auth if no valid role
  console.log('No valid role, redirecting to auth');
  return <Navigate to="/auth" replace />;
}
