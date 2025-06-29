
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Eye, 
  Video, 
  FileText, 
  Link, 
  Calendar,
  Users,
  BookOpen,
  Target,
  Upload,
  Trash2
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import Header from '@/components/Header';

interface Lesson {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  videoUrl: string;
  materials: string[];
  instructions: string;
  duration: number;
  order: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  instructions: string;
  rubric: string;
  maxPoints: number;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'document';
  url: string;
  description: string;
}

const BuildClassPage = () => {
  const [activeTab, setActiveTab] = useState('details');
  const [classData, setClassData] = useState({
    title: '',
    description: '',
    gradeLevel: '',
    subject: '',
    duration: '',
    instructor: '',
    schedule: '',
    learningObjectives: '',
    prerequisites: '',
    maxStudents: 25
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson>>({
    title: '',
    description: '',
    objectives: [''],
    videoUrl: '',
    materials: [''],
    instructions: '',
    duration: 60,
    order: lessons.length + 1
  });

  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({
    title: '',
    description: '',
    dueDate: '',
    instructions: '',
    rubric: '',
    maxPoints: 100
  });

  const [currentResource, setCurrentResource] = useState<Partial<Resource>>({
    title: '',
    type: 'pdf',
    url: '',
    description: ''
  });

  const handleClassDataChange = (field: string, value: string | number) => {
    setClassData(prev => ({ ...prev, [field]: value }));
  };

  const addLesson = () => {
    if (currentLesson.title && currentLesson.description) {
      const newLesson: Lesson = {
        id: Date.now().toString(),
        title: currentLesson.title!,
        description: currentLesson.description!,
        objectives: currentLesson.objectives || [''],
        videoUrl: currentLesson.videoUrl || '',
        materials: currentLesson.materials || [''],
        instructions: currentLesson.instructions || '',
        duration: currentLesson.duration || 60,
        order: currentLesson.order || lessons.length + 1
      };
      setLessons([...lessons, newLesson]);
      setCurrentLesson({
        title: '',
        description: '',
        objectives: [''],
        videoUrl: '',
        materials: [''],
        instructions: '',
        duration: 60,
        order: lessons.length + 2
      });
    }
  };

  const addAssignment = () => {
    if (currentAssignment.title && currentAssignment.description) {
      const newAssignment: Assignment = {
        id: Date.now().toString(),
        title: currentAssignment.title!,
        description: currentAssignment.description!,
        dueDate: currentAssignment.dueDate || '',
        instructions: currentAssignment.instructions || '',
        rubric: currentAssignment.rubric || '',
        maxPoints: currentAssignment.maxPoints || 100
      };
      setAssignments([...assignments, newAssignment]);
      setCurrentAssignment({
        title: '',
        description: '',
        dueDate: '',
        instructions: '',
        rubric: '',
        maxPoints: 100
      });
    }
  };

  const addResource = () => {
    if (currentResource.title && currentResource.url) {
      const newResource: Resource = {
        id: Date.now().toString(),
        title: currentResource.title!,
        type: currentResource.type as 'pdf' | 'link' | 'video' | 'document',
        url: currentResource.url!,
        description: currentResource.description || ''
      };
      setResources([...resources, newResource]);
      setCurrentResource({
        title: '',
        type: 'pdf',
        url: '',
        description: ''
      });
    }
  };

  const removeLesson = (id: string) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  const removeAssignment = (id: string) => {
    setAssignments(assignments.filter(assignment => assignment.id !== id));
  };

  const removeResource = (id: string) => {
    setResources(resources.filter(resource => resource.id !== id));
  };

  const handleSaveClass = () => {
    const fullClassData = {
      ...classData,
      lessons,
      assignments,
      resources,
      createdAt: new Date().toISOString()
    };
    console.log('Saving class:', fullClassData);
    // Here you would typically save to your database
    alert('Class saved successfully!');
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 6;
    
    if (classData.title) completed++;
    if (classData.description) completed++;
    if (classData.gradeLevel) completed++;
    if (classData.subject) completed++;
    if (lessons.length > 0) completed++;
    if (assignments.length > 0) completed++;
    
    return (completed / total) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <RouterLink to="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </RouterLink>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Build New Class</h1>
              <p className="text-gray-600">Create a comprehensive learning experience</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Progress</p>
              <Progress value={getCompletionPercentage()} className="w-32" />
            </div>
            <Button onClick={handleSaveClass} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Class
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Class Details</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Class Details Tab */}
          <TabsContent value="details" className="space-y-6">
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
                      onChange={(e) => handleClassDataChange('title', e.target.value)}
                      placeholder="e.g., Advanced Excel for Business"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={classData.subject} onValueChange={(value) => handleClassDataChange('subject', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="data-science">Data Science</SelectItem>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="math">Mathematics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Class Description *</Label>
                  <Textarea
                    id="description"
                    value={classData.description}
                    onChange={(e) => handleClassDataChange('description', e.target.value)}
                    placeholder="Provide a detailed description of what students will learn..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Grade Level *</Label>
                    <Select value={classData.gradeLevel} onValueChange={(value) => handleClassDataChange('gradeLevel', value)}>
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
                      onChange={(e) => handleClassDataChange('duration', e.target.value)}
                      placeholder="e.g., 8 weeks"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Max Students</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      value={classData.maxStudents}
                      onChange={(e) => handleClassDataChange('maxStudents', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives">Learning Objectives</Label>
                  <Textarea
                    id="objectives"
                    value={classData.learningObjectives}
                    onChange={(e) => handleClassDataChange('learningObjectives', e.target.value)}
                    placeholder="List the key learning objectives for this class..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Textarea
                    id="prerequisites"
                    value={classData.prerequisites}
                    onChange={(e) => handleClassDataChange('prerequisites', e.target.value)}
                    placeholder="Any required prior knowledge or skills..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New Lesson */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Lesson
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Lesson Title</Label>
                    <Input
                      value={currentLesson.title || ''}
                      onChange={(e) => setCurrentLesson({...currentLesson, title: e.target.value})}
                      placeholder="Enter lesson title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={currentLesson.description || ''}
                      onChange={(e) => setCurrentLesson({...currentLesson, description: e.target.value})}
                      placeholder="Lesson overview and description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Video URL</Label>
                    <Input
                      value={currentLesson.videoUrl || ''}
                      onChange={(e) => setCurrentLesson({...currentLesson, videoUrl: e.target.value})}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={currentLesson.duration || 60}
                        onChange={(e) => setCurrentLesson({...currentLesson, duration: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Order</Label>
                      <Input
                        type="number"
                        value={currentLesson.order || lessons.length + 1}
                        onChange={(e) => setCurrentLesson({...currentLesson, order: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Learning Objectives</Label>
                    <Textarea
                      value={currentLesson.objectives?.join('\n') || ''}
                      onChange={(e) => setCurrentLesson({...currentLesson, objectives: e.target.value.split('\n')})}
                      placeholder="One objective per line"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Textarea
                      value={currentLesson.instructions || ''}
                      onChange={(e) => setCurrentLesson({...currentLesson, instructions: e.target.value})}
                      placeholder="Detailed lesson instructions"
                      rows={4}
                    />
                  </div>

                  <Button onClick={addLesson} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </CardContent>
              </Card>

              {/* Lessons List */}
              <Card>
                <CardHeader>
                  <CardTitle>Lessons ({lessons.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{lesson.title}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLesson(lesson.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            {lesson.duration}min
                          </span>
                          <span>Order: {lesson.order}</span>
                          {lesson.videoUrl && (
                            <Badge variant="secondary" className="text-xs">
                              Video
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {lessons.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No lessons added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Assignment Title</Label>
                    <Input
                      value={currentAssignment.title || ''}
                      onChange={(e) => setCurrentAssignment({...currentAssignment, title: e.target.value})}
                      placeholder="Enter assignment title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={currentAssignment.description || ''}
                      onChange={(e) => setCurrentAssignment({...currentAssignment, description: e.target.value})}
                      placeholder="Assignment overview"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={currentAssignment.dueDate || ''}
                        onChange={(e) => setCurrentAssignment({...currentAssignment, dueDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Points</Label>
                      <Input
                        type="number"
                        value={currentAssignment.maxPoints || 100}
                        onChange={(e) => setCurrentAssignment({...currentAssignment, maxPoints: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Textarea
                      value={currentAssignment.instructions || ''}
                      onChange={(e) => setCurrentAssignment({...currentAssignment, instructions: e.target.value})}
                      placeholder="Detailed assignment instructions"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Grading Rubric</Label>
                    <Textarea
                      value={currentAssignment.rubric || ''}
                      onChange={(e) => setCurrentAssignment({...currentAssignment, rubric: e.target.value})}
                      placeholder="Grading criteria and rubric"
                      rows={4}
                    />
                  </div>

                  <Button onClick={addAssignment} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Assignment
                  </Button>
                </CardContent>
              </Card>

              {/* Assignments List */}
              <Card>
                <CardHeader>
                  <CardTitle>Assignments ({assignments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{assignment.title}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAssignment(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {assignment.dueDate || 'No due date'}
                          </span>
                          <span>{assignment.maxPoints} points</span>
                        </div>
                      </div>
                    ))}
                    {assignments.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No assignments added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New Resource */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Resource
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Resource Title</Label>
                    <Input
                      value={currentResource.title || ''}
                      onChange={(e) => setCurrentResource({...currentResource, title: e.target.value})}
                      placeholder="Enter resource title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Resource Type</Label>
                    <Select 
                      value={currentResource.type} 
                      onValueChange={(value) => setCurrentResource({...currentResource, type: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="link">External Link</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      value={currentResource.url || ''}
                      onChange={(e) => setCurrentResource({...currentResource, url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={currentResource.description || ''}
                      onChange={(e) => setCurrentResource({...currentResource, description: e.target.value})}
                      placeholder="Brief description of the resource"
                      rows={3}
                    />
                  </div>

                  <Button onClick={addResource} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </CardContent>
              </Card>

              {/* Resources List */}
              <Card>
                <CardHeader>
                  <CardTitle>Resources ({resources.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resources.map((resource) => (
                      <div key={resource.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{resource.title}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Resource
                          </a>
                        </div>
                      </div>
                    ))}
                    {resources.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No resources added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BuildClassPage;
