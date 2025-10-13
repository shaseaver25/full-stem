import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Clock, BookOpen, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  useLessons,
  useLessonComponents,
  useAssignLesson,
  useClassStudents,
} from '@/hooks/useClassManagement';
import { LessonComponent } from '@/services/classManagementService';

const assignmentSchema = z.object({
  lessonId: z.number().min(1, 'Please select a lesson'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  selectedComponents: z.array(z.string()).min(1, 'Select at least one component'),
  dueDate: z.date().optional(),
  releaseDate: z.date().optional(),
  allowResubmission: z.boolean(),
  gradingCategory: z.string(),
  points: z.number().min(1).max(1000),
});

type AssignmentForm = z.infer<typeof assignmentSchema>;

interface AssignmentWizardProps {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLessonId?: number;
}

type Step = 'lesson' | 'components' | 'schedule' | 'differentiate' | 'review';

export function AssignmentWizard({ classId, open, onOpenChange, initialLessonId }: AssignmentWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('lesson');
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(initialLessonId || null);
  const [studentOverrides, setStudentOverrides] = useState<Record<string, any>>({});

  const { data: lessons = [] } = useLessons();
  const { data: components = [] } = useLessonComponents(selectedLessonId ? String(selectedLessonId) : '');
  const { data: classStudents = [] } = useClassStudents(classId);
  const assignLesson = useAssignLesson(classId);

  const form = useForm<AssignmentForm>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      lessonId: initialLessonId || 0,
      title: '',
      description: '',
      selectedComponents: [],
      allowResubmission: false,
      gradingCategory: 'assignment',
      points: 100,
    },
  });

  const watchedComponents = form.watch('selectedComponents');
  const watchedLessonId = form.watch('lessonId');

  // Update selected lesson when form changes
  React.useEffect(() => {
    if (watchedLessonId && watchedLessonId !== selectedLessonId) {
      setSelectedLessonId(watchedLessonId);
      form.setValue('selectedComponents', []); // Reset components when lesson changes
    }
  }, [watchedLessonId, selectedLessonId, form]);

  const validateAndProceed = async () => {
    let isValid = false;
    
    // Validate current step only
    switch (currentStep) {
      case 'lesson':
        isValid = await form.trigger('lessonId');
        break;
      case 'components':
        isValid = await form.trigger('selectedComponents');
        break;
      case 'schedule':
        isValid = await form.trigger(['title', 'points', 'gradingCategory']);
        break;
      case 'differentiate':
        isValid = true; // No validation needed for differentiate step
        break;
      case 'review':
        isValid = await form.trigger(); // Validate all fields for final submission
        break;
    }
    
    if (!isValid) return;
    
    if (currentStep === 'review') {
      // Submit the assignment
      const data = form.getValues();
      try {
        await assignLesson.mutateAsync({
          lessonId: data.lessonId,
          componentIds: data.selectedComponents,
          dueAt: data.dueDate?.toISOString() || new Date().toISOString(),
          releaseAt: data.releaseDate?.toISOString(),
          options: {
            allow_resubmission: data.allowResubmission,
            grading_category: data.gradingCategory,
            points: data.points,
          },
        });
        
        onOpenChange(false);
        // Reset form and state
        form.reset();
        setCurrentStep('lesson');
        setSelectedLessonId(null);
        setStudentOverrides({});
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    } else {
      // Move to next step
      const steps: Step[] = ['lesson', 'components', 'schedule', 'differentiate', 'review'];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const goToPreviousStep = () => {
    const steps: Step[] = ['lesson', 'components', 'schedule', 'differentiate', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const selectedLesson = lessons.find(l => l['Lesson ID'] === selectedLessonId);
  const selectedComponentsData = components.filter(c => watchedComponents.includes(c.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Lesson to Class</DialogTitle>
          <DialogDescription>
            Create a new assignment by selecting lesson components and configuring options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {['lesson', 'components', 'schedule', 'differentiate', 'review'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                    currentStep === step
                      ? 'bg-primary text-primary-foreground'
                      : index < ['lesson', 'components', 'schedule', 'differentiate', 'review'].indexOf(currentStep)
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {index + 1}
                </div>
                {index < 4 && (
                  <div className={cn(
                    'w-12 h-0.5 mx-2',
                    index < ['lesson', 'components', 'schedule', 'differentiate', 'review'].indexOf(currentStep)
                      ? 'bg-primary'
                      : 'bg-muted'
                  )} />
                )}
              </div>
            ))}
          </div>

          <Form {...form}>
            <div className="space-y-6">
              {/* Step 1: Select Lesson */}
              {currentStep === 'lesson' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Select a Lesson</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose the lesson you want to assign to your class.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="lessonId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesson</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a lesson" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lessons.map((lesson) => (
                              <SelectItem key={lesson['Lesson ID']} value={lesson['Lesson ID'].toString()}>
                                <div>
                                  <div className="font-medium">{lesson.Title}</div>
                                  {lesson.Track && (
                                    <div className="text-xs text-muted-foreground">{lesson.Track}</div>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedLesson && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{selectedLesson.Title}</CardTitle>
                        {selectedLesson.Track && (
                          <Badge variant="outline" className="w-fit">
                            {selectedLesson.Track}
                          </Badge>
                        )}
                      </CardHeader>
                      {selectedLesson.Description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{selectedLesson.Description}</p>
                        </CardContent>
                      )}
                    </Card>
                  )}
                </div>
              )}

              {/* Step 2: Select Components */}
              {currentStep === 'components' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Select Components</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose which parts of the lesson to assign to students.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="selectedComponents"
                    render={() => (
                      <FormItem>
                        <div className="space-y-3">
                          {components.map((component) => (
                            <FormField
                              key={component.id}
                              control={form.control}
                              name="selectedComponents"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(component.id)}
                                      onCheckedChange={(checked) => {
                                        const value = field.value || [];
                                        if (checked) {
                                          field.onChange([...value, component.id]);
                                        } else {
                                          field.onChange(value.filter(id => id !== component.id));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none flex-1">
                                    <div className="flex items-center gap-2">
                                      {component.type === 'activity' && <CheckSquare className="h-4 w-4" />}
                                      {component.type === 'resource' && <BookOpen className="h-4 w-4" />}
                                      <span className="font-medium">{component.title}</span>
                                      {component.estimated_minutes && (
                                        <Badge variant="outline" className="ml-auto">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {component.estimated_minutes}m
                                        </Badge>
                                      )}
                                    </div>
                                    {component.description && (
                                      <p className="text-sm text-muted-foreground">
                                        {component.description}
                                      </p>
                                    )}
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {components.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No components available for this lesson.
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Schedule & Options */}
              {currentStep === 'schedule' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Schedule & Options</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure when the assignment is available and grading options.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Assignment Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter assignment title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="releaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Release Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="1000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gradingCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grading Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="assignment">Assignment</SelectItem>
                              <SelectItem value="quiz">Quiz</SelectItem>
                              <SelectItem value="homework">Homework</SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                              <SelectItem value="participation">Participation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Assignment instructions or description..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowResubmission"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Allow Resubmission
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Students can resubmit their work after the initial submission.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 4: Differentiation (Optional) */}
              {currentStep === 'differentiate' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Student Differentiation</h3>
                    <p className="text-sm text-muted-foreground">
                      Optionally customize components and settings for individual students.
                    </p>
                  </div>

                  <div className="text-center py-8 text-muted-foreground">
                    <p>Differentiation features coming soon!</p>
                    <p className="text-xs">For now, all students will receive the same assignment.</p>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 'review' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Review Assignment</h3>
                    <p className="text-sm text-muted-foreground">
                      Review your assignment settings before creating.
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>{form.getValues('title')}</CardTitle>
                      <CardDescription>
                        {selectedLesson?.Title} • {selectedComponentsData.length} component{selectedComponentsData.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {form.getValues('description') && (
                        <div>
                          <h4 className="font-medium mb-1">Description</h4>
                          <p className="text-sm text-muted-foreground">{form.getValues('description')}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium mb-2">Selected Components</h4>
                        <div className="space-y-2">
                          {selectedComponentsData.map((component) => (
                            <div key={component.id} className="flex items-center gap-2 text-sm">
                              {component.type === 'activity' && <CheckSquare className="h-4 w-4" />}
                              {component.type === 'resource' && <BookOpen className="h-4 w-4" />}
                              <span>{component.title}</span>
                              {component.estimated_minutes && (
                                <Badge variant="outline" className="ml-auto">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {component.estimated_minutes}m
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Points:</span> {form.getValues('points')}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {form.getValues('gradingCategory')}
                        </div>
                        {form.getValues('releaseDate') && (
                          <div>
                            <span className="font-medium">Release:</span> {format(form.getValues('releaseDate')!, 'PPP')}
                          </div>
                        )}
                        {form.getValues('dueDate') && (
                          <div>
                            <span className="font-medium">Due:</span> {format(form.getValues('dueDate')!, 'PPP')}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          This assignment will be created for {classStudents.length} student{classStudents.length !== 1 ? 's' : ''} in the class.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={currentStep === 'lesson'}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={validateAndProceed}
                    disabled={assignLesson.isPending}
                  >
                    {currentStep === 'review' ? (
                      assignLesson.isPending ? 'Creating...' : 'Create Assignment'
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}