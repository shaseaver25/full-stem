import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, ClipboardList } from 'lucide-react';

interface MetricsOverviewProps {
  totalStudents: number;
  assignmentsDueThisWeek: number;
  averageEngagement: number;
}

export const MetricsOverview = ({
  totalStudents,
  assignmentsDueThisWeek,
  averageEngagement
}: MetricsOverviewProps) => {
  const metrics = [
    {
      title: 'Total Students',
      value: totalStudents,
      subtitle: 'Across all classes',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Assignments Due',
      value: assignmentsDueThisWeek,
      subtitle: 'This week',
      icon: ClipboardList,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Student Engagement',
      value: `${averageEngagement}%`,
      subtitle: 'Average completion rate',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
