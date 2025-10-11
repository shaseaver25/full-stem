import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, GraduationCap, BookOpen, TrendingUp, FileCheck } from "lucide-react";

interface AnalyticsData {
  teachers: any[];
  totalStudents: number;
  totalClasses: number;
  overallAverage: number;
  totalSubmissions: number;
}

interface SchoolOverviewProps {
  analyticsData: AnalyticsData;
}

const SchoolOverview = ({ analyticsData }: SchoolOverviewProps) => {
  const { teachers, totalStudents, totalClasses, overallAverage, totalSubmissions } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">School Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAverage.toFixed(1)}%</div>
            <Progress value={overallAverage} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Teachers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...teachers]
              .sort((a, b) => b.averageGrade - a.averageGrade)
              .slice(0, 5)
              .map((teacher, index) => (
                <div key={teacher.teacher_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.classCount} {teacher.classCount === 1 ? 'class' : 'classes'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{teacher.averageGrade.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">avg grade</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Excellent (90-100%)', count: teachers.filter(t => t.averageGrade >= 90).length, color: 'bg-green-500' },
              { label: 'Good (80-89%)', count: teachers.filter(t => t.averageGrade >= 80 && t.averageGrade < 90).length, color: 'bg-blue-500' },
              { label: 'Average (70-79%)', count: teachers.filter(t => t.averageGrade >= 70 && t.averageGrade < 80).length, color: 'bg-yellow-500' },
              { label: 'Below Average (<70%)', count: teachers.filter(t => t.averageGrade < 70).length, color: 'bg-red-500' },
            ].map((range) => {
              const percentage = teachers.length > 0 ? (range.count / teachers.length) * 100 : 0;
              return (
                <div key={range.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{range.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {range.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${range.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolOverview;
