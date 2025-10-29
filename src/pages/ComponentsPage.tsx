import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import DemoReadAloud from '@/components/DemoReadAloud';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Sparkles, Volume2, Mic } from 'lucide-react';

const ComponentsPage = () => {
  const sampleText = "Artificial intelligence is transforming education by making learning more accessible and personalized for every student. With AI-powered tools, students can learn at their own pace, in their own language, and with support tailored to their unique needs.";

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Read-Aloud Demo</h1>
              <p className="text-lg text-gray-600">
                Conference demo with 40-language support
              </p>
            </div>
            <LanguageSelector />
          </div>
        </div>

        <div className="grid gap-8">
          {/* AI Read-Aloud Demo for Conference */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                AI Read-Aloud Demo
              </CardTitle>
              <CardDescription>
                Conference demo: Click the large Play button to hear AI-powered text-to-speech with word highlighting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemoReadAloud text={sampleText} />
            </CardContent>
          </Card>

          {/* Legacy Read Aloud Notice */}
          <Card className="shadow-lg border-dashed">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-muted-foreground" />
                <CardTitle className="text-2xl text-muted-foreground">Basic Components</CardTitle>
                <Badge variant="outline">Removed</Badge>
              </div>
              <CardDescription>
                Basic audio components have been replaced with the enhanced inline version. Each text section now has integrated read-aloud functionality with ElevenLabs AI voices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-muted-foreground">
                  Audio buttons under Instructions sections now use ElevenLabs AI voices with synchronized word highlighting.
                </p>
              </div>
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
                      <td className="text-center p-3">✅ ElevenLabs</td>
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