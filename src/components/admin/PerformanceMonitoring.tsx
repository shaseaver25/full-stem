
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface PerformanceMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  value: number;
  unit: string;
  recorded_at: string;
}

interface PerformanceMonitoringProps {
  performanceMetrics: PerformanceMetric[];
}

const PerformanceMonitoring: React.FC<PerformanceMonitoringProps> = ({ performanceMetrics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Performance Monitoring
        </CardTitle>
        <CardDescription>
          System performance metrics and monitoring data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {performanceMetrics.map((metric) => (
            <Card key={metric.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{metric.metric_name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {metric.metric_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {metric.value.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {metric.unit}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(metric.recorded_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitoring;
