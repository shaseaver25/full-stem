import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Plus, Sparkles, Check, X, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface StudentGoalsSectionProps {
  studentId: string;
}

export function StudentGoalsSection({ studentId }: StudentGoalsSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newGoalDialogOpen, setNewGoalDialogOpen] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [generatingGoals, setGeneratingGoals] = useState(false);
  const [aiGeneratedGoals, setAiGeneratedGoals] = useState<string[]>([]);

  // Fetch goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['student-goals', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_goals')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Generate AI goals mutation
  const generateAIGoals = async () => {
    setGeneratingGoals(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-goals', {
        body: { studentId },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "AI Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setAiGeneratedGoals(data.goals || []);
      toast({
        title: "Goals Generated",
        description: "AI has suggested personalized learning goals.",
      });
    } catch (error: any) {
      console.error('Error generating goals:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate goals",
        variant: "destructive",
      });
    } finally {
      setGeneratingGoals(false);
    }
  };

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async ({ goalText, aiGenerated = false }: { goalText: string; aiGenerated?: boolean }) => {
      const { data, error } = await supabase
        .from('student_goals')
        .insert({
          student_id: studentId,
          goal_text: goalText,
          target_date: newGoalDate || null,
          ai_generated: aiGenerated,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
      toast({
        title: "Goal Created",
        description: "New learning goal has been added.",
      });
      setNewGoalText('');
      setNewGoalDate('');
      setNewGoalDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update goal status mutation
  const updateGoalStatusMutation = useMutation({
    mutationFn: async ({ goalId, status }: { goalId: string; status: string }) => {
      const { data, error } = await supabase
        .from('student_goals')
        .update({ status })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
      toast({
        title: "Goal Updated",
        description: "Goal status has been updated.",
      });
    },
  });

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Goals
              </CardTitle>
              <CardDescription>
                Track and manage personalized learning goals
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={generateAIGoals}
                disabled={generatingGoals}
                className="gap-2"
              >
                {generatingGoals ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate AI Goals
              </Button>
              <Dialog open={newGoalDialogOpen} onOpenChange={setNewGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                    <DialogDescription>
                      Add a personalized learning goal for this student
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Goal Description</Label>
                      <Textarea
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        placeholder="Enter goal description..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Target Date (Optional)</Label>
                      <Input
                        type="date"
                        value={newGoalDate}
                        onChange={(e) => setNewGoalDate(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => createGoalMutation.mutate({ goalText: newGoalText })}
                      disabled={!newGoalText || createGoalMutation.isPending}
                      className="w-full"
                    >
                      Create Goal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI Generated Goals */}
      {aiGeneratedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Suggested Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiGeneratedGoals.map((goal, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                <p className="flex-1 text-sm">{goal}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => createGoalMutation.mutate({ goalText: goal, aiGenerated: true })}
                  disabled={createGoalMutation.isPending}
                >
                  Add
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Goals ({activeGoals.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : activeGoals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active goals</p>
          ) : (
            activeGoals.map((goal) => (
              <Card key={goal.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{goal.goal_text}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {goal.target_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                          </span>
                        )}
                        {goal.ai_generated && (
                          <Badge variant="outline" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI Generated
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateGoalStatusMutation.mutate({ goalId: goal.id, status: 'completed' })
                        }
                        title="Mark as Completed"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          updateGoalStatusMutation.mutate({ goalId: goal.id, status: 'cancelled' })
                        }
                        title="Cancel Goal"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Goals ({completedGoals.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 p-3 border rounded-lg opacity-75"
              >
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <p className="text-sm flex-1">{goal.goal_text}</p>
                {goal.target_date && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(goal.target_date), 'MMM d')}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}