import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Trash2, Plus, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface PollOption {
  id: string;
  option_text: string;
  option_order: number;
}

interface PollBuilderProps {
  componentId?: string;
  initialData?: any;
  onSave?: (pollData: any) => void;
}

export const PollBuilderComponent: React.FC<PollBuilderProps> = ({
  componentId,
  initialData,
  onSave
}) => {
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollType, setPollType] = useState<'single_choice' | 'multiple_choice' | 'rating_scale' | 'ranking' | 'text_response'>('single_choice');
  const [options, setOptions] = useState<PollOption[]>([
    { id: crypto.randomUUID(), option_text: '', option_order: 0 },
    { id: crypto.randomUUID(), option_text: '', option_order: 1 }
  ]);
  const [showResultsTiming, setShowResultsTiming] = useState<'before_voting' | 'after_voting' | 'never'>('after_voting');
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [allowChangeVote, setAllowChangeVote] = useState(false);
  const [requireParticipation, setRequireParticipation] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'donut'>('bar');
  const [showPercentages, setShowPercentages] = useState(true);
  const [showVoteCounts, setShowVoteCounts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pollComponentId, setPollComponentId] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      loadPollDataFromInitial();
    } else if (componentId) {
      loadPollDataFromDatabase();
    }
  }, [initialData, componentId]);

  const loadPollDataFromInitial = () => {
    if (!initialData) return;
    
    setPollQuestion(initialData.poll_question || '');
    setPollType(initialData.poll_type || 'single_choice');
    setShowResultsTiming(initialData.show_results_timing || 'after_voting');
    setAllowAnonymous(initialData.allow_anonymous ?? true);
    setAllowChangeVote(initialData.allow_change_vote ?? false);
    setRequireParticipation(initialData.require_participation ?? false);
    setChartType(initialData.chart_type || 'bar');
    setShowPercentages(initialData.show_percentages ?? true);
    setShowVoteCounts(initialData.show_vote_counts ?? true);

    if (initialData.options && initialData.options.length > 0) {
      setOptions(initialData.options);
    }
  };

  const loadPollDataFromDatabase = async () => {
    if (!componentId) return;
    
    try {
      const { data: pollData, error } = await supabase
        .from('poll_components')
        .select('*, poll_options(*)')
        .eq('component_id', componentId)
        .maybeSingle();

      if (error) throw error;

      if (pollData) {
        setPollComponentId(pollData.id);
        setPollQuestion(pollData.poll_question);
        setPollType(pollData.poll_type as 'single_choice' | 'multiple_choice' | 'rating_scale' | 'ranking' | 'text_response');
        setShowResultsTiming(pollData.show_results_timing as 'before_voting' | 'after_voting' | 'never');
        setAllowAnonymous(pollData.allow_anonymous);
        setAllowChangeVote(pollData.allow_change_vote);
        setRequireParticipation(pollData.require_participation);
        setChartType(pollData.chart_type as 'bar' | 'pie' | 'donut');
        setShowPercentages(pollData.show_percentages);
        setShowVoteCounts(pollData.show_vote_counts);

        if (pollData.poll_options && pollData.poll_options.length > 0) {
          setOptions(pollData.poll_options.sort((a: any, b: any) => a.option_order - b.option_order));
        }
      }
    } catch (error) {
      console.error('Error loading poll data:', error);
    }
  };

  const handleAddOption = () => {
    if (options.length >= 10) {
      toast.error('Maximum 10 options allowed');
      return;
    }
    setOptions([...options, { id: crypto.randomUUID(), option_text: '', option_order: options.length }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    setOptions(options.filter(opt => opt.id !== id).map((opt, idx) => ({ ...opt, option_order: idx })));
  };

  const handleOptionChange = (id: string, text: string) => {
    if (text.length > 200) {
      toast.error('Option text must be 200 characters or less');
      return;
    }
    setOptions(options.map(opt => opt.id === id ? { ...opt, option_text: text } : opt));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(options);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOptions(items.map((item, idx) => ({ ...item, option_order: idx })));
  };

  const handleSave = () => {
    if (!pollQuestion.trim()) {
      toast.error('Poll question is required');
      return;
    }

    if (pollType !== 'rating_scale' && pollType !== 'text_response' && options.some(opt => !opt.option_text.trim())) {
      toast.error('All options must have text');
      return;
    }

    if (pollType !== 'rating_scale' && pollType !== 'text_response' && options.length < 2) {
      toast.error('At least 2 options required');
      return;
    }

    // Save poll data locally (not to database yet)
    const pollData = {
      poll_question: pollQuestion,
      poll_type: pollType,
      show_results_timing: showResultsTiming,
      allow_anonymous: allowAnonymous,
      allow_change_vote: allowChangeVote,
      require_participation: requireParticipation,
      chart_type: chartType,
      show_percentages: showPercentages,
      show_vote_counts: showVoteCounts,
      options: (pollType === 'rating_scale' || pollType === 'text_response') ? [] : options.map(opt => ({
        id: opt.id,
        option_text: opt.option_text,
        option_order: opt.option_order
      }))
    };

    toast.success('Poll configuration saved');
    onSave?.(pollData);
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-[#D1FAE5] border-b-2 border-[#065F46]">
        <CardTitle className="flex items-center gap-2 text-[#065F46]">
          <BarChart3 className="h-5 w-5" />
          Poll/Survey Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Poll Question */}
        <div className="space-y-2">
          <Label htmlFor="poll-question">Poll Question</Label>
          <Input
            id="poll-question"
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            placeholder="What topic should we explore next?"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Example: "What topic should we explore next?"</p>
        </div>

        {/* Poll Type */}
        <div className="space-y-2">
          <Label>Poll Type</Label>
          <Select value={pollType} onValueChange={(value: any) => setPollType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single_choice">Single Choice (radio buttons)</SelectItem>
              <SelectItem value="multiple_choice">Multiple Choice (checkboxes)</SelectItem>
              <SelectItem value="rating_scale">Rating Scale (1-5 stars)</SelectItem>
              <SelectItem value="ranking">Ranking (drag to order)</SelectItem>
              <SelectItem value="text_response">Text Response (open-ended)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Answer Options */}
        {pollType !== 'rating_scale' && pollType !== 'text_response' && (
          <div className="space-y-2">
            <Label>Answer Options</Label>
            <Card>
              <CardContent className="pt-4 space-y-2">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="options">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {options.map((option, index) => (
                          <Draggable key={option.id} draggableId={option.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-2"
                              >
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span className="text-sm font-medium min-w-[24px]">[{index + 1}]</span>
                                <Input
                                  value={option.option_text}
                                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                  placeholder={`Option ${index + 1}`}
                                  className="flex-1"
                                  maxLength={200}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveOption(option.id)}
                                  disabled={options.length <= 2}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={options.length >= 10}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option (2-10 options)
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Poll Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Poll Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Show Results:</Label>
              <RadioGroup value={showResultsTiming} onValueChange={(value: any) => setShowResultsTiming(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="before_voting" id="before" />
                  <Label htmlFor="before">Before Voting (see live results)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="after_voting" id="after" />
                  <Label htmlFor="after">After Voting (after you submit)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never" />
                  <Label htmlFor="never">Never (teacher only)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={allowAnonymous}
                  onCheckedChange={(checked) => setAllowAnonymous(!!checked)}
                />
                <Label htmlFor="anonymous">Allow Anonymous Responses</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="change-vote"
                  checked={allowChangeVote}
                  onCheckedChange={(checked) => setAllowChangeVote(!!checked)}
                />
                <Label htmlFor="change-vote">Allow Changing Vote</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="require"
                  checked={requireParticipation}
                  onCheckedChange={(checked) => setRequireParticipation(!!checked)}
                />
                <Label htmlFor="require">Require Participation (mark as assignable)</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Display Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="donut">Donut Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="percentages"
                  checked={showPercentages}
                  onCheckedChange={(checked) => setShowPercentages(!!checked)}
                />
                <Label htmlFor="percentages">Show Percentages</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="counts"
                  checked={showVoteCounts}
                  onCheckedChange={(checked) => setShowVoteCounts(!!checked)}
                />
                <Label htmlFor="counts">Show Vote Counts</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline">Preview Poll</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Poll'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
