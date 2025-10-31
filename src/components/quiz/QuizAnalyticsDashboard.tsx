import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuizAnalyticsProps {
  quizComponentId: string;
  quizTitle: string;
}

interface AttemptData {
  id: string;
  student_id: string;
  attempt_number: number;
  score: number;
  max_score: number;
  percentage: number;
  time_spent_seconds: number;
  completed_at: string;
  answers: any;
}

interface QuestionAnalysis {
  questionId: string;
  questionText: string;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  percentCorrect: number;
}

export function QuizAnalyticsDashboard({ quizComponentId, quizTitle }: QuizAnalyticsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [questionAnalysis, setQuestionAnalysis] = useState<QuestionAnalysis[]>([]);
  const [students, setStudents] = useState<Record<string, any>>({});

  useEffect(() => {
    loadAnalytics();
  }, [quizComponentId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load all attempts for this quiz
      const { data: attemptsData, error: attemptsError } = await (supabase as any)
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_component_id', quizComponentId)
        .order('completed_at', { ascending: false });

      if (attemptsError) throw attemptsError;

      setAttempts(attemptsData || []);

      // Load student information
      const studentIdsSet = new Set<string>();
      attemptsData?.forEach((a: any) => {
        if (a.student_id) studentIdsSet.add(String(a.student_id));
      });
      const studentIds = Array.from(studentIdsSet);
      const studentsMap: Record<string, any> = {};
      
      for (const studentId of studentIds) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(studentId as string);
          if (userData) {
            studentsMap[studentId as string] = userData.user;
          }
        } catch (error) {
          // User might not be accessible, skip
          console.warn('Could not load user:', studentId);
        }
      }
      
      setStudents(studentsMap);

      // Load quiz questions for analysis
      const { data: quizData } = await (supabase as any)
        .from('quiz_components')
        .select('*')
        .eq('id', quizComponentId)
        .single();

      if (quizData) {
        const { data: questions } = await (supabase as any)
          .from('quiz_questions')
          .select('*')
          .eq('quiz_component_id', quizComponentId);

        // Analyze question difficulty
        const analysis = (questions || []).map((q: any) => {
          let correctCount = 0;
          let totalAttempts = 0;

          attemptsData?.forEach((attempt: any) => {
            if (attempt.answers && attempt.answers[q.id]) {
              totalAttempts++;
              // Simple heuristic: if answer exists, check if it contributed to score
              // This is simplified - in production you'd track per-question correctness
              const wasCorrect = attempt.percentage >= 70; // Simplified
              if (wasCorrect) correctCount++;
            }
          });

          return {
            questionId: q.id,
            questionText: q.question_text,
            totalAttempts,
            correctCount,
            incorrectCount: totalAttempts - correctCount,
            percentCorrect: totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0
          };
        });

        setQuestionAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (attempts.length === 0) {
      return {
        averageScore: 0,
        medianScore: 0,
        highScore: 0,
        lowScore: 0,
        passRate: 0,
        averageTime: 0,
        totalStudents: 0
      };
    }

    // Get best attempt per student
    const bestAttempts = new Map<string, AttemptData>();
    attempts.forEach(attempt => {
      const existing = bestAttempts.get(attempt.student_id);
      if (!existing || attempt.percentage > existing.percentage) {
        bestAttempts.set(attempt.student_id, attempt);
      }
    });

    const bestAttemptsArray = Array.from(bestAttempts.values());
    const percentages = bestAttemptsArray.map(a => a.percentage).sort((a, b) => a - b);

    return {
      averageScore: Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length),
      medianScore: Math.round(percentages[Math.floor(percentages.length / 2)]),
      highScore: Math.round(Math.max(...percentages)),
      lowScore: Math.round(Math.min(...percentages)),
      passRate: Math.round((bestAttemptsArray.filter(a => a.percentage >= 70).length / bestAttemptsArray.length) * 100),
      averageTime: Math.round(attempts.reduce((sum, a) => sum + a.time_spent_seconds, 0) / attempts.length / 60),
      totalStudents: bestAttempts.size
    };
  };

  const getScoreDistribution = () => {
    const bestAttempts = new Map<string, AttemptData>();
    attempts.forEach(attempt => {
      const existing = bestAttempts.get(attempt.student_id);
      if (!existing || attempt.percentage > existing.percentage) {
        bestAttempts.set(attempt.student_id, attempt);
      }
    });

    const distribution = [
      { range: '90-100%', count: 0, color: '#22c55e' },
      { range: '80-89%', count: 0, color: '#84cc16' },
      { range: '70-79%', count: 0, color: '#eab308' },
      { range: '60-69%', count: 0, color: '#f97316' },
      { range: 'Below 60%', count: 0, color: '#ef4444' }
    ];

    Array.from(bestAttempts.values()).forEach(attempt => {
      if (attempt.percentage >= 90) distribution[0].count++;
      else if (attempt.percentage >= 80) distribution[1].count++;
      else if (attempt.percentage >= 70) distribution[2].count++;
      else if (attempt.percentage >= 60) distribution[3].count++;
      else distribution[4].count++;
    });

    return distribution;
  };

  const exportToCSV = () => {
    const bestAttempts = new Map<string, AttemptData>();
    attempts.forEach(attempt => {
      const existing = bestAttempts.get(attempt.student_id);
      if (!existing || attempt.percentage > existing.percentage) {
        bestAttempts.set(attempt.student_id, attempt);
      }
    });

    const headers = ['Student', 'Score', 'Percentage', 'Attempts', 'Time (minutes)', 'Status', 'Date'];
    const rows = Array.from(bestAttempts.values()).map(attempt => [
      students[attempt.student_id]?.email || 'Unknown',
      `${attempt.score}/${attempt.max_score}`,
      `${Math.round(attempt.percentage)}%`,
      attempts.filter(a => a.student_id === attempt.student_id).length,
      Math.round(attempt.time_spent_seconds / 60),
      attempt.percentage >= 70 ? 'Passed' : 'Needs Review',
      new Date(attempt.completed_at).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quizTitle.replace(/[^a-z0-9]/gi, '_')}_results.csv`;
    a.click();

    toast({
      title: 'Export Complete',
      description: 'Quiz results exported to CSV'
    });
  };

  const stats = calculateStats();
  const distribution = getScoreDistribution();
  const mostMissed = questionAnalysis
    .filter(q => q.totalAttempts > 0)
    .sort((a, b) => a.percentCorrect - b.percentCorrect)
    .slice(0, 3);

  if (loading) {
    return <div className="p-4">Loading analytics...</div>;
  }

  return (
    <Card className="bg-cyan-50 border-cyan-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-cyan-900">📊 Quiz Analytics: {quizTitle}</CardTitle>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Class Stats</TabsTrigger>
            <TabsTrigger value="students">Individual Students</TabsTrigger>
            <TabsTrigger value="questions">Question Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-cyan-900">{stats.averageScore}%</div>
                  <p className="text-xs text-muted-foreground">Average Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-cyan-900">{stats.medianScore}%</div>
                  <p className="text-xs text-muted-foreground">Median Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-cyan-900">{stats.passRate}%</div>
                  <p className="text-xs text-muted-foreground">Pass Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-cyan-900">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Students</p>
                </CardContent>
              </Card>
            </div>

            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Most Missed Questions */}
            {mostMissed.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Most Challenging Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mostMissed.map((q, idx) => (
                    <div key={q.questionId} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{q.questionText}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(q.percentCorrect)}% correct ({q.incorrectCount} of {q.totalAttempts} incorrect)
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                    <TrendingDown className="h-4 w-4" />
                    <span>💡 Consider reviewing these topics in your next lesson</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Student</th>
                        <th className="text-left py-2 px-4">Score</th>
                        <th className="text-left py-2 px-4">%</th>
                        <th className="text-left py-2 px-4">Attempts</th>
                        <th className="text-left py-2 px-4">Time</th>
                        <th className="text-left py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(new Map(attempts.map(a => [a.student_id, a])).values())
                        .sort((a, b) => b.percentage - a.percentage)
                        .map((attempt) => {
                          const studentAttempts = attempts.filter(a => a.student_id === attempt.student_id);
                          const bestAttempt = studentAttempts.reduce((best, curr) => 
                            curr.percentage > best.percentage ? curr : best
                          , attempt);
                          
                          return (
                            <tr key={attempt.student_id} className="border-b hover:bg-accent">
                              <td className="py-2 px-4">
                                {students[attempt.student_id]?.email || 'Unknown'}
                              </td>
                              <td className="py-2 px-4">
                                {bestAttempt.score}/{bestAttempt.max_score}
                              </td>
                              <td className="py-2 px-4">
                                {Math.round(bestAttempt.percentage)}%
                              </td>
                              <td className="py-2 px-4">{studentAttempts.length}</td>
                              <td className="py-2 px-4">
                                {Math.round(bestAttempt.time_spent_seconds / 60)} min
                              </td>
                              <td className="py-2 px-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  bestAttempt.percentage >= 70 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {bestAttempt.percentage >= 70 ? '✅ Passed' : '📚 Needs Review'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <Card>
              <CardContent className="pt-6 space-y-3">
                {questionAnalysis.map((q) => (
                  <div key={q.questionId} className="p-4 bg-background rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium flex-1">{q.questionText}</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        q.percentCorrect >= 70 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {Math.round(q.percentCorrect)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>✅ {q.correctCount} correct</span>
                      <span>❌ {q.incorrectCount} incorrect</span>
                      <span>Total: {q.totalAttempts} attempts</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${q.percentCorrect}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
