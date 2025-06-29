
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Users, Clock, BookOpen } from 'lucide-react';

const AdminClassManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data
  const classes = [
    {
      id: 1,
      name: 'Excel Fundamentals',
      subject: 'Excel',
      instructor: 'Sarah Johnson',
      site: 'Hope Academy',
      enrollment: 25,
      maxEnrollment: 30,
      duration: '8 weeks',
      status: 'active',
      startDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Advanced Excel Analytics',
      subject: 'Excel',
      instructor: 'Mike Chen',
      site: 'Genesys Works',
      enrollment: 18,
      maxEnrollment: 20,
      duration: '12 weeks',
      status: 'active',
      startDate: '2024-02-01'
    },
    {
      id: 3,
      name: 'Data Visualization',
      subject: 'Data Science',
      instructor: 'Lisa Rodriguez',
      site: 'Lincoln High School',
      enrollment: 22,
      maxEnrollment: 25,
      duration: '10 weeks',
      status: 'active',
      startDate: '2024-01-20'
    },
    {
      id: 4,
      name: 'Python Programming Basics',
      subject: 'Programming',
      instructor: 'David Kim',
      site: 'Roosevelt Middle School',
      enrollment: 0,
      maxEnrollment: 20,
      duration: '14 weeks',
      status: 'scheduled',
      startDate: '2024-03-01'
    }
  ];

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.site.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || cls.subject === subjectFilter;
    const matchesStatus = statusFilter === 'all' || cls.status === statusFilter;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const totalClasses = classes.length;
  const activeClasses = classes.filter(cls => cls.status === 'active').length;
  const totalEnrollment = classes.reduce((sum, cls) => sum + cls.enrollment, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              {activeClasses} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollment}</div>
            <p className="text-xs text-muted-foreground">
              Across all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">
              weeks per class
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollment Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Average capacity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Class Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Class Management</CardTitle>
              <CardDescription>
                Manage all classes across your platform
              </CardDescription>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Build Class
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Excel">Excel</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Programming">Programming</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Classes Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.subject}</TableCell>
                  <TableCell>{cls.instructor}</TableCell>
                  <TableCell>{cls.site}</TableCell>
                  <TableCell>
                    {cls.enrollment}/{cls.maxEnrollment}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(cls.enrollment / cls.maxEnrollment) * 100}%` }}
                      ></div>
                    </div>
                  </TableCell>
                  <TableCell>{cls.duration}</TableCell>
                  <TableCell>
                    <Badge variant={cls.status === 'active' ? 'default' : 
                                  cls.status === 'scheduled' ? 'secondary' : 'outline'}>
                      {cls.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
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
    </div>
  );
};

export default AdminClassManagement;
