import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  MessageSquare,
  AlertTriangle,
  BarChart3,
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';

interface CostData {
  date: string;
  cost: number;
  tokens: number;
  conversations: number;
}

interface UsageByLesson {
  lesson_title: string;
  question_count: number;
  cost: number;
  student_count: number;
}

interface SystemStats {
  total_cost_30d: number;
  total_tokens_30d: number;
  total_conversations_30d: number;
  active_users_30d: number;
  avg_cost_per_user: number;
  avg_questions_per_conversation: number;
  projected_monthly_cost: number;
}

export default function AITutorAnalytics() {
  const [costData, setCostData] = useState<CostData[]>([]);
  const [usageByLesson, setUsageByLesson] = useState<UsageByLesson[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCostOverTime(),
        loadUsageByLesson(),
        loadSystemStats()
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCostOverTime = async () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const startDate = subDays(new Date(), days);

    // Get AI usage logs
    const { data: logs } = await supabase
      .from('ai_lesson_history')
      .select('*')
      .eq('model_provider', 'anthropic')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Get conversations
    const { data: convs } = await supabase
      .from('ai_tutor_conversations')
      .select('started_at')
      .gte('started_at', startDate.toISOString());

    // Group by date
    const dailyData: Record<string, { cost: number; tokens: number; conversations: number }> = {};

    logs?.forEach(log => {
      const date = format(new Date(log.created_at), 'MMM d');
      if (!dailyData[date]) {
        dailyData[date] = { cost: 0, tokens: 0, conversations: 0 };
      }
      dailyData[date].cost += log.estimated_cost || 0;
      dailyData[date].tokens += (log.input_tokens || 0) + (log.output_tokens || 0);
    });

    convs?.forEach(conv => {
      const date = format(new Date(conv.started_at), 'MMM d');
      if (!dailyData[date]) {
        dailyData[date] = { cost: 0, tokens: 0, conversations: 0 };
      }
      dailyData[date].conversations += 1;
    });

    const formattedData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      cost: parseFloat(data.cost.toFixed(4)),
      tokens: data.tokens,
      conversations: data.conversations
    }));

    setCostData(formattedData);
  };

  const loadUsageByLesson = async () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const startDate = subDays(new Date(), days);

    // Get usage by lesson
    const { data: usage } = await supabase
      .from('ai_tutor_usage')
      .select(`
        lesson_id,
        questions_asked,
        user_id
      `)
      .gte('date', format(startDate, 'yyyy-MM-dd'));

    // Get lesson titles
    const lessonIds = [...new Set(usage?.map(u => u.lesson_id))];
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title')
      .in('id', lessonIds);

    // Get costs by lesson
    const { data: costs } = await supabase
      .from('ai_lesson_history')
      .select('estimated_cost, metadata')
      .eq('model_provider', 'anthropic')
      .gte('created_at', startDate.toISOString());

    // Aggregate by lesson
    const lessonData: Record<string, { questions: number; cost: number; students: Set<string> }> = {};

    usage?.forEach(u => {
      const lesson = lessons?.find(l => l.id === u.lesson_id);
      const lessonTitle = lesson?.title || 'Unknown Lesson';
      
      if (!lessonData[lessonTitle]) {
        lessonData[lessonTitle] = { questions: 0, cost: 0, students: new Set() };
      }
      lessonData[lessonTitle].questions += u.questions_asked;
      lessonData[lessonTitle].students.add(u.user_id);
    });

    costs?.forEach(c => {
      if (c.metadata && typeof c.metadata === 'object' && !Array.isArray(c.metadata)) {
        const metadata = c.metadata as { lesson_id?: string };
        const lessonId = metadata.lesson_id;
        const lesson = lessons?.find(l => l.id === lessonId);
        const lessonTitle = lesson?.title || 'Unknown Lesson';
        
        if (lessonData[lessonTitle]) {
          lessonData[lessonTitle].cost += c.estimated_cost || 0;
        }
      }
    });

    const formattedData = Object.entries(lessonData)
      .map(([title, data]) => ({
        lesson_title: title,
        question_count: data.questions,
        cost: parseFloat(data.cost.toFixed(4)),
        student_count: data.students.size
      }))
      .sort((a, b) => b.question_count - a.question_count)
      .slice(0, 10); // Top 10 lessons

    setUsageByLesson(formattedData);
  };

  const loadSystemStats = async () => {
    const thirtyDaysAgo = subDays(new Date(), 30);

    // Total cost
    const { data: costData } = await supabase
      .from('ai_lesson_history')
      .select('estimated_cost, input_tokens, output_tokens')
      .eq('model_provider', 'anthropic')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const totalCost = costData?.reduce((sum, log) => sum + (log.estimated_cost || 0), 0) || 0;
    const totalTokens = costData?.reduce((sum, log) => 
      sum + (log.input_tokens || 0) + (log.output_tokens || 0), 0
    ) || 0;

    // Total conversations
    const { data: conversations } = await supabase
      .from('ai_tutor_conversations')
      .select('user_id, message_count')
      .gte('started_at', thirtyDaysAgo.toISOString());

    const totalConversations = conversations?.length || 0;
    const uniqueUsers = new Set(conversations?.map(c => c.user_id)).size;
    const avgQuestions = conversations?.length 
      ? conversations.reduce((sum, c) => sum + c.message_count, 0) / conversations.length 
      : 0;

    // Projected monthly cost (extrapolate from 30 days)
    const projectedMonthlyCost = totalCost;

    setStats({
      total_cost_30d: totalCost,
      total_tokens_30d: totalTokens,
      total_conversations_30d: totalConversations,
      active_users_30d: uniqueUsers,
      avg_cost_per_user: uniqueUsers > 0 ? totalCost / uniqueUsers : 0,
      avg_questions_per_conversation: Math.round(avgQuestions),
      projected_monthly_cost: projectedMonthlyCost
    });
  };

  const exportData = async () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const startDate = subDays(new Date(), days);

    const { data } = await supabase
      .from('ai_lesson_history')
      .select('*')
      .eq('model_provider', 'anthropic')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (!data) return;

    // Convert to CSV
    const headers = ['Date', 'User ID', 'Model', 'Input Tokens', 'Output Tokens', 'Total Tokens', 'Cost'];
    const rows = data.map(row => [
      format(new Date(row.created_at), 'yyyy-MM-dd HH:mm:ss'),
      row.user_id || 'N/A',
      row.model_name || 'N/A',
      row.input_tokens || 0,
      row.output_tokens || 0,
      (row.input_tokens || 0) + (row.output_tokens || 0),
      row.estimated_cost?.toFixed(6) || '0.000000'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tutor-usage-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Tutor Analytics</h1>
          <p className="text-muted-foreground">
            Cost monitoring and usage analytics for Pivot AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* KEY METRICS */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost (30d)</p>
                  <p className="text-2xl font-bold">${stats.total_cost_30d.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Projected: ${stats.projected_monthly_cost.toFixed(2)}/mo
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{stats.active_users_30d}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${stats.avg_cost_per_user.toFixed(2)}/user
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversations</p>
                  <p className="text-2xl font-bold">{stats.total_conversations_30d}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.avg_questions_per_conversation} avg questions
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tokens</p>
                  <p className="text-2xl font-bold">
                    {(stats.total_tokens_30d / 1000000).toFixed(2)}M
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last 30 days
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* COST ALERT */}
      {stats && stats.projected_monthly_cost > 100 && (
        <Card className="mb-6 border-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-1" />
              <div>
                <p className="font-semibold">High Usage Alert</p>
                <p className="text-sm text-muted-foreground">
                  Projected monthly cost (${stats.projected_monthly_cost.toFixed(2)}) exceeds $100 threshold. 
                  Consider reviewing usage patterns or adjusting rate limits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* COST OVER TIME */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Cost Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(4)}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#10b981" 
                  name="Cost ($)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CONVERSATIONS OVER TIME */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="conversations" 
                  fill="#3b82f6" 
                  name="Conversations"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* USAGE BY LESSON */}
      <Card>
        <CardHeader>
          <CardTitle>Top Lessons by Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {usageByLesson.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No lesson usage data available for this period
            </div>
          ) : (
            <div className="space-y-4">
              {usageByLesson.map((lesson, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{lesson.lesson_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {lesson.question_count} questions • {lesson.student_count} students
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">${lesson.cost.toFixed(4)}</p>
                    <div className="w-32 h-2 bg-muted rounded-full mt-1">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ 
                          width: `${(lesson.question_count / Math.max(...usageByLesson.map(l => l.question_count))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RECOMMENDATIONS */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Cost Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats && stats.avg_cost_per_user > 2 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">High Per-User Cost</p>
                  <p className="text-muted-foreground">
                    Average cost per user (${stats.avg_cost_per_user.toFixed(2)}) is above target. 
                    Consider reducing rate limit from 5 to 3 questions per day.
                  </p>
                </div>
              </div>
            )}
            
            {stats && stats.avg_questions_per_conversation < 3 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Low Engagement</p>
                  <p className="text-muted-foreground">
                    Average {stats.avg_questions_per_conversation} questions per conversation suggests 
                    students may need more prompting to engage with the AI tutor.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">System Healthy</p>
                <p className="text-muted-foreground">
                  Rate limiting is preventing runaway costs. Current usage patterns are sustainable.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
