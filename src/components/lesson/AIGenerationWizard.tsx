import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAILessonWizard } from "@/hooks/useAILessonWizard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import type { AILesson } from "@/types/aiLesson";

interface AIGenerationWizardProps {
  lessonId?: string;
  classId?: string;
  onComponentsGenerated?: (components: any[]) => void;
}

export default function AIGenerationWizard({ 
  lessonId, 
  classId,
  onComponentsGenerated 
}: AIGenerationWizardProps = {}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    topic: "",
    subject: "",
    gradeLevel: "",
    readingLevel: "on-grade",
    language: "en",
    durationMinutes: 45,
    customPrompt: "",
    componentTypes: [] as string[],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<number[]>([]);
  const { generateLesson, lesson, isGenerating } = useAILessonWizard();
  const { toast } = useToast();

  function updateField(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleGenerate() {
    await generateLesson(form);
    setStep(3);
    // Select all components by default
    if (lesson) {
      const components = convertAILessonToComponents(lesson);
      setSelectedComponents(components.map((_, idx) => idx));
    }
  }

  // Update selected components when lesson changes
  React.useEffect(() => {
    if (lesson && step === 3) {
      const components = convertAILessonToComponents(lesson);
      setSelectedComponents(components.map((_, idx) => idx));
    }
  }, [lesson, step]);

  const convertAILessonToComponents = (aiLesson: AILesson): any[] => {
    const components: any[] = [];
    let order = 0;

    // Instructions overview
    if (aiLesson.warmup?.steps?.length > 0) {
      components.push({
        component_type: 'instructions',
        content: {
          title: 'Warm-Up Activity',
          text: aiLesson.warmup.steps.join('\n\n')
        },
        order: order++,
        enabled: true,
        is_assignable: false,
        read_aloud: true,
        language_code: aiLesson.meta.language,
      });
    }

    // Direct instruction as Page
    if (aiLesson.directInstruction?.steps?.length > 0) {
      components.push({
        component_type: 'page',
        content: {
          title: 'Direct Instruction',
          body: `<h3>Learning Objectives</h3><ul>${aiLesson.objectives.map(obj => `<li>${obj}</li>`).join('')}</ul><h3>Key Steps</h3>${aiLesson.directInstruction.steps.map((step, i) => `<p><strong>Step ${i + 1}:</strong> ${step}</p>`).join('')}`
        },
        order: order++,
        enabled: true,
        is_assignable: false,
        read_aloud: true,
        language_code: aiLesson.meta.language,
      });
    }

    // Vocabulary as resources
    if (aiLesson.vocabulary?.length > 0) {
      components.push({
        component_type: 'resources',
        content: {
          title: 'Key Vocabulary',
          resources: aiLesson.vocabulary.join('\n')
        },
        order: order++,
        enabled: true,
        is_assignable: false,
        read_aloud: true,
        language_code: aiLesson.meta.language,
      });
    }

    // Guided practice as Activity
    if (aiLesson.guidedPractice?.activities?.length > 0) {
      components.push({
        component_type: 'activity',
        content: {
          title: 'Guided Practice',
          description: aiLesson.guidedPractice.activities.join('\n\n')
        },
        order: order++,
        enabled: true,
        is_assignable: false,
        read_aloud: true,
        language_code: aiLesson.meta.language,
      });
    }

    // Independent practice as Assignment
    if (aiLesson.independentPractice?.choices?.length > 0) {
      components.push({
        component_type: 'assignment',
        content: {
          title: 'Independent Practice',
          prompt: aiLesson.independentPractice.choices.join('\n\n'),
          points: 20
        },
        order: order++,
        enabled: true,
        is_assignable: true,
        read_aloud: false,
        language_code: aiLesson.meta.language,
      });
    }

    // Exit ticket as Reflection
    if (aiLesson.formativeAssessment?.exitTicket) {
      components.push({
        component_type: 'reflection',
        content: {
          title: 'Exit Ticket',
          prompt: aiLesson.formativeAssessment.exitTicket,
          points: 5
        },
        order: order++,
        enabled: true,
        is_assignable: true,
        read_aloud: false,
        language_code: aiLesson.meta.language,
      });
    }

    // Discussion from formative assessment
    if (aiLesson.formativeAssessment?.methods?.length > 0) {
      components.push({
        component_type: 'discussion',
        content: {
          title: 'Class Discussion',
          prompt: aiLesson.formativeAssessment.methods[0]
        },
        order: order++,
        enabled: true,
        is_assignable: false,
        read_aloud: false,
        language_code: aiLesson.meta.language,
      });
    }

    return components;
  };

  const handleSaveComponents = async () => {
    if (!lesson || !lessonId) {
      toast({
        title: 'Error',
        description: !lessonId ? 'Please save the lesson first before generating components' : 'Missing lesson data',
        variant: 'destructive',
      });
      return;
    }

    if (selectedComponents.length === 0) {
      toast({
        title: 'No Components Selected',
        description: 'Please select at least one component to add',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const allComponents = convertAILessonToComponents(lesson);
      
      // Filter to only selected components
      const selectedComps = allComponents.filter((_, idx) => selectedComponents.includes(idx));
      
      // Add lesson_id to selected components
      const componentsToInsert = selectedComps.map(comp => ({
        ...comp,
        lesson_id: lessonId,
      }));

      const { error } = await supabase
        .from('lesson_components')
        .insert(componentsToInsert);

      if (error) throw error;

      toast({
        title: 'Components Saved',
        description: `${componentsToInsert.length} AI-generated components added successfully`,
      });

      // Notify parent and reset
      if (onComponentsGenerated) {
        onComponentsGenerated(componentsToInsert);
      }
      
      // Reset wizard
      setStep(1);
      setSelectedComponents([]);
      setForm({
        topic: "",
        subject: "",
        gradeLevel: "",
        readingLevel: "on-grade",
        language: "en",
        durationMinutes: 45,
        customPrompt: "",
        componentTypes: [],
      });
    } catch (error) {
      console.error('Error saving components:', error);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save components',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderGeneratedComponents = () => {
    if (!lesson) return null;

    const components = convertAILessonToComponents(lesson);

    const toggleComponent = (idx: number) => {
      setSelectedComponents(prev => 
        prev.includes(idx) 
          ? prev.filter(i => i !== idx)
          : [...prev, idx]
      );
    };

    const toggleAll = () => {
      if (selectedComponents.length === components.length) {
        setSelectedComponents([]);
      } else {
        setSelectedComponents(components.map((_, idx) => idx));
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            AI generated {components.length} components. Select which ones to add:
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleAll}
          >
            {selectedComponents.length === components.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {components.map((comp, idx) => (
            <div 
              key={idx} 
              className={`border rounded-lg p-4 bg-card transition-colors cursor-pointer ${
                selectedComponents.includes(idx) 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => toggleComponent(idx)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedComponents.includes(idx)}
                    onChange={() => toggleComponent(idx)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-input"
                  />
                  <Badge variant={comp.is_assignable ? "default" : "outline"}>
                    {comp.component_type}
                  </Badge>
                  {comp.is_assignable && (
                    <Badge variant="secondary">Assignable</Badge>
                  )}
                </div>
              </div>
              
              {comp.content.title && (
                <h4 className="font-semibold mb-2 ml-6">{comp.content.title}</h4>
              )}
              
              <div className="text-sm text-muted-foreground line-clamp-3 ml-6">
                {comp.content.text?.substring(0, 150) || 
                 comp.content.body?.substring(0, 150)?.replace(/<[^>]*>/g, '') || 
                 comp.content.prompt?.substring(0, 150) || 
                 'Content preview...'}
                {(comp.content.text?.length > 150 || 
                  comp.content.body?.length > 150 || 
                  comp.content.prompt?.length > 150) && '...'}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {selectedComponents.length} of {components.length} components selected
        </p>
      </div>
    );
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>AI Lesson Component Generator</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Generate lesson components automatically, then customize as needed
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Progress value={step * 33.33} className="w-full" />

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Step 1: Lesson Basics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Topic *</label>
                <Input 
                  placeholder="e.g., Photosynthesis, Civil War, Fractions" 
                  value={form.topic} 
                  onChange={(e) => updateField("topic", e.target.value)} 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Subject *</label>
                <Input 
                  placeholder="e.g., Biology, History, Math" 
                  value={form.subject} 
                  onChange={(e) => updateField("subject", e.target.value)} 
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Grade Level *</label>
                <Input 
                  placeholder="e.g., 8, 10-12" 
                  value={form.gradeLevel} 
                  onChange={(e) => updateField("gradeLevel", e.target.value)} 
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                <Input
                  type="number"
                  placeholder="45"
                  value={form.durationMinutes}
                  onChange={(e) => updateField("durationMinutes", Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Reading Level</label>
                <Select value={form.readingLevel} onValueChange={(v) => updateField("readingLevel", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Reading Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emerging">Emerging</SelectItem>
                    <SelectItem value="on-grade">On Grade</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={form.language} onValueChange={(v) => updateField("language", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Request Specific Components</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg">
                {[
                  { value: 'instructions', label: 'Instructions' },
                  { value: 'page', label: 'Page/Content' },
                  { value: 'multimedia', label: 'Multimedia' },
                  { value: 'activity', label: 'Activity' },
                  { value: 'discussion', label: 'Discussion' },
                  { value: 'assignment', label: 'Assignment' },
                  { value: 'reflection', label: 'Reflection' },
                  { value: 'resources', label: 'Resources' },
                  { value: 'coding', label: 'Coding IDE' },
                ].map((component) => (
                  <label key={component.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.componentTypes.includes(component.value)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...form.componentTypes, component.value]
                          : form.componentTypes.filter(t => t !== component.value);
                        updateField("componentTypes", newTypes);
                      }}
                      className="rounded border-input"
                    />
                    <span className="text-sm">{component.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Select which components you want the AI to generate
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Additional Instructions (Optional)</label>
              <Textarea
                placeholder="e.g., Focus on hands-on activities. Include real-world examples."
                value={form.customPrompt}
                onChange={(e) => updateField("customPrompt", e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add any other specific requirements or teaching approaches
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)} 
                disabled={!form.topic || !form.subject || !form.gradeLevel}
              >
                Next: Review & Generate
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Step 2: Review & Generate</h3>
            <p className="text-sm text-muted-foreground">
              Review your selections, then generate AI-powered lesson components.
            </p>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div><strong>Topic:</strong> {form.topic}</div>
              <div><strong>Subject:</strong> {form.subject}</div>
              <div><strong>Grade:</strong> {form.gradeLevel}</div>
              <div><strong>Reading Level:</strong> {form.readingLevel}</div>
              <div><strong>Language:</strong> {form.language}</div>
              <div><strong>Duration:</strong> {form.durationMinutes} min</div>
            </div>

            {form.componentTypes.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <strong className="block mb-2">Requested Components:</strong>
                <div className="flex flex-wrap gap-2">
                  {form.componentTypes.map(type => (
                    <Badge key={type} variant="secondary">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {form.customPrompt && (
              <div className="p-4 bg-muted rounded-lg">
                <strong className="block mb-2">Additional Instructions:</strong>
                <p className="text-sm">{form.customPrompt}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    AI is generating your lesson...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Lesson Components
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={() => setStep(1)} disabled={isGenerating}>
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 3 && lesson && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Step 3: Review Generated Components</h3>
            </div>

            {renderGeneratedComponents()}

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                onClick={handleSaveComponents} 
                disabled={isSaving || !lessonId || selectedComponents.length === 0}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving Components...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Add Selected to Lesson ({selectedComponents.length})
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={() => setStep(2)} disabled={isSaving}>
                Regenerate
              </Button>

              <Button variant="ghost" onClick={() => setStep(1)}>
                Start Over
              </Button>
            </div>

            {!lessonId && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please save your lesson first (Manual Build tab) before adding AI-generated components
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
