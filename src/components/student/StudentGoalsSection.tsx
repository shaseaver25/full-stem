import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Target, Check, Play, Pause, Calendar, Sparkles, StickyNote } from 'lucide-react';
import { format } from 'date-fns';
import { useCreateReflection } from '@/hooks/useStudentDashboard';

interface Goal {
  id: string;
  goal_text: string;
  target_date: string | null;
  status: string;
  ai_generated: boolean;
  created_at: string;
}

interface StudentGoalsSectionProps {
  goals: Goal[];
  studentId: string;
  onStatusChange: (goalId: string, status: string) => void;
}

export function StudentGoalsSection({
  goals,
  studentId,
  onStatusChange,
}: StudentGoalsSectionProps) {
  const [goalNotes, setGoalNotes] = useState<Record<string, string>>({});
  const createReflection = useCreateReflection();

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const handleSaveNote = (goalId: string) => {
    const noteText = goalNotes[goalId];
    if (!noteText?.trim()) return;

    createReflection.mutate({
      studentId,
      goalId,
      reflectionText: noteText,
      promptQuestion: 'Personal Note',
    });

    setGoalNotes(prev => ({ ...prev, [goalId]: '' }));
  };

  const getStatusActions = (goal: Goal) => {
    switch (goal.status) {
      case 'active':
        return [
          <Button
            key="complete"
            size="sm"
            variant="default"
            onClick={() => onStatusChange(goal.id, 'completed')}
            className="gap-1"
          >
            <Check className="h-4 w-4" />
            Complete
          </Button>,
        ];
      default:
        return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          My Goals
        </CardTitle>
        <CardDescription>
          Track your learning goals and progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedGoals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeGoals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No active goals yet</h3>
                <p className="text-muted-foreground">
                  Check with your teacher to set some learning goals!
                </p>
              </div>
            ) : (
              activeGoals.map((goal) => (
                <Card key={goal.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-lg">{goal.goal_text}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          {goal.target_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                            </span>
                          )}
                          {goal.ai_generated && (
                            <Badge variant="outline" className="gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI Suggested
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getStatusActions(goal)}
                      </div>
                    </div>

                    {/* Personal Note */}
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <StickyNote className="h-4 w-4" />
                        <span>Add a note about this goal</span>
                      </div>
                      <Textarea
                        placeholder="How are you working on this goal? Any challenges?"
                        value={goalNotes[goal.id] || ''}
                        onChange={(e) => setGoalNotes(prev => ({ ...prev, [goal.id]: e.target.value }))}
                        rows={2}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveNote(goal.id)}
                        disabled={!goalNotes[goal.id]?.trim() || createReflection.isPending}
                      >
                        Save Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completedGoals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed goals yet. Keep working on your active goals!</p>
              </div>
            ) : (
              completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30"
                >
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{goal.goal_text}</p>
                    {goal.target_date && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Completed on {format(new Date(goal.target_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}