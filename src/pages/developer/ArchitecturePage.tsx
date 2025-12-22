import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Network, Database, Users, Cloud, Shield, Layers, Server, Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

const ArchitecturePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/dev">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Developer Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Network className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Platform Architecture</h1>
            <Badge variant="destructive">Developer Only</Badge>
          </div>
          <p className="text-muted-foreground">
            Full STEM Platform technical architecture and system design
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="data">Data Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-6 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre text-foreground">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FULL STEM PLATFORM ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        CLIENT LAYER (Browser)                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │   Student    │  │   Teacher    │  │    Admin     │               │    │
│  │  │   Portal     │  │   Portal     │  │   Portal     │               │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │    │
│  │                    React + TypeScript + Tailwind                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        SUPABASE (Backend)                            │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │    Auth     │  │   Database  │  │   Storage   │  │  Realtime  │  │    │
│  │  │  (GoTrue)   │  │ (PostgreSQL)│  │   (S3-like) │  │ (Channels) │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        EDGE FUNCTIONS (Deno)                         │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │    │
│  │  │ AI Processing │  │  Translation  │  │   Grading     │            │    │
│  │  │  (OpenAI)     │  │  (Multi-lang) │  │  (Adaptive)   │            │    │
│  │  └───────────────┘  └───────────────┘  └───────────────┘            │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │    │
│  │  │ Text-to-Speech│  │  Pivot Tutor  │  │ Content Parse │            │    │
│  │  │  (ElevenLabs) │  │  (Socratic)   │  │ (Lesson Gen)  │            │    │
│  │  └───────────────┘  └───────────────┘  └───────────────┘            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      EXTERNAL INTEGRATIONS                           │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │    │
│  │  │   OpenAI   │  │ ElevenLabs │  │   Google   │  │  OneDrive  │     │    │
│  │  │    API     │  │    TTS     │  │   Drive    │  │    API     │     │    │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5 text-blue-500" />
                    Frontend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Framework</span>
                    <Badge variant="outline">React 18</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Build Tool</span>
                    <Badge variant="outline">Vite</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Styling</span>
                    <Badge variant="outline">Tailwind CSS</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Components</span>
                    <Badge variant="outline">shadcn/ui</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>State</span>
                    <Badge variant="outline">React Query</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-5 w-5 text-green-500" />
                    Backend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Platform</span>
                    <Badge variant="outline">Supabase</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Database</span>
                    <Badge variant="outline">PostgreSQL</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Auth</span>
                    <Badge variant="outline">GoTrue</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Edge Functions</span>
                    <Badge variant="outline">Deno</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage</span>
                    <Badge variant="outline">S3-compatible</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Cloud className="h-5 w-5 text-purple-500" />
                    AI Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>LLM</span>
                    <Badge variant="outline">OpenAI GPT-4o</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>TTS</span>
                    <Badge variant="outline">ElevenLabs</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Embeddings</span>
                    <Badge variant="outline">OpenAI Ada</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Translation</span>
                    <Badge variant="outline">GPT-4o-mini</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Grading</span>
                    <Badge variant="outline">Adaptive AI</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="frontend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Role Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-6 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre text-foreground">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                            USER ROLES & PORTALS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐             │
│  │    STUDENT     │    │    TEACHER     │    │     ADMIN      │             │
│  ├────────────────┤    ├────────────────┤    ├────────────────┤             │
│  │ • Dashboard    │    │ • Dashboard    │    │ • Dashboard    │             │
│  │ • My Classes   │    │ • Classes      │    │ • All Classes  │             │
│  │ • Assignments  │    │ • Gradebook    │    │ • Users        │             │
│  │ • Grades       │    │ • Assignments  │    │ • Analytics    │             │
│  │ • Pivot Tutor  │    │ • AI Tutor Mon │    │ • Content Mgmt │             │
│  │ • Class Lesson │    │ • Lesson Build │    │ • Quizzes/Polls│             │
│  └────────────────┘    │ • Analytics    │    └────────────────┘             │
│                        └────────────────┘                                    │
│                                                                              │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐             │
│  │    PARENT      │    │  SUPER ADMIN   │    │   DEVELOPER    │             │
│  ├────────────────┤    ├────────────────┤    ├────────────────┤             │
│  │ • Dashboard    │    │ • All Access   │    │ • Full Access  │             │
│  │ • Child View   │    │ • Tenant Mgmt  │    │ • Impersonation│             │
│  │ • Reports      │    │ • System Config│    │ • Feature Flags│             │
│  │ • Progress     │    │ • Audit Logs   │    │ • Debug Tools  │             │
│  └────────────────┘    └────────────────┘    │ • AI Costs     │             │
│                                              │ • Error Logs   │             │
│                                              └────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Component Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-6 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre text-foreground">{`
src/
├── components/
│   ├── ui/              # shadcn/ui base components
│   ├── admin/           # Admin-specific components
│   ├── teacher/         # Teacher portal components
│   ├── student/         # Student portal components
│   ├── developer/       # Developer tools & debug
│   ├── lessons/         # Lesson rendering & builder
│   ├── assignments/     # Assignment components
│   ├── auth/            # Auth forms & protection
│   ├── drive/           # Google Drive integration
│   └── pivot/           # Pivot AI Tutor
│
├── pages/               # Route components
│   ├── admin/           # Admin pages
│   ├── teacher/         # Teacher pages
│   ├── student/         # Student pages
│   ├── developer/       # Developer pages
│   └── classes/         # Class management
│
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── integrations/        # External service clients
                  `}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Edge Functions Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-6 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre text-foreground">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EDGE FUNCTIONS (50+ Functions)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         AI / CONTENT                                 │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │    │
│  │  │ pivot-chat      │  │ socratic-tutor  │  │ ai-lesson-gen   │      │    │
│  │  │ pivot-hint      │  │ ai-insights     │  │ ai-goals        │      │    │
│  │  │ ai-reflection   │  │ ai-weekly-digest│  │ ai-class-digest │      │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         GRADING / ASSESSMENT                         │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │    │
│  │  │ grade-short-ans │  │ analyze-submis  │  │ generate-quiz   │      │    │
│  │  │ adaptive-content│  │ generate-poll   │  │ class-assessment│      │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         CONTENT PROCESSING                           │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │    │
│  │  │ translate-text  │  │ text-to-speech  │  │ elevenlabs-tts  │      │    │
│  │  │ extract-text    │  │ parse-lesson    │  │ transcribe-video│      │    │
│  │  │ extract-slide   │  │ embed-content   │  │ benchmark-doc   │      │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         USER / AUTH                                  │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │    │
│  │  │ create-dev-user │  │ invite-teacher  │  │ update-user     │      │    │
│  │  │ setup-mfa       │  │ verify-mfa      │  │ store-oauth     │      │    │
│  │  │ create-demo-cls │  │ seed-demo-data  │  │ import-csv      │      │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-6 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre text-foreground">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Layer 1: Authentication (Supabase Auth)                           │     │
│  │  • Email/Password login                                            │     │
│  │  • MFA support (TOTP)                                              │     │
│  │  • OAuth (Google)                                                  │     │
│  │  • Session management                                              │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Layer 2: Role-Based Access Control (RBAC)                         │     │
│  │  • user_roles table (separate from profiles)                       │     │
│  │  • has_role() security definer function                            │     │
│  │  • RequireRole React component                                     │     │
│  │  • Route protection (DeveloperRoute, ProtectedTeacherRoute, etc.)  │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Layer 3: Row-Level Security (RLS)                                 │     │
│  │  • Per-table policies                                              │     │
│  │  • User-scoped data access                                         │     │
│  │  • Role-based visibility (teacher sees class, student sees own)    │     │
│  │  • Developer/Super Admin override policies                         │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Layer 4: Edge Function Security                                   │     │
│  │  • JWT verification (verify_jwt = true/false in config.toml)       │     │
│  │  • Service role key for admin operations                           │     │
│  │  • CORS headers configured                                         │     │
│  │  • Secrets management via Supabase Vault                           │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Model Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-6 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre text-foreground">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CORE DATA RELATIONSHIPS                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         ┌──────────────┐                                     │
│                         │  auth.users  │                                     │
│                         └──────┬───────┘                                     │
│                                │                                             │
│           ┌────────────────────┼────────────────────┐                        │
│           │                    │                    │                        │
│           ▼                    ▼                    ▼                        │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐               │
│  │   profiles     │   │  user_roles    │   │ teacher_profiles│               │
│  │  (all users)   │   │ (role assign)  │   │  (teacher data) │               │
│  └────────────────┘   └────────────────┘   └────────────────┘               │
│                                                    │                         │
│                                                    ▼                         │
│                                           ┌────────────────┐                 │
│                                           │    classes     │                 │
│                                           └────────┬───────┘                 │
│                                                    │                         │
│              ┌─────────────────────────────────────┼─────────────┐           │
│              │                    │                │             │           │
│              ▼                    ▼                ▼             ▼           │
│     ┌────────────────┐   ┌────────────────┐ ┌────────────┐ ┌──────────────┐  │
│     │ class_students │   │    lessons     │ │ assignments│ │class_teachers│  │
│     └────────────────┘   └────────┬───────┘ └──────┬─────┘ └──────────────┘  │
│              │                    │                │                         │
│              │                    ▼                ▼                         │
│              │           ┌────────────────┐ ┌──────────────┐                 │
│              │           │lesson_components│ │ submissions  │                 │
│              │           └────────────────┘ └──────────────┘                 │
│              │                                                               │
│              ▼                                                               │
│     ┌────────────────┐                                                       │
│     │    students    │◄──────┐                                               │
│     └────────────────┘       │                                               │
│              │               │                                               │
│              ▼               │                                               │
│     ┌────────────────┐       │                                               │
│     │student_progress│       │                                               │
│     │ ai_tutor_chats │───────┘                                               │
│     │ quiz_responses │                                                       │
│     └────────────────┘                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Data Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-6 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre text-foreground">{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PIVOT AI TUTOR DATA FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐    │
│  │ Student │────▶│  Frontend   │────▶│ Edge Func   │────▶│   OpenAI    │    │
│  │  Input  │     │ (pivot-chat)│     │ pivot-chat  │     │   GPT-4o    │    │
│  └─────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘    │
│                                                                  │           │
│                                                                  ▼           │
│  ┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐    │
│  │Response │◀────│  Frontend   │◀────│ Edge Func   │◀────│ AI Response │    │
│  │ Display │     │ (streaming) │     │  (parse)    │     │  (Socratic) │    │
│  └─────────┘     └─────────────┘     └─────────────┘     └─────────────┘    │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     DATA PERSISTENCE                                 │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │    │
│  │  │ai_tutor_chats │  │ai_tutor_usage │  │ ai_usage_logs │            │    │
│  │  │(conversation) │  │(analytics)    │  │(cost tracking)│            │    │
│  │  └───────────────┘  └───────────────┘  └───────────────┘            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                        ADAPTIVE CONTENT PIPELINE

  ┌──────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────────┐
  │ Student  │───▶│  Determine  │───▶│  Fetch Base │───▶│   Adapt to   │
  │  Access  │    │Reading Level│    │   Content   │    │ Level + Lang │
  └──────────┘    └─────────────┘    └─────────────┘    └──────────────┘
                         │                                      │
                         ▼                                      ▼
                  ┌─────────────┐                       ┌──────────────┐
                  │  students   │                       │  translated  │
                  │(reading_lvl)│                       │   content    │
                  └─────────────┘                       └──────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArchitecturePage;
