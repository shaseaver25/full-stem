import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Lightbulb, 
  FileEdit,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { useStudentProfiles, StudentWithProfile } from '@/hooks/useStudentProfiles';
import { useClasses } from '@/hooks/useClasses';
import { StudentProfileRenderer } from '@/components/profile/StudentProfileRenderer';
import { LEARNING_STYLES, INTERESTS, MOTIVATION_TRIGGERS } from '@/types/surveyTypes';

export const StudentProfilesView: React.FC = () => {
  const { students, loading, fetchStudentProfiles, generateProjectIdea, suggestAssignmentModifications } = useStudentProfiles();
  const { data: classes, isLoading: classesLoading } = useClasses();
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithProfile | null>(null);
  const [generatedContent, setGeneratedContent] = useState<{ type: 'project' | 'modification'; content: string } | null>(null);

  useEffect(() => {
    fetchStudentProfiles(selectedClass === 'all' ? undefined : selectedClass);
  }, [selectedClass, fetchStudentProfiles]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'completed' && student.survey_completed) ||
      (filterStatus === 'pending' && !student.survey_completed);

    return matchesSearch && matchesFilter;
  });

  const handleGenerateProject = async (student: StudentWithProfile) => {
    const content = await generateProjectIdea(student);
    setGeneratedContent({ type: 'project', content });
  };

  const handleSuggestModifications = async (student: StudentWithProfile) => {
    const content = await suggestAssignmentModifications(student);
    setGeneratedContent({ type: 'modification', content });
  };

  const getProfileSummary = (student: StudentWithProfile) => {
    if (!student.profile) return null;

    const { learning_styles, top_interests, motivation_triggers } = student.profile;
    
    return {
      primaryStyle: learning_styles[0] ? LEARNING_STYLES[learning_styles[0] as keyof typeof LEARNING_STYLES] : 'Unknown',
      topInterest: top_interests[0] ? INTERESTS[top_interests[0] as keyof typeof INTERESTS] : 'Unknown',
      motivation: motivation_triggers[0] ? MOTIVATION_TRIGGERS[motivation_triggers[0] as keyof typeof MOTIVATION_TRIGGERS] : 'Unknown'
    };
  };

  if (loading || classesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading student profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Learning Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="completed">Survey Completed</SelectItem>
                <SelectItem value="pending">Survey Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          const summary = getProfileSummary(student);
          
          return (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <h3 className="font-semibold">
                      {student.profile?.preferred_name || `${student.first_name} ${student.last_name}`}
                    </h3>
                  </div>
                  {student.survey_completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {student.class_name} • {student.grade_level}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {student.survey_completed && summary ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Learning Style</p>
                      <Badge variant="outline" className="text-xs">
                        {summary.primaryStyle}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Top Interest</p>
                      <Badge variant="outline" className="text-xs">
                        {summary.topInterest}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Motivation</p>
                      <Badge variant="outline" className="text-xs">
                        {summary.motivation}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedStudent(student)}>
                            <Eye className="h-3 w-3 mr-1" />
                            View Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Learning Profile</DialogTitle>
                          </DialogHeader>
                          {selectedStudent?.profile && (
                            <StudentProfileRenderer
                              profileData={selectedStudent.profile}
                              studentName={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                              onGenerateProject={() => handleGenerateProject(selectedStudent)}
                              onSuggestModifications={() => handleSuggestModifications(selectedStudent)}
                              onTranslateMaterials={() => {
                                // TODO: Implement translation feature
                                console.log('Translation feature to be implemented');
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGenerateProject(student)}
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Project
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSuggestModifications(student)}
                      >
                        <FileEdit className="h-3 w-3 mr-1" />
                        Modify
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Survey not completed
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ask student to complete the Learning Genius survey
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No students in the selected class yet.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Generated Content Dialog */}
      <Dialog open={!!generatedContent} onOpenChange={() => setGeneratedContent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {generatedContent?.type === 'project' ? 'Generated Project Idea' : 'Assignment Modifications'}
            </DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm">
            {generatedContent?.content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};