
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Gradebook from '@/components/teacher/Gradebook';

interface Class {
  id: string;
  name: string;
  grade_level: string;
  subject: string;
  school_year: string;
}

const GradebookPage: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useTeacherProfile();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id)
          .order('name');

        if (error) throw error;
        setClasses(data || []);
        
        // Auto-select first class if available
        if (data && data.length > 0) {
          setSelectedClass(data[0]);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/teacher/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gradebook</h1>
            <p className="text-gray-600">Manage student grades and track progress</p>
          </div>
        </div>

        {classes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Classes Found</CardTitle>
              <CardDescription>
                You need to create a class before you can access the gradebook.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/teacher/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Class</CardTitle>
                <CardDescription>
                  Choose a class to view and manage grades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedClass?.id || ''} 
                  onValueChange={(value) => {
                    const classItem = classes.find(c => c.id === value);
                    setSelectedClass(classItem || null);
                  }}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(classItem => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name} - {classItem.grade_level} ({classItem.subject})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedClass && (
              <Gradebook 
                classId={selectedClass.id} 
                className={selectedClass.name}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GradebookPage;
