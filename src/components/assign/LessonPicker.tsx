import { useState } from 'react';
import { Search, BookOpen, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLessons } from '@/hooks/useClassManagement';
import type { Lesson } from '@/types/assignmentTypes';

interface LessonPickerProps {
  selectedLessonId?: number;
  onLessonSelect: (lesson: Lesson) => void;
}

export function LessonPicker({ selectedLessonId, onLessonSelect }: LessonPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');

  const { data: lessons = [], isLoading } = useLessons();

  // Get unique subjects and tracks for filtering
  const subjects = Array.from(new Set(lessons.map(l => l.subject).filter(Boolean)));
  const tracks = Array.from(new Set(lessons.map(l => l.track).filter(Boolean)));

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = !searchTerm || 
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = subjectFilter === 'all' || lesson.subject === subjectFilter;
    const matchesTrack = trackFilter === 'all' || lesson.track === trackFilter;

    return matchesSearch && matchesSubject && matchesTrack;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search lessons by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject!}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={trackFilter} onValueChange={setTrackFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tracks</SelectItem>
              {tracks.map(track => (
                <SelectItem key={track} value={track!}>
                  {track}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-muted-foreground">
        {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''} found
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-lg font-medium text-muted-foreground">No lessons found</div>
          <div className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria.
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map(lesson => (
            <Card
              key={lesson.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedLessonId === lesson.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:ring-1 hover:ring-border'
              }`}
              onClick={() => onLessonSelect(lesson)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base leading-tight">
                  {lesson.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {lesson.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {lesson.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-1">
                  {lesson.subject && (
                    <Badge variant="secondary" className="text-xs">
                      {lesson.subject}
                    </Badge>
                  )}
                  {lesson.grade_level && (
                    <Badge variant="outline" className="text-xs">
                      Grade {lesson.grade_level}
                    </Badge>
                  )}
                  {lesson.track && (
                    <Badge variant="outline" className="text-xs">
                      {lesson.track}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}