import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SessionCard from '@/components/conference/SessionCard';
import { WifiOff, Wifi } from 'lucide-react';
import { useConferenceMode } from '@/hooks/useConferenceMode';
import { supabase } from '@/integrations/supabase/client';

interface Session {
  id: string;
  title: string;
  description: string;
  speakers: Array<{
    name: string;
    bio: string;
    headshotUrl: string;
    linkedInUrl: string;
  }>;
  badges: string[];
  isKeynote: boolean;
  lessonId: string;
}

const ConferenceDemo: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // SCALABILITY: Skip expensive auth/settings checks for conference mode
  useConferenceMode();

  // Fetch conference classes (session time blocks)
  const { data: conferenceClasses = [], isLoading } = useQuery({
    queryKey: ['conference-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          description,
          lessons (
            id,
            title,
            description,
            order_index
          )
        `)
        .ilike('name', '%Applied AI Conference%')
        .eq('published', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Group lessons into sessions by class
  const sessionBlocks = conferenceClasses.map(classBlock => ({
    id: classBlock.id,
    name: classBlock.name.replace('Applied AI Conference - ', ''),
    description: classBlock.description,
    sessions: (classBlock.lessons || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || '',
        speakers: [],
        badges: classBlock.name.includes('Keynote') ? ['Keynote Speaker'] : [],
        isKeynote: classBlock.name.includes('Keynote'),
        lessonId: lesson.id
      }))
  })).filter(block => block.sessions.length > 0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleJoinSession = (sessionId: string, lessonId: string) => {
    navigate(`/conference/session/${sessionId}?lesson=${lessonId}`);
  };

  return (
    <>
      <Helmet>
        <title>Conference Demo - TailorEDU</title>
        <meta name="description" content="Join interactive conference sessions with real-time polling" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TailorEDU Conference</h1>
                <p className="text-sm text-gray-600">Interactive Learning Sessions</p>
              </div>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Welcome Card */}
          <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Welcome to Applied AI Conference!</CardTitle>
              <CardDescription className="text-blue-100">
                Join any session below to participate in live polls and interactive content. No signup required!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Live Polling</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Anonymous Participation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Real-time Results</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading conference sessions...</p>
            </div>
          ) : sessionBlocks.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No conference sessions available at this time.</p>
              </CardContent>
            </Card>
          ) : (
            sessionBlocks.map((block) => (
              <div key={block.id} className="mb-12">
                {/* Block Header */}
                <div className="mb-6 border-l-4 border-blue-600 pl-4">
                  <h2 className="text-2xl font-bold text-gray-900">{block.name}</h2>
                  {block.description && (
                    <p className="text-gray-600 mt-1">{block.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {block.sessions.length} session{block.sessions.length !== 1 ? 's' : ''} in this block
                  </p>
                </div>

                {/* Sessions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {block.sessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onJoin={handleJoinSession}
                    />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Instructions Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">How to Join</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">1</span>
                  <span>Choose a session above and click "Join Session" or scan the QR code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">2</span>
                  <span>View the slides and participate in live polls</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">3</span>
                  <span>See results update in real-time as others vote</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">4</span>
                  <span>No account needed - participate anonymously!</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16 py-6">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            <p>Powered by TailorEDU • Interactive Learning Platform</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ConferenceDemo;
