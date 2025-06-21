
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useLessonProgressUpdate = () => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);

  const markLessonComplete = async (lessonId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your progress.",
        variant: "destructive",
      });
      return false;
    }

    setUpdating(true);
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: 'Completed',
          progress_percentage: 100,
          completed_at: now,
          date_completed: now,
          updated_at: now,
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Error updating progress:', error);
        toast({
          title: "Error",
          description: "Failed to mark lesson as complete.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Lesson Complete!",
        description: "Your progress has been saved successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete.",
        variant: "destructive",
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return { markLessonComplete, updating };
};
