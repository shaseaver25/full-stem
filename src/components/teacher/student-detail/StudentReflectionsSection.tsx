import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Quote, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface StudentReflectionsSectionProps {
  studentId: string;
}

export function StudentReflectionsSection({ studentId }: StudentReflectionsSectionProps) {
  // Fetch student reflections with their associated goals
  const { data: reflections = [], isLoading } = useQuery({
    queryKey: ['student-reflections', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_reflections')
        .select(`
          *,
          student_goals:goal_id (
            id,
            goal_text,
            status
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch AI feedback summaries for reflections
  const { data: aiSummaries = [] } = useQuery({
    queryKey: ['reflection-summaries', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_feedback_history')
        .select('*')
        .eq('student_id', studentId)
        .eq('feedback_type', 'reflection_summary')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Student Reflections
          </CardTitle>
          <CardDescription>
            View student self-reflections on completed goals and learning experiences
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Reflections List */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading reflections...</p>
          </CardContent>
        </Card>
      ) : reflections.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Reflections Yet</h3>
              <p className="text-muted-foreground">
                Student reflections will appear here after completing goals
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reflections.map((reflection) => {
            const relatedSummary = aiSummaries.find(s => s.goal_id === reflection.goal_id);

            return (
              <Card key={reflection.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      {reflection.student_goals && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {reflection.student_goals.status}
                          </Badge>
                          <span className="text-sm font-medium">
                            {reflection.student_goals.goal_text}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(reflection.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                      </div>
                    </div>
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Reflection Question and Answer */}
                  <div className="space-y-2">
                    {reflection.prompt_question && (
                      <div className="flex items-start gap-2">
                        <Quote className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <p className="text-sm font-medium italic">
                          {reflection.prompt_question}
                        </p>
                      </div>
                    )}
                    <div className="pl-6 text-sm text-muted-foreground">
                      {reflection.reflection_text}
                    </div>
                  </div>

                  {/* AI Summary if available */}
                  {relatedSummary && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-dashed">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">AI Feedback Summary</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {relatedSummary.feedback_text}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}