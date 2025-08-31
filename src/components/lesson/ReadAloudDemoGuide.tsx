import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, MousePointer, Keyboard, Sparkles, Globe, Accessibility } from 'lucide-react';

const ReadAloudDemoGuide: React.FC = () => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Volume2 className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            🎵 AI-Powered Read-Aloud Demo
          </h3>
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Try It Now!
          </Badge>
        </div>
        
        <p className="text-gray-700 mb-4">
          Experience our advanced AI text-to-speech with real-time word highlighting and interactive features:
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <MousePointer className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Click any word</h4>
              <p className="text-sm text-gray-600">Jump to that point in the audio instantly</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Keyboard className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Keyboard shortcuts</h4>
              <p className="text-sm text-gray-600">Spacebar to play/pause, arrows to seek</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Sparkles className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">ElevenLabs AI voices</h4>
              <p className="text-sm text-gray-600">Natural, human-like speech synthesis</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <Globe className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Multi-language support</h4>
              <p className="text-sm text-gray-600">Works with translated content</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Accessibility className="h-4 w-4" />
          <span>Fully accessible with screen reader support and ARIA labels</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadAloudDemoGuide;