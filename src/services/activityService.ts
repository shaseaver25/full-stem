
import { supabase } from '@/integrations/supabase/client';

export interface ApiActivity {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  activity_type: string;
  resources: any[];
  instructions: string | null;
  estimated_time: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const activityApi = {
  async getByLessonId(lessonId: string) {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index');
    
    if (error) throw error;
    return data as ApiActivity[];
  },

  async create(activityData: Partial<ApiActivity> & { lesson_id: string; title: string }) {
    const dbData = {
      lesson_id: activityData.lesson_id,
      title: activityData.title,
      description: activityData.description || null,
      activity_type: activityData.activity_type || 'general',
      resources: activityData.resources || [],
      instructions: activityData.instructions || null,
      estimated_time: activityData.estimated_time || 30,
      order_index: activityData.order_index || 0
    };

    const { data, error } = await supabase
      .from('activities')
      .insert(dbData)
      .select()
      .single();
    
    if (error) throw error;
    return data as ApiActivity;
  },

  async update(id: string, activityData: Partial<ApiActivity>) {
    const { data, error } = await supabase
      .from('activities')
      .update(activityData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ApiActivity;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
