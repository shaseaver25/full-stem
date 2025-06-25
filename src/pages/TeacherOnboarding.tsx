
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherProfile } from '@/hooks/useTeacherProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, GraduationCap } from 'lucide-react';

const TeacherOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    school_name: '',
    grade_levels: [] as string[],
    subjects: [] as string[],
    years_experience: 0,
  });
  const { saveProfile, saving } = useTeacherProfile();
  const navigate = useNavigate();

  const gradeOptions = [
    'Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th', 
    '7th', '8th', '9th', '10th', '11th', '12th'
  ];

  const subjectOptions = [
    'Mathematics', 'Science', 'Technology', 'Engineering', 
    'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Environmental Science', 'Robotics', 'Data Science'
  ];

  const handleGradeLevelChange = (grade: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      grade_levels: checked 
        ? [...prev.grade_levels, grade]
        : prev.grade_levels.filter(g => g !== grade)
    }));
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subjects: checked 
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const success = await saveProfile({
      ...formData,
      onboarding_completed: true,
    });
    
    if (success) {
      navigate('/teacher/dashboard');
    }
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to Full STEM!</CardTitle>
            <div className="mt-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600 mt-2">Step {currentStep} of 3</p>
            </div>
          </CardHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <CardContent className="space-y-6 p-6">
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="school">School Name</Label>
                      <Input
                        id="school"
                        value={formData.school_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, school_name: e.target.value }))}
                        placeholder="Enter your school name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Years of Teaching Experience</Label>
                      <Select
                        value={formData.years_experience.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, years_experience: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select years of experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">New Teacher</SelectItem>
                          <SelectItem value="1">1-2 years</SelectItem>
                          <SelectItem value="3">3-5 years</SelectItem>
                          <SelectItem value="6">6-10 years</SelectItem>
                          <SelectItem value="11">11-15 years</SelectItem>
                          <SelectItem value="16">16+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Grade Levels */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Grade Levels You Teach</h3>
                  <p className="text-sm text-gray-600">Select all that apply</p>
                  <div className="grid grid-cols-3 gap-3">
                    {gradeOptions.map((grade) => (
                      <div key={grade} className="flex items-center space-x-2">
                        <Checkbox
                          id={grade}
                          checked={formData.grade_levels.includes(grade)}
                          onCheckedChange={(checked) => handleGradeLevelChange(grade, checked as boolean)}
                        />
                        <Label htmlFor={grade} className="text-sm">{grade}</Label>
                      </div>
                    ))}
                  </div>
                  {formData.grade_levels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.grade_levels.map((grade) => (
                        <Badge key={grade} variant="secondary">{grade}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Subjects */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">STEM Subjects You Teach</h3>
                  <p className="text-sm text-gray-600">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-3">
                    {subjectOptions.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={subject}
                          checked={formData.subjects.includes(subject)}
                          onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                        />
                        <Label htmlFor={subject} className="text-sm">{subject}</Label>
                      </div>
                    ))}
                  </div>
                  {formData.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary">{subject}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </ScrollArea>

          {/* Navigation Buttons - Fixed at bottom */}
          <div className="p-6 border-t bg-white rounded-b-lg">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep === 3 ? (
                <Button onClick={handleComplete} disabled={saving}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Setup
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherOnboarding;
