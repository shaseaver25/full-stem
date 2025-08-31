
import { supabase } from '@/integrations/supabase/client';
import { Assignment, AssignmentSubmission } from '@/types/assignmentTypes';

export const fetchAssignments = async (lessonId: string): Promise<Assignment[]> => {
  console.log('Fetching assignments for lesson:', lessonId);
  
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('lesson_id', parseInt(lessonId));

  console.log('Assignment query result:', { data, error, lessonId: parseInt(lessonId) });
  
  if (error) {
    console.error('Assignment fetch error:', error);
    throw error;
  }
  return data || [];
};

export const fetchSubmissions = async (
  assignmentIds: string[],
  userId: string
): Promise<AssignmentSubmission[]> => {
  if (!userId || !assignmentIds.length) return [];

  const { data, error } = await supabase
    .from('assignment_submissions')
    .select('*')
    .in('assignment_id', assignmentIds)
    .eq('user_id', userId);

  if (error) throw error;
  
  // Type assertion to ensure status is properly typed
  return (data || []).map(submission => ({
    ...submission,
    status: submission.status as 'draft' | 'submitted'
  }));
};

export const saveDraft = async ({
  assignmentId,
  userId,
  textResponse,
  fileUrls,
  fileNames,
  fileTypes,
}: {
  assignmentId: string;
  userId: string;
  textResponse: string;
  fileUrls: string[];
  fileNames: string[];
  fileTypes: string[];
}) => {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .upsert({
      assignment_id: assignmentId,
      user_id: userId,
      text_response: textResponse,
      file_urls: fileUrls,
      file_names: fileNames,
      file_types: fileTypes,
      status: 'draft',
      last_edited_at: new Date().toISOString(),
    }, {
      onConflict: 'assignment_id,user_id'
    });

  if (error) throw error;
  return data;
};

export const submitAssignment = async ({
  assignmentId,
  userId,
  textResponse,
  fileUrls,
  fileNames,
  fileTypes,
}: {
  assignmentId: string;
  userId: string;
  textResponse: string;
  fileUrls: string[];
  fileNames: string[];
  fileTypes: string[];
}) => {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .upsert({
      assignment_id: assignmentId,
      user_id: userId,
      text_response: textResponse,
      file_urls: fileUrls,
      file_names: fileNames,
      file_types: fileTypes,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      last_edited_at: new Date().toISOString(),
    }, {
      onConflict: 'assignment_id,user_id'
    });

  if (error) throw error;
  return data;
};

export const uploadFile = async (file: File, assignmentId: string, userId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${assignmentId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('assignment-files')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('assignment-files')
    .getPublicUrl(fileName);

  return publicUrl;
};
