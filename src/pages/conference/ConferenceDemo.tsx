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

// CSV data embedded directly
const CSV_DATA = `Time,Title,Room
4:15–5:00pm,AI Is Taking My Job! A Spirited Debate on the Future of Work,Breakout 5 – Scooters
9:45–10:30am,Beyond the Black Box: A Practitioner's Framework for Systematic Bias Assessment in AI Models,Breakout 1 – Woulfe North
9:45–10:30am,Lean meets AI - The Future of Flow: Humans + LLMs by Design,Breakout 2 – Woulfe South
9:45–10:30am,Embracing AI in the Classroom (and Industry),Breakout 5 – Scooters
9:45–10:30am,Why Creatives Will Be The Next Tech Giants,Breakout 3 – Lyden
9:45–10:30am,AI in Gastroenterology: Revolutionizing Care and Documentation,Breakout 6 – Dance (LL07)
9:45–10:30am,Building Production‑Grade AI Agents,Breakout 4 – Dining
10:45–11:30am,AI-Assisted Tools: 4-Part Prompt Pattern & Build Heuristic,Breakout 5 – Scooters
10:45–11:30am,The Road to AI Autonomy: Swifty's Journey from Assistant to Agent,Breakout 1 – Woulfe North
10:45–11:30am,Accessibility + AI: Why Keeping Humans in the Loop Matters,Breakout 2 – Woulfe South
10:45–11:30am,How AI Keeps the Students Up at Night,Breakout 5 – Scooters
10:45–11:30am,"Rebrand, Reskill, Rise: How GenAI Is Rewiring the Future of Work",Breakout 3 – Lyden
10:45–11:30am,Agentic AI Versioning: Architecting at Scale,Breakout 6 – Dance (LL07)
10:45–11:30am,Integration of Earth Observation data into machine learning models for On-farm Decisions,Breakout 4 – Dining
11:45am–12:30pm,AI in the Byline: Redefining Who Gets to Tell the Story,Breakout 1 – Woulfe North
11:45am–12:30pm,The Silent Leak Costing PI Firms Millions: How AI Patches Revenue Holes You Don't See,Breakout 2 – Woulfe South
11:45am–12:30pm,AI at the Manufacturing Test Bench,Breakout 5 – Scooters
11:45am–12:30pm,AI Solution Delivery & Development,Breakout 3 – Lyden
11:45am–12:30pm,AI & the changing role of Supply Chain Plannerss,Breakout 6 – Dance (LL07)
11:45am–12:30pm,Peering into the multiverse: Agent-based simulation,Breakout 4 – Dining
1:15–2:00pm,A Pragmatic Guide to AI at Scale: Lessons from applying AI to enterprise systems,Breakout 1 – Woulfe North
1:15–2:00pm,"Trust, But Verify: Evaluating the Evaluators of LLMs",Breakout 2 – Woulfe South
1:15–2:00pm,"Beyond the Algorithm: Why 85% of AI Projects Fail and How to Beat the Odds",Breakout 5 – Scooters
1:15–2:00pm,Regulating AI in International Legal Frameworks: Challenges and Opportunities for Digital Sovereignty,Breakout 3 – Lyden
1:15–2:00pm,AI for Impact: Fixing the Web's 96% Accessibility Gap,Breakout 6 – Dance (LL07)
1:15–2:00pm,Invisible AI: Boosting Office Productivity & Driving Public AI Literacy,Breakout 4 – Dining
2:15–3:00pm,Building optimizations for latency sensitive agents,Breakout 1 – Woulfe North
2:15–3:00pm,STOP USING AI & Start using AIE (an integrated environment),Breakout 2 – Woulfe South
2:15–3:00pm,From Text to Structure: Unlocking AI's Hidden Superpower,Breakout 5 – Scooters
2:15–3:00pm,"Strategic AI Leadership: Building Student, Teacher, and Administrator Competencies",Breakout 3 – Lyden
2:15–3:00pm,Trace AI Infra - AI Infrastructure Monitoring Tool,Breakout 6 – Dance (LL07)
2:15–3:00pm,LLMs as the Missing Link: From Paper Forms to Automated Flows,Breakout 4 – Dining
3:15–4:00pm,Case Study: Building a SaaS product in 48 hours by leveraging Github Copilot.,Breakout 1 – Woulfe North
3:15–4:00pm,"Click, Snap, Sell: How AI is Replacing Product Data Entry",Breakout 2 – Woulfe South
3:15–4:00pm,Mini Workshop - Vibe Coding: Ship the Feel Before the Feature,Breakout 3 – Lyden
3:15–4:00pm,Moving from AI Experimentation to Enterprise AI Solutions,Breakout 6 – Dance (LL07)
3:15–4:00pm,Larry's Engineering Odyssey,Breakout 4 – Dining
4:15–5:00pm,The Easiest Way to Run LLMs Locally: Meet Docker Model Runner,Breakout 1 – Woulfe North
4:15–5:00pm,Talk Nerdy To Me: Generative AI You'll Actually Use,Breakout 2 – Woulfe South
4:15–5:00pm,Empowering Educators with AI,Breakout 3 – Lyden
4:15–5:00pm,TurboAQ,Breakout 4 – Dining`;

const ConferenceDemo: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // SCALABILITY: Skip expensive auth/settings checks for conference mode
  useConferenceMode();

  // Parse CSV data for sessions
  const { data: sessionBlocks = [], isLoading } = useQuery({
    queryKey: ['conference-sessions-csv'],
    queryFn: async () => {
      // Simulate async parsing
      await new Promise(resolve => setTimeout(resolve, 100));
      const blocks = parseConferenceSessions(CSV_DATA);
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
