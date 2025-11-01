import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Users, Star, Check, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getRateLimiter } from '@/middleware/rateLimit';
import SpeechControls from '@/components/SpeechControls';
import { useElevenLabsTTSPublic } from '@/hooks/useElevenLabsTTSPublic';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PollOption {
  id: string;
  option_text: string;
  option_order: number;
  vote_count: number;
}

interface PollData {
  id: string;
  poll_question: string;
  poll_type: 'single_choice' | 'multiple_choice' | 'rating_scale' | 'ranking' | 'text_response';
  show_results_timing: 'before_voting' | 'after_voting' | 'never';
  allow_anonymous: boolean;
  allow_change_vote: boolean;
  chart_type: 'bar' | 'pie' | 'donut';
  show_percentages: boolean;
  show_vote_counts: boolean;
  is_closed: boolean;
}

interface PollStudentViewProps {
  componentId: string;
  pollData?: any; // Poll data from lesson component content
}

// Separate SortableItem component for each ranking option
function SortableRankingItem({ 
  option, 
  index 
}: { 
  option: PollOption; 
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-4 bg-white rounded-lg border-2 
        ${isDragging 
          ? 'border-emerald-500 shadow-lg z-50' 
          : 'border-gray-200 hover:border-emerald-300'
        }
        transition-all cursor-move
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      {/* Rank Number */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center">
        {index + 1}
      </div>

      {/* Option Text */}
      <div className="flex-grow text-gray-900">
        {option.option_text}
      </div>
    </div>
  );
}

export const PollStudentView: React.FC<PollStudentViewProps> = ({ componentId, pollData: propPollData }) => {
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [userResponse, setUserResponse] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textResponse, setTextResponse] = useState('');
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [rankingOrder, setRankingOrder] = useState<PollOption[]>([]);
  const [hasInitializedRanking, setHasInitializedRanking] = useState(false);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // TTS functionality
  const { speak, pause, resume, stop, isPlaying, isPaused, isLoading: ttsLoading, error: ttsError, currentTime, duration } = useElevenLabsTTSPublic('en');

  // Sensors for drag interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle read aloud
  const handleReadAloud = () => {
    const questionText = pollData?.poll_question || '';
    const optionsText = options
      .map((opt, idx) => `Option ${idx + 1}: ${opt.option_text}`)
      .join('. ');
    speak(`${questionText}. ${optionsText}`);
  };

  useEffect(() => {
    loadPollData();
    const cleanup = subscribeToUpdates();
    return cleanup;
  }, [componentId, userResponse]);

  const loadPollData = async () => {
    try {
      setLoading(true);

      // If poll data is provided from props, use it
      if (propPollData) {
        const mockPollData: PollData = {
          id: componentId, // Use componentId as temporary ID
          poll_question: propPollData.poll_question,
          poll_type: propPollData.poll_type,
          show_results_timing: propPollData.show_results_timing,
          allow_anonymous: propPollData.allow_anonymous,
          allow_change_vote: propPollData.allow_change_vote,
          chart_type: propPollData.chart_type,
          show_percentages: propPollData.show_percentages,
          show_vote_counts: propPollData.show_vote_counts,
          is_closed: false
        };
        setPollData(mockPollData);

        // Create mock options from prop data with stable string IDs
        const mockOptions: PollOption[] = propPollData.options.map((opt: any, index: number) => ({
          id: opt.id || `option-${index}`, // Use original ID if available, otherwise stable string ID
          option_text: opt.option_text,
          option_order: opt.option_order || index,
          vote_count: 0
        }));
        setOptions(mockOptions);
        
        // CRITICAL: Only set ranking order if it hasn't been initialized yet (preserve user's drag order)
        if (mockPollData.poll_type === 'ranking' && !hasInitializedRanking) {
          setRankingOrder([...mockOptions].sort((a, b) => a.option_order - b.option_order));
          setHasInitializedRanking(true);
        }

        // Check for existing responses in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: response } = await supabase
            .from('poll_responses')
            .select('*')
            .eq('poll_component_id', componentId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (response) {
            setUserResponse(response);
            if (response.selected_option_ids) {
              setSelectedOptions(response.selected_option_ids);
            }
            if (response.response_text) {
              setTextResponse(response.response_text);
            }
            if (response.rating_value) {
              setRatingValue(response.rating_value);
            }
            if (response.ranking_order) {
              const orderMap = response.ranking_order as Record<string, number>;
              const ordered = [...mockOptions].sort((a, b) => 
                (orderMap[a.id] || 999) - (orderMap[b.id] || 999)
              );
              setRankingOrder(ordered);
            }
          }

          // Get total response count
          const { count } = await supabase
            .from('poll_responses')
            .select('*', { count: 'exact', head: true })
            .eq('poll_component_id', componentId);
          setTotalResponses(count || 0);
        }
      } else {
        // Fallback to database query
        const { data: pollComponent, error: pollError } = await supabase
          .from('poll_components')
          .select('*')
          .eq('component_id', componentId)
          .single();

        if (pollError) throw pollError;
        setPollData(pollComponent as PollData);

        // Get poll options
        const { data: pollOptions, error: optionsError } = await supabase
          .from('poll_options')
          .select('*')
          .eq('poll_component_id', pollComponent.id)
          .order('option_order');

        if (optionsError) throw optionsError;
        setOptions(pollOptions || []);
        
        // CRITICAL: Only set ranking order if it hasn't been initialized yet
        if (pollComponent.poll_type === 'ranking' && !hasInitializedRanking) {
          setRankingOrder(pollOptions || []);
          setHasInitializedRanking(true);
        }

        // Get user's existing response
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: response } = await supabase
            .from('poll_responses')
            .select('*')
            .eq('poll_component_id', pollComponent.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (response) {
            setUserResponse(response);
            if (response.selected_option_ids) {
              setSelectedOptions(response.selected_option_ids);
            }
            if (response.rating_value) {
              setRatingValue(response.rating_value);
            }
            if (response.ranking_order) {
              const orderMap = response.ranking_order as Record<string, number>;
              const ordered = [...pollOptions].sort((a, b) => 
                (orderMap[a.id] || 999) - (orderMap[b.id] || 999)
              );
              setRankingOrder(ordered);
            }
          }
        }

        // Get total response count
        const { count } = await supabase
          .from('poll_responses')
          .select('*', { count: 'exact', head: true })
          .eq('poll_component_id', pollComponent.id);

        setTotalResponses(count || 0);
      }
    } catch (error) {
      console.error('Error loading poll:', error);
      toast.error('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    // CRITICAL: Don't subscribe to updates for ranking polls while user is ranking
    if (pollData?.poll_type === 'ranking' && !userResponse) {
      console.log('Skipping realtime updates for ranking poll (user not voted yet)');
      return () => {};
    }

    // SCALABILITY FIX: Subscribe only to THIS poll's updates, not all polls
    // This reduces connection overhead from O(n) to O(1) per user
    const pollComponentId = pollData?.id;
    if (!pollComponentId) return () => {};

    const channel = supabase
      .channel(`poll-${componentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_responses',
          filter: `poll_component_id=eq.${pollComponentId}`,
        },
        () => {
          if (pollData?.poll_type !== 'ranking' || userResponse) {
            loadPollData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async () => {
    if (!pollData) return;

    // SCALABILITY: Rate limit poll submissions (5 per 10 seconds)
    const rateLimiter = getRateLimiter('MUTATION');
    const rateLimitResult = rateLimiter.attempt();
    
    if (!rateLimitResult.allowed) {
      toast.error(`Please wait ${Math.ceil(rateLimitResult.retryAfter / 1000)} seconds before voting again`);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to vote');
      return;
    }

    // Validation
    if (pollData.poll_type === 'single_choice' && selectedOptions.length === 0) {
      toast.error('Please select an option');
      return;
    }
    if (pollData.poll_type === 'multiple_choice' && selectedOptions.length === 0) {
      toast.error('Please select at least one option');
      return;
    }
    if (pollData.poll_type === 'rating_scale' && ratingValue === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (pollData.poll_type === 'text_response' && !textResponse.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setSubmitting(true);
    try {
      // SCALABILITY FIX: Poll records should be pre-created by ConferenceSession
      // to avoid race conditions with 600 concurrent users
      const actualPollId = pollData.id;

      const responseData: any = {
        poll_component_id: actualPollId,
        user_id: pollData.allow_anonymous ? null : user.id,
        is_anonymous: pollData.allow_anonymous,
      };

      if (pollData.poll_type === 'single_choice' || pollData.poll_type === 'multiple_choice') {
        responseData.selected_option_ids = selectedOptions;
      } else if (pollData.poll_type === 'rating_scale') {
        responseData.rating_value = ratingValue;
      } else if (pollData.poll_type === 'ranking') {
        const rankingMap: Record<string, number> = {};
        rankingOrder.forEach((option, index) => {
          rankingMap[option.id] = index + 1;
        });
        responseData.ranking_order = rankingMap;
      } else if (pollData.poll_type === 'text_response') {
        responseData.response_text = textResponse;
      }

      const { error } = await supabase
        .from('poll_responses')
        .upsert(responseData, {
          onConflict: 'poll_component_id,user_id'
        });

      if (error) throw error;

      toast.success('Vote submitted successfully');
      await loadPollData();
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle drag end with @dnd-kit
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setRankingOrder((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const calculatePercentage = (voteCount: number) => {
    if (totalResponses === 0) return 0;
    return Math.round((voteCount / totalResponses) * 100);
  };

  const showResults = () => {
    if (!pollData) return false;
    if (pollData.show_results_timing === 'never') return false;
    if (pollData.show_results_timing === 'before_voting') return true;
    if (pollData.show_results_timing === 'after_voting' && userResponse) return true;
    return false;
  };

  if (loading) {
    return <div className="p-4">Loading poll...</div>;
  }

  if (!pollData) {
    return <div className="p-4">Poll not found</div>;
  }

  const hasVoted = userResponse !== null;
  const canVote = !hasVoted || (hasVoted && pollData.allow_change_vote);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-[#D1FAE5] border-b-2 border-[#065F46]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-[#065F46]">
            <BarChart3 className="h-5 w-5" />
            {hasVoted && showResults() ? 'Poll Results' : 'Quick Poll'}
          </CardTitle>
          <SpeechControls
            isPlaying={isPlaying}
            isPaused={isPaused}
            isLoading={ttsLoading}
            error={ttsError}
            currentTime={currentTime}
            duration={duration}
            onPlay={handleReadAloud}
            onPause={pause}
            onResume={resume}
            onStop={stop}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <h3 className="text-xl font-semibold text-center">{pollData.poll_question}</h3>

        {/* Show voting interface if not voted or can change vote */}
        {canVote && !showResults() && (
          <div className="space-y-4">
            {pollData.poll_type === 'text_response' && (
              <div className="space-y-2">
                <textarea
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder="Enter your response..."
                  className="w-full min-h-[120px] p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {textResponse.length} / 1000 characters
                </p>
              </div>
            )}

            {pollData.poll_type === 'single_choice' && (
              <RadioGroup value={selectedOptions[0]} onValueChange={(value) => setSelectedOptions([value])}>
                {options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id}>{option.option_text}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {pollData.poll_type === 'multiple_choice' && (
              <div className="space-y-2">
                {options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedOptions([...selectedOptions, option.id]);
                        } else {
                          setSelectedOptions(selectedOptions.filter(id => id !== option.id));
                        }
                      }}
                    />
                    <Label htmlFor={option.id}>{option.option_text}</Label>
                  </div>
                ))}
              </div>
            )}

            {pollData.poll_type === 'rating_scale' && (
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setRatingValue(rating)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        rating <= ratingValue
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}

            {pollData.poll_type === 'ranking' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-800">
                    📋 <strong>Drag to rank:</strong> Move items up or down to show your preference (1 = most preferred)
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Keyboard users:</strong> Tab to an item, press Space to pick it up, 
                    use Arrow keys to move it, and press Space again to drop it.
                  </p>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={rankingOrder.map(opt => opt.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {rankingOrder.map((option, index) => (
                        <SortableRankingItem
                          key={option.id}
                          option={option}
                          index={index}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{totalResponses} {totalResponses === 1 ? 'student has' : 'students have'} voted</span>
              </div>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : hasVoted ? 'Change Vote' : 'Submit Vote'}
              </Button>
            </div>

            {pollData.allow_anonymous && (
              <p className="text-xs text-center text-muted-foreground">ℹ️ Your response is anonymous</p>
            )}
          </div>
        )}

        {/* Show results */}
        {showResults() && (
          <div className="space-y-4">
            {hasVoted && userResponse && pollData.poll_type === 'text_response' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <p className="font-semibold text-green-800 dark:text-green-200">✓ Your response has been recorded</p>
                <p className="text-sm text-muted-foreground mt-1">Thank you for your feedback!</p>
                {pollData.allow_change_vote && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setUserResponse(null);
                      setTextResponse('');
                    }}
                    className="mt-3"
                  >
                    Change Your Response
                  </Button>
                )}
              </div>
            )}

            {hasVoted && userResponse && pollData.poll_type !== 'text_response' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium">
                  {pollData.poll_type === 'rating_scale'
                    ? `Your Rating: ${userResponse.rating_value} / 5`
                    : `Your Vote: ${options.find(o => selectedOptions.includes(o.id))?.option_text || 'Submitted'}`}
                </span>
              </div>
            )}

            {pollData.poll_type !== 'rating_scale' && pollData.poll_type !== 'text_response' && (
              <div className="space-y-3">
                {options.map((option) => {
                  const percentage = calculatePercentage(option.vote_count);
                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{option.option_text}</span>
                        <div className="flex gap-2 text-muted-foreground">
                          {pollData.show_vote_counts && <span>{option.vote_count} votes</span>}
                          {pollData.show_percentages && <span>({percentage}%)</span>}
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}

            {pollData.poll_type === 'rating_scale' && (
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">
                  {(options.reduce((acc, opt) => acc + opt.vote_count, 0) / Math.max(totalResponses, 1)).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating (out of 5)</div>
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`h-6 w-6 ${
                        rating <= Math.round(options.reduce((acc, opt) => acc + opt.vote_count, 0) / Math.max(totalResponses, 1))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4 border-t">
              <Users className="h-4 w-4" />
              <span>{totalResponses} total {totalResponses === 1 ? 'response' : 'responses'}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
