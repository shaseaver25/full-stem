import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, RefreshCw, Send, Download, TrendingUp, TrendingDown, 
  AlertTriangle, Star, Target, MessageSquare, CheckCircle, Mail, Users
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ClassWeeklyDigestProps {
  classId: string;
  className: string;
}

export function ClassWeeklyDigest({ classId, className }: ClassWeeklyDigestProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVariant, setSelectedVariant] = useState<'teacher' | 'student' | 'parent'>('teacher');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch digest for selected variant
  const { data: digest, isLoading } = useQuery({
    queryKey: ['class-digest', classId, selectedVariant],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_weekly_digests')
        .select('*')
        .eq('class_id', classId)
        .eq('variant', selectedVariant)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Generate digest mutation
  const generateDigest = useMutation({
    mutationFn: async (variant: string) => {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('ai-class-digest', {
        body: { classId, variant },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.digest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-digest', classId] });
      toast({
        title: "Digest Generated",
        description: "Class weekly digest has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate digest",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  // Approve digest mutation
  const approveDigest = useMutation({
    mutationFn: async (digestId: string) => {
      const { error } = await supabase
        .from('class_weekly_digests')
        .update({ 
          teacher_approved: true,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', digestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-digest', classId] });
      toast({
        title: "Digest Approved",
        description: "Digest is ready for delivery.",
      });
    },
  });

  // Export PDF (placeholder)
  const exportPDF = () => {
    toast({
      title: "Export Coming Soon",
      description: "PDF export will be available in a future update.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const payload = digest?.payload_json as any;
  const kpis = payload?.kpis;
  const aiInsights = payload?.aiInsights;
  const atRiskStudents = payload?.atRiskStudents || [];
  const topImprovers = payload?.topImprovers || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              This Week in {className}
            </CardTitle>
            <CardDescription>
              AI-powered class analytics and insights
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => generateDigest.mutate(selectedVariant)}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {digest ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Variant Tabs */}
        <Tabs value={selectedVariant} onValueChange={(v) => setSelectedVariant(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="teacher">Teacher View</TabsTrigger>
            <TabsTrigger value="student">Student View</TabsTrigger>
            <TabsTrigger value="parent">Parent View</TabsTrigger>
          </TabsList>

          {!digest ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No digest generated yet for this view.</p>
              <p className="text-sm mt-2">Click "Generate" to create a weekly summary.</p>
            </div>
          ) : (
            <>
              {/* KPIs */}
              {kpis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Progress</p>
                          <p className="text-2xl font-bold">{kpis.avgProgress}%</p>
                        </div>
                        {kpis.avgProgressChange > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : kpis.avgProgressChange < 0 ? (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : null}
                      </div>
                      {kpis.avgProgressChange !== 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {kpis.avgProgressChange > 0 ? '+' : ''}{kpis.avgProgressChange.toFixed(1)}% vs last week
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">On-Time Rate</p>
                      <p className="text-2xl font-bold">{kpis.onTimeRate}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {kpis.lateCount} late, {kpis.missingCount} missing
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Reflections</p>
                      <p className="text-2xl font-bold">{kpis.reflectionRate}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        participation rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Goals</p>
                      <p className="text-2xl font-bold">{kpis.goalCompletionRate}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {kpis.completedGoals} of {kpis.activeGoals + kpis.completedGoals} completed
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* AI Insights by Variant */}
              <TabsContent value="teacher" className="space-y-4 mt-0">
                {aiInsights && (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Learning Trend
                      </h4>
                      <p className="text-sm text-muted-foreground pl-6">
                        {aiInsights.learning_trend}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Target className="h-4 w-4 text-secondary" />
                        Goals Status
                      </h4>
                      <p className="text-sm text-muted-foreground pl-6">
                        {aiInsights.goals_status}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-accent" />
                        Engagement
                      </h4>
                      <p className="text-sm text-muted-foreground pl-6">
                        {aiInsights.engagement_note}
                      </p>
                    </div>

                    {/* At-Risk Students */}
                    {atRiskStudents.length > 0 && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                        <h4 className="font-semibold flex items-center gap-2 text-amber-900 dark:text-amber-100">
                          <AlertTriangle className="h-4 w-4" />
                          Students Needing Support ({atRiskStudents.length})
                        </h4>
                        <div className="mt-2 space-y-1">
                          {atRiskStudents.slice(0, 5).map((student: any, idx: number) => (
                            <div key={idx} className="text-sm flex items-start gap-2">
                              <span className="font-medium">{student.name}</span>
                              <span className="text-muted-foreground">—</span>
                              <span className="text-muted-foreground">{student.reasons.join(', ')}</span>
                              {student.iep && <Badge variant="secondary" className="ml-2">IEP</Badge>}
                              {student.ell && <Badge variant="outline" className="ml-2">ELL</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Improvers */}
                    {topImprovers.length > 0 && (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                        <h4 className="font-semibold flex items-center gap-2 text-green-900 dark:text-green-100">
                          <Star className="h-4 w-4" />
                          Top Improvers
                        </h4>
                        <div className="mt-2 space-y-1">
                          {topImprovers.map((student: any, idx: number) => (
                            <div key={idx} className="text-sm flex items-center gap-2">
                              <span className="font-medium">{student.name}</span>
                              <Badge variant="default">+{student.improvement}%</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Steps */}
                    {aiInsights.action_steps && aiInsights.action_steps.length > 0 && (
                      <div className="rounded-lg bg-accent/50 p-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Recommended Actions
                        </h4>
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                          {aiInsights.action_steps.map((step: string, idx: number) => (
                            <li key={idx} className="text-sm">{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="student" className="space-y-4 mt-0">
                {aiInsights && (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        Celebration
                      </h4>
                      <p className="text-sm text-muted-foreground pl-6">
                        {aiInsights.celebration}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Target className="h-4 w-4 text-secondary" />
                        Next Focus
                      </h4>
                      <p className="text-sm text-muted-foreground pl-6">
                        {aiInsights.next_focus}
                      </p>
                    </div>

                    <div className="rounded-lg bg-accent/50 p-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Keep Going!
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        {aiInsights.encouragement}
                      </p>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="parent" className="space-y-4 mt-0">
                {aiInsights && (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Class Summary
                      </h4>
                      <p className="text-sm text-muted-foreground pl-6">
                        {aiInsights.class_summary}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Target className="h-4 w-4 text-secondary" />
                        How to Support at Home
                      </h4>
                      <p className="text-sm text-muted-foreground pl-6">
                        {aiInsights.support_tips}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        Coming Up
                      </h4>
                      <p className="text-sm text-muted-foreground pl-6">
                        {aiInsights.upcoming_focus}
                      </p>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {!digest.teacher_approved && selectedVariant === 'teacher' && (
                  <Button
                    onClick={() => approveDigest.mutate(digest.id)}
                    disabled={approveDigest.isPending}
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
                
                {selectedVariant === 'parent' && (
                  <Button
                    onClick={() => toast({ title: "Coming Soon", description: "Email delivery will be available soon" })}
                    variant="outline"
                    size="sm"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Parents
                  </Button>
                )}

                {selectedVariant === 'student' && (
                  <Button
                    onClick={() => toast({ title: "Coming Soon", description: "Class feed posting will be available soon" })}
                    variant="outline"
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post to Class Feed
                  </Button>
                )}

                <Button
                  onClick={exportPDF}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </>
          )}
        </Tabs>

        {/* Metadata Footer */}
        {digest && (
          <div className="text-xs text-muted-foreground border-t pt-4">
            Generated {format(new Date(digest.created_at), 'MMM d, h:mm a')} • 
            Week of {format(new Date(digest.week_start), 'MMM d')} - {format(new Date(digest.week_end), 'MMM d')}
            {digest.teacher_approved && (
              <span> • <Badge variant="default" className="ml-2">Approved</Badge></span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
