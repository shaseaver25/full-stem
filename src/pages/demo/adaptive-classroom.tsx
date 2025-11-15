import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, User, CheckCircle, Clock, AlertCircle, Sparkles, Trash2, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { StudentAnalysisReviewModal } from '@/components/teacher/StudentAnalysisReviewModal'
import { useSeedDemoEnvironment } from '@/hooks/useSeedDemoEnvironment'
import { useInsertDemoSubmissions } from '@/hooks/useInsertDemoSubmissions'
import { Alert, AlertDescription } from '@/components/ui/alert'

const MASTERY_COLORS = {
  advanced: 'bg-green-500',
  proficient: 'bg-blue-500',
  developing: 'bg-yellow-500',
  emerging: 'bg-orange-500',
  'needs-support': 'bg-red-500'
}

const MASTERY_LABELS = {
  advanced: 'Advanced',
  proficient: 'Proficient',
  developing: 'Developing',
  emerging: 'Emerging',
  'needs-support': 'Needs Support'
}

export default function AdaptiveClassroomDemo() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [viewAsTeacher, setViewAsTeacher] = useState(true)
  
  // Demo seeding hook
  const { mutate: seedDemo, isPending: isSeeding } = useSeedDemoEnvironment()
  const { mutate: insertSubmissions, isPending: isInsertingSubmissions } = useInsertDemoSubmissions()

  // Fetch demo class by name instead of hardcoded ID
  const { data: demoClass, isLoading: isCheckingDemo } = useQuery({
    queryKey: ['demo-class'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*, teacher_profiles(*)')
        .eq('name', 'Demo Class - 5th Grade Science')
        .maybeSingle()
      
      if (error) throw error
      return data
    }
  })

  // Fetch students enrolled in the demo class
  const { data: demoStudents } = useQuery({
    queryKey: ['demo-students', demoClass?.id],
    enabled: !!demoClass?.id,
    queryFn: async () => {
      // First get class_students enrollments
      const { data: enrollments, error: enrollError } = await supabase
        .from('class_students')
        .select('*')
        .eq('class_id', demoClass!.id)
        .eq('status', 'active')
      
      if (enrollError) throw enrollError
      if (!enrollments || enrollments.length === 0) return []

      // Then fetch student details
      const studentIds = enrollments.map(e => e.student_id)
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds)
      
      if (studentsError) throw studentsError

      // Combine the data
      return enrollments.map(enrollment => ({
        ...enrollment,
        students: students?.find(s => s.id === enrollment.student_id)
      }))
    }
  })

  // Fetch demo assignments using the actual class ID
  const { data: assignments } = useQuery({
    queryKey: ['demo-assignments', demoClass?.id],
    enabled: !!demoClass?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_assignments_new')
        .select('*')
        .eq('class_id', demoClass!.id)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data || []
    }
  })

  // Fetch submissions with analyses
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['demo-submissions', assignments],
    enabled: !!assignments && assignments.length > 0,
    queryFn: async () => {
      const assignmentIds = assignments!.map(a => a.id)
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *
        `)
        .in('assignment_id', assignmentIds)
        .order('user_id', { ascending: true })
      
      if (error) throw error

      // Fetch students info
      const userIds = [...new Set(data.map(s => s.user_id))]
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name, user_id')
        .in('user_id', userIds)
      
      if (studentsError) throw studentsError

      // Fetch analyses
      const submissionIds = data.map(s => s.id)
      const { data: analyses, error: analysesError } = await supabase
        .from('submission_analyses')
        .select('*')
        .in('submission_id', submissionIds)
      
      if (analysesError) throw analysesError

      // Merge everything
      return data.map(submission => {
        const student = students?.find(s => s.user_id === submission.user_id)
        return {
          ...submission,
          student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown',
          student,
          analysis: analyses?.find(a => a.submission_id === submission.id)
        }
      })
    }
  })

  // Create demo students mutation
  const createDemoStudents = useMutation({
    mutationFn: async () => {
      // Get teacher profile ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (!teacherProfile) throw new Error('Teacher profile not found')
      
      // Call edge function
      const { data, error } = await supabase.functions.invoke('create-demo-students', {
        body: { teacherId: teacherProfile.id }
      })
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      toast({
        title: 'Success!',
        description: `Created ${data.data.students.length} students, 1 class, and 1 assignment`,
      })
      queryClient.invalidateQueries({ queryKey: ['demo-class'] })
      queryClient.invalidateQueries({ queryKey: ['demo-students'] })
      queryClient.invalidateQueries({ queryKey: ['demo-assignments'] })
      queryClient.invalidateQueries({ queryKey: ['demo-submissions'] })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const handleSeedDemo = () => {
    seedDemo(false)
  }

  const handleResetDemo = () => {
    if (confirm('⚠️ This will delete all existing demo data and create fresh data. Continue?')) {
      seedDemo(true)
    }
  }

  const getSubmissionsForAssignment = (assignmentId: string) => {
    return submissions?.filter(s => s.assignment_id === assignmentId) || []
  }

  const getMasteryLevel = (analysis: any): keyof typeof MASTERY_COLORS => {
    if (!analysis?.analysis_data) return 'needs-support'
    
    const data = typeof analysis.analysis_data === 'string' 
      ? JSON.parse(analysis.analysis_data) 
      : analysis.analysis_data
    
    return data.overall_mastery?.toLowerCase() || 'needs-support'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demo: Adaptive Classroom</h1>
          <p className="text-muted-foreground">
            {demoClass?.name || '5th Grade Science - Room 204'} • Ms. Sarah Johnson
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewAsTeacher(!viewAsTeacher)}
          >
            View as: {viewAsTeacher ? 'Teacher' : 'Student'}
          </Button>
          
          <Button
            onClick={() => createDemoStudents.mutate()}
            disabled={createDemoStudents.isPending}
          >
            {createDemoStudents.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Users className="h-4 w-4 mr-2" />
            Create Demo Students
          </Button>
          
          <Button
            onClick={handleSeedDemo}
            disabled={isSeeding}
          >
            {isSeeding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Seed Demo Data
          </Button>
          
          <Button
            variant="outline"
            onClick={() => insertSubmissions('3dd06368-5a45-47f0-a2d1-e3885994f8b9')}
            disabled={isInsertingSubmissions}
          >
            {isInsertingSubmissions && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Insert Submissions
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleResetDemo}
            disabled={isSeeding}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Demo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {demoStudents?.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions?.filter(s => s.analysis).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Tabs */}
      <Tabs defaultValue="demo_assignment_001" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {assignments?.map((assignment) => (
            <TabsTrigger key={assignment.id} value={assignment.id}>
              {assignment.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {assignments?.map((assignment) => (
          <TabsContent key={assignment.id} value={assignment.id} className="space-y-4">
            {/* Assignment Info */}
            <Card>
              <CardHeader>
                <CardTitle>{assignment.title}</CardTitle>
                <CardDescription>{assignment.instructions}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">
                    <span className="font-semibold">Assignment ID:</span>
                    <code>{assignment.id}</code>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {getSubmissionsForAssignment(assignment.id).filter(s => s.status === 'submitted').length} submitted
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {getSubmissionsForAssignment(assignment.id).filter(s => s.analysis).length} analyzed
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {demoStudents?.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No students enrolled yet. Click "Create Demo Students" to add students.
                  </div>
                ) : (
                  demoStudents?.map((enrollment: any) => {
                    const student = enrollment.students
                    const submission = getSubmissionsForAssignment(assignment.id).find(
                      s => s.user_id === student.user_id
                    )
                    const masteryLevel = submission ? getMasteryLevel(submission.analysis) : 'needs-support'
                    
                    return (
                      <Card
                        key={student.id}
                        className={submission ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}
                        onClick={() => submission && setSelectedStudent(submission)}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {student.first_name} {student.last_name}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {submission?.analysis ? (
                              <>
                                <div className={`h-2 w-full rounded-full ${MASTERY_COLORS[masteryLevel]}`} />
                                <Badge variant="outline" className="w-full justify-center">
                                  {MASTERY_LABELS[masteryLevel]}
                                </Badge>
                              </>
                            ) : (
                              <Badge variant="secondary" className="w-full justify-center">
                                Not Analyzed
                              </Badge>
                            )}
                            
                            <Badge
                              variant={submission?.status === 'submitted' ? 'default' : 'secondary'}
                              className="w-full justify-center"
                            >
                              {submission?.status === 'submitted' ? 'Submitted' : 
                               submission?.status === 'draft' ? 'Draft' : 'Not Started'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentAnalysisReviewModal
          submission={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onReviewed={() => {
            queryClient.invalidateQueries({ queryKey: ['demo-submissions'] })
            setSelectedStudent(null)
          }}
        />
      )}
    </div>
  )
}
