import { SystemHealthCard } from './SystemHealthCard';
import { ErrorFeed } from './ErrorFeed';
import { ActivityChart } from './ActivityChart';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { Server, Database, Users, Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SystemHealthMonitor = () => {
  const { healthData, metrics, activityData, errors, isLoading, getMetricByName } = useSystemHealth();

  const dbLatency = getMetricByName('db_latency');
  const activeUsers = getMetricByName('active_users');
  const errorCount = getMetricByName('error_count');
  const lastBackup = getMetricByName('last_backup');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">System Health Monitor</h3>
        <p className="text-sm text-muted-foreground">
          Real-time platform metrics and operational status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SystemHealthCard
          title="API Uptime"
          value={healthData?.status === 'healthy' ? '99.98%' : 'Down'}
          subtitle={`Latency: ${healthData?.latency || 0}ms`}
          status={
            healthData?.status === 'healthy'
              ? 'healthy'
              : healthData?.status === 'unhealthy'
              ? 'warning'
              : 'critical'
          }
          icon={Server}
          isLoading={isLoading}
          updatedAt={
            healthData?.timestamp
              ? formatDistanceToNow(new Date(healthData.timestamp), { addSuffix: true })
              : undefined
          }
        />

        <SystemHealthCard
          title="Active Users"
          value={activeUsers?.value || 0}
          subtitle="Live sessions (15min)"
          status={activeUsers?.status || 'healthy'}
          icon={Users}
          isLoading={isLoading}
          updatedAt={
            activeUsers?.updated_at
              ? formatDistanceToNow(new Date(activeUsers.updated_at), { addSuffix: true })
              : undefined
          }
        />

        <SystemHealthCard
          title="DB Latency"
          value={`${Math.round(dbLatency?.value || 0)}ms`}
          subtitle="Database response time"
          status={dbLatency?.status || 'healthy'}
          icon={Database}
          isLoading={isLoading}
          updatedAt={
            dbLatency?.updated_at
              ? formatDistanceToNow(new Date(dbLatency.updated_at), { addSuffix: true })
              : undefined
          }
        />

        <SystemHealthCard
          title="Error Rate"
          value={errorCount?.value || 0}
          subtitle="Last hour"
          status={errorCount?.status || 'healthy'}
          icon={Activity}
          isLoading={isLoading}
          updatedAt={
            errorCount?.updated_at
              ? formatDistanceToNow(new Date(errorCount.updated_at), { addSuffix: true })
              : undefined
          }
        />
      </div>

      {lastBackup && (
        <SystemHealthCard
          title="Last Backup"
          value={formatDistanceToNow(new Date(lastBackup.metadata?.timestamp), { addSuffix: true })}
          subtitle="Database backup status"
          status={lastBackup.status}
          icon={Clock}
          isLoading={isLoading}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <ErrorFeed errors={errors} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <ActivityChart data={activityData} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};
