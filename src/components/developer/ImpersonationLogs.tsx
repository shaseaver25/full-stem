import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ImpersonationLog {
  id: string;
  developer_id: string;
  impersonated_user_id: string;
  impersonated_role: string;
  session_start: string;
  session_end: string | null;
  ip_address: unknown;
  user_agent: string;
  actions_performed: any;
}

const ImpersonationLogs = () => {
  const [logs, setLogs] = useState<ImpersonationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('impersonation_logs')
        .select('*')
        .order('session_start', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching impersonation logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return 'Active';
    
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);
    
    return `${duration} min`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impersonation Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Impersonation Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      Role: <Badge variant="outline">{log.impersonated_role}</Badge>
                    </span>
                  </div>
                  <Badge variant={log.session_end ? 'secondary' : 'destructive'}>
                    {log.session_end ? 'Completed' : 'Active'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Started: {format(new Date(log.session_start), 'MMM d, HH:mm')}
                  </div>
                  <div>
                    Duration: {formatDuration(log.session_start, log.session_end)}
                  </div>
                  <div>
                    IP: {String(log.ip_address)}
                  </div>
                  <div>
                    Actions: {Array.isArray(log.actions_performed) ? log.actions_performed.length : 0}
                  </div>
                </div>

                {Array.isArray(log.actions_performed) && log.actions_performed.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      View Actions ({log.actions_performed.length})
                    </summary>
                    <div className="mt-2 space-y-1 text-xs bg-gray-50 p-2 rounded">
                      {log.actions_performed.map((action: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{action.action}</span>
                          <span className="text-gray-500">
                            {action.timestamp ? format(new Date(action.timestamp), 'HH:mm:ss') : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))}
            
            {logs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No impersonation logs found
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ImpersonationLogs;