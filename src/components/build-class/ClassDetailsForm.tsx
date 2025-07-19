
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen } from 'lucide-react';
import { ClassData } from '@/types/buildClassTypes';

interface ClassDetailsFormProps {
  classData: ClassData;
  onClassDataChange: (field: string, value: string | number) => void;
}

const ClassDetailsForm: React.FC<ClassDetailsFormProps> = ({ classData, onClassDataChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Basic Information
        </CardTitle>
        <CardDescription>
          Set up the fundamental details of your class
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Class Title *</Label>
            <Input
              id="title"
              value={classData.title}
              onChange={(e) => onClassDataChange('title', e.target.value)}
              placeholder="e.g., Advanced Excel for Business"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select value={classData.subject} onValueChange={(value) => onClassDataChange('subject', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="math">Math</SelectItem>
                <SelectItem value="workforce">Workforce</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Class Description *</Label>
          <Textarea
            id="description"
            value={classData.description}
            onChange={(e) => onClassDataChange('description', e.target.value)}
            placeholder="Provide a detailed description of what students will learn..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="gradeLevel">Grade Level *</Label>
            <Select value={classData.gradeLevel} onValueChange={(value) => onClassDataChange('gradeLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6-8">6th-8th Grade</SelectItem>
                <SelectItem value="9-12">9th-12th Grade</SelectItem>
                <SelectItem value="college">College Level</SelectItem>
                <SelectItem value="adult">Adult Learning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={classData.duration}
              onChange={(e) => onClassDataChange('duration', e.target.value)}
              placeholder="e.g., 8 weeks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxStudents">Max Students</Label>
            <Input
              id="maxStudents"
              type="number"
              value={classData.maxStudents}
              onChange={(e) => onClassDataChange('maxStudents', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="objectives">Learning Objectives</Label>
          <Textarea
            id="objectives"
            value={classData.learningObjectives}
            onChange={(e) => onClassDataChange('learningObjectives', e.target.value)}
            placeholder="List the key learning objectives for this class..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prerequisites">Prerequisites</Label>
          <Textarea
            id="prerequisites"
            value={classData.prerequisites}
            onChange={(e) => onClassDataChange('prerequisites', e.target.value)}
            placeholder="Any required prior knowledge or skills..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassDetailsForm;
