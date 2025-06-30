
import { supabase } from '@/integrations/supabase/client';

export interface ApiClass {
  id: string;
  title: string;
  description: string | null;
  grade_level: string | null;
  subject: string | null;
  duration: string | null;
  instructor: string | null;
  schedule: string | null;
  learning_objectives: string | null;
  prerequisites: string | null;
  max_students: number | null;
  published: boolean;
  status: string;
  published_at: string | null;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

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

// Class API operations
export const classApi = {
  async getAll(published?: boolean) {
    let query = supabase.from('classes').select('*');
    
    if (published !== undefined) {
      query = query.eq('published', published);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ApiClass[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as ApiClass;
  },

  async create(classData: Partial<ApiClass>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!teacherProfile) throw new Error('Teacher profile not found');

    const { data, error } = await supabase
      .from('classes')
      .insert({
        ...classData,
        teacher_id: teacherProfile.id,
        status: 'draft',
        published: false
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as ApiClass;
  },

  async update(id: string, classData: Partial<ApiClass>) {
    const { data, error } = await supabase
      .from('classes')
      .update(classData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ApiClass;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async publish(id: string) {
    const { data, error } = await supabase
      .from('classes')
      .update({ published: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ApiClass;
  },

  async unpublish(id: string) {
    const { data, error } = await supabase
      .from('classes')
      .update({ published: false })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ApiClass;
  }
};

// Lesson API operations
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

  async create(lessonData: Partial<ApiLesson>) {
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessonData)
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

// Activity API operations
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

  async create(activityData: Partial<ApiActivity>) {
    const { data, error } = await supabase
      .from('activities')
      .insert(activityData)
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
