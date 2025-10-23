
import React, { useState, useEffect } from 'react';
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
import { CheckCircle, GraduationCap, Loader2 } from 'lucide-react';
import Header from '@/components/Header';

const TeacherOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    school_name: '',
    grade_levels: [] as string[],
    subjects: [] as string[],
    years_experience: 0,
  });
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomSubject, setShowCustomSubject] = useState(false);
  const { profile, loading, saveProfile, saving } = useTeacherProfile();
  const navigate = useNavigate();

  // Check if onboarding is already completed and redirect
  // Use ref to prevent multiple redirects
  const hasRedirected = React.useRef(false);
  
  useEffect(() => {
    if (!loading && profile?.onboarding_completed && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate('/teacher/dashboard', { replace: true });
    }
  }, [profile?.onboarding_completed, loading, navigate]);

  const gradeOptions = [
    'Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th', 
    '7th', '8th', '9th', '10th', '11th', '12th', 'College', 'Workforce'
  ];

  const subjectOptions = [
    'Mathematics', 'Science', 'Technology', 'Engineering', 
    'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Environmental Science', 'Robotics', 'Data Science', 'Other'
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
    if (subject === 'Other') {
      setShowCustomSubject(checked);
      if (!checked) {
        setCustomSubject('');
        // Remove any custom subject from the subjects array
        setFormData(prev => ({
          ...prev,
          subjects: prev.subjects.filter(s => !subjectOptions.includes(s) || s === 'Other')
        }));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      subjects: checked 
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleCustomSubjectChange = (value: string) => {
    setCustomSubject(value);
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        subjects: [
          ...prev.subjects.filter(s => subjectOptions.includes(s)),
          value.trim()
        ]
      }));
    }
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
      // Force full page reload to clear all cached state
      window.location.href = '/teacher/dashboard';
    }
  };

  const progress = (currentStep / 3) * 100;

  // Show loading spinner while checking onboarding status
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-2xl mx-auto p-4">
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
                   
                   {/* Custom subject input when "Other" is selected */}
                   {showCustomSubject && (
                     <div className="mt-4">
                       <Label htmlFor="custom-subject">Please specify:</Label>
                       <Input
                         id="custom-subject"
                         value={customSubject}
                         onChange={(e) => handleCustomSubjectChange(e.target.value)}
                         placeholder="Enter your subject"
                         className="mt-2"
                       />
                     </div>
                   )}
                   
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
