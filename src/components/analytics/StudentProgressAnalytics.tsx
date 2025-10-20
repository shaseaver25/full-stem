import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Clock,
  Award,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface StudentAnalytics {
  student_id: string;
  student_name: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  average_grade: number;
  time_spent: number;
  last_activity: string;
  engagement_score: number;
}

interface ClassAnalytics {
  class_id: string;
  class_name: string;
  total_students: number;
  average_progress: number;
  completion_rate: number;
  engagement_metrics: {
    high: number;
    medium: number;
    low: number;
  };
}

const StudentProgressAnalytics: React.FC<{ classId: string }> = ({ classId }) => {
  const [analytics, setAnalytics] = useState<StudentAnalytics[]>([]);
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [exportFormat, setExportFormat] = useState('pdf');

  useEffect(() => {
    fetchAnalytics();
  }, [classId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch enrolled students for this class
      const { data: enrolledStudents, error: enrollmentError } = await supabase
        .from('class_students')
        .select('student_id')
        .eq('class_id', classId)
        .eq('status', 'active');

      if (enrollmentError) throw enrollmentError;

      if (!enrolledStudents || enrolledStudents.length === 0) {
        setAnalytics([]);
        setClassAnalytics({
          class_id: classId,
          class_name: 'Current Class',
          total_students: 0,
          average_progress: 0,
          completion_rate: 0,
          engagement_metrics: { high: 0, medium: 0, low: 0 }
        });
        setLoading(false);
        return;
      }

      // Get student details
      const studentIds = enrolledStudents.map(e => e.student_id);
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name, user_id')
        .in('id', studentIds);

      if (studentsError) throw studentsError;

      // Get all assignments for this class
      const { data: assignments, error: assignmentsError } = await supabase
        .from('class_assignments_new')
        .select('id')
        .eq('class_id', classId);

      if (assignmentsError) throw assignmentsError;

      const assignmentIds = assignments?.map(a => a.id) || [];
      
      // Fetch submission data for all students
      let submissionsData: any[] = [];
      if (assignmentIds.length > 0 && studentsData) {
        const userIds = studentsData.map(s => s.user_id).filter(Boolean);
        if (userIds.length > 0) {
          const { data: subs, error: subsError } = await supabase
            .from('assignment_submissions')
            .select('*')
            .in('assignment_id', assignmentIds)
            .in('user_id', userIds);

          if (!subsError) {
            submissionsData = subs || [];
          }
        }
      }

      // Fetch grades data
      let gradesData: any[] = [];
      const submissionIds = submissionsData.map(s => s.id);
      if (submissionIds.length > 0) {
        const { data: grades, error: gradesError } = await supabase
          .from('assignment_grades')
          .select('*')
          .in('submission_id', submissionIds);

        if (!gradesError) {
          gradesData = grades || [];
        }
      }

      // Process analytics data
      const studentAnalytics = processStudentAnalytics(
        studentsData || [],
        submissionsData,
        gradesData,
        assignmentIds.length
      );
      setAnalytics(studentAnalytics);

      // Calculate class-level analytics
      const classStats = calculateClassAnalytics(studentAnalytics);
      setClassAnalytics(classStats);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processStudentAnalytics = (
    studentsData: any[],
    submissionsData: any[], 
    gradesData: any[],
    totalAssignments: number
  ): StudentAnalytics[] => {
    return studentsData.map(student => {
      const studentId = student.id;
      const studentName = `${student.first_name} ${student.last_name}`;
      
      // Get submissions for this student
      const studentSubmissions = submissionsData.filter(s => s.user_id === student.user_id);
      const completedSubmissions = studentSubmissions.filter(s => 
        s.status === 'submitted' || s.status === 'graded'
      );

      // Get grades for this student's submissions
      const studentGrades = gradesData.filter(g => 
        studentSubmissions.some(s => s.id === g.submission_id)
      );

      const avgGrade = studentGrades.length > 0
        ? Math.round(studentGrades.reduce((sum, g) => sum + (g.grade || 0), 0) / studentGrades.length)
        : 0;

      const progressPercentage = totalAssignments > 0
        ? Math.round((completedSubmissions.length / totalAssignments) * 100)
        : 0;

      // Calculate last activity
      const lastActivity = studentSubmissions.length > 0
        ? studentSubmissions.reduce((latest, s) => 
            new Date(s.updated_at) > new Date(latest) ? s.updated_at : latest
          , studentSubmissions[0].updated_at)
        : new Date().toISOString();

      const engagementScore = calculateEngagementScore({
        progress_percentage: progressPercentage,
        grades: studentGrades.map(g => g.grade || 0),
        time_spent: 0, // We don't track time yet
        last_activity: lastActivity
      });

      return {
        student_id: studentId,
        student_name: studentName,
        total_lessons: totalAssignments,
        completed_lessons: completedSubmissions.length,
        progress_percentage: progressPercentage,
        average_grade: avgGrade,
        time_spent: 0, // Not tracked yet
        last_activity: lastActivity,
        engagement_score: engagementScore
      };
    });
  };

  const calculateEngagementScore = (student: any): number => {
    const progressWeight = 0.4;
    const gradeWeight = 0.3;
    const timeWeight = 0.2;
    const recentActivityWeight = 0.1;

    const progressScore = student.progress_percentage;
    const gradeScore = student.grades.length > 0 ? 
      student.grades.reduce((a: number, b: number) => a + b, 0) / student.grades.length : 0;
    const timeScore = Math.min(student.time_spent / 3600, 100); // Cap at 100 hours
    const recentActivityScore = isRecentActivity(student.last_activity) ? 100 : 50;

    return Math.round(
      progressScore * progressWeight +
      gradeScore * gradeWeight +
      timeScore * timeWeight +
      recentActivityScore * recentActivityWeight
    );
  };

  const isRecentActivity = (lastActivity: string): boolean => {
    const lastActivityDate = new Date(lastActivity);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastActivityDate > weekAgo;
  };

  const calculateClassAnalytics = (studentAnalytics: StudentAnalytics[]): ClassAnalytics => {
    const totalStudents = studentAnalytics.length;
    const averageProgress = totalStudents > 0 ? 
      Math.round(studentAnalytics.reduce((sum, student) => sum + student.progress_percentage, 0) / totalStudents) : 0;
    const completedStudents = studentAnalytics.filter(s => s.progress_percentage === 100).length;
    const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

    const engagementMetrics = {
      high: studentAnalytics.filter(s => s.engagement_score >= 80).length,
      medium: studentAnalytics.filter(s => s.engagement_score >= 50 && s.engagement_score < 80).length,
      low: studentAnalytics.filter(s => s.engagement_score < 50).length
    };

    return {
      class_id: classId,
      class_name: 'Current Class',
      total_students: totalStudents,
      average_progress: averageProgress,
      completion_rate: completionRate,
      engagement_metrics: engagementMetrics
    };
  };

  const exportAnalytics = async () => {
    try {
      const exportData = {
        classAnalytics,
        studentAnalytics: analytics,
        exportDate: new Date().toISOString(),
        timeRange
      };

      if (exportFormat === 'csv') {
        exportToCSV(exportData);
      } else {
        exportToPDF(exportData);
      }

      toast({
        title: "Export Successful",
        description: `Analytics exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = (data: any) => {
    const csvContent = [
      ['Student Name', 'Progress %', 'Average Grade', 'Time Spent (hours)', 'Engagement Score', 'Last Activity'],
      ...data.studentAnalytics.map((student: StudentAnalytics) => [
        student.student_name,
        student.progress_percentage,
        student.average_grade,
        Math.round(student.time_spent / 3600 * 100) / 100,
        student.engagement_score,
        new Date(student.last_activity).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (data: any) => {
    // Simple PDF export - in a real app, you'd use a library like jsPDF
    const printContent = `
      <h1>Student Analytics Report</h1>
      <p>Export Date: ${new Date().toLocaleDateString()}</p>
      <p>Time Range: ${timeRange}</p>
      <h2>Class Overview</h2>
      <p>Total Students: ${data.classAnalytics?.total_students}</p>
      <p>Average Progress: ${data.classAnalytics?.average_progress}%</p>
      <p>Completion Rate: ${data.classAnalytics?.completion_rate}%</p>
      <h2>Student Details</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th>Student Name</th>
          <th>Progress %</th>
          <th>Average Grade</th>
          <th>Engagement Score</th>
        </tr>
        ${data.studentAnalytics.map((student: StudentAnalytics) => `
          <tr>
            <td>${student.student_name}</td>
            <td>${student.progress_percentage}%</td>
            <td>${student.average_grade}%</td>
            <td>${student.engagement_score}</td>
          </tr>
        `).join('')}
      </table>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const chartData = analytics.map(student => ({
    name: student.student_name.split(' ')[0],
    progress: student.progress_percentage,
    grade: student.average_grade,
    engagement: student.engagement_score
  }));

  const engagementData = classAnalytics ? [
    { name: 'High Engagement', value: classAnalytics.engagement_metrics.high, color: '#10B981' },
    { name: 'Medium Engagement', value: classAnalytics.engagement_metrics.medium, color: '#F59E0B' },
    { name: 'Low Engagement', value: classAnalytics.engagement_metrics.low, color: '#EF4444' }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Student Progress Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into student performance and engagement</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classAnalytics?.total_students || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active learners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classAnalytics?.average_progress || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Class completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classAnalytics?.completion_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Students completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Engagement</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classAnalytics?.engagement_metrics.high || 0}</div>
            <p className="text-xs text-muted-foreground">
              Highly engaged students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Progress Overview</CardTitle>
            <CardDescription>Progress and grade comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="progress" fill="#3B82F6" name="Progress %" />
                <Bar dataKey="grade" fill="#10B981" name="Average Grade %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Distribution</CardTitle>
            <CardDescription>Student engagement levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Student Progress</CardTitle>
          <CardDescription>Detailed breakdown of each student's performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.map((student) => (
              <div key={student.student_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <h3 className="font-semibold">{student.student_name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant={student.progress_percentage >= 80 ? "default" : student.progress_percentage >= 50 ? "secondary" : "destructive"}>
                      {student.progress_percentage}% Complete
                    </Badge>
                    <Badge variant="outline">
                      Grade: {student.average_grade}%
                    </Badge>
                    <Badge variant="outline">
                      {Math.round(student.time_spent / 3600)} hours
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Engagement:</span>
                    <Badge variant={student.engagement_score >= 80 ? "default" : student.engagement_score >= 50 ? "secondary" : "destructive"}>
                      {student.engagement_score}
                    </Badge>
                  </div>
                  <Progress value={student.progress_percentage} className="w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProgressAnalytics;
