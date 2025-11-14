import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, User, CheckCircle, Clock, AlertCircle, Sparkles, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { StudentAnalysisReviewModal } from '@/components/teacher/StudentAnalysisReviewModal'
import { useSeedDemoEnvironment } from '@/hooks/useSeedDemoEnvironment'
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

  // Check if demo data exists
  const { data: demoClass, isLoading: isCheckingDemo } = useQuery({
    queryKey: ['demo-class'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', 'demo_class_001')
        .single()
      
      if (error) throw error
      return data
    }
  })

  // Fetch demo assignments
  const { data: assignments } = useQuery({
    queryKey: ['demo-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_assignments_new')
        .select('*')
        .eq('class_id', 'demo_class_001')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    }
  })

  // Fetch submissions with analyses
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['demo-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *
        `)
        .in('assignment_id', ['demo_assignment_001', 'demo_assignment_002', 'demo_assignment_003'])
        .order('user_id', { ascending: true })
      
      if (error) throw error

      // Fetch students info
      const userIds = [...new Set(data.map(s => s.user_id))]
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name, user_id')
        .in('id', userIds)
      
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
        const student = students?.find(s => s.id === submission.user_id)
        return {
          ...submission,
          student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown',
          student,
          analysis: analyses?.find(a => a.submission_id === submission.id)
        }
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
            onClick={handleSeedDemo}
            disabled={isSeeding}
          >
            {isSeeding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Seed Demo Data
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
              {[...new Set(submissions?.map(s => s.user_id))].length || 0}
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
              </CardContent>
            </Card>

            {/* Student Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {getSubmissionsForAssignment(assignment.id).map((submission) => {
                  const masteryLevel = getMasteryLevel(submission.analysis)
                  
                  return (
                    <Card
                      key={submission.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedStudent(submission)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {submission.student_name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {submission.analysis ? (
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
                            variant={submission.status === 'submitted' ? 'default' : 'secondary'}
                            className="w-full justify-center"
                          >
                            {submission.status === 'submitted' ? 'Submitted' : 'Draft'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
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
