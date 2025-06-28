
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SubmissionWithDetails {
  id: string;
  assignment_id: string;
  user_id: string;
  text_response: string | null;
  file_urls: string[] | null;
  file_names: string[] | null;
  file_types: string[] | null;
  submitted_at: string;
  status: string;
  assignment_title: string;
  student_name: string;
  student_email: string;
  has_grade: boolean;
}

export const useAssignmentSubmissions = (showUngradedOnly: boolean = false) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First get teacher's classes to filter submissions
      const { data: teacherClasses, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', user.id);

      if (classesError) throw classesError;

      if (!teacherClasses?.length) {
        setSubmissions([]);
        return;
      }

      const classIds = teacherClasses.map(c => c.id);

      // Get students from teacher's classes
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name, class_id')
        .in('class_id', classIds);

      if (studentsError) throw studentsError;

      if (!students?.length) {
        setSubmissions([]);
        return;
      }

      const studentIds = students.map(s => s.id);

      // Get submitted assignment submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          assignment_id,
          user_id,
          text_response,
          file_urls,
          file_names,
          file_types,
          submitted_at,
          status
        `)
        .in('user_id', studentIds)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      if (!submissionsData?.length) {
        setSubmissions([]);
        return;
      }

      // Get assignment details
      const assignmentIds = submissionsData.map(s => s.assignment_id);
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('id, title')
        .in('id', assignmentIds);

      if (assignmentsError) throw assignmentsError;

      // Get user profiles for student names
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      // Get existing grades for these submissions
      const submissionIds = submissionsData.map(s => s.id);
      const { data: grades, error: gradesError } = await supabase
        .from('assignment_grades')
        .select('submission_id')
        .in('submission_id', submissionIds);

      if (gradesError) throw gradesError;

      const gradedSubmissionIds = new Set(grades?.map(g => g.submission_id) || []);

      // Combine all data
      let submissionsWithDetails: SubmissionWithDetails[] = submissionsData.map(submission => {
        const assignment = assignments?.find(a => a.id === submission.assignment_id);
        const student = students.find(s => s.id === submission.user_id);
        const profile = profiles?.find(p => p.id === submission.user_id);
        const hasGrade = gradedSubmissionIds.has(submission.id);
        
        return {
          ...submission,
          assignment_title: assignment?.title || 'Unknown Assignment',
          student_name: student 
            ? `${student.first_name} ${student.last_name}`
            : profile?.full_name || 'Unknown Student',
          student_email: profile?.email || '',
          has_grade: hasGrade,
        };
      });

      // Filter ungraded submissions if requested
      if (showUngradedOnly) {
        submissionsWithDetails = submissionsWithDetails.filter(s => !s.has_grade);
      }

      setSubmissions(submissionsWithDetails);
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load assignment submissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [user, showUngradedOnly]);

  return {
    submissions,
    loading,
    refetch: fetchSubmissions,
  };
};
