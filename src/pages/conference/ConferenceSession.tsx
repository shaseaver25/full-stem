import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, MapPin, User, Languages } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SlidesViewer from '@/components/conference/SlidesViewer';
import PollSurvey from '@/components/conference/PollSurvey';
import { useLiveTranslation } from '@/hooks/useLiveTranslation';
import { sessionPresentations } from '@/data/sessionPresentations';

interface SessionData {
  title: string;
  time: string;
  room: string;
  speaker?: string;
  description?: string;
}

const SessionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get session data from navigation state
  const sessionData = location.state as SessionData | null;

  // Fallback data if no state is provided
  const session = sessionData || {
    title: 'Conference Session',
    time: 'TBD',
    room: 'TBD',
    speaker: '',
    description: 'Session details not available'
  };

  // Get presentation data if available
  const presentationData = sessionPresentations[session.title];

  // Translation and TTS
  const [targetLanguage, setTargetLanguage] = useState<string>('en');
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
  const { translateText, isTranslating } = useLiveTranslation();

  const handleTranslate = async () => {
    if (!session.description) return;
    const translated = await translateText({ text: session.description, targetLanguage });
    if (translated) {
      setTranslatedDescription(translated);
    }
  };

  return (
    <>
      <Helmet>
        <title>{session.title} - Applied AI Conference</title>
        <meta name="description" content={session.description || 'Conference session'} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/conference/demo')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sessions
              </Button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground">Applied AI Conference</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Session Header */}
          <Card className="mb-8 bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0">
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="text-xs font-medium flex items-center gap-1 bg-background/20">
                  <Clock className="h-3 w-3" />
                  {session.time}
                </Badge>
                <Badge variant="secondary" className="text-xs font-medium flex items-center gap-1 bg-background/20">
                  <MapPin className="h-3 w-3" />
                  {session.room}
                </Badge>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-[200px] bg-background/20 border-primary-foreground/20 text-primary-foreground">
                    <Languages className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>

                {targetLanguage !== 'en' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="bg-background/20 hover:bg-background/30"
                  >
                    {isTranslating ? 'Translating...' : 'Translate Description'}
                  </Button>
                )}
              </div>
              
              <CardTitle className="text-3xl mb-2">{session.title}</CardTitle>
              
              {session.speaker && (
                <CardDescription className="text-primary-foreground/80 flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  {session.speaker}
                </CardDescription>
              )}
              
              {session.description && (
                <CardDescription className="text-primary-foreground/70 mt-3">
                  {translatedDescription || session.description}
                </CardDescription>
              )}
            </CardHeader>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Slides (Takes 2/3 width on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              <SlidesViewer 
                sessionTitle={session.title} 
                targetLanguage={targetLanguage}
                embedUrl={presentationData?.embedUrl}
                speakerNotes={presentationData?.speakerNotes}
              />
            </div>

            {/* Right Column - Poll/Survey (Takes 1/3 width on large screens) */}
            <div className="lg:col-span-1 space-y-6">
              <PollSurvey targetLanguage={targetLanguage} />
              
              {/* Session Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Session Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span>Session is live</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span>Interactive polling enabled</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span>Anonymous participation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SessionPage;
