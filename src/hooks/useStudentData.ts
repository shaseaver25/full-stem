import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/utils/errorLogging';

// Standardized query keys
export const studentQueryKeys = {
  all: ['students'] as const,
  byUserId: (userId: string) => [...studentQueryKeys.all, 'byUserId', userId] as const,
  byId: (studentId: string) => [...studentQueryKeys.all, 'byId', studentId] as const,
  byClass: (classId: string) => [...studentQueryKeys.all, 'byClass', classId] as const,
  enrollments: (studentId: string) => [...studentQueryKeys.all, 'enrollments', studentId] as const,
  teacherStudents: (teacherId: string) => [...studentQueryKeys.all, 'teacher', teacherId] as const,
  profiles: (studentIds: string[]) => [...studentQueryKeys.all, 'profiles', ...studentIds] as const,
};

// Default stale time: 5 minutes
const DEFAULT_STALE_TIME = 5 * 60 * 1000;

// Get student ID by user ID
export const useStudentByUserId = (
  userId: string | undefined,
  options?: Omit<UseQueryOptions<any, Error, any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: studentQueryKeys.byUserId(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (error) {
        logError(error, 'useStudentByUserId');
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: DEFAULT_STALE_TIME,
    ...options,
  });
};

// Get students by class ID
export const useStudentsByClass = (
  classId: string | undefined,
  options?: Omit<UseQueryOptions<any[], Error, any[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: studentQueryKeys.byClass(classId || ''),
    queryFn: async () => {
      if (!classId) throw new Error('Class ID required');

      try {
        // Get student IDs from class_students
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('class_students')
          .select('student_id')
          .eq('class_id', classId)
          .eq('status', 'active');

        if (enrollmentError) throw enrollmentError;

        const studentIds = enrollmentData?.map(e => e.student_id) || [];

        if (studentIds.length === 0) {
          return [];
        }

        const { data, error } = await supabase
          .from('students')
          .select('*')
          .in('id', studentIds)
          .order('first_name');

        if (error) throw error;
        return data || [];
      } catch (error) {
        logError(error, 'useStudentsByClass');
        throw error;
      }
    },
    enabled: !!classId,
    staleTime: DEFAULT_STALE_TIME,
    ...options,
  });
};

// Get student enrollments with class details
export const useStudentEnrollments = (
  userId: string | undefined,
  options?: Omit<UseQueryOptions<any[], Error, any[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: userId ? studentQueryKeys.enrollments(userId) : ['no-user'],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      // Get student ID first
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (studentError) throw studentError;
      if (!studentData) return [];

      // Fetch enrolled classes
      const { data, error } = await supabase
        .from('class_students')
        .select(`
          id,
          class_id,
          enrolled_at,
          classes (
            id,
            name,
            description,
            schedule,
            grade_level,
            subject,
            teacher_id
          )
        `)
        .eq('student_id', studentData.id)
        .eq('status', 'active')
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      // Fetch teacher info for each class
      const classesWithTeachers = await Promise.all(
        (data || []).map(async (enrollment) => {
          if (!enrollment.classes) return enrollment;

          // Get teacher user_id from teacher_profiles
          const { data: teacherProfile } = await supabase
            .from('teacher_profiles')
            .select('user_id')
            .eq('id', enrollment.classes.teacher_id)
            .maybeSingle();

          if (!teacherProfile) return enrollment;

          // Get teacher name from profiles
          const { data: teacherData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', teacherProfile.user_id)
            .maybeSingle();

          // Parse full_name into first and last
          const fullName = teacherData?.full_name || '';
          const nameParts = fullName.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          return {
            ...enrollment,
            teacher: {
              first_name: firstName,
              last_name: lastName
            }
          };
        })
      );

      return classesWithTeachers;
    },
    enabled: !!userId,
    staleTime: DEFAULT_STALE_TIME,
    ...options,
  });
};

// Get all students for a teacher
export const useTeacherStudents = (
  teacherId: string | undefined,
  classId?: string,
  options?: Omit<UseQueryOptions<any[], Error, any[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: classId 
      ? studentQueryKeys.byClass(classId)
      : studentQueryKeys.teacherStudents(teacherId || ''),
    queryFn: async () => {
      if (!teacherId) throw new Error('Teacher ID required');

      // Get teacher profile
      const { data: teacherProfile, error: teacherError } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', teacherId)
        .maybeSingle();

      if (teacherError) throw teacherError;
      if (!teacherProfile) return [];

      // Get all classes for this teacher
      const { data: teacherClasses, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', teacherProfile.id);

      if (classesError) throw classesError;

      const teacherClassIds = teacherClasses?.map(c => c.id) || [];

      if (teacherClassIds.length === 0) return [];

      // Get student enrollments from teacher's classes
      let enrollmentQuery = supabase
        .from('class_students')
        .select('student_id, class_id')
        .in('class_id', teacherClassIds)
        .eq('status', 'active');

      // Filter by specific class if provided
      if (classId) {
        enrollmentQuery = enrollmentQuery.eq('class_id', classId);
      }

      const { data: enrollmentData, error: enrollmentError } = await enrollmentQuery;

      if (enrollmentError) throw enrollmentError;

      const studentIds = [...new Set(enrollmentData?.map(e => e.student_id) || [])];

      if (studentIds.length === 0) return [];

      // Get student details
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name, grade_level, reading_level, class_id, user_id')
        .in('id', studentIds);

      if (studentsError) throw studentsError;

      return studentsData || [];
    },
    enabled: !!teacherId,
    staleTime: DEFAULT_STALE_TIME,
    ...options,
  });
};

// Get student profiles with survey data
export const useStudentProfiles = (
  studentIds: string[],
  options?: Omit<UseQueryOptions<any[], Error, any[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: studentQueryKeys.profiles(studentIds),
    queryFn: async () => {
      if (studentIds.length === 0) return [];

      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .in('student_id', studentIds);

      if (error) throw error;
      return data || [];
    },
    enabled: studentIds.length > 0,
    staleTime: DEFAULT_STALE_TIME,
    ...options,
  });
};
