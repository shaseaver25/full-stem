import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDiscussionThreads } from '@/hooks/useDiscussionThreads';
import { ThreadReplies } from '@/components/discussion/ThreadReplies';

interface DiscussionComponentProps {
  componentId: string;
  lessonId: string;
  lessonTitle: string;
  lessonContent?: string;
  isTeacher?: boolean;
}

export function DiscussionComponent({ 
  componentId, 
  lessonId,
  lessonTitle, 
  lessonContent,
  isTeacher = false 
}: DiscussionComponentProps) {
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [discussionThread, setDiscussionThread] = useState<any>(null);
  const { toast } = useToast();
  const { threads, createThread, loading: threadsLoading } = useDiscussionThreads(undefined, lessonId);

  // Check if discussion thread already exists for this component
  useEffect(() => {
    const existingThread = threads.find(t => 
      t.lesson_id === lessonId && t.title?.includes(componentId)
    );
    if (existingThread) {
      setDiscussionThread(existingThread);
      if (existingThread.body) {
        setAiPrompt(existingThread.body);
      }
    }
  }, [threads, lessonId, componentId]);

  const generatePrompt = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-discussion-prompt', {
        body: {
          lessonTitle,
          lessonContent,
          componentId
        }
      });

      if (error) throw error;

      if (data?.prompt) {
        setAiPrompt(data.prompt);
        
        // Create discussion thread with AI prompt
        if (!discussionThread) {
          const thread = await createThread({
            title: `Discussion: ${lessonTitle}`,
            body: data.prompt,
            lesson_id: lessonId,
          });
          
          if (thread) {
            setDiscussionThread(thread);
          }
        }

        toast({
          title: "Discussion Prompt Generated",
          description: "Students can now respond to this prompt.",
        });
      }
    } catch (error) {
      console.error('Error generating discussion prompt:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate discussion prompt",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (threadsLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Discussion</CardTitle>
          </div>
          <Badge variant="outline">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!aiPrompt ? (
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Generate Discussion Prompt</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use AI to create an engaging discussion prompt based on the lesson content
              </p>
              <Button 
                onClick={generatePrompt} 
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Prompt
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Discussion Prompt */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Discussion Prompt</h4>
                  <p className="text-sm leading-relaxed">{aiPrompt}</p>
                </div>
              </div>
              {isTeacher && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generatePrompt}
                  disabled={isGenerating}
                  className="mt-4"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    'Regenerate Prompt'
                  )}
                </Button>
              )}
            </div>

            {/* Student Responses */}
            {discussionThread && (
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Student Responses & Discussion
                </h4>
                <ThreadReplies
                  threadId={discussionThread.id}
                  isLocked={false}
                  isTeacher={isTeacher}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
