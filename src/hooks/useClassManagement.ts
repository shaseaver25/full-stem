import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  ClassStudent, 
  ClassAssignment, 
  AssignmentWithSubmissions,
  Lesson,
  LessonComponent,
  AssignmentOptions,
  StudentOverride
} from '@/types/assignmentTypes';

// Query keys
export const classQueryKeys = {
  class: (id: string) => ['class', id] as const,
  students: (classId: string) => ['class', classId, 'students'] as const,
  assignments: (classId: string) => ['class', classId, 'assignments'] as const,
  assignment: (id: string) => ['assignment', id] as const,
  lessons: () => ['lessons'] as const,
  lessonComponents: (lessonId: string) => ['lesson', lessonId, 'components'] as const,
  availableStudents: () => ['students', 'available'] as const,
};

// Fetch class details
export const useClass = (classId: string) => {
  return useQuery({
    queryKey: classQueryKeys.class(classId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });
};

// Fetch class students (roster)
export const useClassStudents = (classId: string) => {
  return useQuery({
    queryKey: classQueryKeys.students(classId),
    queryFn: async (): Promise<ClassStudent[]> => {
      const { data: classStudentData, error: csError } = await supabase
        .from('class_students')
        .select('*')
        .eq('class_id', classId)
        .eq('status', 'active')
        .order('enrolled_at', { ascending: false });

      if (csError) throw csError;
      if (!classStudentData?.length) return [];

      const studentIds = classStudentData.map(cs => cs.student_id);
      const { data: studentData, error: sError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds)
        .order('last_name', { ascending: true });

      if (sError) throw sError;

      return classStudentData.map(cs => ({
        ...cs,
        status: cs.status as 'active' | 'inactive',
        student: studentData?.find(s => s.id === cs.student_id) || {
          id: cs.student_id,
          first_name: 'Unknown',
          last_name: 'Student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }));
    },
    enabled: !!classId,
  });
};

// Fetch available students for enrollment
export const useAvailableStudents = () => {
  return useQuery({
    queryKey: classQueryKeys.availableStudents(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

// Enroll students mutation
export const useEnrollStudents = (classId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentIds: string[]) => {
      const { error } = await supabase.rpc('rpc_enroll_students', {
        p_class_id: classId,
        p_student_ids: studentIds,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classQueryKeys.students(classId) });
      toast({
        title: '✅ Students Enrolled',
        description: 'Students have been successfully enrolled in the class.',
      });
    },
    onError: (error) => {
      console.error('Error enrolling students:', error);
      toast({
        title: 'Error',
        description: 'Failed to enroll students. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Remove student from class
export const useRemoveStudent = (classId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase
        .from('class_students')
        .update({ status: 'inactive' })
        .eq('class_id', classId)
        .eq('student_id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classQueryKeys.students(classId) });
      toast({
        title: '✅ Student Removed',
        description: 'Student has been removed from the class.',
      });
    },
    onError: (error) => {
      console.error('Error removing student:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove student. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Fetch lessons for assignment wizard - filtered by class
export const useLessons = (classId?: string) => {
  return useQuery({
    queryKey: [...classQueryKeys.lessons(), classId],
    queryFn: async (): Promise<Lesson[]> => {
      let query = supabase
        .from('lessons')
        .select('*')
        .order('title', { ascending: true });

      // Filter by class_id if provided
      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map database structure to our interface
      return (data || []).map(lesson => ({
        ...lesson,
        id: lesson.id,
        'Lesson ID': lesson.id,
        title: lesson.title,
        Title: lesson.title,
        description: lesson.description || undefined,
        Description: lesson.description || undefined,
        track: undefined,
        Track: undefined,
        subject: undefined,
        grade_level: undefined,
      }));
    },
    enabled: classId ? !!classId : true,
  });
};

// Fetch lesson components
export const useLessonComponents = (lessonId: string) => {
  return useQuery({
    queryKey: classQueryKeys.lessonComponents(lessonId),
    queryFn: async (): Promise<LessonComponent[]> => {
      const { data, error } = await supabase
        .from('lesson_components')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('enabled', true)
        .order('order', { ascending: true });

      if (error) throw error;

      return (data || []).map(component => ({
        id: component.id,
        type: component.component_type as LessonComponent['type'],
        title: (typeof component.content === 'object' && component.content && 'title' in component.content) 
          ? String(component.content.title) 
          : `${component.component_type} Component`,
        description: (typeof component.content === 'object' && component.content && 'description' in component.content)
          ? String(component.content.description)
          : (typeof component.content === 'object' && component.content && 'content' in component.content)
          ? String(component.content.content).slice(0, 100)
          : '',
        estimated_minutes: 30, // Default since not in current schema
        requires_submission: component.component_type === 'assignment',
        is_required: true,
        order_index: component.order,
      }));
    },
    enabled: !!lessonId,
  });
};

// Fetch class assignments
export const useClassAssignments = (classId: string) => {
  return useQuery({
    queryKey: classQueryKeys.assignments(classId),
    queryFn: async (): Promise<AssignmentWithSubmissions[]> => {
      const { data, error } = await supabase
        .from('class_assignments_new')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      return (data || []).map(assignment => ({
        ...assignment,
        selected_components: Array.isArray(assignment.selected_components) 
          ? assignment.selected_components 
          : JSON.parse(assignment.selected_components as string || '[]'),
        options: typeof assignment.options === 'object' 
          ? assignment.options 
          : JSON.parse(assignment.options as string || '{}'),
      }));
    },
    enabled: !!classId,
  });
};

// Fetch single assignment with submissions
export const useAssignment = (assignmentId: string) => {
  return useQuery({
    queryKey: classQueryKeys.assignment(assignmentId),
    queryFn: async (): Promise<AssignmentWithSubmissions> => {
      const { data: assignment, error: assignmentError } = await supabase
        .from('class_assignments_new')
        .select('*')
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;

      const { data: submissions, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', assignmentId);

      if (submissionsError) throw submissionsError;

      return {
        ...assignment,
        selected_components: Array.isArray(assignment.selected_components)
          ? assignment.selected_components
          : JSON.parse(assignment.selected_components as string || '[]'),
        options: typeof assignment.options === 'object'
          ? assignment.options
          : JSON.parse(assignment.options as string || '{}'),
        submissions: (submissions || []).map(sub => ({
          ...sub,
          status: sub.status as 'assigned' | 'draft' | 'submitted' | 'graded' | 'exempt',
          overrides: typeof sub.overrides === 'object'
            ? sub.overrides
            : JSON.parse(sub.overrides as string || '{}'),
          files: Array.isArray(sub.files) ? sub.files : [],
        }))
      };
    },
    enabled: !!assignmentId,
  });
};

// Create class mutation
export const useCreateClass = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classData: {
      name: string;
      subject?: string;
      grade_level?: string;
      description?: string;
      max_students?: number;
    }) => {
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          ...classData,
          teacher_id: (await supabase.auth.getUser()).data.user?.id || ''
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: '✅ Class Created',
        description: 'Class has been successfully created.',
      });
    },
    onError: (error) => {
      console.error('Error creating class:', error);
      toast({
        title: 'Error',
        description: 'Failed to create class. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Fetch all classes for teacher
export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

// Assign lesson mutation (renamed for clarity)
export const useAssignLesson = (classId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      componentIds,
      dueAt,
      releaseAt,
      options,
      studentOverrides = [],
      title,
      description,
      instructions,
      rubric
    }: {
      lessonId: number | string;
      componentIds: string[];
      dueAt: string;
      releaseAt?: string;
      options: AssignmentOptions;
      studentOverrides?: StudentOverride[];
      title?: string;
      description?: string;
      instructions?: string;
      rubric?: string;
    }) => {
      const { data, error } = await supabase.rpc('rpc_assign_lesson_to_class', {
        p_class_id: classId,
        p_lesson_id: lessonId.toString(),
        p_component_ids: componentIds,
        p_due_at: dueAt,
        p_release_at: releaseAt || null,
        p_options: options as any,
        p_title: title || null,
        p_description: description || null,
        p_instructions: instructions || null,
        p_rubric: rubric || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (assignmentId) => {
      queryClient.invalidateQueries({ queryKey: classQueryKeys.assignments(classId) });
      toast({
        title: '✅ Assignment Created',
        description: 'Assignment has been successfully created and distributed to students.',
      });
      return assignmentId;
    },
    onError: (error) => {
      console.error('Error creating assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create assignment. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Backfill assignments for student
export const useBackfillStudent = (classId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase.rpc('rpc_backfill_assignments_for_student', {
        p_class_id: classId,
        p_student_id: studentId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classQueryKeys.assignments(classId) });
      toast({
        title: '✅ Assignments Backfilled',
        description: 'Past assignments have been assigned to the new student.',
      });
    },
    onError: (error) => {
      console.error('Error backfilling assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to backfill assignments. Please try again.',
        variant: 'destructive',
      });
    },
  });
};