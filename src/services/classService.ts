
import { supabase } from "@/integrations/supabase/client";
import { ClassData, Lesson, Assignment, ClassroomActivity, IndividualActivity, Resource } from "@/types/buildClassTypes";

export interface SaveClassData {
  classData: ClassData;
  lessons: Lesson[];
  assignments: Assignment[];
  classroomActivities: ClassroomActivity[];
  individualActivities: IndividualActivity[];
  resources: Resource[];
}

export interface SavedClass {
  id: string;
  name: string;
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
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export const saveClass = async (data: SaveClassData) => {
  try {
    console.log('Saving class data:', data);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get teacher profile
    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!teacherProfile) {
      throw new Error('Teacher profile not found');
    }

    // Save class data to the classes table
    const { data: classResult, error: classError } = await supabase
      .from('classes')
      .insert({
        name: data.classData.title,
        description: data.classData.description,
        grade_level: data.classData.gradeLevel,
        subject: data.classData.subject,
        duration: data.classData.duration,
        instructor: data.classData.instructor,
        schedule: data.classData.schedule,
        learning_objectives: data.classData.learningObjectives,
        prerequisites: data.classData.prerequisites,
        max_students: data.classData.maxStudents,
        teacher_id: teacherProfile.id,
        published: false
      })
      .select()
      .single();

    if (classError) {
      console.error('Error saving class:', classError);
      throw classError;
    }

    const classId = classResult.id;

    // Save lessons
    if (data.lessons.length > 0) {
      const lessonsToInsert = data.lessons.map(lesson => ({
        class_id: classId,
        title: lesson.title,
        description: lesson.description,
        objectives: lesson.objectives,
        materials: lesson.materials,
        instructions: lesson.instructions,
        duration: lesson.duration,
        order_index: lesson.order
      }));

      const { data: lessonResults, error: lessonsError } = await supabase
        .from('class_lessons')
        .insert(lessonsToInsert)
        .select();

      if (lessonsError) {
        console.error('Error saving lessons:', lessonsError);
        throw lessonsError;
      }

      // Save lesson videos
      for (let i = 0; i < data.lessons.length; i++) {
        const lesson = data.lessons[i];
        const savedLesson = lessonResults[i];
        
        if (lesson.videos && lesson.videos.length > 0) {
          const videosToInsert = lesson.videos.map((video, index) => ({
            lesson_id: savedLesson.id,
            title: video.title,
            url: video.url,
            order_index: index
          }));

          const { error: videosError } = await supabase
            .from('lesson_videos')
            .insert(videosToInsert);

          if (videosError) {
            console.error('Error saving lesson videos:', videosError);
            throw videosError;
          }
        }
      }
    }

    // Save classroom activities
    if (data.classroomActivities.length > 0) {
      const activitiesToInsert = data.classroomActivities.map(activity => ({
        class_id: classId,
        title: activity.title,
        description: activity.description,
        duration: activity.duration,
        materials: activity.materials,
        instructions: activity.instructions
      }));

      const { error: activitiesError } = await supabase
        .from('classroom_activities')
        .insert(activitiesToInsert);

      if (activitiesError) {
        console.error('Error saving classroom activities:', activitiesError);
        throw activitiesError;
      }
    }

    // Save individual activities
    if (data.individualActivities.length > 0) {
      const activitiesToInsert = data.individualActivities.map(activity => ({
        class_id: classId,
        title: activity.title,
        description: activity.description,
        estimated_time: activity.estimatedTime,
        instructions: activity.instructions,
        resources: activity.resources
      }));

      const { error: activitiesError } = await supabase
        .from('individual_activities')
        .insert(activitiesToInsert);

      if (activitiesError) {
        console.error('Error saving individual activities:', activitiesError);
        throw activitiesError;
      }
    }

    // Save assignments
    if (data.assignments.length > 0) {
      const assignmentsToInsert = data.assignments.map(assignment => ({
        class_id: classId,
        title: assignment.title,
        description: assignment.description,
        due_date: assignment.dueDate,
        instructions: assignment.instructions,
        rubric: assignment.rubric,
        max_points: assignment.maxPoints
      }));

      const { error: assignmentsError } = await supabase
        .from('class_assignments_new')
        .insert(assignmentsToInsert);

      if (assignmentsError) {
        console.error('Error saving assignments:', assignmentsError);
        throw assignmentsError;
      }
    }

    // Save resources
    if (data.resources.length > 0) {
      const resourcesToInsert = data.resources.map(resource => ({
        class_id: classId,
        title: resource.title,
        type: resource.type,
        url: resource.url,
        description: resource.description
      }));

      const { error: resourcesError } = await supabase
        .from('class_resources')
        .insert(resourcesToInsert);

      if (resourcesError) {
        console.error('Error saving resources:', resourcesError);
        throw resourcesError;
      }
    }

    console.log('Class saved successfully:', classResult);
    return { success: true, classId: classResult.id };
  } catch (error) {
    console.error('Error saving class:', error);
    return { success: false, error };
  }
};

export const publishClass = async (classId: string) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .update({ published: true })
      .eq('id', classId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error publishing class:', error);
    return { success: false, error };
  }
};

export const getMyClasses = async (): Promise<{ success: boolean; data?: SavedClass[]; error?: any }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get teacher profile
    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!teacherProfile) {
      throw new Error('Teacher profile not found');
    }

    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherProfile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: classes || [] };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { success: false, error };
  }
};

export const getFullClassData = async (classId: string) => {
  try {
    // Get class data
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (classError) throw classError;

    // Get lessons with videos
    const { data: lessons, error: lessonsError } = await supabase
      .from('class_lessons')
      .select(`
        *,
        lesson_videos(*)
      `)
      .eq('class_id', classId)
      .order('order_index');

    if (lessonsError) throw lessonsError;

    // Get classroom activities
    const { data: classroomActivities, error: classroomError } = await supabase
      .from('classroom_activities')
      .select('*')
      .eq('class_id', classId);

    if (classroomError) throw classroomError;

    // Get individual activities
    const { data: individualActivities, error: individualError } = await supabase
      .from('individual_activities')
      .select('*')
      .eq('class_id', classId);

    if (individualError) throw individualError;

    // Get assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('class_assignments_new')
      .select('*')
      .eq('class_id', classId);

    if (assignmentsError) throw assignmentsError;

    // Get resources
    const { data: resources, error: resourcesError } = await supabase
      .from('class_resources')
      .select('*')
      .eq('class_id', classId);

    if (resourcesError) throw resourcesError;

    // Transform data to match expected format
    const transformedData = {
      classId: classData.id,
      classData: {
        title: classData.name,
        description: classData.description || '',
        gradeLevel: classData.grade_level || '',
        subject: classData.subject || '',
        duration: classData.duration || '',
        instructor: classData.instructor || '',
        schedule: classData.schedule || '',
        learningObjectives: classData.learning_objectives || '',
        prerequisites: classData.prerequisites || '',
        maxStudents: classData.max_students || 25
      },
      lessons: lessons?.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || '',
        objectives: lesson.objectives || [],
        videos: lesson.lesson_videos?.map(video => ({
          id: video.id,
          title: video.title,
          url: video.url
        })) || [],
        materials: lesson.materials || [],
        instructions: lesson.instructions || '',
        duration: lesson.duration || 60,
        order: lesson.order_index
      })) || [],
      assignments: assignments?.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description || '',
        dueDate: assignment.due_date || '',
        instructions: assignment.instructions || '',
        rubric: assignment.rubric || '',
        maxPoints: assignment.max_points || 100
      })) || [],
      classroomActivities: classroomActivities?.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description || '',
        duration: activity.duration || 30,
        materials: activity.materials || [],
        instructions: activity.instructions || ''
      })) || [],
      individualActivities: individualActivities?.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description || '',
        estimatedTime: activity.estimated_time || 20,
        instructions: activity.instructions || '',
        resources: activity.resources || []
      })) || [],
      resources: resources?.map(resource => ({
        id: resource.id,
        title: resource.title,
        type: resource.type as 'pdf' | 'link' | 'video' | 'document',
        url: resource.url,
        description: resource.description || ''
      })) || []
    };

    return { success: true, data: transformedData };
  } catch (error) {
    console.error('Error fetching full class data:', error);
    return { success: false, error };
  }
};

export const updateClass = async (classId: string, data: SaveClassData) => {
  try {
    console.log('Updating class data:', classId, data);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Update class data
    const { error: classError } = await supabase
      .from('classes')
      .update({
        name: data.classData.title,
        description: data.classData.description,
        grade_level: data.classData.gradeLevel,
        subject: data.classData.subject,
        duration: data.classData.duration,
        instructor: data.classData.instructor,
        schedule: data.classData.schedule,
        learning_objectives: data.classData.learningObjectives,
        prerequisites: data.classData.prerequisites,
        max_students: data.classData.maxStudents
      })
      .eq('id', classId);

    if (classError) throw classError;

    // For now, we'll handle updates by deleting existing data and re-inserting
    // This could be optimized later to do proper updates/deletes/inserts

    // Delete existing related data
    await supabase.from('lesson_videos').delete().in('lesson_id', 
      supabase.from('class_lessons').select('id').eq('class_id', classId)
    );
    await supabase.from('class_lessons').delete().eq('class_id', classId);
    await supabase.from('classroom_activities').delete().eq('class_id', classId);
    await supabase.from('individual_activities').delete().eq('class_id', classId);
    await supabase.from('class_assignments_new').delete().eq('class_id', classId);
    await supabase.from('class_resources').delete().eq('class_id', classId);

    // Re-insert all data (reuse save logic)
    const saveResult = await saveClass({ ...data, classData: { ...data.classData, title: data.classData.title } });
    
    return { success: true, classId };
  } catch (error) {
    console.error('Error updating class:', error);
    return { success: false, error };
  }
};

export const deleteClass = async (classId: string) => {
  try {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting class:', error);
    return { success: false, error };
  }
};
