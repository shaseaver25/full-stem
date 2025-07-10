
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCourses } from '@/hooks/useCourses';

interface CreateClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassCreated?: () => void;
  createClass: (classData: {
    name: string;
    grade_level: string;
    subject: string;
    school_year?: string;
    courses?: string[];
  }) => Promise<boolean>;
}

const CreateClassModal = ({ open, onOpenChange, onClassCreated, createClass }: CreateClassModalProps) => {
  const { toast } = useToast();
  const { courses, loading: coursesLoading } = useCourses();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: '',
    subjects: [] as string[],
    learningProfiles: [] as string[],
    studentCountEstimate: '',
    selectedCourses: [] as string[],
  });

  const gradeLevels = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const subjectOptions = ['Computer Science', 'Engineering', 'Mathematics', 'Artificial Intelligence', 'Physics', 'Chemistry', 'Biology', 'Data Science'];
  const learningProfileOptions = ['IEP', 'ELL', 'ADHD Support', 'Autism Support', 'Gifted', 'Visual Learner', 'Kinesthetic Learner'];

  const handleSubjectChange = (subject: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subjects: checked 
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleLearningProfileChange = (profile: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      learningProfiles: checked 
        ? [...prev.learningProfiles, profile]
        : prev.learningProfiles.filter(p => p !== profile)
    }));
  };

  const handleCourseChange = (course: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: checked 
        ? [...prev.selectedCourses, course]
        : prev.selectedCourses.filter(c => c !== course)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Class name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.gradeLevel) {
      toast({
        title: "Validation Error",
        description: "Grade level is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const success = await createClass({
        name: formData.name.trim(),
        grade_level: formData.gradeLevel,
        subject: formData.subjects.join(', '),
        school_year: new Date().getFullYear().toString(),
        courses: formData.selectedCourses,
      });

      if (success) {
        // Reset form
        setFormData({
          name: '',
          gradeLevel: '',
          subjects: [],
          learningProfiles: [],
          studentCountEstimate: '',
          selectedCourses: [],
        });

        onOpenChange(false);
        onClassCreated?.();
      }
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>
            Set up a new class with student learning profiles, subject focus, and select from available courses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Name */}
          <div className="space-y-2">
            <Label htmlFor="className" className="text-sm font-medium">
              Class Name *
            </Label>
            <Input
              id="className"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Advanced Excel 2024"
              className="w-full"
              disabled={loading}
            />
          </div>

          {/* Grade Level */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Grade Level *</Label>
            <Select 
              value={formData.gradeLevel} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, gradeLevel: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                {gradeLevels.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Focus */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Subject Focus</Label>
            <div className="grid grid-cols-2 gap-3">
              {subjectOptions.map((subject) => (
                <div key={subject} className="flex items-center space-x-2">
                  <Checkbox
                    id={`subject-${subject}`}
                    checked={formData.subjects.includes(subject)}
                    onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                    disabled={loading}
                  />
                  <Label htmlFor={`subject-${subject}`} className="text-sm">
                    {subject}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Profiles */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Learning Profiles & Accommodations</Label>
            <div className="grid grid-cols-2 gap-3">
              {learningProfileOptions.map((profile) => (
                <div key={profile} className="flex items-center space-x-2">
                  <Checkbox
                    id={`profile-${profile}`}
                    checked={formData.learningProfiles.includes(profile)}
                    onCheckedChange={(checked) => handleLearningProfileChange(profile, checked as boolean)}
                    disabled={loading}
                  />
                  <Label htmlFor={`profile-${profile}`} className="text-sm">
                    {profile}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Available Courses */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Available Courses (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              Select pre-built courses to include in your class. These will auto-populate lessons that you can customize.
            </p>
            {coursesLoading ? (
              <div className="text-sm text-muted-foreground">Loading courses...</div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {courses.map((course) => (
                  <div key={course.track} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id={`course-${course.track}`}
                      checked={formData.selectedCourses.includes(course.track)}
                      onCheckedChange={(checked) => handleCourseChange(course.track, checked as boolean)}
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`course-${course.track}`} className="text-sm font-medium">
                        {course.track}
                      </Label>
                      <p className="text-xs text-muted-foreground">{course.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No courses available at this time.</div>
            )}
          </div>

          {/* Student Count Estimate */}
          <div className="space-y-2">
            <Label htmlFor="studentCount" className="text-sm font-medium">
              Expected Student Count (Optional)
            </Label>
            <Input
              id="studentCount"
              type="number"
              value={formData.studentCountEstimate}
              onChange={(e) => setFormData(prev => ({ ...prev, studentCountEstimate: e.target.value }))}
              placeholder="e.g., 25"
              min="1"
              max="50"
              className="w-full"
              disabled={loading}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassModal;
