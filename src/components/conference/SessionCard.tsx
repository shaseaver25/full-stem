import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, ChevronRight, MapPin, Clock } from 'lucide-react';
import QRCodeLib from 'qrcode';

interface SessionCardProps {
  title: string;
  room: string;
  time: string;
  presenter?: string;
  description?: string;
  onJoin: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ 
  title, 
  room, 
  time, 
  presenter,
  description,
  onJoin 
}) => {
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
      className="group rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-card border-border hover:scale-[1.01] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
      role="article"
      aria-label={`Session: ${title}`}
      tabIndex={0}
    >
      <CardHeader className="space-y-3 pb-4">
        {/* Time and Location Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="secondary" 
            className="text-xs font-medium flex items-center gap-1"
            aria-label={`Time: ${time}`}
          >
            <Clock className="h-3 w-3" aria-hidden="true" />
            {time}
          </Badge>
          <Badge 
            variant="outline" 
            className="text-xs font-medium flex items-center gap-1"
            aria-label={`Location: ${room}`}
          >
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {room}
          </Badge>
        </div>

        {/* Session Title */}
        <CardTitle 
          className="text-xl leading-tight line-clamp-3 text-card-foreground group-hover:text-primary transition-colors"
          role="heading"
          aria-level={3}
        >
          {title}
        </CardTitle>

        {/* Presenter (if provided) */}
        {presenter && (
          <p className="text-sm italic text-muted-foreground" aria-label={`Presenter: ${presenter}`}>
            {presenter}
          </p>
        )}

        {/* Description (if provided) */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* QR Code Section */}
        {showQR ? (
          <div className="bg-muted/50 rounded-xl p-6 text-center animate-fade-in">
            <p className="text-sm text-muted-foreground mb-4 font-medium">
              Scan to view session
            </p>
            <canvas
              ref={canvasRef}
              className="mx-auto border-4 border-background rounded-xl shadow-lg"
              aria-label="QR code for session access"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQR(false)}
              className="mt-4 hover:bg-background"
              aria-label="Hide QR code"
            >
              Hide QR Code
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 animate-fade-in">
            <Button
              onClick={onJoin}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm transition-all duration-200"
              size="lg"
              aria-label={`Join ${title} session`}
            >
              Join Session
              <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowQR(true)}
              className="hover:bg-muted/50 transition-colors"
              aria-label="Show QR code for this session"
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        {/* Session Features */}
        <div 
          className="flex items-center justify-center gap-3 pt-2 text-xs text-muted-foreground border-t border-border/50 pt-4" 
          role="status" 
          aria-label="Session features"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50" aria-hidden="true"></span>
            Live
          </span>
          <span aria-hidden="true" className="text-border">•</span>
          <span className="font-medium">Interactive</span>
          <span aria-hidden="true" className="text-border">•</span>
          <span className="font-medium">Anonymous</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCard;
