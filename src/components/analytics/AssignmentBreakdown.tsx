import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";

interface AssignmentData {
  id: string;
  title: string;
  averageGrade: number;
  submissionCount: number;
  classTitle: string;
}

interface AssignmentBreakdownProps {
  assignments: AssignmentData[];
}

const AssignmentBreakdown = ({ assignments }: AssignmentBreakdownProps) => {
  // Group assignments by class
  const assignmentsByClass = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.classTitle]) {
      acc[assignment.classTitle] = [];
    }
    acc[assignment.classTitle].push(assignment);
    return acc;
  }, {} as Record<string, AssignmentData[]>);

  const chartConfig = {
    averageGrade: {
      label: "Average Grade",
      color: "hsl(var(--primary))",
    },
  };

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assignment Performance</CardTitle>
          <CardDescription>No assignment data available yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(assignmentsByClass).map(([className, classAssignments]) => (
        <Card key={className}>
          <CardHeader>
            <CardTitle>{className}</CardTitle>
            <CardDescription>
              Assignment performance breakdown for this class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classAssignments}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value: any) => `${Number(value).toFixed(1)}%`}
                      />
                    }
                  />
                  <Bar
                    dataKey="averageGrade"
                    fill="var(--color-averageGrade)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Assignment Details Table */}
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-semibold">Assignment Details</h4>
              <div className="rounded-md border">
                <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 font-medium text-sm">
                  <div>Assignment</div>
                  <div className="text-center">Avg Grade</div>
                  <div className="text-center">Submissions</div>
                </div>
                {classAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="grid grid-cols-3 gap-4 p-3 border-t text-sm"
                  >
                    <div className="truncate">{assignment.title}</div>
                    <div className="text-center font-semibold">
                      {assignment.averageGrade.toFixed(1)}%
                    </div>
                    <div className="text-center">{assignment.submissionCount}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AssignmentBreakdown;
