import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, TrendingUp, Award, Clock } from "lucide-react";

interface StudentData {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  classes: ClassData[];
}

interface ClassData {
  id: string;
  title: string;
  submissions: SubmissionData[];
}

interface SubmissionData {
  grade: number;
  assignment_title: string;
  submitted_at: string;
}

interface ParentStudentOverviewProps {
  studentData: StudentData;
  preferredLanguage: string;
}

const ParentStudentOverview = ({ studentData, preferredLanguage }: ParentStudentOverviewProps) => {
  // Calculate overall statistics
  const allSubmissions = studentData.classes.flatMap(c => c.submissions);
  const totalSubmissions = allSubmissions.length;
  const averageGrade = totalSubmissions > 0
    ? allSubmissions.reduce((sum, s) => sum + s.grade, 0) / totalSubmissions
    : 0;

  const recentSubmissions = [...allSubmissions]
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grade Level</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.grade_level}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.classes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGrade.toFixed(1)}%</div>
            <Progress value={averageGrade} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Class Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Class Performance</CardTitle>
          <CardDescription>
            {studentData.first_name}'s performance across all classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studentData.classes.map((classItem) => {
              const classAverage = classItem.submissions.length > 0
                ? classItem.submissions.reduce((sum, s) => sum + s.grade, 0) / classItem.submissions.length
                : 0;

              return (
                <div key={classItem.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{classItem.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {classItem.submissions.length} submission{classItem.submissions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{classAverage.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">average</p>
                    </div>
                  </div>
                  <Progress value={classAverage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest assignments completed</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet</p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((submission, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{submission.assignment_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{submission.grade}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentStudentOverview;
