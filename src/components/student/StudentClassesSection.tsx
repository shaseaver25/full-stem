import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookOpen, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentClasses, EnrolledClass } from '@/hooks/useStudentClasses';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClassWithStats extends EnrolledClass {
  completedAssignments: number;
  totalAssignments: number;
}

export const StudentClassesSection = () => {
  const navigate = useNavigate();
  const { data: enrolledClasses = [], isLoading } = useStudentClasses();

  // Fetch assignment stats for all enrolled classes
  const { data: classStats = {} } = useQuery({
    queryKey: ['class-assignment-stats', enrolledClasses.map(c => c.class_id)],
    queryFn: async () => {
      if (enrolledClasses.length === 0) return {};

      const stats: Record<string, { completed: number; total: number }> = {};

      await Promise.all(
        enrolledClasses.map(async (enrollment) => {
          // Get all assignments for this class
          const { data: assignments } = await supabase
            .from('class_assignments_new')
            .select('id')
            .eq('class_id', enrollment.class_id);

          const assignmentIds = assignments?.map(a => a.id) || [];

          if (assignmentIds.length === 0) {
            stats[enrollment.class_id] = { completed: 0, total: 0 };
            return;
          }

          // Get submission statuses for these assignments
          const { data: submissions } = await supabase
            .from('assignment_submissions')
            .select('status')
            .in('assignment_id', assignmentIds);

          const completed = submissions?.filter(
            s => s.status === 'submitted' || s.status === 'graded'
          ).length || 0;

          stats[enrollment.class_id] = {
            completed,
            total: assignmentIds.length
          };
        })
      );

      return stats;
    },
    enabled: enrolledClasses.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">My Classes</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="min-w-[320px] h-[180px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (enrolledClasses.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">My Classes</h2>
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={BookOpen}
              title="No classes yet"
              description="You're not enrolled in any classes yet. Ask your teacher to add you!"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const classesWithStats: ClassWithStats[] = enrolledClasses.map((enrollment) => ({
    ...enrollment,
    completedAssignments: classStats[enrollment.class_id]?.completed || 0,
    totalAssignments: classStats[enrollment.class_id]?.total || 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My Classes</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/classes/my-classes')}
        >
          View All
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {classesWithStats.map((classItem) => {
          const completionRate =
            classItem.totalAssignments > 0
              ? Math.round((classItem.completedAssignments / classItem.totalAssignments) * 100)
              : 0;

          const teacherName = classItem.teacher
            ? `${classItem.teacher.first_name} ${classItem.teacher.last_name}`.trim() || 'Instructor'
            : 'Instructor';

          return (
            <Card
              key={classItem.class_id}
              className="min-w-[320px] hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/classes/${classItem.class_id}`)}
            >
              <CardContent className="p-6 space-y-4">
                {/* Class Header */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {classItem.classes.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {teacherName}
                    </p>
                  </div>
                </div>

                {/* Class Info */}
                <div className="space-y-2">
                  {classItem.classes.subject && (
                    <p className="text-sm text-muted-foreground">
                      Subject: {classItem.classes.subject}
                    </p>
                  )}
                  {classItem.classes.grade_level && (
                    <p className="text-sm text-muted-foreground">
                      Grade: {classItem.classes.grade_level}
                    </p>
                  )}
                </div>

                {/* Assignment Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Assignments</span>
                    <span className="font-medium">
                      {classItem.completedAssignments} / {classItem.totalAssignments}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {completionRate}% complete
                  </p>
                </div>

                {/* View Class Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/classes/${classItem.class_id}`);
                  }}
                >
                  View Class
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
