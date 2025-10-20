import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, TrendingUp, Award, Target, Volume2, Languages, BookOpen } from 'lucide-react';

interface StudentDashboardHeaderProps {
  firstName: string;
  lastName: string;
  stats: {
    completionRate: string;
    averageGrade: string;
    submittedCount: number;
    totalAssignments: number;
  } | null;
  readingLevel?: string | null;
  languagePreference?: string | null;
  iepAccommodations?: string[] | null;
}

export function StudentDashboardHeader({
  firstName,
  lastName,
  stats,
  readingLevel,
  languagePreference,
  iepAccommodations,
}: StudentDashboardHeaderProps) {
  const initials = `${firstName[0]}${lastName[0]}`;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="pt-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {firstName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's your learning progress and goals
              </p>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-3 py-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">{stats.completionRate}%</span>
                  <span className="text-muted-foreground">Progress</span>
                </Badge>

                <Badge variant="secondary" className="px-3 py-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="font-medium">{stats.averageGrade}%</span>
                  <span className="text-muted-foreground">Avg Grade</span>
                </Badge>

                <Badge variant="secondary" className="px-3 py-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">{stats.submittedCount}/{stats.totalAssignments}</span>
                  <span className="text-muted-foreground">Completed</span>
                </Badge>
              </div>
            )}

            {/* Support Mode Badges */}
            <div className="flex flex-wrap gap-2">
              {readingLevel && (
                <Badge variant="outline" className="gap-1">
                  <BookOpen className="h-3 w-3" />
                  Reading: {readingLevel}
                </Badge>
              )}
              {languagePreference && languagePreference !== 'en' && (
                <Badge variant="outline" className="gap-1">
                  <Languages className="h-3 w-3" />
                  {languagePreference.toUpperCase()}
                </Badge>
              )}
              {iepAccommodations && iepAccommodations.length > 0 && (
                <Badge variant="outline" className="gap-1">
                  <User className="h-3 w-3" />
                  IEP Accommodations
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}