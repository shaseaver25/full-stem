import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, ChevronRight, User } from 'lucide-react';
import QRCodeLib from 'qrcode';

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

interface SessionCardProps {
  session: Session;
  onJoin: (sessionId: string, lessonId: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onJoin }) => {
  const [showQR, setShowQR] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (showQR && canvasRef.current) {
      const url = `${window.location.origin}/conference/session/${session.id}?lesson=${session.lessonId}`;
      QRCodeLib.toCanvas(
        canvasRef.current,
        url,
        {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR Code generation error:', error);
        }
      );
    }
  }, [showQR, session]);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 bg-white">
      <CardHeader>
        <div className="flex items-start gap-3 mb-3">
          {session.speakers.length === 1 ? (
            <>
              {session.speakers[0].headshotUrl ? (
                <img 
                  src={session.speakers[0].headshotUrl} 
                  alt={session.speakers[0].name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </>
          ) : (
            <div className="flex -space-x-2">
              {session.speakers.slice(0, 3).map((speaker, idx) => (
                speaker.headshotUrl ? (
                  <img 
                    key={idx}
                    src={speaker.headshotUrl} 
                    alt={speaker.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div key={idx} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                )
              ))}
              {session.speakers.length > 3 && (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white text-xs font-medium text-gray-600">
                  +{session.speakers.length - 3}
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm text-gray-900">
                {session.speakers.length === 1 
                  ? session.speakers[0].name 
                  : `${session.speakers[0].name} & ${session.speakers.length - 1} other${session.speakers.length > 2 ? 's' : ''}`
                }
              </h4>
              {session.isKeynote && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                  Keynote
                </Badge>
              )}
            </div>
            {session.badges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {session.badges.map((badge, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <CardTitle className="text-lg mb-2 line-clamp-2">{session.title}</CardTitle>
        <CardDescription className="text-gray-600 line-clamp-3">
          {session.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* QR Code Section */}
        {showQR ? (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-3">Scan to join on your phone</p>
            <canvas
              ref={canvasRef}
              className="mx-auto border-4 border-white rounded-lg shadow-sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQR(false)}
              className="mt-3"
            >
              Hide QR Code
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => onJoin(session.id, session.lessonId)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              Join Session
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowQR(true)}
              className="border-gray-300"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Interactive Polls
          </span>
          <span>•</span>
          <span>Anonymous</span>
          <span>•</span>
          <span>Real-time</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCard;
