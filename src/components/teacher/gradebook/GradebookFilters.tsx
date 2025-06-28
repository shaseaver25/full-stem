
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface GradebookFiltersProps {
  assignmentFilter: string;
  setAssignmentFilter: (value: string) => void;
  studentFilter: string;
  setStudentFilter: (value: string) => void;
  uniqueAssignments: string[];
}

const GradebookFilters = ({
  assignmentFilter,
  setAssignmentFilter,
  studentFilter,
  setStudentFilter,
  uniqueAssignments,
}: GradebookFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assignment-filter">Assignment</Label>
            <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All assignments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All assignments</SelectItem>
                {uniqueAssignments.map(assignment => (
                  <SelectItem key={assignment} value={assignment}>
                    {assignment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="student-filter">Student</Label>
            <Input
              id="student-filter"
              placeholder="Search students..."
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradebookFilters;
