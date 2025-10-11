import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLiveTranslation } from "@/hooks/useLiveTranslation";
import { Loader2, MessageSquare } from "lucide-react";

interface ClassData {
  id: string;
  title: string;
  submissions: SubmissionData[];
}

interface SubmissionData {
  id: string;
  assignment_title: string;
  grade: number;
  feedback: string;
  ai_feedback: string;
  submitted_at: string;
}

interface ParentFeedbackSectionProps {
  classes: ClassData[];
  preferredLanguage: string;
}

const ParentFeedbackSection = ({ classes, preferredLanguage }: ParentFeedbackSectionProps) => {
  const { translateText, isTranslating } = useLiveTranslation();
  const [translatedFeedback, setTranslatedFeedback] = useState<Map<string, string>>(new Map());

  const allSubmissionsWithFeedback = classes
    .flatMap(c => c.submissions.map(s => ({ ...s, className: c.title })))
    .filter(s => s.feedback)
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  useEffect(() => {
    const translateFeedback = async () => {
      if (preferredLanguage === 'en') return;

      for (const submission of allSubmissionsWithFeedback) {
        if (!submission.feedback || translatedFeedback.has(submission.id)) continue;

        const translated = await translateText({
          text: submission.feedback,
          targetLanguage: preferredLanguage,
        });

        if (translated) {
          setTranslatedFeedback(prev => new Map(prev.set(submission.id, translated)));
        }
      }
    };

    translateFeedback();
  }, [allSubmissionsWithFeedback.length, preferredLanguage]);

  const getGradeBadge = (grade: number) => {
    if (grade >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (grade >= 80) return <Badge className="bg-blue-500">Good</Badge>;
    if (grade >= 70) return <Badge className="bg-yellow-500">Satisfactory</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  if (allSubmissionsWithFeedback.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teacher Feedback</CardTitle>
          <CardDescription>No feedback available yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isTranslating && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Translating feedback to your preferred language...</AlertDescription>
        </Alert>
      )}

      {allSubmissionsWithFeedback.map((submission) => {
        const displayFeedback = preferredLanguage !== 'en' && translatedFeedback.has(submission.id)
          ? translatedFeedback.get(submission.id)
          : submission.feedback;

        return (
          <Card key={submission.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{submission.assignment_title}</CardTitle>
                  <CardDescription>
                    {submission.className} • {new Date(submission.submitted_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                {getGradeBadge(submission.grade)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <p className="font-semibold">Teacher Feedback</p>
                </div>
                <p className="text-sm whitespace-pre-wrap">{displayFeedback || 'No feedback provided yet'}</p>
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm">
                  <strong>Grade:</strong> {submission.grade}%
                </p>
              </div>

              {preferredLanguage !== 'en' && translatedFeedback.has(submission.id) && (
                <p className="text-xs text-muted-foreground">
                  Translated from English
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ParentFeedbackSection;
