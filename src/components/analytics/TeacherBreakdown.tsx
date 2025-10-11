import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface TeacherStats {
  teacher_id: string;
  name: string;
  classCount: number;
  averageGrade: number;
  completionRate: number;
  totalSubmissions: number;
}

interface TeacherBreakdownProps {
  teachers: TeacherStats[];
}

const TeacherBreakdown = ({ teachers }: TeacherBreakdownProps) => {
  const getPerformanceBadge = (grade: number) => {
    if (grade >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (grade >= 80) return <Badge className="bg-blue-500">Good</Badge>;
    if (grade >= 70) return <Badge className="bg-yellow-500">Average</Badge>;
    return <Badge variant="destructive">Needs Support</Badge>;
  };

  const sortedTeachers = [...teachers].sort((a, b) => b.averageGrade - a.averageGrade);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead className="text-center">Classes</TableHead>
              <TableHead className="text-center">Submissions</TableHead>
              <TableHead>Average Grade</TableHead>
              <TableHead>Completion Rate</TableHead>
              <TableHead>Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTeachers.map((teacher) => (
              <TableRow key={teacher.teacher_id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell className="text-center">{teacher.classCount}</TableCell>
                <TableCell className="text-center">{teacher.totalSubmissions}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {teacher.averageGrade.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={teacher.averageGrade} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {teacher.completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={teacher.completionRate} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>{getPerformanceBadge(teacher.averageGrade)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {teachers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No teacher data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherBreakdown;
