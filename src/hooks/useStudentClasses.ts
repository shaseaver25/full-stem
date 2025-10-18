import { useAuth } from '@/contexts/AuthContext';
import { useStudentEnrollments } from './useStudentData';

export interface EnrolledClass {
  id: string;
  class_id: string;
  enrolled_at: string;
  classes: {
    id: string;
    name: string;
    description: string | null;
    schedule: string | null;
    grade_level: string | null;
    subject: string | null;
    teacher_id: string;
  };
  teacher?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export const useStudentClasses = () => {
  const { user } = useAuth();

  return useStudentEnrollments(user?.id, {
    select: (data) => data as EnrolledClass[]
  });
};
