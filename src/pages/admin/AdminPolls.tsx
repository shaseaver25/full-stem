import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, Filter, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
}

const AdminPolls = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: polls, isLoading, error } = useQuery({
    queryKey: ['admin-polls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('poll_components')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Poll[];
    },
  });

  if (error) {
    toast({
      title: 'Error loading polls',
      description: 'Failed to fetch poll data. Please try again.',
      variant: 'destructive',
    });
  }

  const filteredPolls = polls?.filter((poll) => {
    const matchesSearch = 
      poll.poll_question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.session_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'open' && !poll.is_closed) ||
      (statusFilter === 'closed' && poll.is_closed);
    return matchesSearch && matchesStatus;
  });

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

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
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
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
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
                      <TableHead>Question</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Anonymous</TableHead>
                      <TableHead>Results</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolls.map((poll) => (
                      <TableRow key={poll.id}>
                        <TableCell className="max-w-md">
                          <div className="font-medium line-clamp-2">
                            {poll.poll_question}
                          </div>
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
    </div>
  );
};

export default AdminPolls;
