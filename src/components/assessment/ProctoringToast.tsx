import { useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProctoringEventType } from '@/hooks/useProctoring';

interface ProctoringToastProps {
  show: boolean;
  eventType: ProctoringEventType | '';
  teacherName: string;
}

export const ProctoringToast = ({ show, eventType, teacherName }: ProctoringToastProps) => {
  const { toast } = useToast();
  const lastShownRef = useRef<number>(0);

  useEffect(() => {
    if (!show || !eventType) return;

    // Debounce to prevent multiple toasts
    const now = Date.now();
    if (now - lastShownRef.current < 1000) return;
    lastShownRef.current = now;

    const eventDescriptions: Record<string, string> = {
      tab_switch: 'tab switch',
      fullscreen_exit: 'fullscreen exit',
      blur: 'window blur'
    };

    const description = eventDescriptions[eventType];
    if (!description) return;

    toast({
      title: "📨 Activity Reported to Teacher",
      description: (
        <div className="flex items-start gap-2">
          <Send className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">
              {teacherName} has been notified of your {description}.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This event was logged at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      ),
      variant: "destructive",
      duration: 5000,
    });
  }, [show, eventType, teacherName, toast]);

  return null;
};
