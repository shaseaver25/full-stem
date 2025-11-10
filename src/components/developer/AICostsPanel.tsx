import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  DollarSign, TrendingUp, AlertTriangle, Calendar, 
  Activity, Save 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, startOfWeek, startOfMonth, subDays, eachDayOfInterval } from 'date-fns';
import { toast } from '@/hooks/use-toast';

// Helper functions
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

const formatActionType = (type: string) => {
  const map: Record<string, string> = {
    quiz_generation: 'Quiz Generation',
    short_answer_grading: 'Short Answer Grading',
    poll_generation: 'Poll Generation',
    translation: 'Translation',
    tts: 'Text-to-Speech'
  };
  return map[type] || type;
};

// Types
interface UsageLog {
  id: string;
  created_at: string;
  user_id: string;
  action_type: string;
  model: string;
  tokens_used: number;
  estimated_cost: number;
  metadata: any;
}

interface Profile {
  id: string;
  email: string;
}

export const AICostsPanel = () => {
  const queryClient = useQueryClient();
  const [budgetThreshold, setBudgetThreshold] = useState<number>(100);
  const [newThreshold, setNewThreshold] = useState<string>('100');
  const [logsLimit, setLogsLimit] = useState<number>(25);
  const [showAllLogs, setShowAllLogs] = useState<boolean>(false);

  // Fetch AI usage logs
  const { data: usageLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['ai-usage-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_usage_logs' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as UsageLog[];
    }
  });

  // Fetch user emails for recent logs
  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: async () => {
      const userIds = [...new Set(usageLogs.map(log => log.user_id).filter(Boolean))];
      if (userIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles' as any)
        .select('id, email')
        .in('id', userIds);
      
      if (error) throw error;
      return data as unknown as Profile[];
    },
    enabled: usageLogs.length > 0
  });

  // Calculate summary stats
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(new Date());
  const monthStart = startOfMonth(new Date());
  const daysInMonth = new Date().getDate();

  const todayCost = usageLogs
    .filter(log => new Date(log.created_at) >= today)
    .reduce((sum, log) => sum + (log.estimated_cost || 0), 0);

  const weekCost = usageLogs
    .filter(log => new Date(log.created_at) >= weekStart)
    .reduce((sum, log) => sum + (log.estimated_cost || 0), 0);

  const monthCost = usageLogs
    .filter(log => new Date(log.created_at) >= monthStart)
    .reduce((sum, log) => sum + (log.estimated_cost || 0), 0);

  const avgDailyCost = monthCost / daysInMonth;

  // Cost breakdown by action type
  const costByAction = Object.entries(
    usageLogs.reduce((acc, log) => {
      const type = log.action_type;
      acc[type] = (acc[type] || 0) + (log.estimated_cost || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, cost]) => ({
    name: formatActionType(type),
    cost: cost as number,
    percentage: ((cost as number / monthCost) * 100).toFixed(1)
  })).sort((a, b) => b.cost - a.cost);

  // Daily cost trend (last 30 days)
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  const dailyCosts = last30Days.map(day => {
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayCost = usageLogs
      .filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= dayStart && logDate <= dayEnd;
      })
      .reduce((sum, log) => sum + (log.estimated_cost || 0), 0);

    return {
      date: format(day, 'MMM d'),
      cost: parseFloat(dayCost.toFixed(2))
    };
  });

  // Recent logs with user emails
  const displayLimit = showAllLogs ? usageLogs.length : logsLimit;
  const recentLogs = usageLogs.slice(0, displayLimit).map(log => {
    const profile = profiles.find(p => p.id === log.user_id);
    return {
      ...log,
      userEmail: profile?.email || 'Anonymous'
    };
  });

  // Save budget threshold
  const saveBudgetMutation = useMutation({
    mutationFn: async (threshold: number) => {
      // Store in localStorage for now (could be moved to DB)
      localStorage.setItem('ai_budget_threshold', threshold.toString());
      return threshold;
    },
    onSuccess: (threshold) => {
      setBudgetThreshold(threshold);
      toast({
        title: 'Budget Threshold Updated',
        description: `New threshold set to ${formatCurrency(threshold)}/day`
      });
    }
  });

  // Load saved threshold on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('ai_budget_threshold');
    if (saved) {
      const threshold = parseFloat(saved);
      setBudgetThreshold(threshold);
      setNewThreshold(threshold.toString());
    }
  }, []);

  const isOverBudget = todayCost > budgetThreshold;

  // Chart colors
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  if (logsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Alert */}
      {isOverBudget && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Budget Alert</AlertTitle>
          <AlertDescription>
            Today's AI costs ({formatCurrency(todayCost)}) have exceeded your daily threshold of {formatCurrency(budgetThreshold)}.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today's Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {usageLogs.filter(log => new Date(log.created_at) >= today).length} calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(weekCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {usageLogs.filter(log => new Date(log.created_at) >= weekStart).length} calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {usageLogs.filter(log => new Date(log.created_at) >= monthStart).length} calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Avg Daily
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgDailyCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {daysInMonth} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown by Feature */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown by Feature</CardTitle>
          <CardDescription>Total monthly costs by AI action type</CardDescription>
        </CardHeader>
        <CardContent>
          {costByAction.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costByAction} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="cost" fill="#3b82f6">
                  {costByAction.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No cost data available</p>
          )}
          
          {costByAction.length > 0 && (
            <div className="mt-4 space-y-2">
              {costByAction.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{formatCurrency(item.cost)}</span>
                    <span className="text-muted-foreground">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Cost Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Cost Trend</CardTitle>
          <CardDescription>Last 30 days of AI spending</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyCosts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Daily Cost"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Usage Log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Recent AI Usage</CardTitle>
            <CardDescription>
              {showAllLogs 
                ? `Showing all ${usageLogs.length} AI calls` 
                : `Showing ${Math.min(logsLimit, usageLogs.length)} of ${usageLogs.length} calls`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!showAllLogs && logsLimit < usageLogs.length && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLogsLimit(prev => Math.min(prev + 25, usageLogs.length))}
              >
                Load 25 More
              </Button>
            )}
            {usageLogs.length > 25 && (
              <Button 
                variant={showAllLogs ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowAllLogs(!showAllLogs);
                  if (!showAllLogs) {
                    setLogsLimit(usageLogs.length);
                  } else {
                    setLogsLimit(25);
                  }
                }}
              >
                {showAllLogs ? 'Show Recent' : 'Show All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Timestamp</th>
                  <th className="text-left p-2 font-medium">User</th>
                  <th className="text-left p-2 font-medium">Action Type</th>
                  <th className="text-left p-2 font-medium">Model</th>
                  <th className="text-right p-2 font-medium">Tokens</th>
                  <th className="text-right p-2 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.length > 0 ? (
                  recentLogs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        {format(new Date(log.created_at), 'MMM d, h:mm a')}
                      </td>
                      <td className="p-2 truncate max-w-[200px]" title={log.userEmail}>
                        {log.userEmail}
                      </td>
                      <td className="p-2">{formatActionType(log.action_type)}</td>
                      <td className="p-2 font-mono text-xs">{log.model}</td>
                      <td className="p-2 text-right">{log.tokens_used?.toLocaleString()}</td>
                      <td className="p-2 text-right font-medium">
                        {formatCurrency(log.estimated_cost || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No usage logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Budget Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Alert Threshold</CardTitle>
          <CardDescription>Set daily spending alert threshold</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="threshold">Alert threshold ($/day)</Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                step="0.01"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                placeholder="100.00"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={() => {
                const threshold = parseFloat(newThreshold);
                if (!isNaN(threshold) && threshold >= 0) {
                  saveBudgetMutation.mutate(threshold);
                } else {
                  toast({
                    title: 'Invalid Threshold',
                    description: 'Please enter a valid positive number',
                    variant: 'destructive'
                  });
                }
              }}
              disabled={saveBudgetMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Current threshold: {formatCurrency(budgetThreshold)}/day
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
