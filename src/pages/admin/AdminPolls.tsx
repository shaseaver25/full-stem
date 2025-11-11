import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, Filter, BarChart3, Eye, Pencil, Trash2, Download, Calendar, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Poll {
  id: string;
  component_id: string;
  poll_question: string;
  poll_type: string;
  session_title: string | null;
  is_closed: boolean;
  allow_anonymous: boolean;
  show_results_timing: string;
  close_poll_at: string | null;
  created_at: string;
  creator_id: string;
  creator_name: string;
}

const AdminPolls = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [creatorFilter, setCreatorFilter] = useState<string>('all');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  
  const [selectedPolls, setSelectedPolls] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkCloseDialog, setShowBulkCloseDialog] = useState(false);
  const [pollToDelete, setPollToDelete] = useState<string | null>(null);

  const { data: polls, isLoading, error } = useQuery({
    queryKey: ['admin-polls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poll_components')
        .select(`
          *,
          lesson_components!inner(
            lesson_id,
            lessons!inner(
              class_id,
              classes!inner(
                teacher_id
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique creator IDs (teachers)
      const creatorIds = [...new Set(
        data.map((p: any) => p.lesson_components?.lessons?.classes?.teacher_id).filter(Boolean)
      )];
      
      // Fetch creator names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', creatorIds);

      const creatorMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      // Transform data
      return data.map((poll: any) => ({
        ...poll,
        creator_id: poll.lesson_components?.lessons?.classes?.teacher_id || '',
        creator_name: creatorMap.get(poll.lesson_components?.lessons?.classes?.teacher_id) || 'Unknown',
      })) as Poll[];
    },
  });

  // Fetch unique creators for filter
  const { data: creators } = useQuery({
    queryKey: ['poll-creators'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');
      return data || [];
    },
  });

  // Fetch unique sessions for filter
  const { data: sessions } = useQuery({
    queryKey: ['poll-sessions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('poll_components')
        .select('session_title')
        .not('session_title', 'is', null);
      
      const uniqueSessions = [...new Set(data?.map(d => d.session_title))];
      return uniqueSessions.filter(Boolean);
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading polls',
        description: 'Failed to fetch poll data. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const deletePollMutation = useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase
        .from('poll_components')
        .delete()
        .eq('id', pollId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-polls'] });
      toast({ title: 'Poll deleted successfully' });
      setSelectedPolls(prev => prev.filter(id => id !== pollToDelete));
    },
    onError: () => {
      toast({ title: 'Failed to delete poll', variant: 'destructive' });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (pollIds: string[]) => {
      const { error } = await supabase
        .from('poll_components')
        .delete()
        .in('id', pollIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-polls'] });
      toast({ title: `${selectedPolls.length} polls deleted` });
      setSelectedPolls([]);
    },
    onError: () => {
      toast({ title: 'Failed to delete polls', variant: 'destructive' });
    },
  });

  const bulkCloseMutation = useMutation({
    mutationFn: async (pollIds: string[]) => {
      const { error } = await supabase
        .from('poll_components')
        .update({ is_closed: true })
        .in('id', pollIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-polls'] });
      toast({ title: `${selectedPolls.length} polls closed` });
      setSelectedPolls([]);
    },
    onError: () => {
      toast({ title: 'Failed to close polls', variant: 'destructive' });
    },
  });

  const filteredPolls = polls?.filter((poll) => {
    const matchesSearch = 
      poll.poll_question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.session_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.creator_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'open' && !poll.is_closed) ||
      (statusFilter === 'closed' && poll.is_closed);
    
    const matchesCreator = 
      creatorFilter === 'all' || 
      poll.creator_id === creatorFilter;
    
    const matchesSession = 
      sessionFilter === 'all' || 
      poll.session_title === sessionFilter;
    
    const matchesDateFrom = 
      !dateFrom || 
      new Date(poll.created_at) >= new Date(dateFrom);
    
    const matchesDateTo = 
      !dateTo || 
      new Date(poll.created_at) <= new Date(dateTo);
    
    return matchesSearch && matchesStatus && matchesCreator && matchesSession && matchesDateFrom && matchesDateTo;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPolls(filteredPolls?.map(p => p.id) || []);
    } else {
      setSelectedPolls([]);
    }
  };

  const handleSelectPoll = (pollId: string, checked: boolean) => {
    if (checked) {
      setSelectedPolls(prev => [...prev, pollId]);
    } else {
      setSelectedPolls(prev => prev.filter(id => id !== pollId));
    }
  };

  const handleDelete = (pollId: string) => {
    setPollToDelete(pollId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (pollToDelete) {
      deletePollMutation.mutate(pollToDelete);
    }
    setShowDeleteDialog(false);
    setPollToDelete(null);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedPolls);
    setShowBulkDeleteDialog(false);
  };

  const confirmBulkClose = () => {
    bulkCloseMutation.mutate(selectedPolls);
    setShowBulkCloseDialog(false);
  };

  const exportToCSV = () => {
    if (!filteredPolls || filteredPolls.length === 0) {
      toast({ title: 'No polls to export', variant: 'destructive' });
      return;
    }

    const headers = ['Question', 'Creator', 'Session', 'Type', 'Status', 'Anonymous', 'Results Timing', 'Created'];
    const rows = filteredPolls.map(poll => [
      poll.poll_question,
      poll.creator_name,
      poll.session_title || 'N/A',
      poll.poll_type.replace('_', ' '),
      poll.is_closed ? 'Closed' : 'Open',
      poll.allow_anonymous ? 'Yes' : 'No',
      poll.show_results_timing.replace('_', ' '),
      new Date(poll.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polls-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: 'Polls exported successfully' });
  };

  const getPollTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'multiple_choice':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'single_choice':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rating':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">All Polls</h1>
            <p className="text-muted-foreground">Manage polls and gather feedback</p>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedPolls.length > 0 && (
          <Card className="mb-4 border-primary">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {selectedPolls.length} poll{selectedPolls.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkCloseDialog(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Close Selected
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowBulkDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search polls..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Creator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Creators</SelectItem>
                    {creators?.map((creator: any) => (
                      <SelectItem key={creator.id} value={creator.id}>
                        {creator.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sessionFilter} onValueChange={setSessionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    {sessions?.map((session: any) => (
                      <SelectItem key={session} value={session}>
                        {session}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    placeholder="From date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    placeholder="To date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Polls Table */}
        <Card>
          <CardHeader>
            <CardTitle>Polls ({filteredPolls?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredPolls && filteredPolls.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedPolls.length === filteredPolls.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Anonymous</TableHead>
                      <TableHead>Results</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolls.map((poll) => (
                      <TableRow key={poll.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPolls.includes(poll.id)}
                            onCheckedChange={(checked) => handleSelectPoll(poll.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="font-medium line-clamp-2">
                            {poll.poll_question}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{poll.creator_name}</span>
                        </TableCell>
                        <TableCell>
                          {poll.session_title && (
                            <Badge variant="outline" className="text-xs">
                              {poll.session_title}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getPollTypeColor(poll.poll_type)}
                          >
                            {poll.poll_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {poll.is_closed ? (
                            <Badge variant="secondary">Closed</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Open
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {poll.allow_anonymous ? (
                            <Badge variant="outline" className="text-xs">Yes</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">
                            {poll.show_results_timing.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(poll.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/polls/${poll.id}`)}
                              title="View poll"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/polls/${poll.id}/edit`)}
                              title="Edit poll"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(poll.id)}
                              title="Delete poll"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No polls found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Create one to get started!'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Poll</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this poll? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Polls</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedPolls.length} poll{selectedPolls.length > 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Close Confirmation Dialog */}
      <AlertDialog open={showBulkCloseDialog} onOpenChange={setShowBulkCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Selected Polls</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close {selectedPolls.length} poll{selectedPolls.length > 1 ? 's' : ''}? Students will no longer be able to vote.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkClose}>
              Close All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPolls;
