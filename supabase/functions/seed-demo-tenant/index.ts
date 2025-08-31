// supabase/functions/seed-demo-tenant/index.ts
// Deno Edge Function — Demo seeding + wiping + public status

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// --- Env --------------------------------------------------------------------
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY      = Deno.env.get('SUPABASE_ANON_KEY')!  // used only to decode JWT
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '')
  .split(',').map(s => s.trim()).filter(Boolean)

// --- Constants (demo IDs) ---------------------------------------------------
const TEACHER_ID = 'dddd0001-0000-0000-0000-000000000001'
const CLASS_ID   = 'dddd0002-0000-0000-0000-000000000001'
const ASSIGNMENTS = [
  'dddd0003-0000-0000-0000-000000000001',
  'dddd0004-0000-0000-0000-000000000001',
  'dddd0005-0000-0000-0000-000000000001'
]
const STUDENT_IDS = Array.from({ length: 12 }, (_, i) =>
  `dddd${String(i + 101).padStart(4, '0')}-0000-0000-0000-000000000001`
)
const PARENT_IDS = Array.from({ length: 12 }, (_, i) =>
  `dddd${String(i + 201).padStart(4, '0')}-0000-0000-0000-000000000001`
)

// --- CORS helper (inlined) --------------------------------------------------
function buildCors(req: Request, allowed: string[] = []) {
  const origin = req.headers.get('Origin') ?? '*'
  const okOrigin = allowed.length ? (allowed.includes(origin) ? origin : '') : '*'
  const base: Record<string, string> = {
    Vary: 'Origin',
    'Access-Control-Allow-Origin': okOrigin || '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
  }
  return {
    headers: base,
    preflight(): Response {
      return new Response(null, { status: 204, headers: base })
    }
  }
}

// --- Clients ----------------------------------------------------------------
function serviceDB() {
  // Service role client for DB mutations (RLS bypass)
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
function authClientFromReq(req: Request) {
  // Anon client that uses the caller's Authorization header to decode JWT
  const authHeader = req.headers.get('Authorization') || ''
  return createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// --- Auth helpers -----------------------------------------------------------
async function requireTeacherOrAdmin(req: Request) {
  const auth = authClientFromReq(req)
  const { data: { user }, error } = await auth.auth.getUser()
  if (error || !user) {
    return { ok: false, status: 401, body: { code: 'UNAUTHENTICATED', message: 'Sign in required' } }
  }

  // Check roles via user_roles; fallback to teacher_profiles existence
  const db = serviceDB()

  const { data: roleRow } = await db
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'teacher'])
    .maybeSingle()

  if (roleRow) return { ok: true, user }

  const { data: teacherProfile } = await db
    .from('teacher_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (teacherProfile) return { ok: true, user }

  return { ok: false, status: 403, body: { code: 'FORBIDDEN', message: 'Admin or teacher access required' } }
}

// --- Status (public) --------------------------------------------------------
async function getDemoSummary() {
  const db = serviceDB()
  const out: Record<string, number> = {}

  // classes
  {
    const { count } = await db.from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('id', CLASS_ID)
    out.classes = count ?? 0
  }
  // students
  {
    const { count } = await db.from('students')
      .select('*', { count: 'exact', head: true })
      .in('id', STUDENT_IDS)
    out.students = count ?? 0
  }
  // parents
  {
    const { count } = await db.from('parent_profiles')
      .select('*', { count: 'exact', head: true })
      .in('user_id', PARENT_IDS)
    out.parents = count ?? 0
  }
  // assignments
  {
    const { count } = await db.from('published_assignments')
      .select('*', { count: 'exact', head: true })
      .in('id', ASSIGNMENTS)
    out.assignments = count ?? 0
  }
  // submissions
  {
    const { count } = await db.from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .in('assignment_id', ASSIGNMENTS)
    out.submissions = count ?? 0
  }
  // announcements
  {
    const { count } = await db.from('class_messages')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', CLASS_ID)
      .eq('message_type', 'announcement')
    out.announcements = count ?? 0
  }
  // notifications
  {
    const { count } = await db.from('notifications')
      .select('*', { count: 'exact', head: true })
      .in('user_id', PARENT_IDS)
      .eq('type', 'missing_work')
    out.notifications = count ?? 0
  }
  return out
}

// --- Utility: exec and log (awaits every query; no .catch on thenables) -----
async function exec(dbCall: any, label: string) {
  try {
    const { error } = await dbCall
    if (error) console.log(`${label} error:`, error)
  } catch (e) {
    console.log(`${label} exception:`, e)
  }
}

// --- Wipe -------------------------------------------------------------------
async function wipeDemoData(db: ReturnType<typeof serviceDB>) {
  await exec(db.from('assignment_submissions').delete().in('user_id', STUDENT_IDS), 'delete submissions')
  await exec(db.from('grades').delete().in('student_id', STUDENT_IDS), 'delete grades')
  await exec(db.from('notifications').delete().in('user_id', [...STUDENT_IDS, ...PARENT_IDS, TEACHER_ID]), 'delete notifications')
  await exec(db.from('class_messages').delete().eq('teacher_id', TEACHER_ID), 'delete class_messages')
  await exec(db.from('parent_teacher_messages').delete().eq('teacher_id', TEACHER_ID), 'delete parent_teacher_messages')
  await exec(db.from('published_assignments').delete().in('id', ASSIGNMENTS), 'delete published_assignments')
  await exec(db.from('students').delete().in('id', STUDENT_IDS), 'delete students')
  await exec(db.from('classes').delete().eq('id', CLASS_ID), 'delete classes')
  await exec(db.from('parent_profiles').delete().in('user_id', PARENT_IDS), 'delete parent_profiles')
  await exec(db.from('teacher_profiles').delete().eq('user_id', TEACHER_ID), 'delete teacher_profiles')
  await exec(db.from('profiles').delete().in('id', [...STUDENT_IDS, ...PARENT_IDS, TEACHER_ID]), 'delete profiles')
  return { ok: true }
}

// --- Seed -------------------------------------------------------------------
async function seedDemoData(db: ReturnType<typeof serviceDB>) {
  await wipeDemoData(db)

  const nowISO = () => new Date().toISOString()

  // Teacher profile
  {
    const { error: e1 } = await db.from('profiles').upsert({
      id: TEACHER_ID, email: 'teacher_rivera@demo.school', full_name: 'Ms. Rivera',
      created_at: nowISO(), updated_at: nowISO()
    })
    if (e1) throw new Error(`Teacher profile: ${e1.message}`)

    const { error: e2 } = await db.from('teacher_profiles').upsert({
      id: TEACHER_ID, user_id: TEACHER_ID,
      school_name: 'Full-STEM School (Demo)',
      grade_levels: ['7th Grade', '8th Grade'],
      subjects: ['Computer Science', 'AI Education'],
      years_experience: 8, certification_status: 'Certified',
      pd_hours: 120, onboarding_completed: true,
      created_at: nowISO(), updated_at: nowISO()
    })
    if (e2) throw new Error(`Teacher data: ${e2.message}`)
  }

  // Class
  {
    const { error } = await db.from('classes').upsert({
      id: CLASS_ID,
      teacher_id: TEACHER_ID,
      name: 'AI for Middle School Students (Grades 7–8)',
      grade_level: '7th-8th Grade',
      subject: 'Computer Science - AI',
      school_year: '2024-2025',
      description: 'Intro to AI concepts for middle school',
      duration: '1 Semester',
      instructor: 'Ms. Rivera',
      schedule: 'MWF 2:00-3:00 PM',
      learning_objectives: 'AI basics, ethics, hands-on projects',
      prerequisites: 'Basic computer literacy',
      published: true, status: 'published',
      max_students: 25,
      published_at: nowISO(),
      created_at: nowISO(), updated_at: nowISO()
    })
    if (error) throw new Error(`Class: ${error.message}`)
  }

  // Students + Parents + Relationships
  const roster = [
    ['Aiden','Brooks','7th Grade','Grade Level'],
    ['Maya','Chen','8th Grade','Above Grade Level'],
    ['Liam','Davis','7th Grade','Grade Level'],
    ['Sofia','Edwards','8th Grade','Advanced'],
    ['Noah','Flores','7th Grade','Below Grade Level'],
    ['Ava','Garcia','8th Grade','Grade Level'],
    ['Ethan','Hall','7th Grade','Advanced'],
    ['Zoe','Ibrahim','8th Grade','Grade Level'],
    ['Lucas','Johnson','7th Grade','Above Grade Level'],
    ['Mia','Kim','8th Grade','Grade Level'],
    ['Oliver','Lopez','7th Grade','Grade Level'],
    ['Emma','Nguyen','8th Grade','Advanced']
  ] as const

  for (let i = 0; i < roster.length; i++) {
    const [first, last, grade, reading] = roster[i]
    const studentId = STUDENT_IDS[i]
    const parentId  = PARENT_IDS[i]

    // Student profile + student row
    {
      const { error: e1 } = await db.from('profiles').upsert({
        id: studentId, email: `student${String(i+1).padStart(2,'0')}@demo.school`,
        full_name: `${first} ${last}`, created_at: nowISO(), updated_at: nowISO()
      })
      if (e1) throw new Error(`Student profile ${i+1}: ${e1.message}`)

      const { error: e2 } = await db.from('students').upsert({
        id: studentId, class_id: CLASS_ID,
        first_name: first, last_name: last,
        grade_level: grade, reading_level: reading,
        learning_style: ['Visual','Kinesthetic','Auditory'][i % 3],
        interests: [['Technology','Robotics'],['Art','Gaming'],['Science','Math']][i % 3],
        language_preference: 'English',
        created_at: nowISO(), updated_at: nowISO()
      })
      if (e2) throw new Error(`Student data ${i+1}: ${e2.message}`)
    }

    // Parent profile + parent row
    {
      const { error: e1 } = await db.from('profiles').upsert({
        id: parentId, email: `parent${String(i+1).padStart(2,'0')}@demo.family`,
        full_name: `Parent of ${first} ${last}`, created_at: nowISO(), updated_at: nowISO()
      })
      if (e1) throw new Error(`Parent profile ${i+1}: ${e1.message}`)

      const { error: e2 } = await db.from('parent_profiles').upsert({
        id: parentId, user_id: parentId,
        first_name: 'Parent', last_name: last,
        phone_number: `555-${String(Math.floor(Math.random()*900)+100)}-${String(Math.floor(Math.random()*9000)+1000)}`,
        preferred_contact_method: 'email',
        created_at: nowISO(), updated_at: nowISO()
      })
      if (e2) throw new Error(`Parent data ${i+1}: ${e2.message}`)
    }

    // Relationship
    {
      const relId = `dddd${String(i + 301).padStart(4,'0')}-0000-0000-0000-000000000001`
      const { error } = await db.from('student_parent_relationships').upsert({
        id: relId, student_id: studentId, parent_id: parentId,
        relationship_type: 'parent',
        can_view_grades: true, can_view_attendance: true, can_receive_communications: true,
        created_at: nowISO()
      })
      if (error) throw new Error(`Relationship ${i+1}: ${error.message}`)
    }
  }

  // Assignments (published_assignments)
  const ASSN_BODIES: Record<string, { title: string; html: string; days: number; }> = {
    [ASSIGNMENTS[0]]: {
      title: 'What is AI? (Reading + 3 questions)',
      html: `<h2>What is Artificial Intelligence?</h2>
<p>Artificial Intelligence, or AI, is when computers are built to do tasks that usually need human thinking.</p>
<p>For example, recognizing a face in a photo or suggesting the next word in a sentence.</p>
<p><strong>Quick check:</strong> 1) Name one AI example. 2) Where have you seen AI? 3) Why can AI make mistakes?</p>
<hr/>
<p><em>Spanish sample:</em> La inteligencia artificial ayuda a las computadoras a aprender patrones y tomar decisiones más rápido.</p>`,
      days: 3
    },
    [ASSIGNMENTS[1]]: {
      title: 'Ethics & Bias (Short Answer)',
      html: `<h2>AI Ethics & Bias</h2>
<p>AI can accidentally learn bias if the data it studies is unfair.</p>
<p>Explain a fair way to train an AI model for a school project.</p>`,
      days: 5
    },
    [ASSIGNMENTS[2]]: {
      title: 'Build a Classifier (No-Code)',
      html: `<h2>Build a Tiny Classifier</h2>
<p>Use a no-code tool to train a model to tell apart two objects (e.g., apples vs. bananas).</p>
<p>Upload 5 examples of each, then share a one-paragraph reflection on what worked and what didn't.</p>`,
      days: 7
    }
  }

  for (const id of ASSIGNMENTS) {
    const due = new Date(); due.setDate(due.getDate() + ASSN_BODIES[id].days)
    const { error } = await db.from('published_assignments').upsert({
      id,
      class_assignment_id: id,
      class_id: CLASS_ID,
      title: ASSN_BODIES[id].title,
      instructions: ASSN_BODIES[id].html,
      description: `Demo assignment: ${ASSN_BODIES[id].title}`,
      due_date: due.toISOString(),
      max_points: 100,
      allow_text_response: true,
      max_files: 3,
      file_types_allowed: ['pdf','doc','docx','txt'],
      published_at: nowISO(),
      is_active: true,
      created_at: nowISO(), updated_at: nowISO()
    })
    if (error) throw new Error(`Assignment ${id}: ${error.message}`)
  }

  // Submissions + grades
  const submissionRates = [0.7, 0.4, 2/12] // ~70%, 40%, ~17%
  const sampleAnswers = [
    "AI examples include voice assistants, recommendation systems, and facial recognition. I've seen AI in my phone camera and on YouTube suggestions. AI can make mistakes because it learns from incomplete or biased data.",
    "Train fairly with diverse, representative data. Test with varied examples and invite feedback to catch bias.",
    "I used a no-code tool to classify apples vs. bananas. Clear, well-lit photos worked; blurry or occluded images confused the model."
  ]

  for (let a = 0; a < ASSIGNMENTS.length; a++) {
    const assnId = ASSIGNMENTS[a]
    const num = Math.floor(STUDENT_IDS.length * submissionRates[a])
    for (let i = 0; i < num; i++) {
      const studentId = STUDENT_IDS[i]
      const subId = `demo_sub_${a+1}_${String(i+1).padStart(2,'0')}`

      {
        const { error } = await db.from('assignment_submissions').upsert({
          id: subId,
          assignment_id: assnId,
          user_id: studentId,
          text_response: sampleAnswers[a],
          status: 'submitted',
          submitted_at: new Date(Date.now() - Math.random()*7*24*60*60*1000).toISOString(),
          created_at: nowISO(), updated_at: nowISO()
        })
        if (error) throw new Error(`Submission: ${error.message}`)
      }

      // Ensure a grade category exists
      let { data: cat } = await db.from('grade_categories')
        .select('id').eq('name','Assignments').maybeSingle()

      if (!cat) {
        const { data: newCat } = await db.from('grade_categories')
          .insert({ id: 'demo_category_assignments', name:'Assignments', weight:100, color:'#3B82F6' })
          .select('id').maybeSingle()
        cat = newCat || { id: 'demo_category_assignments' }
      }

      const pts = Math.floor(Math.random()*31) + 70 // 70-100
      const { error: gErr } = await db.from('grades').upsert({
        id: `demo_grade_${a+1}_${String(i+1).padStart(2,'0')}`,
        student_id: studentId,
        assignment_id: assnId,
        category_id: cat?.id,
        points_earned: pts,
        points_possible: 100,
        percentage: pts,
        letter_grade: pts >= 90 ? 'A' : pts >= 80 ? 'B' : 'C',
        graded_by: TEACHER_ID,
        comments: pts >= 90 ? 'Excellent work!' : pts >= 80 ? 'Good job!' : 'Keep practicing!',
        graded_at: nowISO(), created_at: nowISO(), updated_at: nowISO()
      })
      if (gErr) console.log('Grade upsert warning:', gErr) // non-fatal
    }
  }

  // Announcements
  const announcements = [
    {
      id: 'demo_msg_1',
      title: 'Welcome to AI Class!',
      content: "Please read Assignment #1 and click Play for Read-Aloud. Try Translate for the Spanish sample."
    },
    {
      id: 'demo_msg_2',
      title: 'Project Reminder',
      content: 'Bring 2 objects to photograph for Assignment #3 (classifier project).'
    }
  ]
  for (let i = 0; i < announcements.length; i++) {
    const a = announcements[i]
    const { error } = await db.from('class_messages').upsert({
      id: a.id, class_id: CLASS_ID, teacher_id: TEACHER_ID,
      title: a.title, content: a.content,
      message_type: 'announcement',
      priority: i ? 'high' : 'normal',
      sent_at: new Date(Date.now() - (announcements.length - i) * 24*60*60*1000).toISOString(),
      created_at: nowISO(), updated_at: nowISO()
    })
    if (error) throw new Error(`Announcement ${i+1}: ${error.message}`)
  }

  // Parent notifications for missing assignment #1
  const submittedStudents = Math.floor(STUDENT_IDS.length * 0.7)
  for (let i = submittedStudents; i < STUDENT_IDS.length; i++) {
    const studentId = STUDENT_IDS[i]
    const parentId  = PARENT_IDS[i]
    const due = new Date(); due.setDate(due.getDate()+3)
    const { error } = await db.from('notifications').upsert({
      id: `demo_notif_${i+1}`,
      user_id: parentId,
      title: 'Missing Assignment Alert',
      message: `Your student has a missing assignment: 'What is AI? (Reading + 3 questions)'. Please submit by ${due.toLocaleDateString()}.`,
      type: 'missing_work',
      read: false,
      metadata: { student_id: studentId, assignment_id: ASSIGNMENTS[0], assignment_title: 'What is AI? (Reading + 3 questions)', due_date: due.toISOString() },
      created_at: nowISO(), updated_at: nowISO()
    })
    if (error) console.log('Notification warning:', error) // non-fatal
  }

  return { ok: true }
}

// --- HTTP server ------------------------------------------------------------
Deno.serve(async (req) => {
  const { headers, preflight } = buildCors(req, ALLOWED_ORIGINS)
  try {
    // 1) Preflight
    if (req.method === 'OPTIONS') return preflight()

    // 2) Route
    const url = new URL(req.url)
    const action = (url.searchParams.get('action') || 'status').toLowerCase()

    // 3) Public status
    if (req.method === 'GET' && action === 'status') {
      const summary = await getDemoSummary()
      return new Response(JSON.stringify({ ok: true, ...summary }), {
        status: 200, headers: { ...headers, 'Content-Type': 'application/json' }
      })
    }

    // 4) Auth-required: seed / wipe
    if (req.method === 'POST' && (action === 'seed' || action === 'wipe')) {
      const gate = await requireTeacherOrAdmin(req)
      if (!('ok' in gate) || !gate.ok) {
        return new Response(JSON.stringify(gate.body), {
          status: gate.status!, headers: { ...headers, 'Content-Type': 'application/json' }
        })
      }

      const db = serviceDB()
      if (action === 'wipe') {
        await wipeDemoData(db)
        return new Response(JSON.stringify({ ok: true, message: 'Demo data wiped' }), {
          status: 200, headers: { ...headers, 'Content-Type': 'application/json' }
        })
      } else {
        await seedDemoData(db)
        return new Response(JSON.stringify({ ok: true, message: 'Demo data seeded' }), {
          status: 200, headers: { ...headers, 'Content-Type': 'application/json' }
        })
      }
    }

    // 5) Method not allowed / bad route
    return new Response(JSON.stringify({ code: 'BAD_REQUEST', message: 'Use GET ?action=status or POST ?action=seed|wipe' }), {
      status: 400, headers: { ...headers, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    console.error('seed-demo-tenant error:', e)
    return new Response(JSON.stringify({ code: 'UNEXPECTED', message: String((e as Error).message || e) }), {
      status: 500, headers: { ...headers, 'Content-Type': 'application/json' }
    })
  }
})
