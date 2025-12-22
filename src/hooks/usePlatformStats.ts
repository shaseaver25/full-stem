import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlatformStats {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
    developers: number;
  };
  content: {
    classes: number;
    lessons: number;
    lessonComponents: number;
    assignments: number;
  };
  activity: {
    submissions: number;
    aiTutorChats: number;
    quizResponses: number;
  };
  tables: string[];
  edgeFunctions: string[];
}

// Edge functions from config.toml - updated dynamically when new functions are added
const EDGE_FUNCTIONS = [
  'grade-short-answer',
  'demo-request-link',
  'demo-consume-token',
  'seed-demo-tenant',
  'seed-demo-data',
  'create-demo-accounts',
  'elevenlabs-tts',
  'test-tts',
  'generate-ai-feedback',
  'generate-performance-summary',
  'translate-text',
  'text-to-speech',
  'health-check',
  'setup-mfa',
  'verify-mfa',
  'extract-text',
  'parse-lesson-plan',
  'store-oauth-tokens',
  'import-students-csv',
  'ai-lesson-generator',
  'adaptive-content',
  'submit-pilot-interest',
  'ai-insights',
  'ai-goals',
  'ai-reflection',
  'ai-weekly-digest',
  'ai-class-digest',
  'submit-demo-request',
  'submit-access-request',
  'seed-demo-environment',
  'create-demo-class',
  'create-test-students',
  'generate-discussion-prompt',
  'generate-lesson-template',
  'parse-lesson-template',
  'generate-lesson-template-docx',
  'onedrive-oauth',
  'extract-slide-text',
  'generate-quiz-questions',
  'generate-poll-questions',
  'ai-tutor-chat',
  'analyze-submission',
  'embed-assignment',
  'embed-existing-content',
  'seed-demo-classroom',
  'transcribe-video',
  'translate-transcript',
  'transcribe-lesson-video',
  'pivot-chat',
  'pivot-generate-hint',
  'socratic-tutor',
  'pivot-teacher-generate',
  'transcribe-voice',
  'generate-class-assessment',
  'process-benchmark-document',
  'assign-class-teacher',
  'create-dev-user',
  'invite-teacher',
  'update-user',
];

async function fetchPlatformStats(): Promise<PlatformStats> {
  // Fetch counts in parallel - using any to bypass strict typing for dynamic tables
  const [
    usersResult,
    studentsResult,
    teachersResult,
    adminsResult,
    developersResult,
    classesResult,
    lessonsResult,
    componentsResult,
    assignmentsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'developer'),
    supabase.from('classes').select('id', { count: 'exact', head: true }),
    supabase.from('lessons').select('id', { count: 'exact', head: true }),
    supabase.from('lesson_components').select('id', { count: 'exact', head: true }),
    supabase.from('assignments').select('id', { count: 'exact', head: true }),
  ]);

  // Fetch activity stats separately (tables may not exist in types)
  let submissionsCount = 0;
  let aiChatsCount = 0;
  let quizCount = 0;

  try {
    const { count } = await (supabase.from as any)('assignment_submissions').select('id', { count: 'exact', head: true });
    submissionsCount = count || 0;
  } catch { /* table may not exist */ }

  try {
    const { count } = await (supabase.from as any)('ai_tutor_chats').select('id', { count: 'exact', head: true });
    aiChatsCount = count || 0;
  } catch { /* table may not exist */ }

  try {
    const { count } = await (supabase.from as any)('quiz_responses').select('id', { count: 'exact', head: true });
    quizCount = count || 0;
  } catch { /* table may not exist */ }

  // Known tables list
  const tables = [
    'profiles', 'user_roles', 'students', 'teacher_profiles', 'admin_profiles',
    'classes', 'class_students', 'class_teachers', 'lessons', 'lesson_components',
    'assignments', 'assignment_submissions', 'quiz_responses', 'ai_tutor_chats', 'ai_tutor_usage',
    'ai_usage_logs', 'translation_cache', 'activity_log', 'proctoring_events',
  ];

  return {
    users: {
      total: usersResult.count || 0,
      students: studentsResult.count || 0,
      teachers: teachersResult.count || 0,
      admins: adminsResult.count || 0,
      developers: developersResult.count || 0,
    },
    content: {
      classes: classesResult.count || 0,
      lessons: lessonsResult.count || 0,
      lessonComponents: componentsResult.count || 0,
      assignments: assignmentsResult.count || 0,
    },
    activity: {
      submissions: submissionsCount,
      aiTutorChats: aiChatsCount,
      quizResponses: quizCount,
    },
    tables,
    edgeFunctions: EDGE_FUNCTIONS,
  };
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: fetchPlatformStats,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,
  });
}
