
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { ClassData, Lesson, Assignment, ClassroomActivity, IndividualActivity, Resource } from '@/types/buildClassTypes';

interface ClassPreviewProps {
  classData: ClassData;
  lessons: Lesson[];
  assignments: Assignment[];
  classroomActivities: ClassroomActivity[];
  individualActivities: IndividualActivity[];
  resources: Resource[];
  getCompletionPercentage: () => number;
}

const ClassPreview: React.FC<ClassPreviewProps> = ({
  classData,
  lessons,
  assignments,
  classroomActivities,
  individualActivities,
  resources,
  getCompletionPercentage
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Class Preview
        </CardTitle>
        <CardDescription>
          Review your class before publishing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Class Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Title:</strong> {classData.title || 'Not set'}</p>
              <p><strong>Subject:</strong> {classData.subject || 'Not set'}</p>
              <p><strong>Grade Level:</strong> {classData.gradeLevel || 'Not set'}</p>
              <p><strong>Duration:</strong> {classData.duration || 'Not set'}</p>
              <p><strong>Max Students:</strong> {classData.maxStudents}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Content Summary</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Lessons:</strong> {lessons.length}</p>
              <p><strong>Classroom Activities:</strong> {classroomActivities.length}</p>
              <p><strong>Individual Activities:</strong> {individualActivities.length}</p>
              <p><strong>Assignments:</strong> {assignments.length}</p>
              <p><strong>Resources:</strong> {resources.length}</p>
              <p><strong>Completion:</strong> {Math.round(getCompletionPercentage())}%</p>
            </div>
          </div>
        </div>
        
        {classData.description && (
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-gray-600">{classData.description}</p>
          </div>
        )}
        
        {classData.learningObjectives && (
          <div>
            <h3 className="font-semibold mb-2">Learning Objectives</h3>
            <p className="text-sm text-gray-600">{classData.learningObjectives}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassPreview;
