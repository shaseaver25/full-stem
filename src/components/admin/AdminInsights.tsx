
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  BookOpen, 
  Brain, 
  Users, 
  TrendingUp, 
  MessageSquare,
  Settings,
  Zap
} from 'lucide-react';

const AdminInsights = () => {
  const accessibilityData = [
    { feature: 'Translation Usage', usage: 85, trend: '+12%' },
    { feature: 'Reading Level Adjustments', usage: 72, trend: '+8%' },
    { feature: 'Special Education Tools', usage: 45, trend: '+15%' },
    { feature: 'Audio Features', usage: 68, trend: '+5%' }
  ];

  const aiTutorMetrics = [
    { metric: 'Daily Interactions', value: '2,847', change: '+18%' },
    { metric: 'Success Rate', value: '94%', change: '+3%' },
    { metric: 'Avg. Response Time', value: '1.2s', change: '-0.3s' },
    { metric: 'Student Satisfaction', value: '4.7/5', change: '+0.2' }
  ];

  const curriculumAdaptations = [
    { type: 'Language Translation', count: 156, percentage: 78 },
    { type: 'Reading Level Adjustment', count: 142, percentage: 71 },
    { type: 'Visual Adaptations', count: 98, percentage: 49 },
    { type: 'Audio Enhancements', count: 124, percentage: 62 }
  ];

  return (
    <div className="space-y-6">
      {/* Accessibility Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Accessibility & Personalization Insights
          </CardTitle>
          <CardDescription>
            Track how students are using adaptive learning features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accessibilityData.map((item, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{item.feature}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.usage}%</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.trend}
                    </Badge>
                  </div>
                </div>
                <Progress value={item.usage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Tutor Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Tutor Performance
          </CardTitle>
          <CardDescription>
            Real-time metrics on AI-driven curriculum interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiTutorMetrics.map((metric, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {metric.value}
                </div>
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {metric.metric}
                </div>
                <Badge 
                  variant={metric.change.startsWith('+') ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {metric.change}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Curriculum Adaptation Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Curriculum Adaptations
            </CardTitle>
            <CardDescription>
              How students are personalizing their learning experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {curriculumAdaptations.map((adaptation, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{adaptation.type}</span>
                  <span className="text-sm text-muted-foreground">
                    {adaptation.count} students
                  </span>
                </div>
                <Progress value={adaptation.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Engagement Trends
            </CardTitle>
            <CardDescription>
              Weekly engagement and completion patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Peak Usage Time</div>
                  <div className="text-xs text-muted-foreground">2:00 PM - 4:00 PM</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">78%</div>
                  <div className="text-xs text-muted-foreground">of daily activity</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Completion Rate</div>
                  <div className="text-xs text-muted-foreground">This week</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">89%</div>
                  <div className="text-xs text-muted-foreground">+5% vs last week</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">AI Interactions</div>
                  <div className="text-xs text-muted-foreground">Per student/week</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">47</div>
                  <div className="text-xs text-muted-foreground">+12% vs last week</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Pathways */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Personalized Learning Pathways
          </CardTitle>
          <CardDescription>
            How AI is adapting content for individual students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">247</div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                Unique Pathways
              </div>
              <div className="text-xs text-muted-foreground">
                Generated this month
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                Adaptation Success
              </div>
              <div className="text-xs text-muted-foreground">
                Improved outcomes
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">3.2x</div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                Engagement Boost
              </div>
              <div className="text-xs text-muted-foreground">
                vs. standard curriculum
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInsights;
