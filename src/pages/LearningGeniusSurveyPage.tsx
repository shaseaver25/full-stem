import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle, User } from 'lucide-react';
import { LearningGeniusSurvey } from '@/components/survey/LearningGeniusSurvey';
import { StudentProfileRenderer } from '@/components/profile/StudentProfileRenderer';
import { useSurveyData } from '@/hooks/useSurveyData';
import { useAuth } from '@/contexts/AuthContext';

const LearningGeniusSurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadExistingProfile } = useSurveyData();
  const [currentView, setCurrentView] = useState<'intro' | 'survey' | 'profile'>('intro');
  const [existingProfile, setExistingProfile] = useState(null);

  useEffect(() => {
    // Check if user has already completed the survey
    const checkExistingProfile = async () => {
      const profile = await loadExistingProfile();
      if (profile) {
        setExistingProfile(profile);
        setCurrentView('profile');
      }
    };
    
    checkExistingProfile();
  }, [loadExistingProfile]);

  const handleStartSurvey = () => {
    setCurrentView('survey');
  };

  const handleSurveyComplete = () => {
    setCurrentView('profile');
    // Reload the profile
    loadExistingProfile().then(profile => {
      if (profile) setExistingProfile(profile);
    });
  };

  const renderIntro = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Welcome to Learning Genius!</CardTitle>
        <p className="text-muted-foreground mt-2">
          Discover your unique learning style and unlock personalized education experiences
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Understand Your Learning Style</h4>
              <p className="text-sm text-muted-foreground">
                Discover whether you learn best through visual, auditory, reading/writing, or hands-on methods
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Identify Your Interests</h4>
              <p className="text-sm text-muted-foreground">
                Help teachers understand what motivates and excites you most
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Get Personalized Support</h4>
              <p className="text-sm text-muted-foreground">
                Receive customized learning accommodations and project suggestions
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">AI-Powered Recommendations</h4>
              <p className="text-sm text-muted-foreground">
                Get smart suggestions for projects, assignments, and learning approaches
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            📝 <strong>Takes about 5-7 minutes</strong> • 20 questions about your learning preferences and interests
          </p>
        </div>

        <Button onClick={handleStartSurvey} className="w-full" size="lg">
          <Sparkles className="h-4 w-4 mr-2" />
          Start Your Learning Journey
        </Button>
      </CardContent>
    </Card>
  );

  const renderProfile = () => {
    if (!existingProfile?.profile_json) return null;

    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500/10 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Your Learning Profile is Ready!</CardTitle>
            <p className="text-muted-foreground mt-2">
              Your teachers can now see your personalized learning preferences and provide better support
            </p>
          </CardHeader>
        </Card>

        <StudentProfileRenderer
          profileData={existingProfile.profile_json}
          studentName={user?.email || 'Student'}
        />

        <div className="text-center mt-8">
          <Button onClick={() => navigate('/dashboard/student')} variant="outline">
            <User className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4">
        {currentView === 'intro' && renderIntro()}
        {currentView === 'survey' && (
          <LearningGeniusSurvey onComplete={handleSurveyComplete} />
        )}
        {currentView === 'profile' && renderProfile()}
      </div>
    </div>
  );
};

export default LearningGeniusSurveyPage;