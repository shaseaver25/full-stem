import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Activity, DollarSign, Zap } from 'lucide-react';

interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byProvider: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

export function AIUsageSummary() {
  const [stats, setStats] = useState<AIUsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_lesson_history')
        .select('model_provider, input_tokens, output_tokens, estimated_cost');

      if (error) throw error;

      const stats: AIUsageStats = {
        totalRequests: data.length,
        totalTokens: 0,
        totalCost: 0,
        byProvider: {},
      };

      data.forEach((record) => {
        const provider = record.model_provider || 'unknown';
        const tokens = (record.input_tokens || 0) + (record.output_tokens || 0);
        const cost = record.estimated_cost || 0;

        stats.totalTokens += tokens;
        stats.totalCost += cost;

        if (!stats.byProvider[provider]) {
          stats.byProvider[provider] = { requests: 0, tokens: 0, cost: 0 };
        }

        stats.byProvider[provider].requests += 1;
        stats.byProvider[provider].tokens += tokens;
        stats.byProvider[provider].cost += cost;
      });

      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch AI usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Usage</CardTitle>
          <CardDescription>Loading usage statistics...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Usage</CardTitle>
          <CardDescription>No usage data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Usage Overview</CardTitle>
          <CardDescription>Total usage across all providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Requests</p>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Tokens</p>
                <p className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Estimated Cost</p>
                <p className="text-2xl font-bold">${stats.totalCost.toFixed(4)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage by Provider</CardTitle>
          <CardDescription>Breakdown per AI model provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.byProvider).map(([provider, data]) => (
              <div key={provider} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium capitalize">{provider}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.requests} requests • {data.tokens.toLocaleString()} tokens
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${data.cost.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground">
                    ${(data.cost / data.requests).toFixed(4)}/req
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
