import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { StudentProfile, ProfileData } from '@/types/surveyTypes';

export interface StudentWithProfile {
  id: string;
  first_name: string;
  last_name: string;
  grade_level?: string;
  reading_level?: string;
  class_name?: string;
  profile?: ProfileData;
  survey_completed?: boolean;
  survey_completed_at?: string;
}

export const useStudentProfiles = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentWithProfile[]>([]);

  const fetchStudentProfiles = useCallback(async (classId?: string) => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get teacher profile first
      const { data: teacherProfile, error: teacherError } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (teacherError) throw teacherError;

      // Build base query for students
      let studentsQuery = supabase
        .from('students')
        .select(`
          id,
          first_name,
          last_name,
          grade_level,
          reading_level,
          class_id,
          classes!inner (
            name,
            teacher_id
          )
        `)
        .eq('classes.teacher_id', teacherProfile.id);

      // Filter by class if specified
      if (classId) {
        studentsQuery = studentsQuery.eq('class_id', classId);
      }

      const { data: studentsData, error: studentsError } = await studentsQuery;

      if (studentsError) throw studentsError;

      // Get profiles for all students
      const studentIds = studentsData?.map(s => s.id) || [];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('student_profiles')
        .select('*')
        .in('student_id', studentIds);

      if (profilesError) throw profilesError;

      // Combine student data with profiles
      const studentsWithProfiles: StudentWithProfile[] = studentsData?.map(student => {
        const profile = profilesData?.find(p => p.student_id === student.id);
        
        return {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          grade_level: student.grade_level,
          reading_level: student.reading_level,
          class_name: (student.classes as any)?.name,
          profile: profile?.profile_json as unknown as ProfileData,
          survey_completed: !!profile?.survey_completed_at,
          survey_completed_at: profile?.survey_completed_at
        };
      }) || [];

      setStudents(studentsWithProfiles);
    } catch (error) {
      console.error('Error fetching student profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load student profiles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const generateProjectIdea = useCallback(async (student: StudentWithProfile): Promise<string> => {
    if (!student.profile) {
      return "Please complete the Learning Genius survey first to get personalized project ideas.";
    }

    // Generate project idea based on profile
    const { learning_styles, top_interests, motivation_triggers } = student.profile;
    
    let projectIdea = `Based on ${student.first_name}'s learning profile:\n\n`;
    
    // Add learning style context
    if (learning_styles.length > 0) {
      const styleDescriptions = {
        visual: "visual demonstrations and diagrams",
        auditory: "discussions and verbal explanations", 
        read_write: "research and written documentation",
        kinesthetic: "hands-on building and experimentation"
      };
      
      const primaryStyle = learning_styles[0];
      projectIdea += `• Learning Style: ${primaryStyle} - incorporate ${styleDescriptions[primaryStyle as keyof typeof styleDescriptions]}\n`;
    }

    // Add interest-based suggestions
    if (top_interests.includes('robotics') || top_interests.includes('building_tinkering')) {
      projectIdea += `• Project: Build a voice-controlled robot that responds to commands\n`;
      projectIdea += `• Skills: Programming, electronics, mechanical design\n`;
    } else if (top_interests.includes('art_music') && top_interests.includes('ai_creation')) {
      projectIdea += `• Project: Create an AI-powered music or art generator\n`;
      projectIdea += `• Skills: Creative coding, machine learning basics, digital art\n`;
    } else if (top_interests.includes('community_help')) {
      projectIdea += `• Project: Design an AI assistant to help solve a community problem\n`;
      projectIdea += `• Skills: Problem identification, user research, basic AI concepts\n`;
    } else {
      projectIdea += `• Project: Create a personalized learning tool based on your interests\n`;
      projectIdea += `• Skills: Research, design thinking, basic programming\n`;
    }

    // Add motivation context
    if (motivation_triggers.includes('hands_on_challenge')) {
      projectIdea += `• Approach: Include plenty of building, testing, and iterating\n`;
    }
    if (motivation_triggers.includes('creativity')) {
      projectIdea += `• Approach: Allow for creative expression and artistic elements\n`;
    }
    if (motivation_triggers.includes('collaboration')) {
      projectIdea += `• Approach: Consider team-based or community-focused aspects\n`;
    }

    return projectIdea;
  }, []);

  const suggestAssignmentModifications = useCallback(async (student: StudentWithProfile): Promise<string> => {
    if (!student.profile) {
      return "Complete the Learning Genius survey to get personalized assignment suggestions.";
    }

    const { learning_styles, support_needs, ai_recommendations } = student.profile;
    
    let suggestions = `Assignment modifications for ${student.first_name}:\n\n`;

    // Learning style modifications
    if (learning_styles.includes('visual')) {
      suggestions += `• Provide visual aids, diagrams, and infographics\n`;
      suggestions += `• Allow submission of mind maps or visual presentations\n`;
    }
    if (learning_styles.includes('kinesthetic')) {
      suggestions += `• Include hands-on activities and experiments\n`;
      suggestions += `• Allow for movement breaks during longer assignments\n`;
    }
    if (learning_styles.includes('auditory')) {
      suggestions += `• Provide audio recordings of instructions\n`;
      suggestions += `• Allow oral presentations instead of written reports\n`;
    }

    // Support modifications
    if (support_needs.includes('step_by_step')) {
      suggestions += `• Break assignments into clear, numbered steps\n`;
      suggestions += `• Provide checklists and progress tracking\n`;
    }
    if (support_needs.includes('needs_tts')) {
      suggestions += `• Enable text-to-speech for all written materials\n`;
    }
    if (support_needs.some(need => need.startsWith('needs_translation'))) {
      const language = support_needs.find(need => need.startsWith('needs_translation:'))?.split(':')[1];
      suggestions += `• Provide materials in ${language} when possible\n`;
    }
    if (support_needs.includes('extra_practice')) {
      suggestions += `• Provide additional practice problems or examples\n`;
    }

    // AI recommendation-based modifications
    if (ai_recommendations.assignment_preferences.scaffolds.includes('retry_tokens')) {
      suggestions += `• Allow multiple attempts with feedback between tries\n`;
    }
    if (ai_recommendations.assignment_preferences.presentation_modes.includes('video_demo')) {
      suggestions += `• Accept video demonstrations as alternative to written work\n`;
    }

    return suggestions;
  }, []);

  return {
    loading,
    students,
    fetchStudentProfiles,
    generateProjectIdea,
    suggestAssignmentModifications
  };
};