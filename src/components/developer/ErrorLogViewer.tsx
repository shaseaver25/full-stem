import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface ErrorLog {
  id: string;
  metric_type: string;
  metric_name: string;
  value: number;
  unit: string;
  metadata: any;
  recorded_at: string;
}

export const ErrorLogViewer = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [severityFilter]);

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from('performance_metrics')
        .select('*')
        .eq('metric_type', 'error')
        .order('recorded_at', { ascending: false })
        .limit(50);

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'error':
        return 'destructive';
      case 'warning':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filteredLogs = severityFilter === 'all' 
    ? logs 
    : logs.filter(log => log.metric_name.toLowerCase() === severityFilter.toLowerCase());

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Log Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading logs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Error Log Viewer</CardTitle>
            <CardDescription>
              Real-time error feed and system alerts
            </CardDescription>
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="error">Errors</SelectItem>
              <SelectItem value="warning">Warnings</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No error logs found
            </p>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(log.metric_name)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(log.metric_name)}>
                        {log.metric_name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.recorded_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{log.metric_type}</p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground">
                          Show details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
