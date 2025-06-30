
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

// Helper function to transform database class to API class
const transformDbClassToApi = (dbClass: any): ApiClass => ({
  id: dbClass.id,
  title: dbClass.name || dbClass.title || '',
  description: dbClass.description,
  grade_level: dbClass.grade_level,
  subject: dbClass.subject,
  duration: dbClass.duration,
  instructor: dbClass.instructor,
  schedule: dbClass.schedule,
  learning_objectives: dbClass.learning_objectives,
  prerequisites: dbClass.prerequisites,
  max_students: dbClass.max_students,
  published: dbClass.published,
  status: dbClass.status || 'draft',
  published_at: dbClass.published_at,
  teacher_id: dbClass.teacher_id,
  created_at: dbClass.created_at,
  updated_at: dbClass.updated_at
});

export const classApi = {
  async getAll(published?: boolean) {
    let query = supabase.from('classes').select('*');
    
    if (published !== undefined) {
      query = query.eq('published', published);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(transformDbClassToApi);
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return transformDbClassToApi(data);
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

    // Map API fields to database fields
    const dbData = {
      name: classData.title || '',
      description: classData.description,
      grade_level: classData.grade_level,
      subject: classData.subject,
      duration: classData.duration,
      instructor: classData.instructor,
      schedule: classData.schedule,
      learning_objectives: classData.learning_objectives,
      prerequisites: classData.prerequisites,
      max_students: classData.max_students,
      teacher_id: teacherProfile.id,
      status: 'draft',
      published: false
    };

    const { data, error } = await supabase
      .from('classes')
      .insert(dbData)
      .select()
      .single();
    
    if (error) throw error;
    return transformDbClassToApi(data);
  },

  async update(id: string, classData: Partial<ApiClass>) {
    // Map API fields to database fields for update
    const dbData: any = {};
    if (classData.title !== undefined) dbData.name = classData.title;
    if (classData.description !== undefined) dbData.description = classData.description;
    if (classData.grade_level !== undefined) dbData.grade_level = classData.grade_level;
    if (classData.subject !== undefined) dbData.subject = classData.subject;
    if (classData.duration !== undefined) dbData.duration = classData.duration;
    if (classData.instructor !== undefined) dbData.instructor = classData.instructor;
    if (classData.schedule !== undefined) dbData.schedule = classData.schedule;
    if (classData.learning_objectives !== undefined) dbData.learning_objectives = classData.learning_objectives;
    if (classData.prerequisites !== undefined) dbData.prerequisites = classData.prerequisites;
    if (classData.max_students !== undefined) dbData.max_students = classData.max_students;

    const { data, error } = await supabase
      .from('classes')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformDbClassToApi(data);
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
    return transformDbClassToApi(data);
  },

  async unpublish(id: string) {
    const { data, error } = await supabase
      .from('classes')
      .update({ published: false })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformDbClassToApi(data);
  }
};
