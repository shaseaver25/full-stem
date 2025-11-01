import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SpeechControls from '@/components/SpeechControls';
import { useElevenLabsTTSPublic } from '@/hooks/useElevenLabsTTSPublic';
import { useLiveTranslation } from '@/hooks/useLiveTranslation';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  question: string;
  options: PollOption[];
  type: 'multiple-choice' | 'open-ended';
}

interface PollSurveyProps {
  targetLanguage?: string;
}

const PollSurvey: React.FC<PollSurveyProps> = ({ targetLanguage = 'en' }) => {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [openResponse, setOpenResponse] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [translatedQuestion, setTranslatedQuestion] = useState<string | null>(null);
  const [translatedOptions, setTranslatedOptions] = useState<Record<string, string>>({});

  const { translateText, isTranslating } = useLiveTranslation();
  const { speak, pause, resume, stop, isPlaying, isPaused, isLoading, error, currentTime, duration } = useElevenLabsTTSPublic(targetLanguage);

  // Sample poll data
  const [poll] = useState<Poll>({
    question: "What aspect of this session did you find most valuable?",
    options: [
      { id: '1', text: 'Practical examples and case studies', votes: 45 },
      { id: '2', text: 'Technical implementation details', votes: 32 },
      { id: '3', text: 'Strategic insights and best practices', votes: 28 },
      { id: '4', text: 'Q&A and discussion', votes: 15 },
    ],
    type: 'multiple-choice'
  });

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  useEffect(() => {
    const translatePoll = async () => {
      if (targetLanguage !== 'en') {
        const translatedQ = await translateText({ text: poll.question, targetLanguage });
        setTranslatedQuestion(translatedQ);

        const translatedOpts: Record<string, string> = {};
        for (const option of poll.options) {
          const translated = await translateText({ text: option.text, targetLanguage });
          if (translated) {
            translatedOpts[option.id] = translated;
          }
        }
        setTranslatedOptions(translatedOpts);
      } else {
        setTranslatedQuestion(null);
        setTranslatedOptions({});
      }
    };
    translatePoll();
  }, [targetLanguage, poll]);

  const handleReadAloud = () => {
    const questionText = translatedQuestion || poll.question;
    const optionsText = poll.options
      .map((opt, idx) => `Option ${idx + 1}: ${translatedOptions[opt.id] || opt.text}`)
      .join('. ');
    speak(`${questionText}. ${optionsText}`);
  };

  const handleSubmitVote = () => {
    if (!selectedOption && !openResponse.trim()) {
      toast({
        title: "Please make a selection",
        description: "Choose an option or provide a response before submitting.",
        variant: "destructive"
      });
      return;
    }

    setHasVoted(true);
    setShowResults(true);
    
    toast({
      title: "Vote submitted!",
      description: "Thank you for your feedback.",
    });
  };

  const getPercentage = (votes: number): number => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Live Poll</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <SpeechControls
              isPlaying={isPlaying}
              isPaused={isPaused}
              isLoading={isLoading}
              error={error}
              currentTime={currentTime}
              duration={duration}
              onPlay={handleReadAloud}
              onPause={pause}
              onResume={resume}
              onStop={stop}
            />
            {!showResults && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResults(!showResults)}
              >
                View Results
              </Button>
            )}
          </div>
        </div>
        <CardDescription>Your responses are anonymous</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">
            {isTranslating ? 'Translating...' : (translatedQuestion || poll.question)}
          </h3>

          {!hasVoted && !showResults ? (
            // Voting Interface
            <div className="space-y-4">
              {poll.type === 'multiple-choice' ? (
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  <div className="space-y-3">
                    {poll.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label 
                          htmlFor={option.id}
                          className="font-normal cursor-pointer flex-1"
                        >
                          {translatedOptions[option.id] || option.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <Textarea
                  placeholder="Share your thoughts..."
                  value={openResponse}
                  onChange={(e) => setOpenResponse(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              )}

              <Button
                onClick={handleSubmitVote}
                className="w-full"
                disabled={!selectedOption && !openResponse.trim()}
              >
                Submit Vote
              </Button>
            </div>
          ) : (
            // Results Interface
            <div className="space-y-4">
              {hasVoted && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Your vote has been recorded</span>
                </div>
              )}

              <div className="space-y-3">
                {poll.options.map((option) => {
                  const percentage = getPercentage(option.votes);
                  const isSelected = option.id === selectedOption && hasVoted;
                  
                  return (
                      <div key={option.id} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className={`${isSelected ? 'font-semibold text-primary' : 'text-foreground'}`}>
                            {translatedOptions[option.id] || option.text}
                            {isSelected && ' ✓'}
                          </span>
                        <span className="text-muted-foreground font-medium">
                          {percentage}%
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-sm text-muted-foreground pt-2 border-t">
                Total votes: {totalVotes}
              </div>

              {!hasVoted && (
                <Button
                  variant="outline"
                  onClick={() => setShowResults(false)}
                  className="w-full"
                >
                  Back to Poll
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PollSurvey;
