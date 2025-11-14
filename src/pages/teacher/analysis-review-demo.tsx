import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TeacherAnalysisReview } from '@/components/teacher/TeacherAnalysisReview';
import { AnalysisMetricsDashboard } from '@/components/teacher/AnalysisMetricsDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function AnalysisReviewDemo() {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');

  // Fetch assignments for teacher
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['teacher-assignments-with-analyses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_assignments_new')
        .select(`
          id,
          title,
          class_id,
          classes!inner(
            name,
            teacher_id,
            teacher_profiles!inner(user_id)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis Review Dashboard</CardTitle>
          <CardDescription>
            Review AI-generated feedback for student submissions. Track metrics to improve AI accuracy and demonstrate value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="review" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="review">Review Submissions</TabsTrigger>
              <TabsTrigger value="metrics">Metrics & Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="review" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Assignment to Review
                </label>
                <Select value={selectedAssignmentId} onValueChange={setSelectedAssignmentId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an assignment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {assignments?.map((assignment: any) => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        {assignment.title} - {assignment.classes.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAssignmentId && (
                <div className="mt-6">
                  <TeacherAnalysisReview assignmentId={selectedAssignmentId} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="mt-4">
              <AnalysisMetricsDashboard />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Why Track These Metrics?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>% AI Feedback Accepted:</strong> Shows how often teachers trust AI without modifications. High acceptance rate = strong AI accuracy.
          </div>
          <div>
            <strong>Most Modified Criteria:</strong> Identifies where AI needs improvement. If teachers always modify "critical thinking" scores, that's actionable data.
          </div>
          <div>
            <strong>Teacher Modification Patterns:</strong> Learn what changes teachers make most often to improve prompts and training data.
          </div>
          <div>
            <strong>District Value Proof:</strong> "Teachers accept 85% of AI feedback" is powerful evidence for ROI discussions.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
