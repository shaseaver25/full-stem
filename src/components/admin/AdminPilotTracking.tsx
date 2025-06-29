
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  TrendingUp, 
  Users, 
  BookOpen, 
  MessageSquare,
  Star,
  Calendar,
  Target
} from 'lucide-react';

const AdminPilotTracking = () => {
  const pilotPrograms = [
    {
      id: 1,
      name: 'Hope Academy Pilot',
      location: 'Houston, TX',
      startDate: '2024-01-01',
      duration: '6 months',
      status: 'active',
      progress: 65,
      students: 250,
      teachers: 12,
      satisfaction: 4.7,
      completionRate: 89
    },
    {
      id: 2,
      name: 'Genesys Works Pilot',
      location: 'Multiple Locations',
      startDate: '2024-01-15',
      duration: '4 months',
      status: 'active',
      progress: 45,
      students: 180,
      teachers: 8,
      satisfaction: 4.5,
      completionRate: 92
    }
  ];

  const keyMetrics = [
    { metric: 'Student Engagement', value: '94%', change: '+8%', trend: 'up' },
    { metric: 'Completion Rate', value: '90%', change: '+12%', trend: 'up' },
    { metric: 'Teacher Satisfaction', value: '4.6/5', change: '+0.3', trend: 'up' },
    { metric: 'Time to Proficiency', value: '3.2 weeks', change: '-1.1 weeks', trend: 'down' }
  ];

  const feedback = [
    {
      id: 1,
      source: 'Hope Academy - Teacher',
      feedback: 'The AI-driven personalization has significantly improved student engagement. Students are more motivated to complete assignments.',
      rating: 5,
      date: '2024-01-10'
    },
    {
      id: 2,
      source: 'Genesys Works - Student',
      feedback: 'I love how the platform adapts to my learning speed. The translation feature helps me understand concepts better.',
      rating: 5,
      date: '2024-01-08'
    },
    {
      id: 3,
      source: 'Hope Academy - Administrator',
      feedback: 'The reporting tools give us great insights into student progress. Would like to see more detailed analytics.',
      rating: 4,
      date: '2024-01-05'
    }
  ];

  const insights = [
    {
      category: 'Learning Outcomes',
      insight: 'Students using adaptive features show 40% faster skill acquisition',
      impact: 'high'
    },
    {
      category: 'Teacher Adoption',
      insight: 'Teachers using the AI tutor report 35% reduction in grading time',
      impact: 'high'
    },
    {
      category: 'Accessibility',
      insight: 'Translation features are used by 60% of students, improving comprehension by 25%',
      impact: 'medium'
    },
    {
      category: 'Engagement',
      insight: 'Personalized pathways increase session duration by 50%',
      impact: 'high'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Pilot Program Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pilotPrograms.map((pilot) => (
          <Card key={pilot.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    {pilot.name}
                  </CardTitle>
                  <CardDescription>{pilot.location}</CardDescription>
                </div>
                <Badge variant={pilot.status === 'active' ? 'default' : 'secondary'}>
                  {pilot.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{pilot.students}</div>
                  <div className="text-xs text-muted-foreground">Students</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{pilot.teachers}</div>
                  <div className="text-xs text-muted-foreground">Teachers</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{pilot.progress}%</span>
                </div>
                <Progress value={pilot.progress} className="h-2" />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{pilot.satisfaction}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {pilot.completionRate}% completion
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Target className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Performance Metrics
          </CardTitle>
          <CardDescription>
            Consolidated metrics across all pilot programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {keyMetrics.map((metric, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {metric.metric}
                </div>
                <Badge 
                  variant={metric.trend === 'up' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {metric.change}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Pilot Program Insights</CardTitle>
          <CardDescription>
            Detailed feedback and insights from pilot participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="feedback" className="space-y-4">
            <TabsList>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback" className="space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-sm">{item.source}</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${
                            i < item.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.feedback}</p>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-sm">{insight.category}</div>
                    <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.insight}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-sm mb-4">Timeline Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Phase 1: Setup & Onboarding</span>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Phase 2: Initial Rollout</span>
                      <Badge variant="default">In Progress</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Phase 3: Full Deployment</span>
                      <Badge variant="secondary">Scheduled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Phase 4: Evaluation</span>
                      <Badge variant="secondary">Planned</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-sm mb-4">Success Metrics</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Student Achievement</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Teacher Adoption</span>
                        <span>87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Platform Utilization</span>
                        <span>95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPilotTracking;
