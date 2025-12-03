import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import pivotLogo from '@/assets/pivot-logo.svg';

interface TeacherPivotAssistantProps {
  lessonId: string;
  onComponentGenerated: (component: any) => void;
}

export const TeacherPivotAssistant: React.FC<TeacherPivotAssistantProps> = ({
  lessonId,
  onComponentGenerated
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pivot-teacher-generate', {
        body: {
          action: 'suggest',
          lessonId
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limits exceeded')) {
          toast.error('Rate limit exceeded', {
            description: 'Please try again in a few moments.'
          });
        } else if (data.error.includes('Payment required')) {
          toast.error('Credits required', {
            description: 'Please add credits to your Lovable AI workspace in Settings.'
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast.error('Failed to generate suggestions', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateComponent = async (ideaNumber: number) => {
    setSelectedIdea(ideaNumber);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('pivot-teacher-generate', {
        body: {
          action: 'generate',
          lessonId,
          ideaNumber,
          suggestions // Pass the suggestions so AI knows what each idea was
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limits exceeded')) {
          toast.error('Rate limit exceeded', {
            description: 'Please try again in a few moments.'
          });
        } else if (data.error.includes('Payment required')) {
          toast.error('Credits required', {
            description: 'Please add credits to your Lovable AI workspace in Settings.'
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      onComponentGenerated(data.component);
      
      toast.success('Component generated!', {
        description: 'The new component has been added to your lesson.'
      });
      
      // Reset state
      setIsExpanded(false);
      setSuggestions(null);
      setSelectedIdea(null);
    } catch (error) {
      console.error('Error generating component:', error);
      toast.error('Failed to generate component', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => {
          setIsExpanded(true);
          setSuggestions(null);
          handleGetSuggestions();
        }}
        className="fixed bottom-6 right-6 z-50 h-14 rounded-full shadow-lg"
        size="lg"
      >
        <img src={pivotLogo} alt="Pivot" className="w-6 h-6 mr-2" />
        <Sparkles className="w-5 h-5 mr-2" />
        Ask Pivot for Ideas
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-[500px] shadow-2xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-2">
          <img src={pivotLogo} alt="Pivot" className="w-8 h-8" />
          <div>
            <CardTitle>Pivot for Teachers</CardTitle>
            <CardDescription>AI-powered component suggestions</CardDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsExpanded(false);
            setSuggestions(null);
            setSelectedIdea(null);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && !suggestions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Analyzing your lesson...
            </span>
          </div>
        ) : suggestions ? (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm">{suggestions}</div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleGenerateComponent(1)}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading && selectedIdea === 1 ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Idea 1
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleGenerateComponent(2)}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading && selectedIdea === 2 ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Idea 2
                  </>
                )}
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                setSuggestions(null);
                handleGetSuggestions();
              }}
              disabled={isLoading}
              className="w-full"
            >
              Get Different Suggestions
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Click the button below to get AI-powered component suggestions
            </p>
            <Button
              onClick={handleGetSuggestions}
              className="mt-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
