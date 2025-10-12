import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { HelpHint } from '@/components/common/HelpHint';
import BuildClassHeader from '@/components/build-class/BuildClassHeader';
import BuildClassTabs from '@/components/build-class/BuildClassTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useClassCreationWithInitialData } from '@/hooks/useClassCreationWithInitialData';
import { useBuildClassActions } from '@/hooks/useBuildClassActions';
import { useClassApi } from '@/hooks/useClassApi';
import { transformCourseData } from '@/utils/courseDataTransformer';
import { aiCourseJSON } from '@/data/aiCourseData';
import { toast } from '@/hooks/use-toast';

const AICourseBuilderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('details');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loadedCourseData, setLoadedCourseData] = useState(null);
  
  // Get course ID from URL if present
  useEffect(() => {
    const courseId = searchParams.get('courseId');
    if (courseId) {
      setSelectedCourseId(courseId);
    }
  }, [searchParams]);
  
  // Fetch all available courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, description, grade_level, subject')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch selected course details
  const { data: selectedCourse, isLoading: courseLoading } = useQuery({
    queryKey: ['course-detail', selectedCourseId],
    queryFn: async () => {
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', selectedCourseId)
        .single();
      
      if (classError) throw classError;
      
      // Fetch lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('class_id', selectedCourseId)
        .order('order_index');
      
      if (lessonsError) throw lessonsError;
      
      // Fetch activities
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .in('lesson_id', lessons?.map(l => l.id) || [])
        .order('order_index');
      
      return {
        classData,
        lessons: lessons || [],
        activities: activities || [],
      };
    },
    enabled: !!selectedCourseId,
  });

  // Use either selected course data or AI template
  const initialData = (selectedCourse && selectedCourseId !== 'new') ? {
    classData: {
      title: selectedCourse.classData.name,
      description: selectedCourse.classData.description || '',
      gradeLevel: selectedCourse.classData.grade_level || '',
      subject: selectedCourse.classData.subject || '',
      duration: selectedCourse.classData.duration || '',
      instructor: selectedCourse.classData.instructor || '',
      schedule: selectedCourse.classData.schedule || '',
      learningObjectives: selectedCourse.classData.learning_objectives || '',
      prerequisites: selectedCourse.classData.prerequisites || '',
      maxStudents: selectedCourse.classData.max_students || 30,
    },
    lessons: selectedCourse.lessons.map((lesson: any) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || '',
      objectives: lesson.objectives || [],
      videos: [],
      materials: lesson.materials || [],
      instructions: lesson.content?.instructions || '',
      duration: lesson.duration || 60,
      order: lesson.order_index || 0,
    })),
    assignments: [],
    classroomActivities: [],
    individualActivities: [],
    resources: [],
  } : (selectedCourseId === 'new' ? transformCourseData(aiCourseJSON) : undefined);
  
  const {
    classData,
    lessons,
    assignments,
    classroomActivities,
    individualActivities,
    resources,
    currentLesson,
    currentAssignment,
    currentClassroomActivity,
    currentIndividualActivity,
    currentResource,
    setLessons,
    setAssignments,
    setClassroomActivities,
    setIndividualActivities,
    setResources,
    setCurrentLesson,
    setCurrentAssignment,
    setCurrentClassroomActivity,
    setCurrentIndividualActivity,
    setCurrentResource,
    handleClassDataChange,
    addVideoToLesson,
    removeVideoFromLesson,
    updateLessonVideo,
    getCompletionPercentage
  } = useClassCreationWithInitialData(initialData);

  const {
    addLesson,
    addAssignment,
    addClassroomActivity,
    addIndividualActivity,
    addResource,
    removeLesson,
    removeAssignment,
    removeClassroomActivity,
    removeIndividualActivity,
    removeResource
  } = useBuildClassActions(
    lessons,
    assignments,
    classroomActivities,
    individualActivities,
    resources,
    currentLesson,
    currentAssignment,
    currentClassroomActivity,
    currentIndividualActivity,
    currentResource,
    setLessons,
    setAssignments,
    setClassroomActivities,
    setIndividualActivities,
    setResources,
    setCurrentLesson,
    setCurrentAssignment,
    setCurrentClassroomActivity,
    setCurrentIndividualActivity,
    setCurrentResource
  );

  const { createClass, updateClass, isCreating, isUpdating } = useClassApi();

  const handleSaveClass = async () => {
    if (!classData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a class title before saving.",
        variant: "destructive",
      });
      return;
    }

    const classDataToSave = {
      classData,
      lessons,
      assignments,
      classroomActivities,
      individualActivities,
      resources
    };

    if (selectedCourseId && selectedCourseId !== 'new') {
      // Update existing class
      updateClass({
        id: selectedCourseId,
        data: {
          title: classData.title,
          description: classData.description,
          grade_level: classData.gradeLevel,
          subject: classData.subject,
          duration: classData.duration,
          instructor: classData.instructor,
          schedule: classData.schedule,
          learning_objectives: classData.learningObjectives,
          prerequisites: classData.prerequisites,
          max_students: classData.maxStudents,
        }
      });
      toast({
        title: "Course Updated",
        description: "Your course has been updated successfully.",
      });
    } else {
      // Create new class using mutation
      createClass(classDataToSave);
      toast({
        title: "Course Created",
        description: "Your course has been created successfully.",
      });
    }
    
    // Navigate to teacher dashboard to see the created/updated course
    setTimeout(() => {
      navigate('/teacher/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              AI Course Builder
            </h1>
            <HelpHint
              text="Use this tool to generate AI-based lesson plans for your classes. Select an existing course to edit or create a new one from scratch."
              learnMoreUrl="https://docs.lovable.dev/features/ai-course-builder"
            />
          </div>
          <p className="text-gray-600">
            Create new courses or edit existing ones with AI assistance
          </p>
        </div>

        {/* Course Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Course to Edit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="course-select">Course</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course to edit or create new" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">➕ Create New Course</SelectItem>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} - {course.grade_level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCourseId && selectedCourseId !== 'new' && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCourseId('new')}
                  >
                    Create New Instead
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {(selectedCourseId || !coursesLoading) && (
          <>
            <BuildClassHeader
              completionPercentage={getCompletionPercentage()}
              onSave={handleSaveClass}
              isSaving={isCreating || isUpdating}
            />

            <BuildClassTabs
              classData={classData}
              handleClassDataChange={handleClassDataChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AICourseBuilderPage;