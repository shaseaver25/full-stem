import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import EnhancedReadAloud from '@/components/EnhancedReadAloud';
import HighlightedTextReader from '@/components/HighlightedTextReader';
import { Sparkles, Volume2, Mic } from 'lucide-react';

const ComponentsPage = () => {
  const sampleText = `Welcome to our enhanced reading experience! This is a demonstration of our advanced text-to-speech capabilities. The system uses cutting-edge AI voices to provide natural-sounding narration with real-time word highlighting. You can adjust the playback speed, choose different voices, and even download the transcript. This technology helps students of all reading levels engage with content more effectively. The highlighting feature helps track progress and improve reading comprehension. Try clicking the play button to experience this innovative learning tool in action!`;

  const shortText = "This is a shorter sample text for the basic read-aloud button component.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">UI Components Showcase</h1>
          <p className="text-lg text-gray-600">
            Explore and test the various interactive components available in the platform.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Enhanced Read Aloud Component */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">Enhanced Read Aloud</CardTitle>
                </div>
                <Badge variant="default" className="flex items-center gap-1">
                  <Mic className="h-3 w-3" />
                  AI Powered
                </Badge>
              </div>
              <CardDescription>
                Advanced text-to-speech with Google WaveNet voices, real-time word highlighting, and professional controls.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    ✨ Natural AI voices
                  </div>
                  <div className="flex items-center gap-2">
                    🎯 Word-by-word highlighting
                  </div>
                  <div className="flex items-center gap-2">
                    ⚡ Adjustable speed & voice
                  </div>
                </div>
                
                <Separator />
                
                <EnhancedReadAloud
                  text={sampleText}
                  autoHighlight={true}
                  showControls={true}
                  theme="light"
                />
              </div>
            </CardContent>
          </Card>

          {/* Legacy Read Aloud Notice */}
          <Card className="shadow-lg border-dashed">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-muted-foreground" />
                <CardTitle className="text-2xl text-muted-foreground">Basic Read Aloud Button</CardTitle>
                <Badge variant="outline">Removed</Badge>
              </div>
              <CardDescription>
                The basic read-aloud button has been replaced with the enhanced global version. Use the floating button in the top-right corner of any page for advanced text-to-speech features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-muted-foreground">
                  This component has been removed in favor of the global Enhanced Read Aloud widget.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Highlighted Text Reader */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-green-600" />
                <CardTitle className="text-2xl">Highlighted Text Reader</CardTitle>
                <Badge variant="secondary">Interactive</Badge>
              </div>
              <CardDescription>
                Text reader with word-by-word highlighting and basic speech controls.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HighlightedTextReader text={shortText} />
            </CardContent>
          </Card>

          {/* Feature Comparison */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Feature Comparison</CardTitle>
              <CardDescription>
                Compare the capabilities of different read-aloud components.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Feature</th>
                      <th className="text-center p-3 font-semibold">Enhanced Read Aloud</th>
                      <th className="text-center p-3 font-semibold">Highlighted Reader</th>
                      <th className="text-center p-3 font-semibold text-muted-foreground">Basic Button (Removed)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3">AI Voice Quality</td>
                      <td className="text-center p-3">✅ Google WaveNet</td>
                      <td className="text-center p-3">⚠️ Browser Default</td>
                      <td className="text-center p-3">⚠️ Browser Default</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Word Highlighting</td>
                      <td className="text-center p-3">✅ Advanced</td>
                      <td className="text-center p-3">✅ Basic</td>
                      <td className="text-center p-3">❌ None</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Speed Control</td>
                      <td className="text-center p-3">✅ Slider</td>
                      <td className="text-center p-3">❌ None</td>
                      <td className="text-center p-3">❌ None</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Voice Selection</td>
                      <td className="text-center p-3">✅ Multiple Options</td>
                      <td className="text-center p-3">❌ None</td>
                      <td className="text-center p-3">❌ None</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Progress Tracking</td>
                      <td className="text-center p-3">✅ Visual Progress</td>
                      <td className="text-center p-3">⚠️ Word Index</td>
                      <td className="text-center p-3">❌ None</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Transcript Download</td>
                      <td className="text-center p-3">✅ Available</td>
                      <td className="text-center p-3">❌ None</td>
                      <td className="text-center p-3">❌ None</td>
                    </tr>
                    <tr>
                      <td className="p-3">Mobile Optimized</td>
                      <td className="text-center p-3">✅ Responsive</td>
                      <td className="text-center p-3">✅ Responsive</td>
                      <td className="text-center p-3">✅ Responsive</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComponentsPage;