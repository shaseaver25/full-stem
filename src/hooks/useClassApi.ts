
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classApi, lessonApi, activityApi, ApiClass, ApiLesson, ApiActivity } from '@/services/apiService';
import { toast } from '@/hooks/use-toast';
import { SaveClassData } from '@/services/classService';

export const useClassApi = () => {
  const queryClient = useQueryClient();

  // Fetch all classes
  const useClasses = (published?: boolean) => {
    return useQuery({
      queryKey: ['classes', published],
      queryFn: () => classApi.getAll(published),
    });
  };

  // Fetch single class with lessons and activities
  const useClassWithContent = (classId: string) => {
    return useQuery({
      queryKey: ['class', classId],
      queryFn: async () => {
        const [classData, lessons] = await Promise.all([
          classApi.getById(classId),
          lessonApi.getByClassId(classId)
        ]);

        const lessonsWithActivities = await Promise.all(
          lessons.map(async (lesson) => {
            const activities = await activityApi.getByLessonId(lesson.id);
            return { ...lesson, activities };
          })
        );

        return {
          class: classData,
          lessons: lessonsWithActivities
        };
      },
      enabled: !!classId,
    });
  };

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (data: SaveClassData) => {
      // Create the class first
      const newClass = await classApi.create({
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
      });

      // Create lessons and activities
      for (let i = 0; i < data.lessons.length; i++) {
        const lesson = data.lessons[i];
        const newLesson = await lessonApi.create({
          class_id: newClass.id,
          title: lesson.title,
          description: lesson.description,
          objectives: lesson.objectives,
          materials: lesson.materials,
          duration: lesson.duration,
          order_index: lesson.order || i,
          content: {
            instructions: lesson.instructions,
            videos: lesson.videos
          }
        });

        // Create classroom activities as activities
        for (const activity of data.classroomActivities) {
          await activityApi.create({
            lesson_id: newLesson.id,
            title: activity.title,
            description: activity.description,
            activity_type: 'classroom',
            resources: activity.materials,
            instructions: activity.instructions,
            estimated_time: activity.duration,
            order_index: 0
          });
        }

        // Create individual activities as activities
        for (const activity of data.individualActivities) {
          await activityApi.create({
            lesson_id: newLesson.id,
            title: activity.title,
            description: activity.description,
            activity_type: 'individual',
            resources: activity.resources,
            instructions: activity.instructions,
            estimated_time: activity.estimatedTime,
            order_index: 0
          });
        }
      }

      return newClass;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Success!",
        description: "Class created successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ApiClass> }) => {
      return await classApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Success!",
        description: "Class updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating class:', error);
      toast({
        title: "Error",
        description: "Failed to update class. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Publish class mutation
  const publishClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      return await classApi.publish(classId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Success!",
        description: "Class published successfully.",
      });
    },
    onError: (error) => {
      console.error('Error publishing class:', error);
      toast({
        title: "Error",
        description: "Failed to publish class. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      return await classApi.delete(classId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: "Success!",
        description: "Class deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Error deleting class:', error);
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    useClasses,
    useClassWithContent,
    createClass: createClassMutation.mutate,
    createClassAsync: createClassMutation.mutateAsync,
    updateClass: updateClassMutation.mutate,
    updateClassAsync: updateClassMutation.mutateAsync,
    publishClass: publishClassMutation.mutate,
    deleteClass: deleteClassMutation.mutate,
    isCreating: createClassMutation.isPending,
    isUpdating: updateClassMutation.isPending,
    isPublishing: publishClassMutation.isPending,
    isDeleting: deleteClassMutation.isPending,
  };
};
