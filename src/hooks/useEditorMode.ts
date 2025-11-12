import { useMemo } from 'react';

export type EditorMode = 'kid' | 'pro';

export interface User {
  id: string;
  role?: 'student' | 'teacher';
  grade?: number;
  preferences?: {
    editorMode?: EditorMode;
  };
}

export interface Lesson {
  id: string;
  gradeLevel?: number;
  targetGrades?: number[];
}

/**
 * Determines the appropriate editor mode based on user and lesson context
 * 
 * Logic:
 * 1. Check user preferences first (if explicitly set)
 * 2. For students: use grade level (K-5 → kid, 6-12 → pro)
 * 3. For lessons: use target grade level
 * 4. Default to "pro" for teachers and unknown cases
 */
export const useEditorMode = (
  user?: User | null,
  lesson?: Lesson | null,
  override?: EditorMode
): EditorMode => {
  return useMemo(() => {
    // 1. Check for explicit override
    if (override) {
      return override;
    }

    // 2. Check user preferences
    if (user?.preferences?.editorMode) {
      return user.preferences.editorMode;
    }

    // 3. Determine from user grade (students only)
    if (user?.role === 'student' && user.grade !== undefined) {
      return user.grade <= 5 ? 'kid' : 'pro';
    }

    // 4. Determine from lesson target grades
    if (lesson?.gradeLevel !== undefined) {
      return lesson.gradeLevel <= 5 ? 'kid' : 'pro';
    }

    if (lesson?.targetGrades && lesson.targetGrades.length > 0) {
      const avgGrade = lesson.targetGrades.reduce((a, b) => a + b, 0) / lesson.targetGrades.length;
      return avgGrade <= 5 ? 'kid' : 'pro';
    }

    // 5. Default to pro for teachers and unknown cases
    return 'pro';
  }, [user, lesson, override]);
};

/**
 * Helper to save user's editor mode preference
 * This is a stub - implement with your actual user settings service
 */
export const saveEditorModePreference = async (
  userId: string,
  mode: EditorMode
): Promise<void> => {
  // TODO: Implement with Supabase user preferences
  console.log('Saving editor mode preference:', { userId, mode });
  
  // Example implementation:
  // await supabase
  //   .from('user_preferences')
  //   .upsert({ user_id: userId, editor_mode: mode });
};
