
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar as CalendarIcon,
  Users,
  BookOpen,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { DateRange } from 'react-day-picker';

const AdminReports = () => {
  const [dateRange, setDateRange] = useState<{from: Date; to: Date}>({
    from: new Date(2024, 0, 1),
    to: new Date()
  });
  const [reportType, setReportType] = useState('enrollment');
  const [reportFormat, setReportFormat] = useState('pdf');

  const reportTypes = [
    {
      id: 'enrollment',
      name: 'Enrollment Statistics',
      description: 'Student enrollment trends and demographics',
      icon: Users
    },
    {
      id: 'progress',
      name: 'Student Progress Reports',
      description: 'Individual and aggregate progress tracking',
      icon: TrendingUp
    },
    {
      id: 'attendance',
      name: 'Attendance Tracking',
      description: 'Class attendance and participation rates',
      icon: CalendarIcon
    },
    {
      id: 'curriculum',
      name: 'Curriculum Utilization',
      description: 'Usage patterns and completion rates',
      icon: BookOpen
    },
    {
      id: 'feedback',
      name: 'Student Feedback Summary',
      description: 'Aggregated feedback and satisfaction scores',
      icon: MessageSquare
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Q1 2024 Enrollment Report',
      type: 'Enrollment Statistics',
      generatedDate: '2024-01-15',
      status: 'completed',
      size: '2.3 MB'
    },
    {
      id: 2,
      name: 'Hope Academy Progress Report',
      type: 'Student Progress',
      generatedDate: '2024-01-10',
      status: 'completed',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Curriculum Usage Analysis',
      type: 'Curriculum Utilization',
      generatedDate: '2024-01-05',
      status: 'completed',
      size: '3.1 MB'
    }
  ];

  const handleGenerateReport = () => {
    console.log('Generating report:', { reportType, dateRange, format: reportFormat });
    // Implementation would generate and download the report
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to });
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Custom Report
          </CardTitle>
          <CardDescription>
            Create detailed reports with custom parameters and date ranges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all ${
                    reportType === type.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => setReportType(type.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-sm">{type.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Date Range and Format Selection */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-fit">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={handleDateRangeSelect}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Select value={reportFormat} onValueChange={setReportFormat}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              Generated this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Coverage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              Platform coverage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Report Size</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 MB</div>
            <p className="text-xs text-muted-foreground">
              Optimized for sharing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export Formats</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              PDF, CSV, Excel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            View and download previously generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {report.type} • {report.generatedDate} • {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {report.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
