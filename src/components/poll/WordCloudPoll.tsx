import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WordCloudVisualization } from './WordCloudVisualization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WordCloudPollProps {
  pollId: string;
  question: string;
  maxLength?: number;
  isTeacher?: boolean;
  hasVoted?: boolean;
  userResponse?: string;
}

export const WordCloudPoll = ({
  pollId,
  question,
  maxLength = 50,
  isTeacher = false,
  hasVoted = false,
  userResponse = '',
}: WordCloudPollProps) => {
  const [response, setResponse] = useState(userResponse);
  const [submitted, setSubmitted] = useState(hasVoted);
  const [responses, setResponses] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch existing responses
    fetchResponses();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`poll-${pollId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poll_responses',
          filter: `poll_component_id=eq.${pollId}`,
        },
        (payload) => {
          if (payload.new.text_response) {
            setResponses(prev => [...prev, payload.new.text_response]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId]);

  const fetchResponses = async () => {
    const { data, error } = await supabase
      .from('poll_responses')
      .select('text_response')
      .eq('poll_component_id', pollId)
      .not('text_response', 'is', null);

    if (error) {
      console.error('Error fetching responses:', error);
      return;
    }

    setResponses(data.map(r => r.text_response).filter(Boolean) as string[]);
  };

  const handleSubmit = async () => {
    if (!response.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a response',
        variant: 'destructive',
      });
      return;
    }

    if (response.length > maxLength) {
      toast({
        title: 'Error',
        description: `Response must be ${maxLength} characters or less`,
        variant: 'destructive',
      });
      return;
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to vote',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('poll_responses').insert({
      poll_component_id: pollId,
      user_id: user.user.id,
      text_response: response.trim(),
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit response',
        variant: 'destructive',
      });
      return;
    }

    setSubmitted(true);
    toast({
      title: 'Success',
      description: 'Response submitted!',
    });
  };

  const handleExportPNG = async () => {
    // Export word cloud as PNG
    const element = document.querySelector('[data-wordcloud]');
    if (!element) return;

    try {
      // Simple implementation - could be enhanced with html2canvas
      toast({
        title: 'Info',
        description: 'Export feature coming soon',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export',
        variant: 'destructive',
      });
    }
  };

  const handleCopyWordList = () => {
    const wordList = responses.join('\n');
    navigator.clipboard.writeText(wordList);
    toast({
      title: 'Success',
      description: 'Word list copied to clipboard',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{question}</CardTitle>
      </CardHeader>
      <CardContent>
        {!isTeacher && !submitted && (
          <div className="space-y-4">
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type your response..."
              maxLength={maxLength}
              className="resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {response.length}/{maxLength}
              </span>
              <Button onClick={handleSubmit}>Submit Response</Button>
            </div>
          </div>
        )}

        {submitted && !isTeacher && (
          <div className="mb-6 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">Your response:</p>
            <p className="text-lg">{response}</p>
          </div>
        )}

        {(isTeacher || submitted) && (
          <div>
            {isTeacher && (
              <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={handleCopyWordList}>
                  Copy Word List
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPNG}>
                  Export as PNG
                </Button>
              </div>
            )}

            <div data-wordcloud>
              <WordCloudVisualization
                responses={responses}
                minResponses={isTeacher ? 1 : 5}
              />
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Responses ({responses.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {responses.slice(0, 20).map((resp, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 bg-secondary/50 rounded text-sm truncate"
                  >
                    {resp}
                  </div>
                ))}
              </div>
              {responses.length > 20 && (
                <p className="text-sm text-muted-foreground mt-2">
                  And {responses.length - 20} more...
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
