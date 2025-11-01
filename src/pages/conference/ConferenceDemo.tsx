import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SessionCard from '@/components/conference/SessionCard';
import { WifiOff, Wifi } from 'lucide-react';
import { useConferenceMode } from '@/hooks/useConferenceMode';
import { parseConferenceSessions } from '@/utils/csvParser';


const ConferenceDemo: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // SCALABILITY: Skip expensive auth/settings checks for conference mode
  useConferenceMode();

  // Load and parse the CSV data from file
  const { data: sessionBlocks = [], isLoading } = useQuery({
    queryKey: ['conference-sessions-csv'],
    queryFn: async () => {
      const response = await fetch('/conference-schedule.csv');
      const csvContent = await response.text();
      const blocks = parseConferenceSessions(csvContent);
      console.log('Parsed session blocks:', blocks);
      console.log('Total blocks:', blocks.length);
      console.log('Total sessions:', blocks.reduce((sum, b) => sum + b.sessions.length, 0));
      return blocks;
    },
    staleTime: Infinity, // CSV data is static
  });

  // Debug log
  console.log('sessionBlocks in render:', sessionBlocks);

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

  const handleJoinSession = () => {
    // For demo purposes, navigate to a placeholder
    navigate('/conference/demo');
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
        <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Applied AI Conference</h1>
                <p className="text-sm text-muted-foreground">Interactive Learning Sessions</p>
              </div>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Wifi className="h-3 w-3 mr-1" aria-hidden="true" />
                    Online
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <WifiOff className="h-3 w-3 mr-1" aria-hidden="true" />
                    Offline
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-7xl" role="main">
          {/* Welcome Card */}
          <Card className="mb-8 bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0">
            <CardHeader>
              <CardTitle className="text-3xl">Welcome to Applied AI Conference!</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Browse sessions below organized by time block. Each session features interactive content and expert presenters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></span>
                  <span>6 Time Blocks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full" aria-hidden="true"></span>
                  <span>41 Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full" aria-hidden="true"></span>
                  <span>Multiple Tracks</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-12" role="status" aria-live="polite">
              <p className="text-muted-foreground">Loading conference sessions...</p>
            </div>
          ) : sessionBlocks.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No sessions scheduled.</p>
              </CardContent>
            </Card>
          ) : (
            sessionBlocks.map((block, blockIndex) => (
              <section key={`${block.timeSlot}-${blockIndex}`} className="mb-12">
                {/* Block Header - Sticky */}
                <div 
                  className="sticky top-20 bg-background/95 backdrop-blur-sm py-4 mb-6 border-l-4 border-primary pl-4 z-10"
                  role="heading"
                  aria-level={2}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-foreground">
                      Session Block {blockIndex + 1}
                    </h2>
                    <Badge variant="secondary" className="text-base font-normal">
                      {block.timeSlot}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {block.sessions.length} session{block.sessions.length !== 1 ? 's' : ''} available
                  </p>
                </div>

                {/* Sessions Grid - Responsive */}
                {block.sessions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {block.sessions.map((session, sessionIndex) => (
                      <SessionCard
                        key={`${session.room}-${sessionIndex}`}
                        title={session.title}
                        room={session.room}
                        time={session.time}
                        presenter={session.speaker}
                        description={session.description}
                        onJoin={handleJoinSession}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-2">
                    <CardContent className="pt-6 text-center py-12">
                      <p className="text-muted-foreground text-sm">
                        No sessions scheduled for this time.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </section>
            ))
          )}

          {/* Instructions Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Conference Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground" role="list">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold" aria-hidden="true">1</span>
                  <span>Browse sessions organized by time blocks above</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold" aria-hidden="true">2</span>
                  <span>Each card shows the session title, room location, and time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold" aria-hidden="true">3</span>
                  <span>Click "Join Session" to access interactive content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold" aria-hidden="true">4</span>
                  <span>Use QR codes for quick mobile access</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="bg-background/80 backdrop-blur-sm border-t mt-16 py-6" role="contentinfo">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>Powered by TailorEDU • Interactive Learning Platform</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ConferenceDemo;
