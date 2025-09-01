
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Users, Calendar, Clock, GraduationCap } from 'lucide-react';
import { useTeacherProfileSimplified } from '@/hooks/useTeacherProfileSimplified';
import { useClasses } from '@/hooks/useClasses';
import { useClassApi } from '@/hooks/useClassApi';
import Header from '@/components/Header';

const TeacherDashboard = () => {
  const { profile, loading: profileLoading } = useTeacherProfileSimplified();
  const { classes: myClasses, loading: loadingMyClasses } = useClasses(false);
  const { useClasses: usePublishedClasses } = useClassApi();
  const { data: publishedClasses, isLoading: loadingPublished } = usePublishedClasses(true);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to TailorEDU</h2>
          <p className="text-muted-foreground mb-4">Please complete your profile setup to get started.</p>
          <Link to="/teacher/onboarding">
            <Button>Complete Setup</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">Manage your classes and view available content</p>
        </div>
        <div className="flex gap-2">
          <Link to="/teacher/gradebook">
            <Button variant="outline">
              <GraduationCap className="h-4 w-4 mr-2" />
              Gradebook
            </Button>
          </Link>
          <Link to="/admin/build-class">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Class
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="my-classes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-classes">My Classes</TabsTrigger>
          <TabsTrigger value="available-classes">Available Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="my-classes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Classes</h2>
            <Link to="/admin/build-class">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Class
              </Button>
            </Link>
          </div>

          {loadingMyClasses ? (
            <div className="text-center py-8">Loading your classes...</div>
          ) : myClasses && myClasses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myClasses.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first class to get started with TailorEDU.
                </p>
                <Link to="/admin/build-class">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Class
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="available-classes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Classes</h2>
            <p className="text-sm text-gray-600">
              Classes published by administrators
            </p>
          </div>

          {loadingPublished ? (
            <div className="text-center py-8">Loading available classes...</div>
          ) : publishedClasses && publishedClasses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publishedClasses.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No published classes</h3>
                <p className="text-gray-600">
                  Check back later for new classes published by administrators.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

interface ClassCardProps {
  classItem: any;
  showActions: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({ classItem, showActions }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{classItem.title || classItem.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {classItem.description || 'No description available'}
            </CardDescription>
          </div>
          {classItem.published && (
            <Badge variant="default">Published</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {classItem.grade_level && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span>{classItem.grade_level}</span>
            </div>
          )}
          {classItem.subject && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span>{classItem.subject}</span>
            </div>
          )}
          {classItem.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{classItem.duration}</span>
            </div>
          )}
          {classItem.max_students && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>Max {classItem.max_students}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 pt-4">
            <Link to={`/build-class/${classItem.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Edit
              </Button>
            </Link>
            <Link to={`/teacher/class/${classItem.id}`} className="flex-1">
              <Button size="sm" className="w-full">
                Manage
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherDashboard;
