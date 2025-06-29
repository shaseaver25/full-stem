
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  HeadphonesIcon, 
  Video, 
  BookOpen, 
  Users, 
  Calendar,
  Clock,
  MessageSquare,
  Plus,
  Search
} from 'lucide-react';

const AdminTeacherSupport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const supportSessions = [
    {
      id: 1,
      teacher: 'Sarah Johnson',
      school: 'Hope Academy',
      type: 'Live Help',
      topic: 'Grading System Help',
      status: 'scheduled',
      scheduledTime: '2024-01-15T14:00:00Z',
      duration: '30 min',
      priority: 'high'
    },
    {
      id: 2,
      teacher: 'Mike Chen',
      school: 'Genesys Works',
      type: 'Professional Development',
      topic: 'Advanced Excel Features',
      status: 'completed',
      scheduledTime: '2024-01-14T10:00:00Z',
      duration: '60 min',
      priority: 'medium'
    },
    {
      id: 3,
      teacher: 'Lisa Rodriguez',
      school: 'Lincoln High School',
      type: 'Technical Support',
      topic: 'Platform Navigation',
      status: 'in-progress',
      scheduledTime: '2024-01-15T11:00:00Z',
      duration: '45 min',
      priority: 'high'
    }
  ];

  const supportMetrics = [
    { metric: 'Active Sessions', value: '3', change: '+1' },
    { metric: 'Avg. Response Time', value: '2.3 min', change: '-0.5 min' },
    { metric: 'Resolution Rate', value: '94%', change: '+2%' },
    { metric: 'Teacher Satisfaction', value: '4.8/5', change: '+0.1' }
  ];

  const pdResources = [
    {
      id: 1,
      title: 'Advanced Excel Formulas',
      type: 'Video Course',
      duration: '2 hours',
      completion: 78
    },
    {
      id: 2,
      title: 'Classroom Management Tips',
      type: 'Interactive Guide',
      duration: '45 min',
      completion: 92
    },
    {
      id: 3,
      title: 'Student Engagement Strategies',
      type: 'Webinar',
      duration: '1 hour',
      completion: 65
    }
  ];

  const filteredSessions = supportSessions.filter(session => {
    const matchesSearch = session.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Support Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {supportMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
              <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.change} vs last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Support Sessions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Live Support Sessions
              </CardTitle>
              <CardDescription>
                Manage ongoing and scheduled teacher support sessions
              </CardDescription>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sessions Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.teacher}</TableCell>
                  <TableCell>{session.school}</TableCell>
                  <TableCell>{session.type}</TableCell>
                  <TableCell>{session.topic}</TableCell>
                  <TableCell>
                    {new Date(session.scheduledTime).toLocaleDateString()} at{' '}
                    {new Date(session.scheduledTime).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>{session.duration}</TableCell>
                  <TableCell>
                    <Badge variant={
                      session.status === 'scheduled' ? 'secondary' :
                      session.status === 'in-progress' ? 'default' : 'outline'
                    }>
                      {session.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {session.status === 'scheduled' && (
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Professional Development Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Professional Development Resources
            </CardTitle>
            <CardDescription>
              Available training materials and courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pdResources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{resource.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {resource.type} • {resource.duration}
                  </p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Completion Rate</span>
                      <span>{resource.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${resource.completion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="ml-4">
                  View
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Quick Support Actions
            </CardTitle>
            <CardDescription>
              Common support tasks and quick actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" className="justify-start h-auto p-4">
                <Calendar className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">Schedule Support Session</div>
                  <div className="text-xs text-muted-foreground">Book 1-on-1 help for teachers</div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4">
                <Users className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">Create Group Training</div>
                  <div className="text-xs text-muted-foreground">Set up webinar for multiple teachers</div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4">
                <BookOpen className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">Update PD Resources</div>
                  <div className="text-xs text-muted-foreground">Add new training materials</div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4">
                <HeadphonesIcon className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">Emergency Support</div>
                  <div className="text-xs text-muted-foreground">Immediate help for urgent issues</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTeacherSupport;
