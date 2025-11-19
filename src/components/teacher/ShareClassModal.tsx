import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check } from 'lucide-react';
import { ClassCodeDisplay } from './ClassCodeDisplay';
import { ClassQRCode } from './ClassQRCode';
import { toast } from '@/hooks/use-toast';
import { getJoinClassUrl } from '@/utils/appUrl';

interface ShareClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  classCode: string;
  onCodeRegenerated?: (newCode: string) => void;
}

export const ShareClassModal = ({
  open,
  onOpenChange,
  classId,
  className,
  classCode,
  onCodeRegenerated,
}: ShareClassModalProps) => {
  const [copiedInstructions, setCopiedInstructions] = useState(false);

  const shareInstructions = `Join ${className} on TailorEDU:

1. Go to ${getJoinClassUrl()}
2. Enter code: ${classCode}

Or scan the QR code attached.`;


  const handleCopyInstructions = async () => {
    await navigator.clipboard.writeText(shareInstructions);
    setCopiedInstructions(true);
    toast({
      title: 'Copied!',
      description: 'Instructions copied to clipboard',
    });
    setTimeout(() => setCopiedInstructions(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Class: {className}</DialogTitle>
          <DialogDescription>
            Share this code or QR code with your students to let them join the class
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <ClassCodeDisplay
              classId={classId}
              classCode={classCode}
              onCodeRegenerated={onCodeRegenerated}
            />
            <ClassQRCode classCode={classCode} className={className} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Share Instructions</label>
            <p className="text-sm text-muted-foreground">
              Copy this message to share with your students:
            </p>
            <div className="relative">
              <Textarea
                value={shareInstructions}
                readOnly
                rows={6}
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={handleCopyInstructions}
              >
                {copiedInstructions ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
