
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Target,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface LearningPattern {
  userId: string;
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  optimalSessionDuration: number;
  bestPerformanceTime: string;
  difficultyPreference: 'easy' | 'medium' | 'hard';
  completionRate: number;
  averageScore: number;
  strugglingAreas: string[];
  strongAreas: string[];
}

interface AdaptiveRecommendation {
  type: 'content' | 'pace' | 'method' | 'timing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  confidence: number;
}

const AdaptiveLearningEngine: React.FC<{ userId: string; classId?: string }> = ({ 
  userId, 
  classId 
}) => {
  const { user } = useAuth();
  const [learningPattern, setLearningPattern] = useState<LearningPattern | null>(null);
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    analyzeLearningPatterns();
  }, [userId]);

  const analyzeLearningPatterns = async () => {
    try {
      setLoading(true);
      
      // Fetch user progress data
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      // Fetch grades data
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', userId);

      if (gradesError) throw gradesError;

      // Fetch user preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('User Preferences')
        .select('*')
        .eq('User Email', user?.email);

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw preferencesError;
      }

      // Analyze patterns
      const patterns = analyzeUserData(progressData || [], gradesData || [], preferencesData?.[0]);
      setLearningPattern(patterns);

      // Generate recommendations
      const recs = generateRecommendations(patterns);
      setRecommendations(recs);

    } catch (error) {
      console.error('Error analyzing learning patterns:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze learning patterns.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeUserData = (
    progressData: any[], 
    gradesData: any[], 
    preferences: any
  ): LearningPattern => {
    // Calculate completion rate
    const completedLessons = progressData.filter(p => p.status === 'completed').length;
    const totalLessons = progressData.length;
    const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Calculate average score
    const averageScore = gradesData.length > 0 ? 
      gradesData.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / gradesData.length : 0;

    // Analyze learning patterns
    const sessionDurations = progressData.map(p => p.time_spent || 0);
    const optimalSessionDuration = sessionDurations.length > 0 ? 
      Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length / 60) : 30;

    // Determine learning style based on preferences and performance
    let preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' = 'visual';
    if (preferences?.['Enable Read-Aloud']) {
      preferredLearningStyle = 'auditory';
    } else if (preferences?.['Enable Translation View']) {
      preferredLearningStyle = 'reading';
    }

    // Identify struggling and strong areas
    const lessonPerformance = progressData.map(p => ({
      lessonId: p.lesson_id,
      progress: p.progress_percentage,
      timeSpent: p.time_spent
    }));

    const strugglingAreas = lessonPerformance
      .filter(p => p.progress < 70)
      .map(p => `Lesson ${p.lessonId}`)
      .slice(0, 3);

    const strongAreas = lessonPerformance
      .filter(p => p.progress >= 90)
      .map(p => `Lesson ${p.lessonId}`)
      .slice(0, 3);

    return {
      userId,
      preferredLearningStyle,
      optimalSessionDuration,
      bestPerformanceTime: '10:00 AM', // Could be calculated from activity patterns
      difficultyPreference: averageScore >= 80 ? 'hard' : averageScore >= 60 ? 'medium' : 'easy',
      completionRate,
      averageScore,
      strugglingAreas,
      strongAreas
    };
  };

  const generateRecommendations = (pattern: LearningPattern): AdaptiveRecommendation[] => {
    const recommendations: AdaptiveRecommendation[] = [];

    // Completion rate recommendations
    if (pattern.completionRate < 70) {
      recommendations.push({
        type: 'pace',
        priority: 'high',
        title: 'Adjust Learning Pace',
        description: 'Your completion rate is below optimal. Consider breaking lessons into smaller chunks.',
        action: 'Reduce session length to 15-20 minutes',
        confidence: 85
      });
    }

    // Performance-based recommendations
    if (pattern.averageScore < 70) {
      recommendations.push({
        type: 'content',
        priority: 'high',
        title: 'Focus on Fundamentals',
        description: 'Consider reviewing basic concepts before advancing to new material.',
        action: 'Review prerequisite lessons',
        confidence: 90
      });
    }

    // Learning style recommendations
    if (pattern.preferredLearningStyle === 'auditory') {
      recommendations.push({
        type: 'method',
        priority: 'medium',
        title: 'Audio Learning Enhancement',
        description: 'Enable read-aloud features and consider audio-based practice exercises.',
        action: 'Enable audio features in preferences',
        confidence: 75
      });
    }

    // Session timing recommendations
    if (pattern.optimalSessionDuration > 45) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        title: 'Optimize Session Length',
        description: 'Shorter, focused sessions may improve retention and reduce fatigue.',
        action: 'Limit sessions to 30-45 minutes',
        confidence: 70
      });
    }

    // Struggling areas recommendations
    if (pattern.strugglingAreas.length > 0) {
      recommendations.push({
        type: 'content',
        priority: 'high',
        title: 'Address Challenging Topics',
        description: `Focus additional practice on: ${pattern.strugglingAreas.join(', ')}`,
        action: 'Schedule extra practice sessions',
        confidence: 80
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const applyRecommendation = async (recommendation: AdaptiveRecommendation) => {
    setAnalyzing(true);
    
    try {
      // Simulate applying recommendation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Recommendation Applied",
        description: `Applied: ${recommendation.title}`,
      });

      // Re-analyze patterns after applying recommendation
      analyzeLearningPatterns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply recommendation.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Learning Pattern Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Adaptive Learning Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {learningPattern && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(learningPattern.completionRate)}%
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(learningPattern.averageScore)}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {learningPattern.optimalSessionDuration}min
                </div>
                <div className="text-sm text-gray-600">Optimal Session</div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="text-sm">
                  {learningPattern.preferredLearningStyle}
                </Badge>
                <div className="text-sm text-gray-600 mt-1">Learning Style</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}>
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {rec.confidence}% confidence
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg">{rec.title}</h3>
                    <p className="text-gray-600 mt-1">{rec.description}</p>
                    <p className="text-sm text-blue-600 mt-2 font-medium">{rec.action}</p>
                  </div>
                  <Button
                    onClick={() => applyRecommendation(rec)}
                    disabled={analyzing}
                    className="ml-4"
                  >
                    {analyzing ? 'Applying...' : 'Apply'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {learningPattern && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Strong Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {learningPattern.strongAreas.length > 0 ? (
                  learningPattern.strongAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{area}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">Keep learning to identify your strengths!</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {learningPattern.strugglingAreas.length > 0 ? (
                  learningPattern.strugglingAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">{area}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">Great job! No areas need extra attention.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdaptiveLearningEngine;
