
import { supabase } from "@/integrations/supabase/client";

export interface PublishAssignmentData {
  classAssignmentId: string;
  classId: string;
  lessonId?: number;
  title: string;
  description?: string;
  instructions: string;
  dueDate?: string;
  maxPoints?: number;
  fileTypesAllowed?: string[];
  maxFiles?: number;
  allowTextResponse?: boolean;
}

export interface PublishedAssignment {
  id: string;
  class_assignment_id: string;
  class_id: string;
  lesson_id?: number;
  title: string;
  description?: string;
  instructions: string;
  due_date?: string;
  max_points: number;
  file_types_allowed: string[];
  max_files: number;
  allow_text_response: boolean;
  published_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const publishAssignment = async (data: PublishAssignmentData) => {
  try {
    const { data: result, error } = await supabase
      .from('published_assignments')
      .insert({
        class_assignment_id: data.classAssignmentId,
        class_id: data.classId,
        lesson_id: data.lessonId,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        due_date: data.dueDate,
        max_points: data.maxPoints || 100,
        file_types_allowed: data.fileTypesAllowed || ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
        max_files: data.maxFiles || 5,
        allow_text_response: data.allowTextResponse ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result };
  } catch (error) {
    console.error('Error publishing assignment:', error);
    return { success: false, error };
  }
};

export const getPublishedAssignments = async (classId: string) => {
  try {
    const { data, error } = await supabase
      .from('published_assignments')
      .select('*')
      .eq('class_id', classId)
      .eq('is_active', true)
      .order('published_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching published assignments:', error);
    return { success: false, error };
  }
};

export const updatePublishedAssignment = async (assignmentId: string, updates: Partial<PublishAssignmentData>) => {
  try {
    const { data, error } = await supabase
      .from('published_assignments')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error updating published assignment:', error);
    return { success: false, error };
  }
};

export const deactivatePublishedAssignment = async (assignmentId: string) => {
  try {
    const { error } = await supabase
      .from('published_assignments')
      .update({ is_active: false })
      .eq('id', assignmentId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deactivating published assignment:', error);
    return { success: false, error };
  }
};
