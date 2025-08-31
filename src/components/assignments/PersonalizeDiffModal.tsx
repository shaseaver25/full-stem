import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, RotateCcw, Edit } from 'lucide-react';

interface PersonalizeDiffModalProps {
  open: boolean;
  onClose: () => void;
  originalText: string;
  personalizedText: string;
  rationale: string;
  changedElements: string[];
  onAccept: () => void;
  onReset: () => void;
}

export const PersonalizeDiffModal: React.FC<PersonalizeDiffModalProps> = ({
  open,
  onClose,
  originalText,
  personalizedText,
  rationale,
  changedElements,
  onAccept,
  onReset,
}) => {
  // Simple diff highlighting - in production, you'd want a more sophisticated diff algorithm
  const renderDiff = (original: string, personalized: string) => {
    const originalWords = original.split(' ');
    const personalizedWords = personalized.split(' ');
    
    return (
      <div className="grid grid-cols-2 gap-4 h-64 overflow-y-auto">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground">Original</h4>
          <div className="p-3 bg-muted/50 rounded-md text-sm">
            {originalWords.map((word, index) => (
              <span key={index} className="mr-1">
                {word}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground">Personalized</h4>
          <div className="p-3 bg-primary/5 rounded-md text-sm">
            {personalizedWords.map((word, index) => {
              const isChanged = !originalWords.includes(word) || 
                               (originalWords[index] && originalWords[index] !== word);
              return (
                <span 
                  key={index} 
                  className={`mr-1 ${isChanged ? 'bg-primary/20 px-1 rounded' : ''}`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assignment Personalization Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Changed Elements */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Changes made to:</span>
            {changedElements.map((element) => (
              <Badge key={element} variant="secondary" className="text-xs">
                {element}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* Diff Preview */}
          {renderDiff(originalText, personalizedText)}

          <Separator />

          {/* Rationale */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Why these changes were made:</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              {rationale}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Original
            </Button>
            <Button variant="outline" disabled>
              <Edit className="w-4 h-4 mr-2" />
              Tweak (Coming Soon)
            </Button>
            <Button onClick={onAccept}>
              <Check className="w-4 h-4 mr-2" />
              Accept Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};