import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Database, Zap, Clock } from 'lucide-react';

interface Metric {
  metric: string;
  value: number;
  status: string;
  metadata?: any;
  updated_at: string;
}

export const PerformancePanel = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      // Refresh metrics first
      await supabase.rpc('refresh_system_metrics');

      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getIcon = (metricName: string) => {
    switch (metricName) {
      case 'db_latency':
        return <Database className="h-5 w-5" />;
      case 'error_count':
        return <Zap className="h-5 w-5" />;
      case 'active_users':
        return <Activity className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const formatValue = (metric: Metric) => {
    switch (metric.metric) {
      case 'db_latency':
        return `${metric.value.toFixed(2)} ms`;
      case 'last_backup':
        const hours = Math.floor(metric.value / 3600);
        return `${hours} hours ago`;
      default:
        return metric.value.toString();
    }
  };

  const getMetricLabel = (metricName: string) => {
    const labels: Record<string, string> = {
      db_latency: 'Database Latency',
      error_count: 'Recent Errors',
      active_users: 'Active Users',
      last_backup: 'Last Backup',
    };
    return labels[metricName] || metricName;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading metrics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>
          Real-time system performance and health indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.metric}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getIcon(metric.metric)}
                  <span className="font-medium">{getMetricLabel(metric.metric)}</span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status.toUpperCase()}
                </span>
              </div>
              <div className="text-2xl font-bold">{formatValue(metric)}</div>
              <div className="text-xs text-muted-foreground">
                Updated {new Date(metric.updated_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {metrics.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No performance metrics available
          </p>
        )}
      </CardContent>
    </Card>
  );
};
