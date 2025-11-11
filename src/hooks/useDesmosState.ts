import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useDesmosState = (lessonId: string, activityId: string) => {
  const [savedState, setSavedState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !lessonId) {
      setIsLoading(false);
      return;
    }

    loadSavedState();
  }, [user, lessonId, activityId]);

  const loadSavedState = async () => {
    if (!user?.id || !lessonId) return;

    try {
      const { data, error } = await supabase
        .from('student_math_sessions')
        .select('calculator_state')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .eq('activity_id', activityId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading calculator state:', error);
      } else if (data) {
        setSavedState(data.calculator_state);
      }
    } catch (error) {
      console.error('Error loading calculator state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCalculatorState = async (state: any) => {
    if (!user?.id || !lessonId) {
      throw new Error('User or lesson ID not available');
    }

    try {
      const { error } = await supabase
        .from('student_math_sessions')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          activity_id: activityId,
          calculator_state: state,
          session_type: 'calculator',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id,activity_id',
        });

      if (error) throw error;

      setSavedState(state);
    } catch (error) {
      console.error('Error saving calculator state:', error);
      throw error;
    }
  };

  const clearCalculatorState = async () => {
    if (!user?.id || !lessonId) return;

    try {
      const { error } = await supabase
        .from('student_math_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .eq('activity_id', activityId);

      if (error) throw error;

      setSavedState(null);
    } catch (error) {
      console.error('Error clearing calculator state:', error);
      throw error;
    }
  };

  return {
    savedState,
    isLoading,
    saveCalculatorState,
    clearCalculatorState,
    loadSavedState,
  };
};
