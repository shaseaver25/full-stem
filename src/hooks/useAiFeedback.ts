import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAiFeedback = () => {
  const { toast } = useToast();
  const [preferredLanguage, setPreferredLanguage] = useState<string>('en');

  useEffect(() => {
    const fetchLanguagePreference = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: student } = await supabase
        .from('students')
        .select('language_preference')
        .eq('user_id', user.id)
        .single();

      if (student?.language_preference) {
        setPreferredLanguage(student.language_preference);
      }
    };

    fetchLanguagePreference();
  }, []);

  const generateFeedback = async (
    submissionId: string,
    submissionText: string,
    grade?: number,
    teacherFeedback?: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-feedback', {
        body: {
          submissionId,
          submissionText,
          grade,
          teacherFeedback,
          preferredLanguage,
        },
      });

      if (error) {
        if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
          toast({
            title: "Please wait",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402') || error.message?.includes('Payment')) {
          toast({
            title: "Service Unavailable",
            description: "AI feedback is temporarily unavailable.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return null;
      }

      toast({
        title: "✨ AI Tips Generated!",
        description: "Personalized learning tips have been added.",
      });

      return data.feedback;
    } catch (err) {
      console.error('Error generating AI feedback:', err);
      toast({
        title: "Error",
        description: "Failed to generate AI tips. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const generateSummary = async (
    submissions: Array<{ assignment_title?: string; grade?: number; feedback?: string }>
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-performance-summary', {
        body: {
          submissions,
          preferredLanguage,
        },
      });

      if (error) {
        if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
          toast({
            title: "Please wait",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return null;
      }

      return data.feedback;
    } catch (err) {
      console.error('Error generating performance summary:', err);
      toast({
        title: "Error",
        description: "Failed to generate performance summary.",
        variant: "destructive",
      });
      return null;
    }
  };

  return { generateFeedback, generateSummary, preferredLanguage };
};
