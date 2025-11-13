import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { ArrowLeft, Save, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { LessonDetailsForm } from '@/components/lesson-builder/LessonDetailsForm';
import { ComponentList } from '@/components/lesson-builder/ComponentList';
import { AddComponentButton } from '@/components/lesson-builder/AddComponentButton';
import { LessonPreview } from '@/components/lesson-builder/LessonPreview';
import { LessonTemplateUpload } from '@/components/lesson-builder/LessonTemplateUpload';
import AIGenerationWizard from '@/components/lesson/AIGenerationWizard';
import { parseSupabaseError } from '@/utils/supabaseErrorHandler';
import { logError } from '@/utils/errorLogging';
import { useLessonAutoSave } from '@/hooks/useLessonAutoSave';
import { formatDistanceToNow } from 'date-fns';

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

// Valid component types from database constraint
const VALID_COMPONENT_TYPES = [
  'slides', 'page', 'video', 'quiz', 'poll', 'discussion', 
  'codingEditor', 'flashcards', 'desmos', 'activity', 
  'assignment', 'assessment', 'reflection', 'instructions', 'resources'
] as const;

export default function LessonBuilderPage() {
  const { lessonId: routeLessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [lessonData, setLessonData] = useState<any>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveredDraft, setRecoveredDraft] = useState<any>(null);
  const justSavedRef = useRef(false);

  // Auto-save functionality
  const { loadDraft, clearDraft } = useLessonAutoSave(lessonId, components, title, objectives);

  useEffect(() => {
    // Check for classId in URL params (for new lessons)
    const classIdParam = searchParams.get('classId');
    if (classIdParam) {
      setClassId(classIdParam);
    }
  }, [searchParams]);

  // Check for unsaved drafts on mount
  useEffect(() => {
    if (!lessonId || !lessonData) return;
    
    // Skip check if we just saved (prevents false positives from auto-save)
    if (justSavedRef.current) {
      justSavedRef.current = false;
      return;
    }
    
    try {
      // Load draft from localStorage
      const draft = loadDraft(lessonId);
      if (!draft) return;
      
      console.log('🔍 Checking for draft recovery:', {
        draftSavedAt: draft.savedAt,
        lessonUpdatedAt: lessonData.updated_at,
        hasDraft: !!draft
      });
      
      // Compare timestamps with a 5-second buffer to avoid race conditions with auto-save
      const draftTime = new Date(draft.savedAt).getTime();
      const dbTime = lessonData.updated_at ? new Date(lessonData.updated_at).getTime() : 0;
      const timeDifference = draftTime - dbTime;
      
      // Only offer recovery if draft is significantly newer (more than 5 seconds)
      if (timeDifference > 5000) {
        console.log('💾 Found newer draft - offering recovery');
        setRecoveredDraft(draft);
        setShowRecoveryDialog(true);
      } else {
        console.log('✅ Database is up to date - no recovery needed');
        // Clear old draft if database is newer or within buffer
        clearDraft(lessonId);
      }
    } catch (error) {
      console.error('❌ Error loading draft:', error);
      // Clear corrupted draft
      if (lessonId) {
        clearDraft(lessonId);
      }
    }
  }, [lessonId, lessonData]);

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

      setLessonData(lessonData);
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
      logError(error, 'LessonBuilderPage.loadLesson');
      
      const parsedError = parseSupabaseError(error);
      toast.error(parsedError.title, {
        description: parsedError.description,
      });
    }
  };

  /**
   * Validates components before attempting to save to database
   * Prevents constraint violations by catching issues early
   */
  const validateComponents = (components: LessonComponent[]): { 
    isValid: boolean; 
    errors: string[] 
  } => {
    const errors: string[] = [];

    components.forEach((comp, index) => {
      // Check component_type constraint
      if (!VALID_COMPONENT_TYPES.includes(comp.component_type as any)) {
        errors.push(`Component ${index + 1} has invalid type: "${comp.component_type}"`);
      }

      // Check required fields
      if (!comp.component_type) {
        errors.push(`Component ${index + 1} is missing component_type`);
      }

      // Content should be an object
      if (comp.content === null || comp.content === undefined) {
        errors.push(`Component ${index + 1} is missing content`);
      }

      // Order should be a valid number
      if (typeof comp.order !== 'number' || comp.order < 0) {
        errors.push(`Component ${index + 1} has invalid order value`);
      }

      // Language code validation (if provided)
      if (comp.language_code && !/^[a-z]{2}(-[A-Z]{2})?$/.test(comp.language_code)) {
        errors.push(`Component ${index + 1} has invalid language code: "${comp.language_code}"`);
      }

      // Reading level validation (if provided)
      if (comp.reading_level !== null && comp.reading_level !== undefined) {
        if (comp.reading_level < 1 || comp.reading_level > 12) {
          errors.push(`Component ${index + 1} has invalid reading level: ${comp.reading_level} (must be 1-12)`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Validation Error', {
        description: 'Lesson title is required',
      });
      return;
    }

    if (!classId) {
      toast.error('Validation Error', {
        description: 'Please select a class',
      });
      return;
    }

    // Validate teacher profile exists
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to save lessons',
      });
      return;
    }

    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!teacherProfile) {
      toast.error('Profile Error', {
        description: 'Teacher profile not found. Please complete your profile setup.',
      });
      return;
    }

    setIsSaving(true);
    
    // Show initial loading toast
    const savingToastId = toast.loading('Saving lesson...', {
      description: 'Validating and uploading components'
    });

    try {
      let savedLessonId = lessonId;

      // Update loading message for lesson save
      toast.loading('Saving lesson details...', { id: savingToastId });

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
        
        // Check for destructive deletion
        const { data: existingComponents } = await supabase
          .from('lesson_components')
          .select('id, component_type')
          .eq('lesson_id', savedLessonId);

        if (existingComponents && existingComponents.length > 0 && components.length === 0) {
          // User is about to delete all components - confirm this action
          toast.dismiss(savingToastId);
          
          const confirmed = window.confirm(
            `Warning: You are about to delete all ${existingComponents.length} existing components. Are you sure?`
          );
          
          if (!confirmed) {
            toast.info('Save cancelled', {
              description: 'No changes were made to your lesson.'
            });
            setIsSaving(false);
            return;
          }
          
          // Re-show saving toast
          toast.loading('Saving lesson...', { id: savingToastId });
        }
        
        // Client-side validation
        const validation = validateComponents(components);
        if (!validation.isValid) {
          console.error('❌ Client-side validation failed:', validation.errors);
          
          toast.dismiss(savingToastId);
          toast.error('Invalid lesson components', {
            description: validation.errors.join('\n'),
            duration: 8000,
          });
          
          logError(new Error('Component validation failed: ' + validation.errors.join('; ')), 'LessonBuilderPage.validateComponents');
          setIsSaving(false);
          return;
        }

        // Update loading message for components
        toast.loading(`Saving ${components.length} components...`, { id: savingToastId });

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

      // Dismiss loading toast
      toast.dismiss(savingToastId);
      
      // Show success
      toast.success('Lesson saved successfully', {
        description: `${components.length} component${components.length !== 1 ? 's' : ''} saved`,
        duration: 3000,
      });

      // Clear auto-save draft and mark that we just saved
      if (savedLessonId) {
        clearDraft(savedLessonId);
        justSavedRef.current = true;
        console.log('🧹 Cleared draft after successful save');
      }

      // Reload lesson data to verify save
      if (lessonId) {
        await loadLesson();
      }

      if (!lessonId) {
        navigate(`/teacher/lesson-builder/${savedLessonId}`);
      }
    } catch (error: any) {
      // Dismiss loading toast
      toast.dismiss(savingToastId);
      
      console.error('Error saving lesson:', error);
      logError(error, 'LessonBuilderPage.handleSave');
      
      const parsedError = parseSupabaseError(error);
      
      toast.error(parsedError.title, {
        description: parsedError.description,
        action: parsedError.canRetry ? {
          label: 'Retry',
          onClick: () => handleSave()
        } : undefined,
        duration: parsedError.canRetry ? 6000 : 8000,
      });
      
      // Log technical details for debugging
      if (parsedError.technicalDetails) {
        console.error('Technical details:', parsedError.technicalDetails);
      }
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
      {/* Draft Recovery Dialog */}
      <AlertDialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-blue-500" />
              Unsaved Changes Found
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                We found unsaved work from{' '}
                <span className="font-semibold text-foreground">
                  {recoveredDraft && formatDistanceToNow(new Date(recoveredDraft.savedAt), { addSuffix: true })}
                </span>
                .
              </p>
              <p>
                Would you like to restore your unsaved changes?
              </p>
              {recoveredDraft && (
                <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                  <div className="font-medium mb-1">Draft contains:</div>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Title: {recoveredDraft.title || '(no title)'}</li>
                    <li>{recoveredDraft.components?.length || 0} component(s)</li>
                    {recoveredDraft.objectives && (
                      <li>Learning objectives included</li>
                    )}
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                console.log('🗑️ User discarded draft');
                if (lessonId) {
                  clearDraft(lessonId);
                }
                setShowRecoveryDialog(false);
                setRecoveredDraft(null);
                toast.info('Draft discarded', {
                  description: 'The auto-saved changes were removed.'
                });
              }}
            >
              Discard Draft
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (!recoveredDraft) return;
                
                console.log('♻️ Restoring draft:', recoveredDraft);
                
                // Restore the draft data into the component state
                if (recoveredDraft.title) {
                  setTitle(recoveredDraft.title);
                }
                if (recoveredDraft.objectives) {
                  setObjectives(recoveredDraft.objectives);
                }
                if (recoveredDraft.components) {
                  setComponents(recoveredDraft.components);
                }
                
                setShowRecoveryDialog(false);
                setRecoveredDraft(null);
                
                toast.success('Draft restored', {
                  description: 'Your unsaved changes have been recovered. Remember to save!',
                  duration: 5000,
                });
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Restore Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              <div className="flex items-center gap-4">
                {lessonId && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Auto-saving to your device
                  </div>
                )}
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
                      toast.success('Lesson Imported', {
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
                    toast.success('AI Components Added', {
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
