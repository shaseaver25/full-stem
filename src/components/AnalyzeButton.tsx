import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AnalyzeButtonProps {
  submissionId: string;
  rubricId?: string;
}

export function AnalyzeButton({ submissionId, rubricId }: AnalyzeButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-submission', {
        body: {
          submissionId,
          rubricId: rubricId || null,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze submission');
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
      
      toast({
        title: 'Analysis Complete',
        description: 'Submission has been analyzed successfully.',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="w-full sm:w-auto"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Analyze Submission
          </>
        )}
      </Button>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Overall Mastery: <span className="font-semibold capitalize">{analysis.overall_mastery}</span>
              {' '} | Confidence: {(analysis.confidence_score * 100).toFixed(0)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.personalized_feedback && (
              <div>
                <h4 className="font-semibold mb-2">Feedback</h4>
                <p className="text-sm text-muted-foreground">{analysis.personalized_feedback}</p>
              </div>
            )}

            {analysis.strengths && analysis.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Strengths</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.strengths.map((strength: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.areas_for_growth && analysis.areas_for_growth.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Areas for Growth</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.areas_for_growth.map((area: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">{area}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.misconceptions && analysis.misconceptions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Misconceptions</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.misconceptions.map((misconception: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">{misconception}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.recommended_action && (
              <div>
                <h4 className="font-semibold mb-2">Recommended Actions</h4>
                <p className="text-sm text-muted-foreground">{analysis.recommended_action}</p>
              </div>
            )}

            {analysis.rubric_scores && Object.keys(analysis.rubric_scores).length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Rubric Scores</h4>
                <div className="space-y-2">
                  {Object.entries(analysis.rubric_scores).map(([criterionId, score]: [string, any]) => (
                    <div key={criterionId} className="flex justify-between items-start">
                      <span className="text-sm font-medium">Criterion {criterionId.slice(0, 8)}</span>
                      <span className="text-sm">
                        {score.score}/{score.maxScore}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
