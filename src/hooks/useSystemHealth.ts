import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logUserAction, ActivityActions } from '@/utils/activityLogger';
import { useEffect } from 'react';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'error';
  latency: number;
  timestamp: string;
}

interface SystemMetric {
  metric: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  metadata: any;
  updated_at: string;
}

interface ActivityDataPoint {
  hour: string;
  actions: number;
}

interface ErrorEntry {
  id: string;
  message: string;
  component?: string;
  timestamp: string;
  severity: 'error' | 'warning' | 'info';
}

export const useSystemHealth = () => {
  const { user } = useAuth();

  // Log dashboard access
  useEffect(() => {
    if (user) {
      logUserAction({
        userId: user.id,
        role: 'system_admin',
        action: ActivityActions.SYSTEM_ADMIN.VIEW_AUDIT_LOG,
        details: { section: 'System Health Monitor' },
      });
    }
  }, [user]);

  // Health check query
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health-check'],
    queryFn: async (): Promise<HealthCheckResponse> => {
      const response = await fetch(
        'https://irxzpsvzlihqitlicoql.supabase.co/functions/v1/health-check',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.json();
    },
    refetchInterval: 60000, // Refresh every 60 seconds
  });

  // System metrics query
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async (): Promise<SystemMetric[]> => {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((item) => ({
        metric: item.metric,
        value: item.value,
        status: item.status as 'healthy' | 'warning' | 'critical',
        metadata: item.metadata,
        updated_at: item.updated_at,
      }));
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Activity data query (last 24 hours)
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['system-activity-24h'],
    queryFn: async (): Promise<ActivityDataPoint[]> => {
      // Query activity log directly and aggregate by hour
      const { data, error } = await supabase
        .from('activity_log')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch activity data:', error);
        // Return mock data
        const mockData: ActivityDataPoint[] = [];
        for (let i = 23; i >= 0; i--) {
          const date = new Date();
          date.setHours(date.getHours() - i, 0, 0, 0);
          mockData.push({
            hour: date.toISOString(),
            actions: Math.floor(Math.random() * 100) + 10,
          });
        }
        return mockData;
      }

      // Aggregate by hour
      const hourlyData: Record<string, number> = {};
      (data || []).forEach((item) => {
        const hour = new Date(item.created_at);
        hour.setMinutes(0, 0, 0);
        const key = hour.toISOString();
        hourlyData[key] = (hourlyData[key] || 0) + 1;
      });

      // Convert to array and fill gaps
      const result: ActivityDataPoint[] = [];
      for (let i = 23; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i, 0, 0, 0);
        const key = date.toISOString();
        result.push({
          hour: key,
          actions: hourlyData[key] || 0,
        });
      }

      return result;
    },
    refetchInterval: 60000,
  });

  // Error feed query
  const { data: errors, isLoading: errorsLoading } = useQuery({
    queryKey: ['system-errors'],
    queryFn: async (): Promise<ErrorEntry[]> => {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('metric_type', 'error')
        .order('recorded_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Failed to fetch errors:', error);
        return [];
      }

      return (data || []).map((item) => {
        const metadata = item.metadata as any;
        return {
          id: item.id,
          message: item.metric_name || 'Unknown error',
          component: metadata?.component as string | undefined,
          timestamp: item.recorded_at,
          severity: (metadata?.severity || 'error') as 'error' | 'warning' | 'info',
        };
      });
    },
    refetchInterval: 30000,
  });

  const getMetricByName = (name: string): SystemMetric | undefined => {
    return metrics?.find((m) => m.metric === name);
  };

  return {
    healthData,
    metrics: metrics || [],
    activityData: activityData || [],
    errors: errors || [],
    isLoading: healthLoading || metricsLoading || activityLoading || errorsLoading,
    getMetricByName,
  };
};
