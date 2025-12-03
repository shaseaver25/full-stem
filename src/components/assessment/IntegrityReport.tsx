import { Shield, AlertTriangle, CheckCircle, Clock, Eye, Maximize, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProctoringEvent } from '@/hooks/useProctoring';
import { cn } from '@/lib/utils';

interface IntegrityReportProps {
  integrityScore: number;
  events: ProctoringEvent[];
  totalTimeAwaySeconds?: number;
  teacherName?: string;
}

export const IntegrityReport = ({
  integrityScore,
  events,
  totalTimeAwaySeconds = 0,
  teacherName = 'Your Teacher'
}: IntegrityReportProps) => {
  const violations = events.filter(e => 
    ['tab_switch', 'fullscreen_exit', 'blur'].includes(e.event_type)
  );
  
  const getScoreColor = () => {
    if (integrityScore >= 90) return 'text-green-600';
    if (integrityScore >= 70) return 'text-yellow-600';
    if (integrityScore >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = () => {
    if (integrityScore >= 90) return 'bg-green-50 border-green-200';
    if (integrityScore >= 70) return 'bg-yellow-50 border-yellow-200';
    if (integrityScore >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'tab_switch':
        return <Eye className="h-4 w-4 text-orange-600" />;
      case 'fullscreen_exit':
        return <Maximize className="h-4 w-4 text-orange-600" />;
      case 'blur':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'focus_return':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'tab_switch':
        return 'Tab Switch';
      case 'fullscreen_exit':
        return 'Fullscreen Exit';
      case 'blur':
        return 'Window Blur';
      case 'focus_return':
        return 'Focus Return';
      case 'fullscreen_enter':
        return 'Fullscreen Enter';
      case 'session_start':
        return 'Session Start';
      case 'session_end':
        return 'Session End';
      default:
        return type;
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className={cn('border-2', getScoreBg())}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className={cn('h-8 w-8', getScoreColor())} />
            <div>
              <CardTitle>Assessment Integrity Report</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                This report has been submitted to {teacherName}
              </p>
            </div>
          </div>
          <div className={cn(
            'text-center px-6 py-3 rounded-lg border-2',
            getScoreBg()
          )}>
            <div className={cn('text-4xl font-bold', getScoreColor())}>
              {integrityScore}%
            </div>
            <div className="text-sm text-muted-foreground">Integrity Score</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-background rounded-lg border">
            <div className="text-3xl font-bold text-orange-600">{violations.length}</div>
            <div className="text-sm text-muted-foreground">Total Violations</div>
          </div>
          <div className="text-center p-4 bg-background rounded-lg border">
            <div className="text-3xl font-bold text-blue-600">{events.length}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </div>
          <div className="text-center p-4 bg-background rounded-lg border">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(totalTimeAwaySeconds)}s
            </div>
            <div className="text-sm text-muted-foreground">Time Away</div>
          </div>
        </div>

        {/* Teacher Notification Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Send className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">
                📨 Report Sent to {teacherName}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                Your complete activity timeline has been submitted along with your assessment responses. 
                Your teacher will review this report when grading your submission.
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Event Timeline */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </h4>
          
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">No suspicious activity detected</p>
              <p className="text-sm">Assessment completed with full integrity</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {events.map((event, index) => {
                const isViolation = ['tab_switch', 'fullscreen_exit', 'blur'].includes(event.event_type);
                return (
                  <div 
                    key={index}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      isViolation ? 'bg-orange-50 border-orange-200' : 'bg-background'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.event_type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getEventLabel(event.event_type)}</span>
                          {isViolation && (
                            <Badge variant="destructive" className="text-xs">
                              Violation
                            </Badge>
                          )}
                        </div>
                        {event.details && Object.keys(event.details).length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {JSON.stringify(event.details)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Score Breakdown */}
        {violations.length > 0 && (
          <>
            <Separator />
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Score Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Score</span>
                  <span className="font-medium">100%</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Violations ({violations.length} × -10%)</span>
                  <span className="font-medium">-{violations.length * 10}%</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Final Integrity Score</span>
                  <span className={getScoreColor()}>{integrityScore}%</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
