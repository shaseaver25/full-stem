
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BookOpen, Upload, Loader2 } from 'lucide-react';
import { ClassData } from '@/types/buildClassTypes';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ClassDetailsFormProps {
  classData: ClassData;
  onClassDataChange: (field: string, value: string | number) => void;
}

const ClassDetailsForm: React.FC<ClassDetailsFormProps> = ({ classData, onClassDataChange }) => {
  const [isUploading, setIsUploading] = useState(false);

  const parseSyllabusWithAI = async (content: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('parse-lesson-plan', {
        body: { content }
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error parsing syllabus:', error);
      throw error;
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      let content = '';

      if (fileType === 'txt') {
        content = await file.text();
      } else if (fileType === 'pdf' || fileType === 'docx') {
        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64File = btoa(binary);

        const { data, error } = await supabase.functions.invoke('extract-text', {
          body: {
            file: base64File,
            fileName: file.name,
            mimeType: file.type
          }
        });

        if (error) throw error;
        content = data.text;
      }

      if (!content) {
        throw new Error('Unable to extract text from file');
      }

      const parsedData = await parseSyllabusWithAI(content);

      // Populate form fields with parsed data
      if (parsedData.title) onClassDataChange('title', parsedData.title);
      if (parsedData.description) onClassDataChange('description', parsedData.description);
      if (parsedData.subject) onClassDataChange('subject', parsedData.subject);
      if (parsedData.gradeLevel) onClassDataChange('gradeLevel', parsedData.gradeLevel);
      if (parsedData.duration) onClassDataChange('duration', parsedData.duration);
      if (parsedData.learningObjectives) {
        const objectives = Array.isArray(parsedData.learningObjectives) 
          ? parsedData.learningObjectives.join('\n') 
          : parsedData.learningObjectives;
        onClassDataChange('learningObjectives', objectives);
      }
      if (parsedData.prerequisites) onClassDataChange('prerequisites', parsedData.prerequisites);

      toast({
        title: "Syllabus Uploaded!",
        description: "Lesson information has been populated from your syllabus.",
      });
    } catch (error: any) {
      console.error('Error uploading syllabus:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to parse syllabus. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isUploading
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Basic Information
        </CardTitle>
        <CardDescription>
          Set up the fundamental details of your lesson or upload a syllabus to auto-populate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Syllabus Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
          <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Processing syllabus...</p>
              </div>
            ) : isDragActive ? (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Drop your syllabus here</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm font-medium">Upload Syllabus</p>
                <p className="text-xs text-muted-foreground">
                  Drag & drop or click to upload (.txt, .pdf, .docx)
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-2">
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </div>
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
