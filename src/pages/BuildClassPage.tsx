
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { HelpHint } from '@/components/common/HelpHint';
import BuildClassHeader from '@/components/build-class/BuildClassHeader';
import BuildClassTabs from '@/components/build-class/BuildClassTabs';
import { useClassCreation } from '@/hooks/useClassCreation';
import { useBuildClassActions } from '@/hooks/useBuildClassActions';
import { useClassApi } from '@/hooks/useClassApi';
import { useClassCourses } from '@/hooks/useClassCourses';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Target, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const BuildClassPage = () => {
  const { classId } = useParams<{ classId?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  const [showAddStandard, setShowAddStandard] = useState(false);
  const [newStandard, setNewStandard] = useState({ code: '', description: '' });
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
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
  } = useClassCreation();

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

  const { createClassAsync, updateClassAsync, useClassWithContent, isCreating, isUpdating } = useClassApi();
  const { classCourses } = useClassCourses(classId);

  // Fetch lessons for this class
  const { data: classLessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['classLessons', classId],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('class_id', classId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!classId
  });

  // Fetch standards for this class
  const { data: classStandards, isLoading: standardsLoading } = useQuery({
    queryKey: ['classStandards', classId],
    queryFn: async () => {
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from('class_standards')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: true }) as any;
      
      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        class_id: string;
        standard_code: string;
        description: string;
        created_at: string;
        updated_at: string;
      }>;
    },
    enabled: !!classId
  });

  // Add standard mutation
  const addStandardMutation = useMutation({
    mutationFn: async (standard: { code: string; description: string }) => {
      if (!classId) throw new Error('No class ID');
      
      const { error } = await (supabase as any)
        .from('class_standards')
        .insert({
          class_id: classId,
          standard_code: standard.code.trim(),
          description: standard.description.trim()
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classStandards', classId] });
      setNewStandard({ code: '', description: '' });
      setShowAddStandard(false);
      toast({
        title: "Success",
        description: "Standard added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add standard. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding standard:', error);
    }
  });

  // Delete standard mutation
  const deleteStandardMutation = useMutation({
    mutationFn: async (standardId: string) => {
      const { error } = await (supabase as any)
        .from('class_standards')
        .delete()
        .eq('id', standardId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classStandards', classId] });
      toast({
        title: "Success",
        description: "Standard removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove standard. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting standard:', error);
    }
  });

  // Delete lesson mutation
  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classLessons', classId] });
      toast({
        title: "Success",
        description: "Lesson removed successfully.",
      });
      setLessonToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove lesson. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting lesson:', error);
    }
  });

  const handleAddStandard = () => {
    if (!newStandard.code.trim() || !newStandard.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter both code and description.",
        variant: "destructive",
      });
      return;
    }
    
    addStandardMutation.mutate(newStandard);
  };

  // Load existing class data if editing
  const { data: existingClassData, isLoading } = useClassWithContent(classId || '');

  // Load existing class data into form when editing
  useEffect(() => {
    if (existingClassData && classId) {
      // Safely extract class info with proper null checking
      const classInfo = existingClassData.class;
      
      // Only proceed if classInfo exists and has the required properties
      if (classInfo) {
        // Update class data using ApiClass properties
        handleClassDataChange('title', classInfo.title || '');
        handleClassDataChange('description', classInfo.description || '');
        handleClassDataChange('gradeLevel', classInfo.grade_level || '');
        handleClassDataChange('subject', classInfo.subject || '');
        handleClassDataChange('duration', classInfo.duration || '');
        handleClassDataChange('instructor', classInfo.instructor || '');
        handleClassDataChange('schedule', classInfo.schedule || '');
        handleClassDataChange('learningObjectives', classInfo.learning_objectives || '');
        handleClassDataChange('prerequisites', classInfo.prerequisites || '');
        handleClassDataChange('maxStudents', classInfo.max_students || 25);
      }
      
      // TODO: Load lessons and activities data
      // This would require updating the useClassCreation hook to accept initial data
    }
  }, [existingClassData, classId, handleClassDataChange]);

  const handleSaveClass = async () => {
    if (!classData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a class title before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const classDataToSave = {
        classData,
        lessons,
        assignments,
        classroomActivities,
        individualActivities,
        resources
      };

      if (classId) {
        // Update existing class
        await updateClassAsync({
          id: classId,
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
        
        // Navigate to build lesson page after update
        navigate(`/teacher/build-lesson/${classId}`);
      } else {
        // Create new class and navigate to build lesson page
        const newClass = await createClassAsync(classDataToSave);
        
        // Navigate to build lesson page with the new class ID
        navigate(`/teacher/build-lesson/${newClass.id}`);
      }
    } catch (error) {
      console.error('Error saving class:', error);
      // Error toast is handled by the mutation's onError
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && classId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading class data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-2xl font-bold">Build Class</h1>
          <HelpHint
            text="Create a new class with lessons, assignments, and student enrollment. Set up your class structure and add content step-by-step."
            learnMoreUrl="https://docs.lovable.dev/features/build-class"
          />
        </div>
        <BuildClassHeader
          completionPercentage={getCompletionPercentage()}
          onSave={handleSaveClass}
          isSaving={isSaving}
        />

        {/* Show selected courses if any */}
        {classCourses.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Courses</h3>
            <div className="flex flex-wrap gap-2">
              {classCourses.map((classCourse) => (
                <span key={classCourse.id} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {classCourse.track}
                </span>
              ))}
            </div>
          </div>
        )}

        <BuildClassTabs
          classData={classData}
          handleClassDataChange={handleClassDataChange}
        />

        {/* Standards Section - Only show if classId exists (editing mode) */}
        {classId && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Standards
              </CardTitle>
              <Button
                onClick={() => setShowAddStandard(!showAddStandard)}
                variant={showAddStandard ? "outline" : "default"}
                className="gap-2"
              >
                {showAddStandard ? (
                  "Cancel"
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Standard
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {showAddStandard && (
                <div className="mb-6 p-4 border rounded-lg bg-accent/50">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="standard-code">Standard Code</Label>
                      <Input
                        id="standard-code"
                        placeholder="e.g., CCSS.MATH.CONTENT.8.F.A.1"
                        value={newStandard.code}
                        onChange={(e) => setNewStandard({ ...newStandard, code: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="standard-description">Description</Label>
                      <Textarea
                        id="standard-description"
                        placeholder="Enter the standard description..."
                        value={newStandard.description}
                        onChange={(e) => setNewStandard({ ...newStandard, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleAddStandard}
                      disabled={addStandardMutation.isPending}
                      className="w-full"
                    >
                      {addStandardMutation.isPending ? "Adding..." : "Add Standard"}
                    </Button>
                  </div>
                </div>
              )}

              {standardsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading standards...
                </div>
              ) : classStandards && classStandards.length > 0 ? (
                <div className="space-y-3">
                  {classStandards.map((standard) => (
                    <div
                      key={standard.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-mono text-sm font-semibold text-primary mb-1">
                          {standard.standard_code}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {standard.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStandardMutation.mutate(standard.id)}
                        disabled={deleteStandardMutation.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No standards yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add learning standards to align your class with educational requirements
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lessons Section - Only show if classId exists (editing mode) */}
        {classId && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Lessons
              </CardTitle>
              <Button
                onClick={() => navigate('/teacher/lesson-builder')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Lesson
              </Button>
            </CardHeader>
            <CardContent>
              {lessonsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading lessons...
                </div>
              ) : classLessons && classLessons.length > 0 ? (
                <div className="space-y-3">
                  {classLessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/teacher/lesson-builder/${lesson.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLessonToDelete(lesson.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No lessons yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your class by adding lessons
                  </p>
                  <Button
                    onClick={() => navigate('/teacher/lesson-builder')}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Lesson
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Lesson Confirmation Dialog */}
        <AlertDialog open={!!lessonToDelete} onOpenChange={() => setLessonToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Lesson</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this lesson from the class? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => lessonToDelete && deleteLessonMutation.mutate(lessonToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default BuildClassPage;
