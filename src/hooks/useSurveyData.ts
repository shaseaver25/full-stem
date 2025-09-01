import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { SurveyResponse, StudentProfile, ProfileData } from '@/types/surveyTypes';
import { LEARNING_GENIUS_SURVEY } from '@/data/learningGeniusSurvey';

export const useSurveyData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);

  const saveSurveyResponse = useCallback(async (
    questionId: string,
    answerValue: any,
    tags: string[] = []
  ) => {
    if (!user?.id) return;

    try {
      const response: Omit<SurveyResponse, 'id' | 'created_at' | 'updated_at'> = {
        student_id: user.id,
        question_id: questionId,
        answer_value: answerValue,
        tags
      };

      const { error } = await supabase
        .from('survey_responses')
        .upsert(response, {
          onConflict: 'student_id,question_id'
        });

      if (error) throw error;
      
      // Update local state
      setResponses(prev => {
        const filtered = prev.filter(r => r.question_id !== questionId);
        return [...filtered, response as SurveyResponse];
      });

    } catch (error) {
      console.error('Error saving survey response:', error);
      toast({
        title: "Error",
        description: "Failed to save survey response",
        variant: "destructive"
      });
    }
  }, [user?.id]);

  const generateProfile = useCallback(async (): Promise<ProfileData | null> => {
    if (!user?.id || responses.length === 0) return null;

    try {
      // Aggregate tags from all responses
      const tagCounts: Record<string, number> = {};
      let preferredName = '';
      let teacherNotes = '';

      responses.forEach(response => {
        // Handle special cases for text responses
        if (response.question_id === 'q1' && typeof response.answer_value === 'string') {
          preferredName = response.answer_value;
        }
        if (response.question_id === 'q20' && typeof response.answer_value === 'string') {
          teacherNotes = response.answer_value;
        }
        if (response.question_id === 'q18' && typeof response.answer_value === 'string' && response.answer_value.trim()) {
          // Handle translation needs
          response.tags.push(`needs_translation:${response.answer_value.trim()}`);
        }

        // Count tags
        response.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      // Determine learning styles (top 2)
      const learningStyleTags = ['visual', 'auditory', 'read_write', 'kinesthetic'];
      const learningStyles = learningStyleTags
        .map(style => ({ style, count: tagCounts[style] || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 2)
        .map(item => item.style);

      // Determine top interests (top 2)
      const interestTags = ['art_music', 'gaming_coding', 'community_help', 'building_tinkering', 'reading_writing', 'sports_movement', 'robotics', 'ai_creation'];
      const topInterests = interestTags
        .map(interest => ({ interest, count: tagCounts[interest] || 0 }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 2)
        .map(item => item.interest);

      // Determine motivation triggers (top 2)
      const motivationTags = ['creativity', 'logic', 'collaboration', 'hands_on_challenge'];
      const motivationTriggers = motivationTags
        .map(trigger => ({ trigger, count: tagCounts[trigger] || 0 }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 2)
        .map(item => item.trigger);

      // Determine support needs
      const supportTags = ['needs_tts', 'step_by_step', 'frequent_breaks', 'partner_work', 'quiet_time', 'visual_examples', 'extra_practice', 'hands_on_retry'];
      const supportNeeds = Object.keys(tagCounts)
        .filter(tag => tag.startsWith('needs_translation:') || supportTags.includes(tag))
        .filter(tag => tagCounts[tag] > 0);

      // Generate AI recommendations based on profile
      const projectTemplates = [];
      const presentationModes = [];
      const scaffolds = [];

      // Add project templates based on interests
      if (topInterests.includes('robotics') || topInterests.includes('building_tinkering')) {
        projectTemplates.push('robotics_voice_control');
      }
      if (topInterests.includes('art_music') || topInterests.includes('ai_creation')) {
        projectTemplates.push('ai_character_design');
      }
      if (topInterests.includes('community_help')) {
        projectTemplates.push('assistive_ai_for_community');
      }

      // Add presentation modes based on learning styles
      if (learningStyles.includes('visual')) {
        presentationModes.push('video_demo', 'diagram');
      }
      if (learningStyles.includes('kinesthetic')) {
        presentationModes.push('lab_report_template');
      }

      // Add scaffolds based on support needs
      if (supportNeeds.includes('step_by_step')) {
        scaffolds.push('checklist_step_by_step');
      }
      if (supportNeeds.includes('visual_examples')) {
        scaffolds.push('example_diagrams');
      }
      if (supportNeeds.includes('hands_on_retry')) {
        scaffolds.push('retry_tokens');
      }

      const profileData: ProfileData = {
        learning_styles: learningStyles,
        top_interests: topInterests,
        motivation_triggers: motivationTriggers,
        support_needs: supportNeeds,
        ai_recommendations: {
          project_templates: projectTemplates,
          assignment_preferences: {
            presentation_modes: presentationModes,
            scaffolds: scaffolds
          }
        },
        preferred_name: preferredName,
        notes: teacherNotes
      };

      return profileData;
    } catch (error) {
      console.error('Error generating profile:', error);
      return null;
    }
  }, [user?.id, responses]);

  const saveProfile = useCallback(async (profileData: ProfileData) => {
    if (!user?.id) return false;

    try {
      setLoading(true);

      const profileRecord = {
        student_id: user.id,
        profile_json: profileData as any,
        survey_completed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('student_profiles')
        .upsert(profileRecord, {
          onConflict: 'student_id'
        });

      if (error) throw error;

      toast({
        title: "Profile Saved",
        description: "Your learning profile has been created successfully!",
      });

      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save learning profile",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadExistingResponses = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('student_id', user.id);

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error loading survey responses:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadExistingProfile = useCallback(async (): Promise<StudentProfile | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('student_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as StudentProfile | null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  }, [user?.id]);

  return {
    loading,
    responses,
    saveSurveyResponse,
    generateProfile,
    saveProfile,
    loadExistingResponses,
    loadExistingProfile,
    survey: LEARNING_GENIUS_SURVEY
  };
};