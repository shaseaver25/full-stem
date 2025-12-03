import { Shield, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProctoringConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
  teacherName: string;
  strictness: 'lenient' | 'standard' | 'strict';
  maxViolations: number;
}

export const ProctoringConsentModal = ({
  open,
  onAccept,
  onDecline,
  teacherName,
  strictness,
  maxViolations
}: ProctoringConsentModalProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-10 w-10 text-blue-600" />
            <AlertDialogTitle className="text-2xl">
              Assessment Integrity Monitoring Active
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-base">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-900 mb-2">
                  ⚠️ This assessment is being monitored for academic integrity
                </p>
                <p className="text-blue-800">
                  Your teacher, <strong>{teacherName}</strong>, will receive a detailed report of your activity during this assessment.
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-medium text-foreground">The following activities are monitored and reported:</p>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Tab Switching</p>
                      <p className="text-sm text-muted-foreground">
                        Switching to other browser tabs or applications
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Fullscreen Exits</p>
                      <p className="text-sm text-muted-foreground">
                        Exiting fullscreen mode during the assessment
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Window Focus</p>
                      <p className="text-sm text-muted-foreground">
                        Time spent with the assessment window not in focus
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <p className="font-semibold text-yellow-900 mb-2">
                  📊 Monitoring Level: {strictness.charAt(0).toUpperCase() + strictness.slice(1)}
                </p>
                <p className="text-yellow-800 text-sm">
                  You will receive up to {maxViolations} warnings before potential consequences. 
                  Each violation is <strong>immediately reported to your teacher</strong> with a timestamp and details.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900 mb-1">To maintain a clean integrity report:</p>
                    <ul className="list-disc list-inside text-green-800 space-y-1">
                      <li>Stay in fullscreen mode for the entire assessment</li>
                      <li>Keep this browser window focused - don't switch tabs</li>
                      <li>Don't minimize or resize the browser window</li>
                      <li>Complete the assessment in one sitting</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground italic">
                By clicking "I Understand, Start Assessment", you acknowledge that your activity will be monitored 
                and reported to your teacher as part of this assessment's integrity verification process.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onDecline} className="sm:flex-1">
            Cancel - Return to Dashboard
          </AlertDialogCancel>
          <AlertDialogAction onClick={onAccept} className="sm:flex-1 bg-blue-600 hover:bg-blue-700">
            I Understand, Start Assessment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
