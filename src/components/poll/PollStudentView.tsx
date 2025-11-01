import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Users, Star, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface PollOption {
  id: string;
  option_text: string;
  option_order: number;
  vote_count: number;
}

interface PollData {
  id: string;
  poll_question: string;
  poll_type: 'single_choice' | 'multiple_choice' | 'rating_scale' | 'ranking';
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

export const PollStudentView: React.FC<PollStudentViewProps> = ({ componentId, pollData: propPollData }) => {
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [userResponse, setUserResponse] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [rankingOrder, setRankingOrder] = useState<PollOption[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPollData();
    const cleanup = subscribeToUpdates();
    return cleanup;
  }, [componentId]);

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

        // Create mock options from prop data
        const mockOptions: PollOption[] = propPollData.options.map((opt: any, index: number) => ({
          id: opt.id,
          option_text: opt.option_text,
          option_order: opt.option_order || index,
          vote_count: 0
        }));
        setOptions(mockOptions);
        setRankingOrder(mockOptions);

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
        setRankingOrder(pollOptions || []);

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
    const channel = supabase
      .channel('poll-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_responses',
        },
        () => {
          loadPollData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_options',
        },
        () => {
          loadPollData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async () => {
    if (!pollData) return;

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

    setSubmitting(true);
    try {
      // If using prop data, ensure database records exist first
      if (propPollData) {
        // Check if poll_component exists
        const { data: existingPoll } = await supabase
          .from('poll_components')
          .select('id')
          .eq('component_id', componentId)
          .maybeSingle();

        if (!existingPoll) {
          // Create poll_component record
          const { data: newPoll, error: pollError } = await supabase
            .from('poll_components')
            .insert({
              component_id: componentId,
              poll_question: pollData.poll_question,
              poll_type: pollData.poll_type,
              show_results_timing: pollData.show_results_timing,
              allow_anonymous: pollData.allow_anonymous,
              allow_change_vote: pollData.allow_change_vote,
              chart_type: pollData.chart_type,
              show_percentages: pollData.show_percentages,
              show_vote_counts: pollData.show_vote_counts,
              is_closed: false
            })
            .select()
            .single();

          if (pollError) throw pollError;

          // Create poll_options records
          const optionsToInsert = options.map(opt => ({
            poll_component_id: newPoll.id,
            option_text: opt.option_text,
            option_order: opt.option_order
          }));

          const { error: optionsError } = await supabase
            .from('poll_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;

          // Update local pollData with real ID
          setPollData({ ...pollData, id: newPoll.id });
        }
      }

      const responseData: any = {
        poll_component_id: propPollData ? componentId : pollData.id,
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

  const handleRankingDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(rankingOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRankingOrder(items);
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
        <CardTitle className="flex items-center gap-2 text-[#065F46]">
          <BarChart3 className="h-5 w-5" />
          {hasVoted && showResults() ? 'Poll Results' : 'Quick Poll'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <h3 className="text-xl font-semibold text-center">{pollData.poll_question}</h3>

        {/* Show voting interface if not voted or can change vote */}
        {canVote && !showResults() && (
          <div className="space-y-4">
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
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">Drag to order from most to least preferred:</p>
                <DragDropContext onDragEnd={handleRankingDragEnd}>
                  <Droppable droppableId="ranking">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {rankingOrder.map((option, index) => (
                          <Draggable key={option.id} draggableId={option.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center gap-3 p-3 bg-muted rounded-md"
                              >
                                <span className="font-bold text-lg">{index + 1}.</span>
                                <span>{option.option_text}</span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
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
            {hasVoted && userResponse && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium">
                  {pollData.poll_type === 'rating_scale'
                    ? `Your Rating: ${userResponse.rating_value} / 5`
                    : `Your Vote: ${options.find(o => selectedOptions.includes(o.id))?.option_text || 'Submitted'}`}
                </span>
              </div>
            )}

            {pollData.poll_type !== 'rating_scale' && (
              <div className="space-y-3">
                {options.map((option) => {
                  const percentage = calculatePercentage(option.vote_count);
                  return (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{option.option_text}</span>
                        <span className="text-muted-foreground">
                          {pollData.show_percentages && `${percentage}%`}
                          {pollData.show_percentages && pollData.show_vote_counts && ' '}
                          {pollData.show_vote_counts && `(${option.vote_count} ${option.vote_count === 1 ? 'vote' : 'votes'})`}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-6" />
                    </div>
                  );
                })}
              </div>
            )}

            {pollData.poll_type === 'rating_scale' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Star
                        key={rating}
                        className={`h-8 w-8 ${
                          rating <= Math.round(ratingValue)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-2xl font-bold">Average Rating: {ratingValue.toFixed(1)} / 5</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
              <Users className="h-4 w-4" />
              <span>{totalResponses} {totalResponses === 1 ? 'rating' : 'ratings'} submitted</span>
            </div>

            {pollData.allow_change_vote && (
              <Button variant="outline" onClick={() => setUserResponse(null)} className="w-full">
                Change Vote
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
