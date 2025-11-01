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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [openResponse, setOpenResponse] = useState<string>('');
  const [votedQuestions, setVotedQuestions] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [translatedQuestion, setTranslatedQuestion] = useState<string | null>(null);
  const [translatedOptions, setTranslatedOptions] = useState<Record<string, string>>({});

  const { translateText, isTranslating } = useLiveTranslation();
  const { speak, pause, resume, stop, isPlaying, isPaused, isLoading, error, currentTime, duration } = useElevenLabsTTSPublic(targetLanguage);

  // Multiple poll questions
  const [polls] = useState<Poll[]>([
    {
      question: "What aspect of this session did you find most valuable?",
      options: [
        { id: '1', text: 'Practical examples and case studies', votes: 45 },
        { id: '2', text: 'Technical implementation details', votes: 32 },
        { id: '3', text: 'Strategic insights and best practices', votes: 28 },
        { id: '4', text: 'Q&A and discussion', votes: 15 },
      ],
      type: 'multiple-choice'
    },
    {
      question: "How likely are you to apply AI techniques in your work?",
      options: [
        { id: '1', text: 'Very likely - already planning', votes: 52 },
        { id: '2', text: 'Somewhat likely - exploring options', votes: 38 },
        { id: '3', text: 'Neutral - still learning', votes: 18 },
        { id: '4', text: 'Unlikely - not applicable', votes: 12 },
      ],
      type: 'multiple-choice'
    },
    {
      question: "What additional topics would you like to see covered?",
      options: [
        { id: '1', text: 'Advanced AI model training', votes: 34 },
        { id: '2', text: 'Real-world deployment strategies', votes: 41 },
        { id: '3', text: 'Ethics and responsible AI', votes: 29 },
        { id: '4', text: 'Cost optimization and scaling', votes: 26 },
      ],
      type: 'multiple-choice'
    }
  ]);

  const currentPoll = polls[currentQuestionIndex];
  const totalVotes = currentPoll.options.reduce((sum, option) => sum + option.votes, 0);
  const hasVoted = votedQuestions.has(currentQuestionIndex);

  useEffect(() => {
    const translatePoll = async () => {
      if (targetLanguage !== 'en') {
        const translatedQ = await translateText({ text: currentPoll.question, targetLanguage });
        setTranslatedQuestion(translatedQ);

        const translatedOpts: Record<string, string> = {};
        for (const option of currentPoll.options) {
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
  }, [targetLanguage, currentPoll, currentQuestionIndex]);

  // Reset selection when question changes
  useEffect(() => {
    setSelectedOption('');
    setOpenResponse('');
    setShowResults(false);
  }, [currentQuestionIndex]);

  const handleReadAloud = () => {
    const questionText = translatedQuestion || currentPoll.question;
    const optionsText = currentPoll.options
      .map((opt, idx) => `Option ${idx + 1}: ${translatedOptions[opt.id] || opt.text}`)
      .join('. ');
    speak(`${questionText}. ${optionsText}`);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < polls.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
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

    setVotedQuestions(prev => new Set(prev).add(currentQuestionIndex));
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
            <CardTitle className="text-lg">Live Poll - Question {currentQuestionIndex + 1} of {polls.length}</CardTitle>
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
            {isTranslating ? 'Translating...' : (translatedQuestion || currentPoll.question)}
          </h3>

          {!hasVoted && !showResults ? (
            // Voting Interface
            <div className="space-y-4">
              {currentPoll.type === 'multiple-choice' ? (
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  <div className="space-y-3">
                    {currentPoll.options.map((option) => (
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
                {currentPoll.options.map((option) => {
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

          {/* Navigation Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1"
            >
              ← Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === polls.length - 1}
              className="flex-1"
            >
              Next →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollSurvey;
