import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowLeft, Users, WifiOff, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { PollStudentView } from '@/components/poll/PollStudentView';
import { useConferenceMode } from '@/hooks/useConferenceMode';

const ConferenceSession: React.FC = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonId = searchParams.get('lesson');

  const [lesson, setLesson] = useState<any>(null);
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // SCALABILITY: Skip expensive auth/settings checks for conference mode
  useConferenceMode();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are back online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    if (!lessonId) return;

    try {
      setLoading(true);

      // Load lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;

      setLesson(lessonData);

      // Load components (slides, polls, etc.)
      const { data: componentsData, error: componentsError } = await supabase
        .from('lesson_components')
        .select(`
          *,
          slide_component:slide_components(*),
          poll_component:poll_components(
            *,
            options:poll_options(*)
          )
        `)
        .eq('lesson_id', lessonId)
        .order('component_order');

      if (componentsError) throw componentsError;

      // SCALABILITY FIX: Pre-create poll_component records to avoid race conditions
      // with 600 concurrent users voting at the same time
      for (const component of componentsData || []) {
        if (component.component_type === 'poll' && !component.poll_component) {
          // Extract poll data from content
          const pollContent = component.content as any;
          
          // Create poll_component
          const { data: newPoll, error: pollError } = await supabase
            .from('poll_components')
            .insert({
              component_id: component.id,
              poll_question: pollContent.poll_question,
              poll_type: pollContent.poll_type,
              show_results_timing: pollContent.show_results_timing || 'after_voting',
              allow_anonymous: pollContent.allow_anonymous || true,
              allow_change_vote: pollContent.allow_change_vote || false,
              chart_type: pollContent.chart_type || 'bar',
              show_percentages: pollContent.show_percentages || true,
              show_vote_counts: pollContent.show_vote_counts || true,
              is_closed: false
            })
            .select()
            .single();

          if (!pollError && newPoll) {
            // Create poll_options
            const optionsToInsert = (pollContent.options || []).map((opt: any, idx: number) => ({
              poll_component_id: newPoll.id,
              option_text: opt.option_text,
              option_order: opt.option_order || idx
            }));

            const { data: createdOptions } = await supabase
              .from('poll_options')
              .insert(optionsToInsert)
              .select();

            // Update component with poll data including options
            component.poll_component = {
              ...newPoll,
              options: createdOptions || []
            };
          }
        }
      }

      setComponents(componentsData || []);
    } catch (error) {
      console.error('Error loading lesson:', error);
      toast.error('Failed to load session content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading session..." />;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">Session not found</p>
            <Button onClick={() => navigate('/conference/demo')} className="mt-4">
              Back to Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{lesson.title} - Conference Session</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/conference/demo')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{lesson.title}</h1>
                  <p className="text-sm text-gray-600">{lesson.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Wifi className="h-3 w-3 mr-1" />
                    Live
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
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {components.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No content available for this session yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {components.map((component, index) => (
                <Card key={component.id} className="overflow-hidden">
                  {component.component_type === 'slide' && component.slide_component && (
                    <div>
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3">
                        <h2 className="text-white font-semibold">
                          Slide {index + 1}: {component.slide_component.title}
                        </h2>
                      </div>
                      <CardContent className="pt-6">
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: component.slide_component.content }}
                        />
                      </CardContent>
                    </div>
                  )}

                  {component.component_type === 'poll' && component.poll_component && (
                    <div>
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3">
                        <div className="flex items-center justify-between">
                          <h2 className="text-white font-semibold">
                            Poll {index + 1}: {component.poll_component.question}
                          </h2>
                          <Badge className="bg-white/20 text-white">
                            <Users className="h-3 w-3 mr-1" />
                            Live
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="pt-6">
                        <PollStudentView componentId={component.id} />
                      </CardContent>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ConferenceSession;
