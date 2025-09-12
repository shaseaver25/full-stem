import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classManagementApi, Class, Student, ClassStudent, ClassAssignment } from '@/services/classManagementService';
import { useToast } from '@/hooks/use-toast';

// Classes
export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: classManagementApi.getClasses,
  });
};

export const useClass = (classId: string) => {
  return useQuery({
    queryKey: ['class', classId],
    queryFn: () => classManagementApi.getClass(classId),
    enabled: !!classId,
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: classManagementApi.createClass,
    onSuccess: (newClass) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: 'Class created',
        description: `${newClass.name} has been created successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating class',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Students
export const useAvailableStudents = () => {
  return useQuery({
    queryKey: ['students', 'available'],
    queryFn: classManagementApi.getAvailableStudents,
  });
};

export const useClassStudents = (classId: string) => {
  return useQuery({
    queryKey: ['class', classId, 'students'],
    queryFn: () => classManagementApi.getClassStudents(classId),
    enabled: !!classId,
  });
};

export const useEnrollStudents = (classId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (studentIds: string[]) => classManagementApi.enrollStudents(classId, studentIds),
    onSuccess: (_, studentIds) => {
      queryClient.invalidateQueries({ queryKey: ['class', classId, 'students'] });
      toast({
        title: 'Students enrolled',
        description: `${studentIds.length} student${studentIds.length > 1 ? 's' : ''} enrolled successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error enrolling students',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useRemoveStudent = (classId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (studentId: string) => classManagementApi.removeStudent(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class', classId, 'students'] });
      toast({
        title: 'Student removed',
        description: 'Student has been removed from the class.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error removing student',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Lessons and Components
export const useLessons = () => {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: classManagementApi.getLessons,
  });
};

export const useLessonComponents = (lessonId: number) => {
  return useQuery({
    queryKey: ['lesson', lessonId, 'components'],
    queryFn: () => classManagementApi.getLessonComponents(lessonId),
    enabled: !!lessonId,
  });
};

// Assignments
export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: classManagementApi.createAssignment,
    onSuccess: (assignment) => {
      queryClient.invalidateQueries({ queryKey: ['class', assignment.class_id, 'assignments'] });
      toast({
        title: 'Assignment created',
        description: `${assignment.title} has been assigned to the class.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating assignment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useClassAssignments = (classId: string) => {
  return useQuery({
    queryKey: ['class', classId, 'assignments'],
    queryFn: () => classManagementApi.getClassAssignments(classId),
    enabled: !!classId,
  });
};

export const useAssignmentSubmissions = (assignmentId: string) => {
  return useQuery({
    queryKey: ['assignment', assignmentId, 'submissions'],
    queryFn: () => classManagementApi.getAssignmentSubmissions(assignmentId),
    enabled: !!assignmentId,
  });
};