
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

export const saveClass = async (data: SaveClassData) => {
  try {
    // First, save the main class data
    const { data: classResult, error: classError } = await supabase
      .from('classes')
      .insert({
        title: data.classData.title,
        description: data.classData.description,
        grade_level: data.classData.gradeLevel,
        subject: data.classData.subject,
        duration: data.classData.duration,
        instructor: data.classData.instructor,
        schedule: data.classData.schedule,
        learning_objectives: data.classData.learningObjectives,
        prerequisites: data.classData.prerequisites,
        max_students: data.classData.maxStudents,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        published: false
      })
      .select()
      .single();

    if (classError) throw classError;

    const classId = classResult.id;

    // Save lessons
    if (data.lessons.length > 0) {
      const lessonsToInsert = data.lessons.map(lesson => ({
        class_id: classId,
        title: lesson.title,
        description: lesson.description,
        objectives: lesson.objectives,
        instructions: lesson.instructions,
        duration: lesson.duration,
        order_index: lesson.order,
        materials: lesson.materials
      }));

      const { data: lessonResults, error: lessonError } = await supabase
        .from('lessons')
        .insert(lessonsToInsert)
        .select();

      if (lessonError) throw lessonError;

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

          const { error: videoError } = await supabase
            .from('lesson_videos')
            .insert(videosToInsert);

          if (videoError) throw videoError;
        }
      }
    }

    // Save classroom activities
    if (data.classroomActivities.length > 0) {
      const activitiesToInsert = data.classroomActivities.map(activity => ({
        class_id: classId,
        title: activity.title,
        description: activity.description,
        type: 'classroom',
        duration: activity.duration,
        instructions: activity.instructions,
        materials: activity.materials
      }));

      const { error: activityError } = await supabase
        .from('activities')
        .insert(activitiesToInsert);

      if (activityError) throw activityError;
    }

    // Save individual activities
    if (data.individualActivities.length > 0) {
      const activitiesToInsert = data.individualActivities.map(activity => ({
        class_id: classId,
        title: activity.title,
        description: activity.description,
        type: 'individual',
        estimated_time: activity.estimatedTime,
        instructions: activity.instructions,
        resources: activity.resources
      }));

      const { error: activityError } = await supabase
        .from('activities')
        .insert(activitiesToInsert);

      if (activityError) throw activityError;
    }

    // Save assignments
    if (data.assignments.length > 0) {
      const assignmentsToInsert = data.assignments.map(assignment => ({
        class_id: classId,
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        rubric: assignment.rubric,
        max_points: assignment.maxPoints,
        due_date: assignment.dueDate
      }));

      const { error: assignmentError } = await supabase
        .from('class_assignments_content')
        .insert(assignmentsToInsert);

      if (assignmentError) throw assignmentError;
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

      const { error: resourceError } = await supabase
        .from('class_resources')
        .insert(resourcesToInsert);

      if (resourceError) throw resourceError;
    }

    return { success: true, classId };
  } catch (error) {
    console.error('Error saving class:', error);
    return { success: false, error };
  }
};

export const publishClass = async (classId: string) => {
  try {
    const { error } = await supabase
      .from('classes')
      .update({ published: true })
      .eq('id', classId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error publishing class:', error);
    return { success: false, error };
  }
};

export const getMyClasses = async () => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { success: false, error };
  }
};
