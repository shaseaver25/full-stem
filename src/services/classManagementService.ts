import { supabase } from '@/integrations/supabase/client';

export interface Student {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  grade_level?: string;
  created_at: string;
  updated_at: string;
}

export interface ClassStudent {
  id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
  status: string;
  student: Student;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  subject?: string;
  grade_level?: string;
  description?: string;
  max_students?: number;
  created_at: string;
  updated_at: string;
}

export interface ClassAssignment {
  id: string;
  class_id: string;
  lesson_id?: number;
  title: string;
  description?: string;
  selected_components: string[];
  options: Record<string, any>;
  release_at?: string;
  due_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LessonComponent {
  id: string;
  type: 'activity' | 'resource' | 'formative_check' | 'homework';
  title: string;
  description?: string;
  estimated_minutes?: number;
  requires_submission: boolean;
  content: any;
}

// Class Management
export const classManagementApi = {
  // Classes
  async createClass(classData: Omit<Class, 'id' | 'teacher_id' | 'created_at' | 'updated_at'>) {
    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!teacherProfile) throw new Error('Teacher profile not found');

    const { data, error } = await supabase
      .from('classes')
      .insert({
        ...classData,
        teacher_id: teacherProfile.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Class;
  },

  async getClasses() {
    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!teacherProfile) throw new Error('Teacher profile not found');

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherProfile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Class[];
  },

  async getClass(classId: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (error) throw error;
    return data as Class;
  },

  // Students
  async getAvailableStudents() {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) throw error;
    return data as Student[];
  },

  async getClassStudents(classId: string) {
    // First get class students
    const { data: classStudentData, error: csError } = await supabase
      .from('class_students')
      .select('*')
      .eq('class_id', classId)
      .eq('status', 'active');

    if (csError) throw csError;

    if (!classStudentData || classStudentData.length === 0) {
      return [];
    }

    // Get student details
    const studentIds = classStudentData.map(cs => cs.student_id);
    const { data: studentData, error: sError } = await supabase
      .from('students')
      .select('*')
      .in('id', studentIds);

    if (sError) throw sError;

    // Combine the data
    const result = classStudentData.map(cs => ({
      ...cs,
      student: studentData?.find(s => s.id === cs.student_id) || {
        id: cs.student_id,
        first_name: 'Unknown',
        last_name: 'Student',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }));

    return result as ClassStudent[];
  },

  async enrollStudents(classId: string, studentIds: string[]) {
    const enrollmentData = studentIds.map(studentId => ({
      class_id: classId,
      student_id: studentId,
    }));

    const { data, error } = await supabase
      .from('class_students')
      .upsert(enrollmentData, { onConflict: 'class_id,student_id' })
      .select();

    if (error) throw error;
    return data;
  },

  async removeStudent(classId: string, studentId: string) {
    const { error } = await supabase
      .from('class_students')
      .update({ status: 'inactive' })
      .eq('class_id', classId)
      .eq('student_id', studentId);

    if (error) throw error;
  },

  // Lessons and Components
  async getLessons() {
    const { data, error } = await supabase
      .from('Lessons')
      .select('*')
      .order('Title', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getLessonComponents(lessonId: number) {
    // Get activities as components
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('lesson_id', lessonId.toString())
      .order('order_index', { ascending: true });

    if (error) throw error;

    // Transform activities into lesson components
    const components: LessonComponent[] = activities?.map(activity => ({
      id: activity.id,
      type: 'activity' as const,
      title: activity.title,
      description: activity.description,
      estimated_minutes: activity.estimated_time || 30,
      requires_submission: activity.activity_type === 'assignment',
      content: activity,
    })) || [];

    return components;
  },

  // Assignments
  async createAssignment(assignmentData: {
    classId: string;
    lessonId?: string; // Changed to string for UUID support
    title: string;
    description?: string;
    selectedComponents: string[];
    options: Record<string, any>;
    releaseAt?: string;
    dueAt?: string;
  }) {
    const { data, error } = await supabase
      .from('class_assignments_new')
      .insert({
        class_id: assignmentData.classId,
        lesson_id: assignmentData.lessonId,
        title: assignmentData.title,
        description: assignmentData.description,
        selected_components: assignmentData.selectedComponents,
        options: assignmentData.options,
        release_at: assignmentData.releaseAt,
        due_at: assignmentData.dueAt,
      })
      .select()
      .single();

    if (error) throw error;

    // Create assignment submissions for all enrolled students
    const classStudents = await this.getClassStudents(assignmentData.classId);
    const submissionData = classStudents.map(cs => ({
      assignment_id: data.id,
      user_id: cs.student_id,
      status: 'assigned',
      overrides: {},
    }));

    if (submissionData.length > 0) {
      const { error: submissionError } = await supabase
        .from('assignment_submissions')
        .insert(submissionData);

      if (submissionError) throw submissionError;
    }

    // Generate embedding for the assignment (async, non-blocking)
    this.embedAssignmentAsync(data.id, assignmentData.classId, {
      title: assignmentData.title,
      description: assignmentData.description,
      instructions: assignmentData.options?.instructions,
      selected_components: assignmentData.selectedComponents,
    }).catch(err => {
      console.error('Error embedding assignment:', err);
      // Don't throw - embedding is not critical for assignment creation
    });

    return data;
  },

  async getClassAssignments(classId: string) {
    const { data, error } = await supabase
      .from('class_assignments_new')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAssignmentSubmissions(assignmentId: string) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        student:students(first_name, last_name, email)
      `)
      .eq('assignment_id', assignmentId);

    if (error) throw error;
    return data;
  },

  /**
   * Asynchronously embed assignment in background
   */
  async embedAssignmentAsync(
    assignmentId: string,
    classId: string,
    assignmentData: {
      title: string;
      description?: string;
      instructions?: string;
      selected_components?: any;
    }
  ) {
    try {
      // Fetch class details for metadata
      const { data: classData } = await supabase
        .from('classes')
        .select('grade_level, subject')
        .eq('id', classId)
        .single();

      // Build content string
      const contentParts = [];
      if (assignmentData.title) contentParts.push(`Title: ${assignmentData.title}`);
      if (assignmentData.description) contentParts.push(`Description: ${assignmentData.description}`);
      if (assignmentData.instructions) contentParts.push(`Instructions: ${assignmentData.instructions}`);
      
      const components = Array.isArray(assignmentData.selected_components)
        ? assignmentData.selected_components
        : [];
      if (components.length > 0) {
        contentParts.push(`Components: ${components.join(', ')}`);
      }

      const content = contentParts.join('\n\n');

      // Build metadata
      const metadata = {
        grade_level: classData?.grade_level,
        subject: classData?.subject,
        content_type: 'assignment',
      };

      // Call embedding function
      const { error } = await supabase.functions.invoke('embed-assignment', {
        body: {
          assignmentId,
          content,
          metadata,
        },
      });

      if (error) {
        console.error('Error calling embed-assignment:', error);
      } else {
        console.log('✓ Assignment embedded successfully:', assignmentId);
      }
    } catch (error) {
      console.error('Error in embedAssignmentAsync:', error);
    }
  },
};