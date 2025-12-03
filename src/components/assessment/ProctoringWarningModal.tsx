import { AlertTriangle, Send, Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProctoringEventType } from '@/hooks/useProctoring';

interface ProctoringWarningModalProps {
  open: boolean;
  onDismiss: () => void;
  message: string;
  warningCount: number;
  maxViolations: number;
  teacherName: string;
  eventType: ProctoringEventType | '';
}

export const ProctoringWarningModal = ({
  open,
  onDismiss,
  message,
  warningCount,
  maxViolations,
  teacherName,
  eventType
}: ProctoringWarningModalProps) => {
  const isNearThreshold = warningCount >= maxViolations - 2;
  const isFinalWarning = warningCount >= maxViolations;

  const getEventDescription = () => {
    switch (eventType) {
      case 'tab_switch':
        return 'switched tabs or minimized the browser';
      case 'fullscreen_exit':
        return 'exited fullscreen mode';
      case 'blur':
        return 'moved focus away from the assessment';
      default:
        return 'triggered an integrity alert';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onDismiss}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className={`h-10 w-10 ${isFinalWarning ? 'text-red-600' : isNearThreshold ? 'text-orange-600' : 'text-yellow-600'}`} />
            <AlertDialogTitle className="text-xl">
              {isFinalWarning ? '🚨 FINAL WARNING - VIOLATION LIMIT REACHED!' : 
               isNearThreshold ? '⚠️ Final Warning Approaching!' : 
               'Assessment Integrity Alert'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-base font-medium text-foreground">{message}</p>
              
              {/* TEACHER NOTIFICATION - MOST PROMINENT */}
              <div className={`${isFinalWarning ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-300'} border-2 rounded-lg p-4`}>
                <div className="flex items-start gap-3">
                  <Send className={`h-6 w-6 ${isFinalWarning ? 'text-red-600' : 'text-orange-600'} flex-shrink-0`} />
                  <div>
                    <p className={`font-bold ${isFinalWarning ? 'text-red-900' : 'text-orange-900'} mb-1`}>
                      📨 Report Sent to Teacher
                    </p>
                    <p className={`text-sm ${isFinalWarning ? 'text-red-800' : 'text-orange-800'}`}>
                      <strong>{teacherName}</strong> has been notified that you {getEventDescription()} at{' '}
                      <span className="font-mono">{new Date().toLocaleTimeString()}</span>
                    </p>
                    <p className={`text-sm ${isFinalWarning ? 'text-red-800' : 'text-orange-800'} mt-2`}>
                      This event has been permanently logged in your assessment integrity report.
                    </p>
                  </div>
                </div>
              </div>

              {/* Violation Counter */}
              <div className={`${isFinalWarning ? 'bg-red-100 border-red-300' : 'bg-yellow-50 border-yellow-300'} border-2 rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Violation Count</p>
                    <p className={`text-3xl font-bold ${isFinalWarning ? 'text-red-600' : 'text-yellow-900'}`}>
                      {warningCount} / {maxViolations}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">Integrity Impact</p>
                    <p className={`text-2xl font-bold ${isFinalWarning ? 'text-red-600' : 'text-orange-600'}`}>
                      -{warningCount * 10} points
                    </p>
                  </div>
                </div>
              </div>

              {isFinalWarning && (
                <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
                  <p className="text-sm font-bold text-red-900 mb-2">
                    ⛔ MAXIMUM VIOLATIONS REACHED
                  </p>
                  <p className="text-sm text-red-800">
                    Your assessment may be automatically submitted, or additional violations may result in 
                    a zero score. Contact your teacher immediately if you're experiencing technical issues.
                  </p>
                </div>
              )}

              {!isFinalWarning && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <strong>To avoid additional reports:</strong> Keep this window in fullscreen mode and 
                    maintain focus on the assessment. Don't switch tabs or use other applications.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>
                  Your complete activity timeline is being recorded and will be reviewed by your instructor 
                  after submission. This includes timestamps, duration, and context for each event.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={onDismiss} 
            className={`w-full ${isFinalWarning ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            {isFinalWarning ? 'I Understand - Proceed Carefully' : 'I Understand - Return to Assessment'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
