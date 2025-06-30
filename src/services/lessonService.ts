
import { supabase } from '@/integrations/supabase/client';

export interface ApiLesson {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  objectives: string[];
  content: any;
  materials: string[];
  duration: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const lessonApi = {
  async getByClassId(classId: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('class_id', classId)
      .order('order_index');
    
    if (error) throw error;
    return data as ApiLesson[];
  },

  async create(lessonData: Partial<ApiLesson> & { class_id: string; title: string }) {
    const dbData = {
      class_id: lessonData.class_id,
      title: lessonData.title,
      description: lessonData.description || null,
      objectives: lessonData.objectives || [],
      content: lessonData.content || {},
      materials: lessonData.materials || [],
      duration: lessonData.duration || 60,
      order_index: lessonData.order_index || 0
    };

    const { data, error } = await supabase
      .from('lessons')
      .insert(dbData)
      .select()
      .single();
    
    if (error) throw error;
    return data as ApiLesson;
  },

  async update(id: string, lessonData: Partial<ApiLesson>) {
    const { data, error } = await supabase
      .from('lessons')
      .update(lessonData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ApiLesson;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
