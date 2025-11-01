import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Save, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { LessonDetailsForm } from '@/components/lesson-builder/LessonDetailsForm';
import { ComponentList } from '@/components/lesson-builder/ComponentList';
import { AddComponentButton } from '@/components/lesson-builder/AddComponentButton';
import { LessonPreview } from '@/components/lesson-builder/LessonPreview';
import { LessonTemplateUpload } from '@/components/lesson-builder/LessonTemplateUpload';
import AIGenerationWizard from '@/components/lesson/AIGenerationWizard';

interface LessonComponent {
  id?: string;
  component_type: string;
  title?: string;
  content: any;
  order: number;
  enabled: boolean;
  is_assignable: boolean;
  reading_level?: number;
  language_code: string;
  read_aloud: boolean;
}

export default function LessonBuilderPage() {
  const { lessonId: routeLessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Get lessonId from either route params or query params
  const lessonId = routeLessonId || searchParams.get('lessonId');

  const [title, setTitle] = useState('');
  const [lessonNumber, setLessonNumber] = useState<number>(1);
  const [unitId, setUnitId] = useState<string>('');
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [components, setComponents] = useState<LessonComponent[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [classId, setClassId] = useState<string>('');
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  useEffect(() => {
    // Check for classId in URL params (for new lessons)
    const classIdParam = searchParams.get('classId');
    if (classIdParam) {
      setClassId(classIdParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    if (!lessonId) return;

    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;

      setTitle(lessonData.title || '');
      setObjectives(lessonData.objectives || ['']);
      setClassId(lessonData.class_id);

      const { data: componentsData, error: componentsError } = await supabase
        .from('lesson_components')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order');

      if (componentsError) throw componentsError;

      // Log quiz components when loading
      componentsData?.forEach((comp, index) => {
        if (comp.component_type === 'quiz') {
          console.log(`🔍 Loaded quiz component ${index}:`, JSON.stringify(comp.content, null, 2));
          console.log(`🔍 Has quizData:`, !!(comp.content as any)?.quizData);
        }
      });

      setComponents(componentsData || []);
    } catch (error) {
      console.error('Error loading lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lesson',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Lesson title is required',
        variant: 'destructive',
      });
      return;
    }

    if (!classId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a class',
        variant: 'destructive',
      });
      return;
    }

    // Validate teacher profile exists
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to save lessons',
        variant: 'destructive',
      });
      return;
    }

    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!teacherProfile) {
      toast({
        title: 'Profile Error',
        description: 'Teacher profile not found. Please complete your profile setup.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      let savedLessonId = lessonId;

      if (lessonId) {
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            title,
            objectives,
            updated_at: new Date().toISOString(),
          })
          .eq('id', lessonId);

        if (updateError) throw updateError;
      } else {
        const { data: newLesson, error: createError } = await supabase
          .from('lessons')
          .insert({
            class_id: classId,
            title,
            objectives,
            order_index: lessonNumber,
          })
          .select()
          .single();

        if (createError) throw createError;
        savedLessonId = newLesson.id;
      }

      if (savedLessonId) {
        console.log('💾 Current components state:', components);
        console.log('💾 Number of components to save:', components.length);
        
        // Only proceed with save if there are components OR if user confirms deletion
        if (components.length === 0) {
          const existingComponents = await supabase
            .from('lesson_components')
            .select('id')
            .eq('lesson_id', savedLessonId);
          
          if (existingComponents.data && existingComponents.data.length > 0) {
            console.warn('⚠️ Attempting to save with no components but lesson has existing components');
            toast({
              title: 'Warning',
              description: 'No components to save. Existing components will be preserved.',
              variant: 'default',
            });
            setIsSaving(false);
            return;
          }
        }
        
        // Validate all components have required fields
        const invalidComponents = components.filter(comp => !comp.component_type || !comp.content);
        if (invalidComponents.length > 0) {
          console.error('❌ Invalid components detected:', invalidComponents);
          throw new Error(`${invalidComponents.length} component(s) are missing required fields`);
        }

        const componentsToInsert = components.map((comp, index) => {
          // Special logging for quiz components
          if (comp.component_type === 'quiz') {
            console.log(`🎯 Quiz component ${index} content:`, JSON.stringify(comp.content, null, 2));
            console.log(`🎯 Quiz component ${index} has quizData:`, !!comp.content?.quizData);
            if (comp.content?.quizData) {
              console.log(`🎯 Quiz has ${comp.content.quizData.questions?.length || 0} questions`);
            }
          }
          
          return {
            lesson_id: savedLessonId!,
            component_type: comp.component_type,
            content: comp.content || {},
            order: index,
            enabled: comp.enabled !== false,
            is_assignable: comp.is_assignable || false,
            reading_level: comp.reading_level || null,
            language_code: comp.language_code || 'en',
            read_aloud: comp.read_aloud !== false,
          };
        });

        console.log('📝 Components to insert:', componentsToInsert);

        // Delete old components and insert new ones in a more controlled way
        const { error: deleteError } = await supabase
          .from('lesson_components')
          .delete()
          .eq('lesson_id', savedLessonId);

        if (deleteError) {
          console.error('❌ Delete error:', deleteError);
          throw deleteError;
        }

        const { data: insertedData, error: insertError } = await supabase
          .from('lesson_components')
          .insert(componentsToInsert)
          .select();

        if (insertError) {
          console.error('❌ Insert error:', insertError);
          console.error('❌ Failed components:', componentsToInsert);
          throw insertError;
        }

        console.log('✅ Successfully inserted components:', insertedData);
      }

      toast({
        title: 'Success',
        description: 'Lesson saved successfully',
      });

      // Reload lesson data to verify save
      if (lessonId) {
        await loadLesson();
      }

      if (!lessonId) {
        navigate(`/teacher/lesson-builder/${savedLessonId}`);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to save lesson',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComponent = (type: string) => {
    const newComponent: LessonComponent = {
      component_type: type,
      content: {},
      order: components.length,
      enabled: true,
      is_assignable: type === 'assignment', // Auto-mark assignments as assignable
      language_code: 'en',
      read_aloud: true,
    };
    console.log('➕ Adding component:', newComponent);
    setComponents([...components, newComponent]);
  };

  const handleUpdateComponent = (index: number, updates: Partial<LessonComponent>) => {
    const updated = [...components];
    updated[index] = { ...updated[index], ...updates };
    console.log(`📝 Updated component ${index}:`, updated[index]);
    setComponents(updated);
  };

  const handleDeleteComponent = (index: number) => {
    const updated = components.filter((_, i) => i !== index);
    setComponents(updated);
  };

  const handleReorderComponents = (newOrder: LessonComponent[]) => {
    setComponents(newOrder.map((comp, index) => ({ ...comp, order: index })));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card relative">
        <div 
          className={`container mx-auto px-4 transition-all duration-300 overflow-hidden ${
            isMenuCollapsed ? 'py-2' : 'py-4'
          }`}
          style={{ maxHeight: isMenuCollapsed ? '56px' : '500px' }}
        >
          {!isMenuCollapsed && (
            <div className="flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(classId ? `/classes/${classId}` : '/teacher/classes')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold">Lesson Builder</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPreview(!isPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isPreview ? 'Edit' : 'Preview'}
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Lesson'}
                </Button>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
            className={`absolute right-4 transition-all duration-300 ${
              isMenuCollapsed ? 'top-2' : 'top-4'
            }`}
            aria-label={isMenuCollapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {isMenuCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pb-32 max-w-6xl">
        <Card>
          <CardContent className="pt-6 pb-24">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="manual">Manual Build</TabsTrigger>
                <TabsTrigger value="template">Import Template</TabsTrigger>
                <TabsTrigger value="ai">AI Generator</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="mt-0">
                {isPreview ? (
                  <LessonPreview
                    title={title}
                    objectives={objectives}
                    components={components}
                    lessonId={lessonId}
                    onUpdateComponent={handleUpdateComponent}
                  />
                ) : (
                  <>
                    <LessonDetailsForm
                      title={title}
                      setTitle={setTitle}
                      lessonNumber={lessonNumber}
                      setLessonNumber={setLessonNumber}
                      unitId={unitId}
                      setUnitId={setUnitId}
                      objectives={objectives}
                      setObjectives={setObjectives}
                      classId={classId}
                      setClassId={setClassId}
                    />

                    <div className="mt-8">
                      <ComponentList
                        components={components}
                        onUpdate={handleUpdateComponent}
                        onDelete={handleDeleteComponent}
                        onReorder={handleReorderComponents}
                        lessonId={lessonId}
                      />
                    </div>

                    <div className="mt-6">
                      <AddComponentButton onSelect={handleAddComponent} />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="template" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Import Lesson from Template</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download our lesson template, fill it out offline in plain text or Microsoft Word (.docx), 
                      and upload it to automatically create all lesson components. Perfect for creating lessons in Word/Google Docs.
                    </p>
                  </div>

                  <LessonTemplateUpload
                    lessonId={lessonId}
                    onImportComplete={(importedLessonId, componentsCount) => {
                      console.log('✅ Import complete:', importedLessonId, componentsCount);
                      loadLesson();
                      toast({
                        title: 'Lesson Imported',
                        description: `${componentsCount} components created. Switch to Manual Build to edit.`,
                      });
                    }}
                  />

                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <h4 className="font-semibold text-sm">Template Instructions:</h4>
                    <ol className="text-sm space-y-2 list-decimal list-inside">
                      <li>Click "Download Template" to get the formatted Word document</li>
                      <li>Fill out the template sections in Microsoft Word, Google Docs, or any word processor</li>
                      <li>Add content to each ## Component: section you want to include</li>
                      <li>Save your file as .docx or export as .txt</li>
                      <li>Click "Upload Template" to import your lesson</li>
                      <li>Review the auto-generated components and edit as needed</li>
                    </ol>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                    <p className="text-sm">
                      <strong>💡 Pro Tip:</strong> The template supports all TailorEDU component types including 
                      Instructions, Pages, Multimedia, Coding IDE, Activities, Quizzes, Discussions, Reflections, 
                      Assignments, and Resources. Assignment components are automatically marked as assignable.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="mt-0">
                <AIGenerationWizard 
                  lessonId={lessonId}
                  classId={classId}
                  onComponentsGenerated={(newComponents) => {
                    loadLesson();
                    toast({
                      title: 'AI Components Added',
                      description: 'Switch to Manual Build tab to view and edit them',
                    });
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
