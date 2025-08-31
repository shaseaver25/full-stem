import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import InlineReadAloud from '@/components/InlineReadAloud';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  PlayCircle,
  GraduationCap,
  Target,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DemoShowcase = () => {
  const demoText = `Welcome to the Full STEM AI-Powered Learning Platform! This comprehensive educational technology platform transforms how students learn and teachers teach. Our AI-powered features include advanced text-to-speech with real-time word highlighting, interactive lesson content, automated grading systems, and personalized learning paths. Teachers can create and manage classes, track student progress with detailed analytics, and communicate directly with parents. Students experience engaging, accessible content that adapts to their reading level and learning style. The platform supports multiple subjects including Mathematics, Science, English Literature, and History. Every feature is designed with accessibility in mind, ensuring all learners can succeed regardless of their individual needs.`;

  const features = [
    {
      title: "AI-Powered Read Aloud",
      description: "ElevenLabs AI voices with real-time word highlighting",
      icon: <Sparkles className="h-5 w-5" />,
      status: "Live Demo Available",
      path: "/components",
      color: "bg-gradient-to-r from-blue-500 to-purple-600"
    },
    {
      title: "Interactive Lessons", 
      description: "Rich content with algebra, geometry, and literature",
      icon: <BookOpen className="h-5 w-5" />,
      status: "Demo Data Populated",
      path: "/lesson/2001",
      color: "bg-gradient-to-r from-green-500 to-blue-600"
    },
    {
      title: "Class Management",
      description: "Teacher dashboard with student progress tracking",
      icon: <Users className="h-5 w-5" />,
      status: "Working Demo",
      path: "/teacher/dashboard", 
      color: "bg-gradient-to-r from-purple-500 to-pink-600"
    },
    {
      title: "Student Analytics",
      description: "Comprehensive progress and performance insights",
      icon: <BarChart3 className="h-5 w-5" />,
      status: "Data Available",
      path: "/analytics",
      color: "bg-gradient-to-r from-orange-500 to-red-600"
    },
    {
      title: "Parent Portal",
      description: "Real-time communication and progress monitoring",
      icon: <MessageSquare className="h-5 w-5" />,
      status: "Interface Ready",
      path: "/parent-portal",
      color: "bg-gradient-to-r from-teal-500 to-green-600"
    },
    {
      title: "Content Library",
      description: "Searchable educational resources and materials",
      icon: <FileText className="h-5 w-5" />,
      status: "Demo Content",
      path: "/content-management",
      color: "bg-gradient-to-r from-indigo-500 to-purple-600"
    }
  ];

  const demoScenarios = [
    {
      title: "🎯 Primary Demo Path",
      description: "Start here for the complete AI experience",
      steps: [
        "Visit /components to experience AI-powered text-to-speech",
        "Try the Enhanced Read Aloud with word highlighting",
        "Adjust playback speed and voice settings",
        "Download transcripts and test mobile responsiveness"
      ],
      badge: "Recommended",
      color: "border-primary bg-primary/5"
    },
    {
      title: "📚 Educational Content Demo",
      description: "Explore the learning management features", 
      steps: [
        "Navigate to lesson pages (Algebra, Geometry, Shakespeare)",
        "Review the structured lesson content and objectives",
        "See interactive activities and resource links",
        "Experience the educational content organization"
      ],
      badge: "Content Rich",
      color: "border-green-500 bg-green-50"
    },
    {
      title: "👨‍🏫 Teacher Workflow Demo",
      description: "Teacher dashboard and management tools",
      steps: [
        "Access the teacher dashboard for class overview",
        "View student progress and analytics",
        "Explore class management features",
        "Review grading and communication tools"
      ],
      badge: "Functional",
      color: "border-blue-500 bg-blue-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Full STEM Learning Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Comprehensive AI-powered educational platform with interactive lessons, teacher management tools, and adaptive learning features
          </p>
          
          {/* Live Demo Section */}
          <Card className="mb-12 shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">Live AI Demo</CardTitle>
                </div>
                <Badge variant="default" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  AI Powered
                </Badge>
              </div>
              <CardDescription>
                Experience our advanced text-to-speech technology with real-time highlighting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InlineReadAloud text={demoText} />
            </CardContent>
          </Card>
        </div>

        {/* Demo Scenarios */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Demo Scenarios for Recording</h2>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {demoScenarios.map((scenario, index) => (
              <Card key={index} className={`${scenario.color} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                    <Badge variant="secondary">{scenario.badge}</Badge>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {scenario.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-sm">
                        <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {stepIndex + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Feature Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Platform Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <div className={`h-2 ${feature.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={feature.path}>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-all">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Explore Demo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Navigation */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quick Demo Access</CardTitle>
            <CardDescription className="text-blue-100">
              Jump directly to key platform features for your demo recording
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link to="/components">
                <Button variant="secondary" className="w-full">
                  AI Text-to-Speech
                </Button>
              </Link>
              <Link to="/lesson/2001">
                <Button variant="secondary" className="w-full">
                  Sample Lesson
                </Button>
              </Link>
              <Link to="/teacher/dashboard">
                <Button variant="secondary" className="w-full">
                  Teacher Dashboard
                </Button>
              </Link>
              <Link to="/content-management">
                <Button variant="secondary" className="w-full">
                  Content Library
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold mb-4">Platform Highlights</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="text-sm">ElevenLabs AI Voices</Badge>
            <Badge variant="secondary" className="text-sm">Real-time Word Highlighting</Badge>
            <Badge variant="secondary" className="text-sm">Responsive Design</Badge>
            <Badge variant="secondary" className="text-sm">Accessibility Features</Badge>
            <Badge variant="secondary" className="text-sm">Progress Analytics</Badge>
            <Badge variant="secondary" className="text-sm">Parent Communication</Badge>
            <Badge variant="secondary" className="text-sm">Multi-Subject Support</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoShowcase;