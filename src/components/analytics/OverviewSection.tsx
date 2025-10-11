import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Users, FileCheck, TrendingUp } from "lucide-react";

interface ClassStats {
  id: string;
  title: string;
  averageGrade: number;
  completionRate: number;
  totalStudents: number;
  totalSubmissions: number;
}

interface OverviewSectionProps {
  classStats: ClassStats[];
}

const OverviewSection = ({ classStats }: OverviewSectionProps) => {
  const totalStudents = classStats.reduce((sum, c) => sum + c.totalStudents, 0);
  const totalSubmissions = classStats.reduce((sum, c) => sum + c.totalSubmissions, 0);
  const overallAverage = classStats.length > 0
    ? classStats.reduce((sum, c) => sum + c.averageGrade, 0) / classStats.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classStats.length}</div>
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
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAverage.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Class Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classStats.map((classItem) => (
          <Card key={classItem.id}>
            <CardHeader>
              <CardTitle className="text-lg">{classItem.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Average Grade</span>
                  <span className="font-semibold">{classItem.averageGrade.toFixed(1)}%</span>
                </div>
                <Progress value={classItem.averageGrade} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-semibold">{classItem.completionRate.toFixed(0)}%</span>
                </div>
                <Progress value={classItem.completionRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Students</p>
                  <p className="text-lg font-semibold">{classItem.totalStudents}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submissions</p>
                  <p className="text-lg font-semibold">{classItem.totalSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OverviewSection;
