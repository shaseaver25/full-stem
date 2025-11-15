import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Target, Lightbulb, AlertCircle } from 'lucide-react';
import InlineReadAloud from '@/components/InlineReadAloud';

interface AnalysisData {
  overall_mastery: 'novice' | 'developing' | 'proficient' | 'advanced';
  confidence_score: number;
  personalized_feedback: string;
  strengths: string[];
  areas_for_growth: string[];
  misconceptions?: string[];
  recommended_actions?: string[];
  rubric_scores?: Array<{
    criterion_name: string;
    score: number;
    max_score: number;
    feedback: string;
  }>;
}

interface SubmissionAnalysisFeedbackProps {
  analysis: AnalysisData;
}

const masteryColors = {
  novice: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  developing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  proficient: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  advanced: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export function SubmissionAnalysisFeedback({ analysis }: SubmissionAnalysisFeedbackProps) {
  return (
    <div className="space-y-6">
      {/* Header with mastery level */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Your Personalized Feedback</CardTitle>
            </div>
            <Badge className={masteryColors[analysis.overall_mastery]}>
              {analysis.overall_mastery}
            </Badge>
          </div>
          <CardDescription>
            AI Confidence: {(analysis.confidence_score * 100).toFixed(0)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InlineReadAloud 
            text={analysis.personalized_feedback}
            className="text-muted-foreground leading-relaxed"
            alwaysShow={true}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        {analysis.strengths && analysis.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">What You Did Well</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.strengths.map((strength, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <InlineReadAloud text={strength} className="text-sm" alwaysShow={true} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Areas for Growth */}
        {analysis.areas_for_growth && analysis.areas_for_growth.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Areas to Improve</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.areas_for_growth.map((area, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    <InlineReadAloud text={area} className="text-sm" alwaysShow={true} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Misconceptions */}
      {analysis.misconceptions && analysis.misconceptions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Common Misconceptions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.misconceptions.map((misconception, i) => (
                <li key={i} className="flex gap-1">
                  <span className="text-muted-foreground">•</span>
                  <InlineReadAloud text={misconception} className="text-sm text-muted-foreground" alwaysShow={true} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {analysis.recommended_actions && analysis.recommended_actions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommended_actions.map((action, i) => (
                <li key={i} className="flex gap-1">
                  <span className="text-sm">{i + 1}.</span>
                  <InlineReadAloud text={action} className="text-sm" alwaysShow={true} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Rubric Scores */}
      {analysis.rubric_scores && analysis.rubric_scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rubric Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.rubric_scores.map((criterion, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{criterion.criterion_name}</span>
                    <span className="text-sm font-semibold">
                      {criterion.score}/{criterion.max_score}
                    </span>
                  </div>
                  <InlineReadAloud text={criterion.feedback} className="text-sm text-muted-foreground" alwaysShow={true} />
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(criterion.score / criterion.max_score) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
