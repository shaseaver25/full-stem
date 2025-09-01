import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, BookOpen, Users, TrendingUp, Calendar } from 'lucide-react';
import { useUnifiedGradebook } from '@/hooks/useUnifiedGradebook';
import Gradebook from './Gradebook';
import AssignmentGradebook from './AssignmentGradebook';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Class {
  id: string;
  name: string;
  grade_level: string;
  subject: string;
}

const UnifiedGradebook = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [loadingClasses, setLoadingClasses] = useState(true);

  const {
    unifiedStudents,
    overview,
    loading,
    traditionalGradebook,
    assignmentGradebook,
    exportUnifiedCSV
  } = useUnifiedGradebook(selectedClassId);

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;
      
      setLoadingClasses(true);
      try {
        const { data, error } = await supabase
          .from('classes')
          .select(`
            id,
            name,
            grade_level,
            subject,
            teacher_profiles!inner(user_id)
          `)
          .eq('teacher_profiles.user_id', user.id)
          .order('name');

        if (error) throw error;
        
        setClasses(data || []);
        
        // Auto-select first class if available
        if (data && data.length > 0 && !selectedClassId) {
          setSelectedClass(data[0]);
          setSelectedClassId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [user]);

  // Update selected class when classId changes
  useEffect(() => {
    if (selectedClassId) {
      const classItem = classes.find(c => c.id === selectedClassId);
      setSelectedClass(classItem || null);
    }
  }, [selectedClassId, classes]);

  const handleClassChange = (classId: string) => {
    const classItem = classes.find(c => c.id === classId);
    setSelectedClass(classItem || null);
    setSelectedClassId(classId);
  };

  const getGradeColor = (grade?: number) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade >= 90) return 'bg-green-100 text-green-800';
    if (grade >= 80) return 'bg-blue-100 text-blue-800';
    if (grade >= 70) return 'bg-yellow-100 text-yellow-800';
    if (grade >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (loadingClasses) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Classes Found</h3>
          <p className="text-gray-600">
            You don't have any classes yet. Create a class to start using the gradebook.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Unified Gradebook</h2>
          <p className="text-muted-foreground">Manage traditional grades and assignment grades in one place</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportUnifiedCSV} disabled={!selectedClass}>
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
        </div>
      </div>

      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
          <CardDescription>Choose a class to view and manage grades</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedClassId} onValueChange={handleClassChange}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((classItem) => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  {classItem.name} - {classItem.grade_level} {classItem.subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClass && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.total_students || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Average</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overview?.average_grade ? `${overview.average_grade.toFixed(1)}%` : 'N/A'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assignment Grades</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.assignments_graded || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Traditional Grades</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.traditional_grades_count || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Student Overview Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Overview</CardTitle>
              <CardDescription>
                Combined view of all students with both traditional and assignment grades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Overall Average</TableHead>
                      <TableHead>Traditional Grades</TableHead>
                      <TableHead>Assignment Grades</TableHead>
                      <TableHead>School Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unifiedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="font-medium">
                            {student.first_name} {student.last_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.overall_average ? (
                            <Badge className={getGradeColor(student.overall_average)}>
                              {student.overall_average.toFixed(1)}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">No grades</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {student.traditional_grades.length} grades
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {student.assignment_grades.length} grades
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {student.first_name}.{student.last_name}@school.edu
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Gradebook Views */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="traditional">Traditional Grades</TabsTrigger>
              <TabsTrigger value="assignments">Assignment Grades</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gradebook Overview</CardTitle>
                  <CardDescription>
                    Quick summary of all grading activity for {selectedClass.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Use the Traditional Grades and Assignment Grades tabs to manage specific grade types.
                      This overview shows combined statistics for all students.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traditional">
              <Gradebook classId={selectedClass.id} className={selectedClass.name} />
            </TabsContent>

            <TabsContent value="assignments">
              <AssignmentGradebook />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default UnifiedGradebook;