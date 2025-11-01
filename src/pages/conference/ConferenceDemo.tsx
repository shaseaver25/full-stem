import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SessionCard from '@/components/conference/SessionCard';
import { WifiOff, Wifi } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  description: string;
  time: string;
  room: string;
  lessonId: string;
}

const ConferenceDemo: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Demo sessions - in production, these would come from a database
  const sessions: Session[] = [
    {
      id: 'session-1',
      title: 'Interactive Polls in Education',
      description: 'Learn how real-time polling transforms classroom engagement',
      time: '10:00 AM - 11:00 AM',
      room: 'Hall A',
      lessonId: 'cf34126a-045c-456f-9664-abd41c679f9a', // Use actual lesson ID
    },
    {
      id: 'session-2',
      title: 'AI-Powered Learning',
      description: 'Discover how AI personalizes student experiences',
      time: '11:30 AM - 12:30 PM',
      room: 'Hall B',
      lessonId: 'cf34126a-045c-456f-9664-abd41c679f9a',
    },
    {
      id: 'session-3',
      title: 'Student Engagement Strategies',
      description: 'Best practices for keeping students engaged',
      time: '2:00 PM - 3:00 PM',
      room: 'Hall C',
      lessonId: 'cf34126a-045c-456f-9664-abd41c679f9a',
    },
    {
      id: 'session-4',
      title: 'Future of EdTech',
      description: 'Emerging trends in educational technology',
      time: '3:30 PM - 4:30 PM',
      room: 'Hall D',
      lessonId: 'cf34126a-045c-456f-9664-abd41c679f9a',
    },
  ];

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
              <CardTitle className="text-3xl text-white">Welcome to Our Conference!</CardTitle>
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

          {/* Sessions Grid */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Today's Sessions</h2>
            <p className="text-gray-600">Scan QR code or tap "Join Session" to participate</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onJoin={handleJoinSession}
              />
            ))}
          </div>

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
