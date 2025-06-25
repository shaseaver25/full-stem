
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
import { X } from 'lucide-react';

interface CreateClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassCreated?: () => void;
}

const CreateClassModal = ({ open, onOpenChange, onClassCreated }: CreateClassModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: '',
    subjects: [] as string[],
    learningProfiles: [] as string[],
    studentCountEstimate: '',
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
      const { error } = await supabase
        .from('classes')
        .insert({
          name: formData.name.trim(),
          grade_level: formData.gradeLevel,
          subject: formData.subjects.join(', '),
          teacher_id: user?.id,
          school_year: new Date().getFullYear().toString(),
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Class created successfully.",
      });

      // Reset form
      setFormData({
        name: '',
        gradeLevel: '',
        subjects: [],
        learningProfiles: [],
        studentCountEstimate: '',
      });

      onOpenChange(false);
      onClassCreated?.();

    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
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
            Set up a new class with student learning profiles and subject focus.
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
            />
          </div>

          {/* Grade Level */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Grade Level *</Label>
            <Select value={formData.gradeLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, gradeLevel: value }))}>
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
                  />
                  <Label htmlFor={`profile-${profile}`} className="text-sm">
                    {profile}
                  </Label>
                </div>
              ))}
            </div>
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
