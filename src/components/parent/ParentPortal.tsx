import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, User, BookOpen, Calendar, TrendingUp, Send, Mail, Phone } from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  reading_level: string;
  class_name: string;
}

interface StudentProgress {
  lesson_id: number;
  lesson_title: string;
  status: string;
  progress_percentage: number;
  completed_at: string;
  time_spent: number;
}

interface Message {
  id: string;
  subject: string;
  message: string;
  sender_type: string;
  is_read: boolean;
  priority: string;
  created_at: string;
  teacher_name: string;
  student_name: string;
}

const ParentPortal = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const { toast } = useToast();

  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    priority: 'normal',
    teacher_id: ''
  });

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch parent profile
      const { data: parentProfile } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!parentProfile) {
        toast({
          title: "Setup Required",
          description: "Please complete your parent profile setup",
          variant: "destructive"
        });
        return;
      }

      // Fetch students linked to this parent
      const { data: studentRelationships } = await supabase
        .from('student_parent_relationships')
        .select(`
          student_id,
          students (
            id,
            first_name,
            last_name,
            grade_level,
            reading_level,
            classes (name)
          )
        `)
        .eq('parent_id', parentProfile.id);

      const studentsData = studentRelationships?.map(rel => ({
        id: rel.students.id,
        first_name: rel.students.first_name,
        last_name: rel.students.last_name,
        grade_level: rel.students.grade_level,
        reading_level: rel.students.reading_level,
        class_name: rel.students.classes?.name || 'N/A'
      })) || [];

      setStudents(studentsData);
      if (studentsData.length > 0) {
        setSelectedStudent(studentsData[0]);
        await fetchStudentProgress(studentsData[0].id);
      }

      // Fetch messages
      await fetchMessages(parentProfile.id);

    } catch (error) {
      console.error('Error fetching parent data:', error);
      toast({
        title: "Error",
        description: "Failed to load parent dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (studentId: string) => {
    try {
      const { data } = await supabase
        .from('student_progress')
        .select(`
          lesson_id,
          status,
          progress_percentage,
          completed_at,
          time_spent,
          Lessons (Title)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      const progressData = data?.map(item => ({
        lesson_id: item.lesson_id,
        lesson_title: item.Lessons?.Title || 'Unknown Lesson',
        status: item.status,
        progress_percentage: item.progress_percentage,
        completed_at: item.completed_at,
        time_spent: item.time_spent
      })) || [];

      setProgress(progressData);
    } catch (error) {
      console.error('Error fetching student progress:', error);
    }
  };

  const fetchMessages = async (parentId: string) => {
    try {
      const { data } = await supabase
        .from('parent_teacher_messages')
        .select(`
          id,
          subject,
          message,
          sender_type,
          is_read,
          priority,
          created_at,
          teacher_id,
          students (first_name, last_name)
        `)
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false });

      if (data) {
        // Get teacher info separately to avoid relation issues
        const messagesData = await Promise.all(
          data.map(async (msg) => {
            const { data: teacherProfile } = await supabase
              .from('teacher_profiles')
              .select('user_id')
              .eq('id', msg.teacher_id)
              .single();

            let teacherName = 'Teacher';
            if (teacherProfile) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', teacherProfile.user_id)
                .single();
              
              teacherName = profile?.full_name || 'Teacher';
            }

            return {
              id: msg.id,
              subject: msg.subject,
              message: msg.message,
              sender_type: msg.sender_type,
              is_read: msg.is_read,
              priority: msg.priority,
              created_at: msg.created_at,
              teacher_name: teacherName,
              student_name: `${msg.students?.first_name || ''} ${msg.students?.last_name || ''}`.trim()
            };
          })
        );

        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedStudent) return;

      const { data: parentProfile } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Get teacher for the student's class
      const { data: classData } = await supabase
        .from('students')
        .select('class_id, classes (teacher_id)')
        .eq('id', selectedStudent.id)
        .single();

      if (!classData?.classes?.teacher_id) {
        toast({
          title: "Error",
          description: "No teacher found for this student",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('parent_teacher_messages')
        .insert({
          parent_id: parentProfile.id,
          teacher_id: classData.classes.teacher_id,
          student_id: selectedStudent.id,
          subject: messageForm.subject,
          message: messageForm.message,
          sender_type: 'parent',
          priority: messageForm.priority
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully"
      });

      setIsMessageModalOpen(false);
      setMessageForm({ subject: '', message: '', priority: 'normal', teacher_id: '' });
      await fetchMessages(parentProfile.id);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading parent portal...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parent Portal</h1>
        <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" />
              Message Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message to Teacher</DialogTitle>
              <DialogDescription>
                {selectedStudent && `Regarding ${selectedStudent.first_name} ${selectedStudent.last_name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Message subject"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={messageForm.priority}
                  onValueChange={(value) => setMessageForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={messageForm.message}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Type your message here..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsMessageModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No Students Found</h3>
              <p className="text-muted-foreground">
                No students are currently linked to your parent account.
                Please contact your school administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex space-x-4 mb-6">
            {students.map((student) => (
              <Button
                key={student.id}
                variant={selectedStudent?.id === student.id ? "default" : "outline"}
                onClick={() => {
                  setSelectedStudent(student);
                  fetchStudentProgress(student.id);
                }}
              >
                {student.first_name} {student.last_name}
              </Button>
            ))}
          </div>

          {selectedStudent && (
            <Tabs defaultValue="progress" className="space-y-4">
              <TabsList>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="profile">Student Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Academic Progress
                    </CardTitle>
                    <CardDescription>
                      {selectedStudent.first_name}'s learning progress and achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {progress.map((item, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium">{item.lesson_title}</h4>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant={getStatusColor(item.status)}>
                                    {item.status.replace('_', ' ')}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {item.progress_percentage}% complete
                                  </span>
                                  {item.time_spent > 0 && (
                                    <span className="text-sm text-muted-foreground">
                                      • {item.time_spent} min
                                    </span>
                                  )}
                                </div>
                              </div>
                              {item.completed_at && (
                                <div className="text-sm text-muted-foreground">
                                  Completed {new Date(item.completed_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Teacher Communications
                    </CardTitle>
                    <CardDescription>
                      Messages and updates from your child's teachers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <Card key={message.id} className={!message.is_read ? 'border-blue-200' : ''}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium">{message.subject}</h4>
                                  <Badge variant={getPriorityColor(message.priority)}>
                                    {message.priority}
                                  </Badge>
                                  {!message.is_read && (
                                    <Badge variant="default">New</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  From: {message.teacher_name} • Re: {message.student_name}
                                </p>
                                <p className="text-sm">{message.message}</p>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(message.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Student Profile
                    </CardTitle>
                    <CardDescription>
                      {selectedStudent.first_name}'s academic information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <p className="text-lg font-medium">
                          {selectedStudent.first_name} {selectedStudent.last_name}
                        </p>
                      </div>
                      <div>
                        <Label>Grade Level</Label>
                        <p className="text-lg font-medium">{selectedStudent.grade_level}</p>
                      </div>
                      <div>
                        <Label>Reading Level</Label>
                        <p className="text-lg font-medium">{selectedStudent.reading_level}</p>
                      </div>
                      <div>
                        <Label>Class</Label>
                        <p className="text-lg font-medium">{selectedStudent.class_name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
};

export default ParentPortal;
