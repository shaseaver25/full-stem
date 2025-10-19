/**
 * Optimized Query Helpers
 * 
 * Provides pre-configured query builders with optimal column selection
 * to replace inefficient `select('*')` patterns
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Student Query Builders
 */
export const studentQueries = {
  /**
   * Minimal student data for lists/dropdowns
   */
  minimal: () => supabase
    .from('students')
    .select('id, first_name, last_name, grade_level, user_id'),

  /**
   * Student list view with essential fields
   */
  list: () => supabase
    .from('students')
    .select(`
      id,
      first_name,
      last_name,
      grade_level,
      reading_level,
      language_preference,
      user_id
    `),

  /**
   * Full student profile with all details
   */
  profile: (studentId: string) => supabase
    .from('students')
    .select(`
      id,
      first_name,
      last_name,
      grade_level,
      reading_level,
      learning_style,
      interests,
      iep_accommodations,
      language_preference,
      lesson_modifications,
      user_id,
      created_at,
      updated_at
    `)
    .eq('id', studentId)
    .single(),

  /**
   * Student with enrollment data
   */
  withEnrollment: (studentId: string) => supabase
    .from('students')
    .select(`
      id,
      first_name,
      last_name,
      grade_level,
      class_students!inner(
        id,
        class_id,
        status,
        joined_at,
        classes(
          id,
          name,
          description,
          teacher_id
        )
      )
    `)
    .eq('id', studentId),
};

/**
 * Class Query Builders
 */
export const classQueries = {
  /**
   * Minimal class data for lists
   */
  minimal: () => supabase
    .from('classes')
    .select('id, name, teacher_id, published'),

  /**
   * Class list view
   */
  list: (teacherId?: string) => {
    let query = supabase
      .from('classes')
      .select(`
        id,
        name,
        description,
        published,
        teacher_id,
        created_at,
        class_code
      `)
      .order('created_at', { ascending: false });

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    return query;
  },

  /**
   * Full class details
   */
  detail: (classId: string) => supabase
    .from('classes')
    .select(`
      id,
      name,
      description,
      published,
      published_at,
      teacher_id,
      class_code,
      created_at,
      updated_at
    `)
    .eq('id', classId)
    .single(),

  /**
   * Class with enrolled students
   */
  withStudents: (classId: string) => supabase
    .from('classes')
    .select(`
      id,
      name,
      class_students!inner(
        id,
        status,
        joined_at,
        students(
          id,
          first_name,
          last_name,
          grade_level,
          user_id
        )
      )
    `)
    .eq('id', classId)
    .eq('class_students.status', 'active'),

  /**
   * Class with lessons
   */
  withLessons: (classId: string) => supabase
    .from('classes')
    .select(`
      id,
      name,
      lessons(
        id,
        title,
        description,
        duration,
        order_index,
        created_at
      )
    `)
    .eq('id', classId)
    .order('order_index', { foreignTable: 'lessons' }),
};

/**
 * Assignment Query Builders
 */
export const assignmentQueries = {
  /**
   * Assignment list view
   */
  list: (classId?: string) => {
    let query = supabase
      .from('class_assignments_new')
      .select(`
        id,
        title,
        description,
        due_at,
        max_points,
        class_id,
        lesson_id,
        created_at
      `)
      .order('due_at', { ascending: false, nullsFirst: false });

    if (classId) {
      query = query.eq('class_id', classId);
    }

    return query;
  },

  /**
   * Full assignment details
   */
  detail: (assignmentId: string) => supabase
    .from('class_assignments_new')
    .select(`
      id,
      title,
      description,
      instructions,
      rubric,
      max_points,
      due_at,
      release_at,
      selected_components,
      options,
      class_id,
      lesson_id,
      created_at,
      updated_at
    `)
    .eq('id', assignmentId)
    .single(),

  /**
   * Assignment with submissions
   */
  withSubmissions: (assignmentId: string) => supabase
    .from('class_assignments_new')
    .select(`
      id,
      title,
      max_points,
      assignment_submissions(
        id,
        user_id,
        status,
        submitted_at,
        text_response,
        students!inner(
          id,
          first_name,
          last_name,
          grade_level
        )
      )
    `)
    .eq('id', assignmentId),
};

/**
 * Lesson Query Builders
 */
export const lessonQueries = {
  /**
   * Minimal lesson data
   */
  minimal: () => supabase
    .from('lessons')
    .select('id, title, class_id, order_index'),

  /**
   * Lesson list view
   */
  list: (classId?: string) => {
    let query = supabase
      .from('lessons')
      .select(`
        id,
        title,
        description,
        duration,
        order_index,
        class_id,
        created_at
      `)
      .order('order_index');

    if (classId) {
      query = query.eq('class_id', classId);
    }

    return query;
  },

  /**
   * Full lesson details
   */
  detail: (lessonId: string) => supabase
    .from('lessons')
    .select(`
      id,
      title,
      description,
      duration,
      objectives,
      materials,
      content,
      desmos_enabled,
      desmos_type,
      class_id,
      order_index,
      created_at,
      updated_at
    `)
    .eq('id', lessonId)
    .single(),

  /**
   * Lesson with components
   */
  withComponents: (lessonId: string) => supabase
    .from('lessons')
    .select(`
      id,
      title,
      description,
      duration,
      lesson_components(
        id,
        component_type,
        order,
        content,
        reading_level,
        read_aloud,
        enabled,
        language_code
      )
    `)
    .eq('id', lessonId)
    .order('order', { foreignTable: 'lesson_components' })
    .single(),
};

/**
 * Enrollment Query Builders
 */
export const enrollmentQueries = {
  /**
   * Active enrollments for a class
   */
  byClass: (classId: string) => supabase
    .from('class_students')
    .select(`
      id,
      student_id,
      status,
      joined_at,
      students!inner(
        id,
        first_name,
        last_name,
        grade_level,
        user_id
      )
    `)
    .eq('class_id', classId)
    .eq('status', 'active')
    .order('students(last_name)'),

  /**
   * Student's enrollments
   */
  byStudent: (studentId: string) => supabase
    .from('class_students')
    .select(`
      id,
      class_id,
      status,
      joined_at,
      classes!inner(
        id,
        name,
        description,
        teacher_id
      )
    `)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .order('joined_at', { ascending: false }),
};

/**
 * Submission Query Builders
 */
export const submissionQueries = {
  /**
   * Student's submission for an assignment
   */
  forStudent: (assignmentId: string, userId: string) => supabase
    .from('assignment_submissions')
    .select(`
      id,
      assignment_id,
      user_id,
      status,
      text_response,
      file_urls,
      file_names,
      submitted_at,
      last_edited_at,
      return_reason,
      ai_feedback,
      created_at,
      updated_at
    `)
    .eq('assignment_id', assignmentId)
    .eq('user_id', userId)
    .single(),

  /**
   * All submissions for an assignment (teacher view)
   */
  forAssignment: (assignmentId: string) => supabase
    .from('assignment_submissions')
    .select(`
      id,
      user_id,
      status,
      submitted_at,
      students!inner(
        id,
        first_name,
        last_name,
        grade_level
      ),
      assignment_grades(
        id,
        grade,
        feedback,
        graded_at
      )
    `)
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false, nullsFirst: false }),
};

/**
 * Notification Query Builders
 */
export const notificationQueries = {
  /**
   * Unread notifications for user
   */
  unread: (userId: string) => supabase
    .from('notifications')
    .select(`
      id,
      title,
      message,
      type,
      metadata,
      created_at
    `)
    .eq('user_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(20),

  /**
   * All notifications for user
   */
  all: (userId: string) => supabase
    .from('notifications')
    .select(`
      id,
      title,
      message,
      type,
      metadata,
      read_at,
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50),
};
