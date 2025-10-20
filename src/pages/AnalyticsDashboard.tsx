
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import StudentProgressAnalytics from '@/components/analytics/StudentProgressAnalytics';
import MobileOptimizedLayout from '@/components/layout/MobileOptimizedLayout';
import Header from '@/components/Header';

interface Class {
  id: string;
  name: string;
  grade_level: string;
  subject: string;
  school_year: string;
}

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useTeacherProfile();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!profile?.id) return;

      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', profile.id)
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
  }, [profile?.id]);

  const header = (
    <div className="flex items-center gap-4">
      <Link to="/teacher/dashboard">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">Advanced student progress and engagement analytics</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileOptimizedLayout header={header}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </MobileOptimizedLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileOptimizedLayout header={header}>
      <div className="space-y-6">
        {classes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Classes Found</CardTitle>
              <CardDescription>
                You need to create a class before you can access analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/teacher/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Select Class for Analytics</CardTitle>
                <CardDescription>
                  Choose a class to view detailed progress and engagement analytics
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
              <StudentProgressAnalytics classId={selectedClass.id} />
            )}
          </>
        )}
      </div>
    </MobileOptimizedLayout>
    </div>
  );
};

export default AnalyticsDashboard;
