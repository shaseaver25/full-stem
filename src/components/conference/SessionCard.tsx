import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, ChevronRight } from 'lucide-react';
import QRCodeLib from 'qrcode';

interface SessionCardProps {
  title: string;
  room: string;
  time: string;
  onJoin: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ title, room, time, onJoin }) => {
  const [showQR, setShowQR] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (showQR && canvasRef.current) {
      const sessionUrl = `${window.location.origin}/conference/demo`;
      QRCodeLib.toCanvas(
        canvasRef.current,
        sessionUrl,
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
  }, [showQR]);

  return (
    <Card 
      className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-card"
      role="article"
      aria-label={`Session: ${title}`}
    >
      <CardHeader>
        <div className="mb-3 space-y-2">
          <Badge variant="outline" className="text-xs font-normal">
            {room}
          </Badge>
          <Badge variant="secondary" className="text-xs font-normal ml-2">
            {time}
          </Badge>
        </div>
        <CardTitle 
          className="text-lg mb-2 line-clamp-3 text-card-foreground"
          role="heading"
          aria-level={3}
        >
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* QR Code Section */}
        {showQR ? (
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">Scan to view session</p>
            <canvas
              ref={canvasRef}
              className="mx-auto border-4 border-background rounded-lg shadow-sm"
              aria-label="QR code for session access"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQR(false)}
              className="mt-3"
              aria-label="Hide QR code"
            >
              Hide QR Code
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={onJoin}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              size="lg"
              aria-label={`Join ${title} session`}
            >
              Join Session
              <ChevronRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowQR(true)}
              aria-label="Show QR code"
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground" role="status" aria-label="Session features">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></span>
            Interactive Polls
          </span>
          <span aria-hidden="true">•</span>
          <span>Anonymous</span>
          <span aria-hidden="true">•</span>
          <span>Real-time</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCard;
