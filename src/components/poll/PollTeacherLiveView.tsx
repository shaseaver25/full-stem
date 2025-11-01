import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Users, X, RefreshCw, Download, Lock, Unlock, Maximize2, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PollOption {
  id: string;
  option_text: string;
  option_order: number;
  vote_count: number;
}

interface TextResponse {
  id: string;
  response_text: string;
  responded_at: string;
  is_anonymous: boolean;
}

interface PollData {
  id: string;
  poll_question: string;
  poll_type: string;
  is_closed: boolean;
  show_percentages: boolean;
  show_vote_counts: boolean;
  allow_anonymous: boolean;
  allow_change_vote: boolean;
}

interface PollTeacherLiveViewProps {
  componentId: string;
  classId?: string;
}

export const PollTeacherLiveView: React.FC<PollTeacherLiveViewProps> = ({ componentId, classId }) => {
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [textResponses, setTextResponses] = useState<TextResponse[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [notVotedStudents, setNotVotedStudents] = useState<string[]>([]);
  const [showProjector, setShowProjector] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPollData();
    subscribeToUpdates();
  }, [componentId]);

  const loadPollData = async () => {
    try {
      // Get poll component
      const { data: pollComponent, error: pollError } = await supabase
        .from('poll_components')
        .select('*')
        .eq('component_id', componentId)
        .single();

      if (pollError) throw pollError;
      setPollData(pollComponent);

      // Get poll options or text responses based on type
      if (pollComponent.poll_type === 'text_response') {
        const { data: responses, error: responsesError } = await supabase
          .from('poll_responses')
          .select('id, response_text, responded_at, is_anonymous')
          .eq('poll_component_id', pollComponent.id)
          .not('response_text', 'is', null)
          .order('responded_at', { ascending: false });

        if (responsesError) throw responsesError;
        setTextResponses(responses || []);
      } else {
        const { data: pollOptions, error: optionsError } = await supabase
          .from('poll_options')
          .select('*')
          .eq('poll_component_id', pollComponent.id)
          .order('option_order');

        if (optionsError) throw optionsError;
        setOptions(pollOptions || []);
      }

      // Get response count
      const { count: responseCount } = await supabase
        .from('poll_responses')
        .select('*', { count: 'exact', head: true })
        .eq('poll_component_id', pollComponent.id);

      setTotalResponses(responseCount || 0);

      // Get class enrollment count if classId provided
      if (classId) {
        const { count: studentCount } = await supabase
          .from('class_students')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', classId)
          .eq('status', 'active');

        setTotalStudents(studentCount || 0);

        // Get students who haven't voted
        const { data: votedUserIds } = await supabase
          .from('poll_responses')
          .select('user_id')
          .eq('poll_component_id', pollComponent.id)
          .not('user_id', 'is', null);

        const votedIds = votedUserIds?.map(r => r.user_id) || [];

        const { data: allStudents } = await supabase
          .from('class_students')
          .select('student_id, students(first_name, last_name)')
          .eq('class_id', classId)
          .eq('status', 'active');

        const notVoted = allStudents
          ?.filter((s: any) => !votedIds.includes(s.students?.user_id))
          .map((s: any) => `${s.students?.first_name} ${s.students?.last_name}`)
          .filter(name => name.trim() !== '') || [];

        setNotVotedStudents(notVoted);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading poll data:', error);
      toast.error('Failed to load poll data');
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('teacher-poll-updates')
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleClosePoll = async () => {
    if (!pollData) return;

    try {
      const { error } = await supabase
        .from('poll_components')
        .update({ is_closed: true })
        .eq('id', pollData.id);

      if (error) throw error;
      toast.success('Poll closed');
      loadPollData();
    } catch (error) {
      console.error('Error closing poll:', error);
      toast.error('Failed to close poll');
    }
  };

  const handleReopenPoll = async () => {
    if (!pollData) return;

    try {
      const { error } = await supabase
        .from('poll_components')
        .update({ is_closed: false })
        .eq('id', pollData.id);

      if (error) throw error;
      toast.success('Poll reopened');
      loadPollData();
    } catch (error) {
      console.error('Error reopening poll:', error);
      toast.error('Failed to reopen poll');
    }
  };

  const handleResetVotes = async () => {
    if (!pollData) return;
    if (!confirm('Are you sure you want to reset all votes? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('poll_responses')
        .delete()
        .eq('poll_component_id', pollData.id);

      if (error) throw error;

      // Reset vote counts
      await supabase
        .from('poll_options')
        .update({ vote_count: 0 })
        .eq('poll_component_id', pollData.id);

      toast.success('All votes reset');
      loadPollData();
    } catch (error) {
      console.error('Error resetting votes:', error);
      toast.error('Failed to reset votes');
    }
  };

  const handleExportResults = () => {
    if (!pollData) return;

    let csvContent: string;

    if (pollData.poll_type === 'text_response') {
      csvContent = [
        ['Response', 'Date', 'Anonymous'],
        ...textResponses.map(resp => [
          `"${resp.response_text.replace(/"/g, '""')}"`,
          new Date(resp.responded_at).toLocaleString(),
          resp.is_anonymous ? 'Yes' : 'No'
        ])
      ].map(row => row.join(',')).join('\n');
    } else {
      csvContent = [
        ['Option', 'Votes', 'Percentage'],
        ...options.map(opt => [
          opt.option_text,
          opt.vote_count.toString(),
          `${calculatePercentage(opt.vote_count)}%`
        ])
      ].map(row => row.join(',')).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poll-results-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCopyResults = () => {
    if (!pollData) return;

    let text: string;

    if (pollData.poll_type === 'text_response') {
      text = [
        `Poll: ${pollData.poll_question}`,
        '',
        'Responses:',
        ...textResponses.map((resp, idx) => 
          `${idx + 1}. ${resp.response_text} ${resp.is_anonymous ? '(Anonymous)' : ''}`
        ),
        '',
        `Total Responses: ${totalResponses}${totalStudents > 0 ? ` / ${totalStudents}` : ''} students`
      ].join('\n');
    } else {
      text = [
        `Poll: ${pollData.poll_question}`,
        '',
        'Results:',
        ...options.map(opt => 
          `${opt.option_text}: ${opt.vote_count} votes (${calculatePercentage(opt.vote_count)}%)`
        ),
        '',
        `Total Responses: ${totalResponses}${totalStudents > 0 ? ` / ${totalStudents}` : ''} students`
      ].join('\n');
    }

    navigator.clipboard.writeText(text);
    toast.success('Results copied to clipboard');
  };

  const calculatePercentage = (voteCount: number) => {
    if (totalResponses === 0) return 0;
    return Math.round((voteCount / totalResponses) * 100);
  };

  const participationPercentage = totalStudents > 0 
    ? Math.round((totalResponses / totalStudents) * 100)
    : 0;

  if (loading) {
    return <div className="p-4">Loading poll data...</div>;
  }

  if (!pollData) {
    return <div className="p-4">Poll not found</div>;
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="bg-[#D1FAE5] border-b-2 border-[#065F46]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[#065F46]">
              <BarChart3 className="h-5 w-5" />
              Poll: "{pollData.poll_question}"
            </CardTitle>
            <div className="flex gap-2">
              {pollData.is_closed ? (
                <Button size="sm" variant="outline" onClick={handleReopenPoll}>
                  <Unlock className="h-4 w-4 mr-2" />
                  Reopen Poll
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handleClosePoll}>
                  <Lock className="h-4 w-4 mr-2" />
                  Close Poll
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleResetVotes}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Votes
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Participation Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-semibold">PARTICIPATION:</span>
                <span className="text-lg">
                  {totalResponses} {totalStudents > 0 && `/ ${totalStudents}`} students ({participationPercentage}%)
                </span>
                {participationPercentage >= 70 ? (
                  <Badge variant="default" className="bg-green-500">✅ Good</Badge>
                ) : (
                  <Badge variant="secondary">⚠️ Low</Badge>
                )}
              </div>
            </div>

            {notVotedStudents.length > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm font-medium mb-1">⚠️ Not Yet Voted:</p>
                <p className="text-sm text-muted-foreground">
                  {notVotedStudents.slice(0, 7).join(', ')}
                  {notVotedStudents.length > 7 && ` and ${notVotedStudents.length - 7} more`}
                </p>
              </div>
            )}
          </div>

          <div className="border-t pt-4" />

          {/* Live Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">LIVE RESULTS</h3>
              <div className="flex items-center gap-2">
                <div className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">LIVE - Results updating automatically</span>
              </div>
            </div>

            {pollData.poll_type === 'text_response' ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {textResponses.length > 0 ? (
                  textResponses.map((response, idx) => (
                    <div key={response.id} className="p-4 border rounded-md bg-card">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Response #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(response.responded_at).toLocaleString()}
                          </span>
                          {response.is_anonymous && (
                            <Badge variant="secondary" className="text-xs">Anonymous</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{response.response_text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No responses yet
                  </div>
                )}
              </div>
            ) : (
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
          </div>

          <div className="border-t pt-4" />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowProjector(true)} className="flex-1">
              <Maximize2 className="h-4 w-4 mr-2" />
              Display on Projector
            </Button>
            <Button variant="outline" onClick={handleCopyResults}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Results
            </Button>
          </div>

          {/* Poll Settings Info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Anonymous Responses:</span>
              <Badge variant={pollData.allow_anonymous ? 'default' : 'secondary'}>
                {pollData.allow_anonymous ? '✅ Enabled' : '❌ Disabled'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Vote Changes:</span>
              <Badge variant={pollData.allow_change_vote ? 'default' : 'secondary'}>
                {pollData.allow_change_vote ? '✅ Allowed' : '❌ Not Allowed'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Poll Status:</span>
              <Badge variant={pollData.is_closed ? 'destructive' : 'default'}>
                {pollData.is_closed ? '🔴 Closed' : '🟢 Open'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projector Mode Dialog */}
      <Dialog open={showProjector} onOpenChange={setShowProjector}>
        <DialogContent className="max-w-full h-screen p-12">
          <button
            onClick={() => setShowProjector(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-center">{pollData.poll_question}</h1>
            <div className="w-full max-w-4xl space-y-6">
              {options.map((option) => {
                const percentage = calculatePercentage(option.vote_count);
                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex justify-between text-2xl">
                      <span className="font-medium">{option.option_text}</span>
                      <span>{percentage}% ({option.vote_count})</span>
                    </div>
                    <Progress value={percentage} className="h-8" />
                  </div>
                );
              })}
            </div>
            <p className="text-2xl text-muted-foreground">
              <Users className="inline h-6 w-6 mr-2" />
              {totalResponses} of {totalStudents} students voted
            </p>
            <p className="text-sm text-muted-foreground">[Press ESC to exit]</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
