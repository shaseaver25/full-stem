
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseData } from '@/hooks/useCourseData';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import CourseHeader from '@/components/course/CourseHeader';
import LessonCard from '@/components/course/LessonCard';
import EmptyLessonsState from '@/components/course/EmptyLessonsState';
import LoadingState from '@/components/course/LoadingState';
import ErrorState from '@/components/course/ErrorState';

interface CourseOverviewProps {
  courseName: string;
  trackFilter: string;
}

const CourseOverview: React.FC<CourseOverviewProps> = ({ courseName, trackFilter }) => {
  const navigate = useNavigate();
  const { lessons, userProgress, loading, error, refetch } = useCourseData(trackFilter);
  const { getLessonStatus, getLessonProgress, calculateProgress, getContinueLesson } = useLessonProgress(lessons, userProgress);

  const handleLessonClick = useCallback((lessonId: number) => {
    navigate(`/lesson/${lessonId}`);
  }, [navigate]);

  const handleContinueClick = useCallback(() => {
    const continueLesson = getContinueLesson();
    if (continueLesson) {
      handleLessonClick(continueLesson['Lesson ID']);
    }
  }, [getContinueLesson, handleLessonClick]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  const progress = calculateProgress();
  const continueLesson = getContinueLesson();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <CourseHeader
          courseName={courseName}
          progress={progress}
          continueLesson={continueLesson}
          onContinueClick={handleContinueClick}
        />

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lessons.map((lesson) => {
            const status = getLessonStatus(lesson['Lesson ID']);
            const progressPercentage = getLessonProgress(lesson['Lesson ID']);
            
            return (
              <LessonCard
                key={lesson['Lesson ID']}
                lesson={lesson}
                status={status}
                progressPercentage={progressPercentage}
                onLessonClick={handleLessonClick}
              />
            );
          })}
        </div>

        {lessons.length === 0 && (
          <EmptyLessonsState courseName={courseName} />
        )}
      </div>
    </div>
  );
};

export default CourseOverview;
