import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface EnhancedLessonControlsProps {
  showPersonalizedView: boolean;
  onToggleLessonView: () => void;
  fullLessonText: string;
  lessonId: string;
}

const EnhancedLessonControls: React.FC<EnhancedLessonControlsProps> = ({
  showPersonalizedView,
  onToggleLessonView,
  fullLessonText,
  lessonId,
}) => {
  const [showEnhancedReadAloud, setShowEnhancedReadAloud] = useState(false); // Removed - now using InlineReadAloud with ElevenLabs

  return (
    <div className="space-y-6">
      {/* Lesson View Toggle */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={onToggleLessonView}
              variant={showPersonalizedView ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              {showPersonalizedView ? (
                <>
                  <Eye className="h-4 w-4" />
                  Personalized View
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  Standard View
                </>
              )}
            </Button>
            
            {showPersonalizedView && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Adaptive
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {showPersonalizedView 
              ? "Content adapted to your learning level" 
              : "Default lesson content"
            }
          </div>
        </div>
      </Card>

      {/* Enhanced Read Aloud Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Enhanced Read Aloud</h3>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Voice
            </Badge>
          </div>
          
          <Switch
            checked={false}
            disabled={true}
            aria-label="Enhanced read aloud (now global)"
          />
        </div>

        <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
          Enhanced Read Aloud is now integrated directly into lesson content sections with natural AI voices.
        </div>
      </Card>
    </div>
  );
};

export default EnhancedLessonControls;