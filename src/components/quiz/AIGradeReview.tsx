import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIGradeReviewProps {
  questionText: string;
  studentAnswer: string;
  acceptableAnswers: string[];
  aiGrade: boolean;
  currentGrade: boolean;
  questionPoints: number;
  onOverride: (newGrade: boolean, feedback?: string) => void;
}

export function AIGradeReview({
  questionText,
  studentAnswer,
  acceptableAnswers,
  aiGrade,
  currentGrade,
  questionPoints,
  onOverride
}: AIGradeReviewProps) {
  const { toast } = useToast();
  const [overrideGrade, setOverrideGrade] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showOverride, setShowOverride] = useState(false);

  useEffect(() => {
    setOverrideGrade(currentGrade);
  }, [currentGrade]);

  const handleSaveOverride = () => {
    if (overrideGrade !== null) {
      onOverride(overrideGrade, feedback || undefined);
      setShowOverride(false);
      toast({
        title: 'Grade Updated',
        description: `Grade has been ${overrideGrade ? 'marked correct' : 'marked incorrect'}`,
      });
    }
  };

  const hasBeenOverridden = aiGrade !== currentGrade;

  return (
    <Card className={`${hasBeenOverridden ? 'border-yellow-500' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">AI-Graded Question</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={aiGrade ? 'default' : 'destructive'}>
              AI: {aiGrade ? 'Correct' : 'Incorrect'}
            </Badge>
            {hasBeenOverridden && (
              <Badge variant="secondary">Overridden</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question */}
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">Question:</p>
          <p className="text-sm">{questionText}</p>
          <p className="text-xs text-muted-foreground mt-1">{questionPoints} points</p>
        </div>

        {/* Student Answer */}
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">Student's Answer:</p>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{studentAnswer}</p>
          </div>
        </div>

        {/* Acceptable Answers */}
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">Acceptable Answers:</p>
          <ul className="list-disc list-inside space-y-1">
            {acceptableAnswers.map((answer, idx) => (
              <li key={idx} className="text-sm">{answer}</li>
            ))}
          </ul>
        </div>

        {/* AI Grade Confidence */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            The AI graded this answer as <strong>{aiGrade ? 'correct' : 'incorrect'}</strong>. 
            Review the student's response and acceptable answers to confirm this is accurate.
          </AlertDescription>
        </Alert>

        {/* Override Controls */}
        {!showOverride && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              {currentGrade ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm font-semibold">
                Current Grade: {currentGrade ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOverride(true)}
            >
              Override Grade
            </Button>
          </div>
        )}

        {/* Override Form */}
        {showOverride && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex gap-2">
              <Button
                variant={overrideGrade === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOverrideGrade(true)}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Mark Correct
              </Button>
              <Button
                variant={overrideGrade === false ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOverrideGrade(false)}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Mark Incorrect
              </Button>
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Feedback (optional):</p>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide additional feedback for the student..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowOverride(false);
                  setOverrideGrade(currentGrade);
                  setFeedback('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveOverride}
                className="flex-1"
              >
                Save Override
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
