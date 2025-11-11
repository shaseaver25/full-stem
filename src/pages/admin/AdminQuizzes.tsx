import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Search, Filter, FileQuestion, Eye, Edit, Trash2, Download, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
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

interface QuizInstance {
  id: string;
  title: string;
  lesson_id: string;
  lesson_title: string;
  class_id: string;
  class_name: string;
  teacher_name: string;
  teacher_id: string;
  created_at: string;
  enabled: boolean;
  num_questions: number;
  attempts_count: number;
}

const AdminQuizzes = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherFilter, setTeacherFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  // Fetch all quiz instances
  const { data: quizzes, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-quiz-instances'],
    queryFn: async () => {
      console.log('Fetching quiz instances from lesson_components...');
      
      const { data, error } = await supabase
        .from('lesson_components')
        .select(`
          id,
          content,
          created_at,
          enabled,
          lesson_id,
          lessons!inner (
            id,
            title,
            class_id,
            classes!inner (
              id,
              name,
              teacher_id,
              teacher_profiles!inner (
                id,
                user_id,
                profiles!inner (
                  full_name
                )
              )
            )
          )
        `)
        .eq('component_type', 'quiz')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz instances:', error);
        throw error;
      }

      console.log('Raw quiz data:', data);

      // Transform the data
      const quizInstances: QuizInstance[] = data.map((item: any) => {
        const lesson = item.lessons;
        const classData = lesson?.classes;
        const teacherProfile = classData?.teacher_profiles;
        const profile = teacherProfile?.profiles;
        
        const quizData = item.content?.quizData || {};
        const questions = quizData.questions || [];

        return {
          id: item.id,
          title: item.content?.title || quizData.title || 'Untitled Quiz',
          lesson_id: lesson?.id || '',
          lesson_title: lesson?.title || 'Unknown Lesson',
          class_id: classData?.id || '',
          class_name: classData?.name || 'Unknown Class',
          teacher_id: teacherProfile?.user_id || '',
          teacher_name: profile?.full_name || 'Unknown Teacher',
          created_at: item.created_at,
          enabled: item.enabled ?? true,
          num_questions: questions.length,
          attempts_count: 0, // TODO: Count from quiz_attempts table when available
        };
      });

      console.log('Transformed quiz instances:', quizInstances);
      return quizInstances;
    },
  });

  // Fetch unique teachers for filter
  const { data: teachers } = useQuery({
    queryKey: ['quiz-teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_profiles')
        .select('id, user_id, profiles!inner(full_name)')
        .order('profiles(full_name)');

      if (error) throw error;
      return data;
    },
  });

  // Fetch unique classes for filter  
  const { data: classes } = useQuery({
    queryKey: ['quiz-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Delete quiz mutation
  const deleteMutation = useMutation({
    mutationFn: async (quizIds: string[]) => {
      const { error } = await supabase
        .from('lesson_components')
        .delete()
        .in('id', quizIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-instances'] });
      toast({
        title: 'Success',
        description: `${selectedQuizzes.length > 1 ? 'Quizzes' : 'Quiz'} deleted successfully`,
      });
      setSelectedQuizzes([]);
      setQuizToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete ${selectedQuizzes.length > 1 ? 'quizzes' : 'quiz'}: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Archive quiz mutation
  const archiveMutation = useMutation({
    mutationFn: async (quizIds: string[]) => {
      const { error } = await supabase
        .from('lesson_components')
        .update({ enabled: false })
        .in('id', quizIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-instances'] });
      toast({
        title: 'Success',
        description: `${selectedQuizzes.length > 1 ? 'Quizzes' : 'Quiz'} archived successfully`,
      });
      setSelectedQuizzes([]);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to archive ${selectedQuizzes.length > 1 ? 'quizzes' : 'quiz'}: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  if (error) {
    toast({
      title: 'Error loading quizzes',
      description: 'Failed to fetch quiz data. Please try again.',
      variant: 'destructive',
    });
  }

  const filteredQuizzes = quizzes?.filter((quiz) => {
    const matchesSearch = 
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.lesson_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.class_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTeacher = teacherFilter === 'all' || quiz.teacher_id === teacherFilter;
    const matchesClass = classFilter === 'all' || quiz.class_id === classFilter;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && quiz.enabled) ||
      (statusFilter === 'archived' && !quiz.enabled);
    
    return matchesSearch && matchesTeacher && matchesClass && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedQuizzes.length === filteredQuizzes?.length) {
      setSelectedQuizzes([]);
    } else {
      setSelectedQuizzes(filteredQuizzes?.map(q => q.id) || []);
    }
  };

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizzes(prev => 
      prev.includes(quizId) 
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    );
  };

  const handleBulkDelete = () => {
    deleteMutation.mutate(selectedQuizzes);
    setDeleteDialogOpen(false);
  };

  const handleBulkArchive = () => {
    archiveMutation.mutate(selectedQuizzes);
  };

  const handleExportCSV = () => {
    if (!filteredQuizzes || filteredQuizzes.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no quizzes matching your current filters.',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['Quiz Title', 'Teacher', 'Class', 'Lesson', 'Questions', 'Attempts', 'Status', 'Created'];
    const rows = filteredQuizzes.map(quiz => [
      quiz.title,
      quiz.teacher_name,
      quiz.class_name,
      quiz.lesson_title,
      quiz.num_questions.toString(),
      quiz.attempts_count.toString(),
      quiz.enabled ? 'Active' : 'Archived',
      new Date(quiz.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quizzes-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: `Exported ${filteredQuizzes.length} quizzes to CSV`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/admin/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Quiz Management</h1>
              <p className="text-muted-foreground">View and manage all quizzes across classes</p>
            </div>
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quizzes, lessons, or classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teachers</SelectItem>
                    {teachers?.map((teacher: any) => (
                      <SelectItem key={teacher.user_id} value={teacher.user_id}>
                        {teacher.profiles?.full_name || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes?.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedQuizzes.length > 0 && (
          <Card className="mb-4 border-primary">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  {selectedQuizzes.length} quiz{selectedQuizzes.length !== 1 ? 'zes' : ''} selected
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkArchive}
                    disabled={archiveMutation.isPending}
                    className="gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Archive Selected
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={deleteMutation.isPending}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Quizzes ({filteredQuizzes?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-12 w-12" />
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredQuizzes && filteredQuizzes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedQuizzes.length === filteredQuizzes.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Quiz Title</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuizzes.map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedQuizzes.includes(quiz.id)}
                            onCheckedChange={() => handleSelectQuiz(quiz.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {quiz.title}
                          <div className="text-xs text-muted-foreground mt-1">
                            {quiz.lesson_title}
                          </div>
                        </TableCell>
                        <TableCell>{quiz.teacher_name}</TableCell>
                        <TableCell>{quiz.class_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{quiz.num_questions}</TableCell>
                        <TableCell>{quiz.attempts_count}</TableCell>
                        <TableCell>
                          <Badge variant={quiz.enabled ? 'default' : 'secondary'}>
                            {quiz.enabled ? 'Active' : 'Archived'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/teacher/lesson-builder/${quiz.lesson_id}`)}
                              title="View Quiz"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/teacher/lesson-builder/${quiz.lesson_id}`)}
                              title="Edit Quiz"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setQuizToDelete(quiz.id);
                                setSelectedQuizzes([quiz.id]);
                                setDeleteDialogOpen(true);
                              }}
                              title="Delete Quiz"
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
                <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No quizzes found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || teacherFilter !== 'all' || classFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters' 
                    : 'No quizzes have been created yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedQuizzes.length > 1 ? `${selectedQuizzes.length} quizzes` : 'this quiz'}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminQuizzes;
