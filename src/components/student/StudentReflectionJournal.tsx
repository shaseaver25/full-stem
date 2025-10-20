import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Sparkles, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { useCreateReflection } from '@/hooks/useStudentDashboard';

interface Reflection {
  id: string;
  reflection_text: string;
  prompt_question: string | null;
  created_at: string;
  student_goals?: {
    id: string;
    goal_text: string;
  } | null;
}

interface StudentReflectionJournalProps {
  reflections: Reflection[];
  studentId: string;
  completedGoals: Array<{ id: string; goal_text: string }>;
}

const REFLECTION_PROMPTS = [
  "What part of this goal felt easiest for you?",
  "Where did you get stuck or face challenges?",
  "What's one thing you'd like to try differently next time?",
];

export function StudentReflectionJournal({
  reflections,
  studentId,
  completedGoals,
}: StudentReflectionJournalProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>({});
  const createReflection = useCreateReflection();

  const handleSaveReflections = async () => {
    if (!selectedGoal) return;

    const promises = Object.entries(reflectionAnswers)
      .filter(([_, answer]) => answer.trim())
      .map(([index, answer]) => 
        createReflection.mutateAsync({
          studentId,
          goalId: selectedGoal,
          reflectionText: answer,
          promptQuestion: REFLECTION_PROMPTS[parseInt(index)],
        })
      );

    await Promise.all(promises);
    setReflectionAnswers({});
    setSelectedGoal('');
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Reflection Journal
            </CardTitle>
            <CardDescription>
              Reflect on your learning journey and completed goals
            </CardDescription>
          </div>
          {completedGoals.length > 0 && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  New Reflection
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Reflect on Your Goal</DialogTitle>
                  <DialogDescription>
                    Take a moment to think about your learning experience
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Goal Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Which completed goal would you like to reflect on?
                    </label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedGoal}
                      onChange={(e) => setSelectedGoal(e.target.value)}
                    >
                      <option value="">Select a goal...</option>
                      {completedGoals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.goal_text}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedGoal && (
                    <>
                      {REFLECTION_PROMPTS.map((prompt, index) => (
                        <div key={index} className="space-y-2">
                          <label className="text-sm font-medium">{prompt}</label>
                          <Textarea
                            placeholder="Share your thoughts..."
                            value={reflectionAnswers[index] || ''}
                            onChange={(e) => 
                              setReflectionAnswers(prev => ({ ...prev, [index]: e.target.value }))
                            }
                            rows={3}
                          />
                        </div>
                      ))}

                      <Button
                        onClick={handleSaveReflections}
                        disabled={!Object.values(reflectionAnswers).some(v => v.trim()) || createReflection.isPending}
                        className="w-full"
                      >
                        Save Reflections
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {reflections.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No reflections yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete a goal to start reflecting on your learning!
            </p>
          </div>
        ) : (
          reflections.map((reflection) => (
            <Card key={reflection.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4 space-y-3">
                {reflection.student_goals && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Goal: {reflection.student_goals.goal_text}
                    </Badge>
                  </div>
                )}

                {reflection.prompt_question && (
                  <p className="text-sm font-medium italic text-muted-foreground">
                    "{reflection.prompt_question}"
                  </p>
                )}

                <p className="text-sm leading-relaxed">{reflection.reflection_text}</p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(reflection.created_at), 'MMM d, yyyy')}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}