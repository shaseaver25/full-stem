import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Network, Database, Users, Cloud, Shield, Layers, Server, Globe, ArrowLeft, RefreshCw, Activity, BookOpen, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ title, value, icon: Icon, color, loading }: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  color: string;
  loading?: boolean;
}) => (
  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
    <Icon className={`h-8 w-8 ${color}`} />
    <div>
      {loading ? (
        <Skeleton className="h-6 w-12" />
      ) : (
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      )}
      <p className="text-xs text-muted-foreground">{title}</p>
    </div>
  </div>
);

const ArchitecturePage = () => {
  const { data: stats, isLoading, refetch, dataUpdatedAt } = usePlatformStats();

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Never';

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
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Network className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Platform Architecture</h1>
                <Badge variant="destructive">Developer Only</Badge>
              </div>
              <p className="text-muted-foreground">
                Full STEM Platform technical architecture and system design
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Updated: {lastUpdated}</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Live Stats Banner */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Live Platform Stats
              <Badge variant="secondary" className="ml-2">Auto-refreshes every 30s</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <StatCard title="Total Users" value={stats?.users.total || 0} icon={Users} color="text-blue-500" loading={isLoading} />
              <StatCard title="Students" value={stats?.users.students || 0} icon={GraduationCap} color="text-green-500" loading={isLoading} />
              <StatCard title="Teachers" value={stats?.users.teachers || 0} icon={Users} color="text-purple-500" loading={isLoading} />
              <StatCard title="Classes" value={stats?.content.classes || 0} icon={BookOpen} color="text-orange-500" loading={isLoading} />
              <StatCard title="Lessons" value={stats?.content.lessons || 0} icon={BookOpen} color="text-cyan-500" loading={isLoading} />
              <StatCard title="Components" value={stats?.content.lessonComponents || 0} icon={Layers} color="text-pink-500" loading={isLoading} />
              <StatCard title="Edge Funcs" value={stats?.edgeFunctions.length || 0} icon={Server} color="text-yellow-500" loading={isLoading} />
              <StatCard title="DB Tables" value={stats?.tables.length || 0} icon={Database} color="text-emerald-500" loading={isLoading} />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="data">Data Flow</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
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
│  │                   EDGE FUNCTIONS (${stats?.edgeFunctions.length || '50+'}  Deno Functions)              │    │
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
                    <Badge variant="outline">{stats?.edgeFunctions.length || 0} functions</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tables</span>
                    <Badge variant="outline">{stats?.tables.length || 0} tables</Badge>
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
                    <span>AI Chats</span>
                    <Badge variant="outline">{stats?.activity.aiTutorChats || 0}</Badge>
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
                  <Badge variant="secondary" className="ml-2">
                    {stats?.users.total || 0} total users
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Students</span>
                      <Badge>{stats?.users.students || 0}</Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Dashboard</li>
                      <li>• My Classes</li>
                      <li>• Assignments</li>
                      <li>• Pivot AI Tutor</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Teachers</span>
                      <Badge>{stats?.users.teachers || 0}</Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Class Management</li>
                      <li>• Gradebook</li>
                      <li>• Lesson Builder</li>
                      <li>• AI Monitoring</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Admins</span>
                      <Badge>{stats?.users.admins || 0}</Badge>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• All Classes</li>
                      <li>• User Management</li>
                      <li>• Analytics</li>
                      <li>• Content Management</li>
                    </ul>
                  </div>
                </div>
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
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
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
                  Edge Functions
                  <Badge variant="secondary">{stats?.edgeFunctions.length || 0} deployed</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-2">
                  {stats?.edgeFunctions.map((fn) => (
                    <Badge key={fn} variant="outline" className="justify-center py-1 font-mono text-xs">
                      {fn}
                    </Badge>
                  ))}
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
│  └────────────────────────────────────────────────────────────────────┘     │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Layer 2: Role-Based Access Control (RBAC)                         │     │
│  │  • user_roles table (separate from profiles)                       │     │
│  │  • has_role() security definer function                            │     │
│  │  • RequireRole React component                                     │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Layer 3: Row-Level Security (RLS)                                 │     │
│  │  • Per-table policies                                              │     │
│  │  • User-scoped data access                                         │     │
│  │  • Role-based visibility                                           │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Layer 4: Edge Function Security                                   │     │
│  │  • JWT verification (verify_jwt in config.toml)                    │     │
│  │  • Service role key for admin operations                           │     │
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
                  <Badge variant="secondary">{stats?.tables.length || 0} tables</Badge>
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
│  │  (${String(stats?.users.total || 0).padEnd(4)} users)  │   │ (role assign)  │   │  (teacher data) │               │
│  └────────────────┘   └────────────────┘   └────────────────┘               │
│                                                    │                         │
│                                                    ▼                         │
│                                           ┌────────────────┐                 │
│                                           │    classes     │                 │
│                                           │  (${String(stats?.content.classes || 0).padEnd(4)} total) │                 │
│                                           └────────┬───────┘                 │
│                                                    │                         │
│              ┌─────────────────────────────────────┼─────────────┐           │
│              │                    │                │             │           │
│              ▼                    ▼                ▼             ▼           │
│     ┌────────────────┐   ┌────────────────┐ ┌────────────┐ ┌──────────────┐  │
│     │ class_students │   │    lessons     │ │ assignments│ │class_teachers│  │
│     └────────────────┘   │  (${String(stats?.content.lessons || 0).padEnd(4)} total) │ │ (${String(stats?.content.assignments || 0).padEnd(4)} tot)│ └──────────────┘  │
│                          └────────┬───────┘ └──────┬─────┘                   │
│                                   │                │                         │
│                                   ▼                ▼                         │
│                          ┌────────────────┐ ┌──────────────┐                 │
│                          │lesson_components│ │ submissions  │                 │
│                          │  (${String(stats?.content.lessonComponents || 0).padEnd(4)} total) │ │ (${String(stats?.activity.submissions || 0).padEnd(4)} tot)  │                 │
│                          └────────────────┘ └──────────────┘                 │
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
│                        (${stats?.activity.aiTutorChats || 0} conversations logged)                          │
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
                  `}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Tables
                    <Badge variant="secondary">{stats?.tables.length || 0}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {stats?.tables.map((table) => (
                      <Badge key={table} variant="outline" className="justify-start py-1 font-mono text-xs">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Edge Functions
                    <Badge variant="secondary">{stats?.edgeFunctions.length || 0}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {stats?.edgeFunctions.map((fn) => (
                      <Badge key={fn} variant="outline" className="justify-start py-1 font-mono text-xs">
                        {fn}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-3xl font-bold text-primary">{stats?.activity.submissions || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-3xl font-bold text-primary">{stats?.activity.aiTutorChats || 0}</p>
                    <p className="text-sm text-muted-foreground">AI Tutor Conversations</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-3xl font-bold text-primary">{stats?.activity.quizResponses || 0}</p>
                    <p className="text-sm text-muted-foreground">Quiz Responses</p>
                  </div>
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
