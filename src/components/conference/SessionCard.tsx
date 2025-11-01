import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, QrCode, ChevronRight } from 'lucide-react';
import QRCodeLib from 'qrcode';

interface Session {
  id: string;
  title: string;
  description: string;
  time: string;
  room: string;
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
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{session.title}</CardTitle>
            <CardDescription className="text-gray-600">
              {session.description}
            </CardDescription>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Live</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{session.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{session.room}</span>
          </div>
        </div>

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
