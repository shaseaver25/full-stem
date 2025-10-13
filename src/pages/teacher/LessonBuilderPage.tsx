import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { LessonDetailsForm } from '@/components/lesson-builder/LessonDetailsForm';
import { ComponentList } from '@/components/lesson-builder/ComponentList';
import { AddComponentButton } from '@/components/lesson-builder/AddComponentButton';
import { LessonPreview } from '@/components/lesson-builder/LessonPreview';

interface LessonComponent {
  id?: string;
  component_type: string;
  title?: string;
  content: any;
  order: number;
  enabled: boolean;
  reading_level?: number;
  language_code: string;
  read_aloud: boolean;
}

export default function LessonBuilderPage() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        const { error: deleteError } = await supabase
          .from('lesson_components')
          .delete()
          .eq('lesson_id', savedLessonId);

        if (deleteError) throw deleteError;

        if (components.length > 0) {
          const componentsToInsert = components.map((comp, index) => ({
            lesson_id: savedLessonId!,
            component_type: comp.component_type,
            content: comp.content,
            order: index,
            enabled: comp.enabled,
            reading_level: comp.reading_level,
            language_code: comp.language_code || 'en',
            read_aloud: comp.read_aloud,
          }));

          const { error: insertError } = await supabase
            .from('lesson_components')
            .insert(componentsToInsert);

          if (insertError) throw insertError;
        }
      }

      toast({
        title: 'Success',
        description: 'Lesson saved successfully',
      });

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
      language_code: 'en',
      read_aloud: true,
    };
    setComponents([...components, newComponent]);
  };

  const handleUpdateComponent = (index: number, updates: Partial<LessonComponent>) => {
    const updated = [...components];
    updated[index] = { ...updated[index], ...updates };
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
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold">
                  {lessonId ? 'Edit Lesson' : 'Create Lesson'}
                </h1>
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

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {isPreview ? (
          <LessonPreview
            title={title}
            objectives={objectives}
            components={components}
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
              />
            </div>

            <div className="mt-6">
              <AddComponentButton onSelect={handleAddComponent} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
