import { useCallback } from 'react';
import { UserProgress, Lesson, CourseProgress } from '@/types/courseTypes';

export const useLessonProgress = (lessons: Lesson[], userProgress: UserProgress[]) => {
  const getLessonStatus = useCallback((lessonId: number): 'Not Started' | 'In Progress' | 'Completed' => {
    const progress = userProgress.find(p => p.lesson_id === lessonId);
    return progress?.status || 'Not Started';
  }, [userProgress]);

  const getLessonProgress = useCallback((lessonId: number): number => {
    const progress = userProgress.find(p => p.lesson_id === lessonId);
    return progress?.progress_percentage || 0;
  }, [userProgress]);

  const calculateProgress = useCallback((): CourseProgress => {
    const completedLessons = lessons.filter(lesson => 
      getLessonStatus(lesson['Lesson ID']) === 'Completed'
    ).length;
    return {
      completed: completedLessons,
      total: lessons.length,
      percentage: lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0
    };
  }, [lessons, getLessonStatus]);

  const getContinueLesson = useCallback(() => {
    // First, find any lesson in progress
    const inProgressLesson = lessons.find(lesson => 
      getLessonStatus(lesson['Lesson ID']) === 'In Progress'
    );
    
    if (inProgressLesson) return inProgressLesson;

    // Otherwise, find the first not started lesson
    const notStartedLesson = lessons.find(lesson => 
      getLessonStatus(lesson['Lesson ID']) === 'Not Started'
    );
    
    return notStartedLesson || lessons[0];
  }, [lessons, getLessonStatus]);

  return {
    getLessonStatus,
    getLessonProgress,
    calculateProgress,
    getContinueLesson
  };
};
