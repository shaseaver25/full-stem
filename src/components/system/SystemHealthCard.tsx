import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemHealthCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  status?: 'healthy' | 'warning' | 'critical';
  icon: LucideIcon;
  isLoading?: boolean;
  updatedAt?: string;
}

export const SystemHealthCard = ({
  title,
  value,
  subtitle,
  status = 'healthy',
  icon: Icon,
  isLoading,
  updatedAt,
}: SystemHealthCardProps) => {
  const statusConfig = {
    healthy: { color: 'bg-green-500', label: 'Healthy', variant: 'default' as const },
    warning: { color: 'bg-yellow-500', label: 'Warning', variant: 'secondary' as const },
    critical: { color: 'bg-red-500', label: 'Critical', variant: 'destructive' as const },
  };

  const config = statusConfig[status];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl font-bold">{value}</div>
          <Badge variant={config.variant} className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${config.color}`} />
            {config.label}
          </Badge>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {updatedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {updatedAt}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
