// supabase/functions/seed-demo-tenant/index.ts
// Demo seeding + wiping + public status (CORS-safe, returns counts)

import { createClient, type User } from 'https://esm.sh/@supabase/supabase-js@2'

// ── ENV ──────────────────────────────────────────────────────────────────────
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY     = Deno.env.get('SUPABASE_ANON_KEY')!

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const TEACHER_EMAIL = 'demo@creatempls.org'
const CLASS_NAME    = 'AI for Middle School Students (Grades 7–8)'
const STUDENT_EMAIL = (i: number) => `student${String(i).padStart(2,'0')}@demo.school`
const PARENT_EMAIL  = (i: number) => `parent${String(i).padStart(2,'0')}@demo.family`
const NUM_STUDENTS = 12
const ASSIGNMENT_IDS = ['demo_assn_ai_intro','demo_assn_ethics_bias','demo_assn_classifier'] as const

// ── CORS ─────────────────────────────────────────────────────────────────────
function buildCors(req: Request) {
  const origin = req.headers.get('Origin') ?? '*'
  const reqHeaders = req.headers.get('Access-Control-Request-Headers') || 'authorization, content-type'
  const base: Record<string,string> = {
    'Vary':'Origin, Access-Control-Request-Headers',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': reqHeaders,
    'Access-Control-Allow-Methods':'GET,POST,OPTIONS',
    'Access-Control-Max-Age':'86400',
  }
  return { headers: base, preflight: () => new Response(null,{status:204,headers:base}) }
}

// ── CLIENTS ──────────────────────────────────────────────────────────────────
const svc = () => createClient(SUPABASE_URL, SERVICE_KEY, { auth:{ autoRefreshToken:false, persistSession:false } })
function authFromReq(req: Request) {
  const authHeader = req.headers.get('Authorization') || ''
  return createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken:false, persistSession:false }
  })
}

const nowISO = () => new Date().toISOString()

// ── AUTH ADMIN HELPERS ───────────────────────────────────────────────────────
async function ensureAuthUser(email: string, full_name: string, roles: string[] = []) {
  const client = svc()
  const { data: list } = await client.auth.admin.listUsers({ page:1, perPage:1000 })
  const found = list?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
  if (found) {
    const oldRoles = (found.user_metadata?.roles ?? []) as string[]
    const merged = Array.from(new Set([...(oldRoles||[]), ...roles]))
    if (JSON.stringify(merged) !== JSON.stringify(oldRoles)) {
      await client.auth.admin.updateUserById(found.id, { user_metadata:{ ...found.user_metadata, roles: merged } })
    }
    return found
  }
  const password = email === TEACHER_EMAIL ? 'GodisGood25!' : `Demo${Math.random().toString(36).slice(2,10)}!A1`
  const { data: created, error } = await client.auth.admin.createUser({
    email, password, email_confirm:true, user_metadata:{ name: full_name, roles }
  })
  if (error) throw new Error(`createUser(${email}): ${error.message}`)
  return created.user as User
}

// ── AUTHZ (teacher/admin required for POST) ──────────────────────────────────
async function requireTeacherOrAdmin(req: Request) {
  const auth = authFromReq(req)
  const { data:{ user }, error } = await auth.auth.getUser()
  if (error || !user) return { ok:false, status:401, body:{ code:'UNAUTHENTICATED', message:'Sign in required' } }

  const rolesFromMeta = user.user_metadata?.roles || user.app_metadata?.roles || []
  const roles = new Set(Array.isArray(rolesFromMeta) ? rolesFromMeta : [rolesFromMeta])
  if (roles.has('admin') || roles.has('teacher')) return { ok:true, user }

  const db = svc()
  const { data: teacherProfile } = await db.from('teacher_profiles').select('id').eq('user_id', user.id).maybeSingle()
  if (teacherProfile) return { ok:true, user }

  return { ok:false, status:403, body:{ code:'FORBIDDEN', message:'Admin or teacher access required' } }
}

// ── STATUS (public, broad counts) ────────────────────────────────────────────
async function getDemoSummary() {
  const db = svc()
  const { count: studentProfiles } = await db.from('profiles').select('*',{count:'exact',head:true}).like('email','%@demo.school')
  const { count: parentProfiles  } = await db.from('profiles').select('*',{count:'exact',head:true}).like('email','%@demo.family')
  const { count: classes }       = await db.from('classes').select('*',{count:'exact',head:true}).eq('name',CLASS_NAME)
  const { data: classRow }       = await db.from('classes').select('id').eq('name',CLASS_NAME).order('created_at',{ascending:false}).maybeSingle()
  const classId = classRow?.id ?? '__none__'
  const { count: assignments }   = await db.from('published_assignments').select('*',{count:'exact',head:true}).eq('class_id',classId)
  const { count: announcements } = await db.from('class_messages').select('*',{count:'exact',head:true}).eq('class_id',classId).eq('message_type','announcement')
  const { count: submissions }   = await db.from('assignment_submissions').select('*',{count:'exact',head:true})
  const { count: notifications } = await db.from('notifications').select('*',{count:'exact',head:true}).eq('type','missing_work')
  return { students: studentProfiles??0, parents: parentProfiles??0, classes: classes??0,
           assignments: assignments??0, announcements: announcements??0, submissions: submissions??0, notifications: notifications??0 }
}

// ── WIPE (by email domain + class name) ──────────────────────────────────────
async function wipeDemoData() {
  const db = svc()
  const { data: studentProf } = await db.from('profiles').select('id').like('email','%@demo.school')
  const { data: parentProf }  = await db.from('profiles').select('id').like('email','%@demo.family')
  const studentIds = (studentProf ?? []).map(r => r.id)
  const parentIds  = (parentProf  ?? []).map(r => r.id)
  const { data: classRow }    = await db.from('classes').select('id, teacher_id').eq('name',CLASS_NAME).order('created_at',{ascending:false}).maybeSingle()
  const classId   = classRow?.id
  const teacherId = classRow?.teacher_id

  if (studentIds.length) {
    await db.from('assignment_submissions').delete().in('user_id', studentIds)
    await db.from('grades').delete().in('student_id', studentIds)
  }
  if (parentIds.length || studentIds.length || teacherId) {
    await db.from('notifications').delete().or(
      [ parentIds.length ? `user_id.in.(${parentIds.join(',')})` : '',
        studentIds.length ? `user_id.in.(${studentIds.join(',')})` : '',
        teacherId ? `user_id.eq.${teacherId}` : '' ].filter(Boolean).join(',')
    )
  }
  if (classId) {
    await db.from('class_messages').delete().eq('class_id', classId)
    await db.from('published_assignments').delete().eq('class_id', classId)
    await db.from('classes').delete().eq('id', classId)
  }
  if (studentIds.length) await db.from('students').delete().in('id', studentIds)
  if (parentIds.length)  await db.from('parent_profiles').delete().in('user_id', parentIds)
  // demo profiles last
  const allDemoIds = [...studentIds, ...parentIds]
  if (teacherId) allDemoIds.push(teacherId)
  if (allDemoIds.length) await db.from('profiles').delete().in('id', allDemoIds)

  return { ok:true }
}

// ── AFTER-SEED COUNT HELPERS (accurate numbers for the toast) ────────────────
async function summarizeForClass(classId: string) {
  const db = svc()
  const [students, parents, assignments, announcements, submissions, notifications] = await Promise.all([
    db.from('students').select('*',{count:'exact',head:true}),
    db.from('parent_profiles').select('*',{count:'exact',head:true}),
    db.from('published_assignments').select('*',{count:'exact',head:true}).eq('class_id', classId),
    db.from('class_messages').select('*',{count:'exact',head:true}).eq('class_id', classId).eq('message_type','announcement'),
    db.from('assignment_submissions').select('*',{count:'exact',head:true}),
    db.from('notifications').select('*',{count:'exact',head:true}).eq('type','missing_work'),
  ])
  return {
    students: students.count ?? 0,
    parents: parents.count ?? 0,
    assignments: assignments.count ?? 0,
    announcements: announcements.count ?? 0,
    submissions: submissions.count ?? 0,
    notifications: notifications.count ?? 0,
  }
}

// ── SEED (owner = caller) ────────────────────────────────────────────────────
async function seedDemoData(ownerId: string) {
  const db = svc()

  // 0) wipe previous demo rows
  await wipeDemoData()

  // 1) demo auth users
  const demoTeacher = await ensureAuthUser(TEACHER_EMAIL,'Demo Teacher',['teacher'])
  const studentUsers: User[] = []
  const parentUsers:  User[] = []
  for (let i=1;i<=NUM_STUDENTS;i++) {
    studentUsers.push(await ensureAuthUser(STUDENT_EMAIL(i),'Student',['student']))
    parentUsers.push(await ensureAuthUser(PARENT_EMAIL(i),'Parent',['parent']))
  }

  // owner must have a teacher profile
  await db.from('teacher_profiles').upsert({ id: ownerId, user_id: ownerId, school_name:'Full-STEM (Demo)', created_at:nowISO(), updated_at:nowISO() })

  // ensure owner profile row exists (in case your schema requires it)
  const { data: ownerProfile } = await db.from('profiles').select('id').eq('id', ownerId).maybeSingle()
  if (!ownerProfile) await db.from('profiles').upsert({ id: ownerId, full_name:'Demo Teacher', created_at:nowISO(), updated_at:nowISO() })

  // demo teacher profile (not owner) - but we'll use the owner's teacher profile for class ownership
  await db.from('profiles').upsert({ id: demoTeacher.id, email: TEACHER_EMAIL, full_name:'Demo Teacher', created_at:nowISO(), updated_at:nowISO() })

  // students / parents / relationships
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

  for (let i=0;i<NUM_STUDENTS;i++) {
    const s = studentUsers[i], p = parentUsers[i]
    const [first,last,grade,reading] = roster[i]
    await db.from('profiles').upsert({ id: s.id, email: STUDENT_EMAIL(i+1), full_name: `${first} ${last}`, created_at: nowISO(), updated_at: nowISO() })
    await db.from('profiles').upsert({ id: p.id, email: PARENT_EMAIL(i+1),  full_name: `Parent of ${first} ${last}`, created_at: nowISO(), updated_at: nowISO() })
    await db.from('students').upsert({
      id: s.id, first_name:first, last_name:last, grade_level:grade, reading_level:reading,
      learning_style: ['Visual','Kinesthetic','Auditory'][i%3],
      interests: [['Technology','Robotics'],['Art','Gaming'],['Science','Math']][i%3],
      language_preference:'English',
      created_at:nowISO(), updated_at:nowISO()
    })
    await db.from('parent_profiles').upsert({
      id: p.id, user_id:p.id, first_name:'Parent', last_name:last,
      phone_number:`555-${String(Math.floor(Math.random()*900)+100)}-${String(Math.floor(Math.random()*9000)+1000)}`,
      preferred_contact_method:'email',
      created_at:nowISO(), updated_at:nowISO()
    })
    await db.from('student_parent_relationships').upsert({
      id:`demo_rel_${String(i+1).padStart(2,'0')}`, student_id:s.id, parent_id:p.id,
      relationship_type:'parent', can_view_grades:true, can_view_attendance:true, can_receive_communications:true,
      created_at:nowISO()
    })
  }

  // class OWNED BY CALLER (using their teacher profile)
  const { data: ownerTeacherProfile } = await db.from('teacher_profiles').select('id').eq('user_id', ownerId).maybeSingle()
  if (!ownerTeacherProfile) {
    throw new Error(`No teacher profile found for user ${ownerId}`)
  }
  const teacherProfileId = ownerTeacherProfile.id
  
  console.log(`Creating class for teacher profile: ${teacherProfileId}`)
  
  const { data: existingClass } = await db.from('classes').select('id').eq('name',CLASS_NAME).eq('teacher_id',teacherProfileId).maybeSingle()
  const classId = existingClass?.id ?? `demo_class_${crypto.randomUUID().slice(0,8)}`
  
  const { error: classError } = await db.from('classes').upsert({
    id:classId, teacher_id:teacherProfileId, name:CLASS_NAME,
    grade_level:'7th-8th Grade', subject:'Computer Science - AI', school_year:'2024-2025',
    description:'Intro to AI concepts for middle school', duration:'1 Semester', instructor:'Demo Teacher',
    schedule:'MWF 2:00-3:00 PM', learning_objectives:'AI basics, ethics, hands-on projects', prerequisites:'Basic computer literacy',
    published:true, status:'published', max_students:25, published_at:nowISO(),
    created_at:nowISO(), updated_at:nowISO()
  })
  
  if (classError) {
    console.error('Error creating class:', classError)
    throw new Error(`Failed to create class: ${classError.message}`)
  }
  
  console.log(`Created/updated class: ${classId}`)

  // enroll: try schema A (students.class_id); else schema B (enrollments)
  const ids = studentUsers.map(u => u.id)
  const { error: eA } = await db.from('students').update({ class_id: classId }).in('id', ids)
  if (eA) {
    for (let i=0;i<ids.length;i++) {
      await db.from('enrollments').upsert({ id:`demo_enroll_${String(i+1).padStart(2,'0')}`, class_id:classId, student_id:ids[i], created_at:nowISO() })
    }
  }

  // assignments
  const bodies: Record<string,{title:string;html:string;days:number;}> = {
    [ASSIGNMENT_IDS[0]]:{ title:'What is AI? (Reading + 3 questions)', html:`<h2>What is Artificial Intelligence?</h2>
<p>Artificial Intelligence, or AI, is when computers are built to do tasks that usually need human thinking.</p>
<p>For example, recognizing a face in a photo or suggesting the next word in a sentence.</p>
<p><strong>Quick check:</strong> 1) Name one AI example. 2) Where have you seen AI? 3) Why can AI make mistakes?</p>
<hr/>
<p><em>Spanish sample:</em> La inteligencia artificial ayuda a las computadoras a aprender patrones y tomar decisiones más rápido.</p>`, days:3 },
    [ASSIGNMENT_IDS[1]]:{ title:'Ethics & Bias (Short Answer)', html:`<h2>AI Ethics & Bias</h2>
<p>AI can accidentally learn bias if the data it studies is unfair.</p>
<p>Explain a fair way to train an AI model for a school project.</p>`, days:5 },
    [ASSIGNMENT_IDS[2]]:{ title:'Build a Classifier (No-Code)', html:`<h2>Build a Tiny Classifier</h2>
<p>Use a no-code tool to train a model to tell apart two objects (e.g., apples vs. bananas).</p>
<p>Upload 5 examples of each, then share a one-paragraph reflection on what worked and what didn't.</p>`, days:7 },
  }
  for (const id of ASSIGNMENT_IDS) {
    const due = new Date(); due.setDate(due.getDate()+bodies[id].days)
    await db.from('published_assignments').upsert({
      id, class_assignment_id:id, class_id:classId,
      title:bodies[id].title, instructions:bodies[id].html, description:`Demo assignment: ${bodies[id].title}`,
      due_date:due.toISOString(), max_points:100, allow_text_response:true, max_files:3, file_types_allowed:['pdf','doc','docx','txt'],
      published_at:nowISO(), is_active:true, created_at:nowISO(), updated_at:nowISO()
    })
  }

  // grades scaffolding
  let { data: cat } = await db.from('grade_categories').select('id').eq('name','Assignments').maybeSingle()
  if (!cat) {
    const { data: newCat } = await db.from('grade_categories')
      .insert({ id:'demo_category_assignments', name:'Assignments', weight:100, color:'#3B82F6' })
      .select('id').maybeSingle()
    cat = newCat || { id:'demo_category_assignments' }
  }

  // submissions + grades
  const submissionRates = [0.7, 0.4, 2/12]
  const sampleAnswers = [
    "AI examples include voice assistants, recommendation systems, and facial recognition. I've seen AI in my phone camera and on YouTube suggestions. AI can make mistakes because it learns from incomplete or biased data.",
    "Train fairly with diverse, representative data. Test with varied examples and invite feedback to catch bias.",
    "I used a no-code tool to classify apples vs. bananas. Clear, well-lit photos worked; blurry or occluded images confused the model."
  ]
  for (let a=0;a<ASSIGNMENT_IDS.length;a++) {
    const assnId = ASSIGNMENT_IDS[a]
    const num = Math.floor(NUM_STUDENTS * submissionRates[a])
    for (let i=0;i<num;i++) {
      const studentId = ids[i]
      await db.from('assignment_submissions').upsert({
        id:`demo_sub_${a+1}_${String(i+1).padStart(2,'0')}`, assignment_id:assnId, user_id:studentId,
        text_response:sampleAnswers[a], status:'submitted',
        submitted_at:new Date(Date.now()-Math.random()*7*24*60*60*1000).toISOString(),
        created_at:nowISO(), updated_at:nowISO()
      })
      const pts = Math.floor(Math.random()*31)+70
      await db.from('grades').upsert({
        id:`demo_grade_${a+1}_${String(i+1).padStart(2,'0')}`, student_id:studentId, assignment_id:assnId, category_id:cat?.id,
        points_earned:pts, points_possible:100, percentage:pts,
        letter_grade: pts>=90?'A':pts>=80?'B':'C',
        graded_by: teacherProfileId, comments: pts>=90?'Excellent work!':pts>=80?'Good job!':'Keep practicing!',
        graded_at:nowISO(), created_at:nowISO(), updated_at:nowISO()
      })
    }
  }

  // announcements
  const announcements = [
    { id:'demo_msg_1', title:'Welcome to AI Class!', content:"Please read Assignment #1 and click Play for Read-Aloud. Try Translate for the Spanish sample." },
    { id:'demo_msg_2', title:'Project Reminder',    content:'Bring 2 objects to photograph for Assignment #3 (classifier project).' }
  ]
  for (let i=0;i<announcements.length;i++) {
    const a = announcements[i]
    await db.from('class_messages').upsert({
      id:a.id, class_id:classId, teacher_id:teacherProfileId, title:a.title, content:a.content,
      message_type:'announcement', priority:i?'high':'normal',
      sent_at:new Date(Date.now()-(announcements.length-i)*24*60*60*1000).toISOString(),
      created_at:nowISO(), updated_at:nowISO()
    })
  }

  // parent notifications (missing assignment #1)
  const submitted = Math.floor(NUM_STUDENTS * 0.7)
  for (let i=submitted;i<NUM_STUDENTS;i++) {
    const stId = ids[i], parentId = parentUsers[i].id
    const due = new Date(); due.setDate(due.getDate()+3)
    await db.from('notifications').upsert({
      id:`demo_notif_${i+1}`, user_id:parentId, title:'Missing Assignment Alert',
      message:`Your student has a missing assignment: 'What is AI? (Reading + 3 questions)'. Please submit by ${due.toLocaleDateString()}.`,
      type:'missing_work', read:false,
      metadata:{ student_id:stId, assignment_id:ASSIGNMENT_IDS[0], assignment_title:'What is AI? (Reading + 3 questions)', due_date:due.toISOString() },
      created_at:nowISO(), updated_at:nowISO()
    })
  }

  // 6) return accurate counts for the toast
  const counts = await summarizeForClass(classId)
  return { ok:true, classId, counts }
}

// ── SERVER ───────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const { headers, preflight } = buildCors(req)
  try {
    if (req.method === 'OPTIONS') return preflight()

    const url = new URL(req.url)
    const action = (url.searchParams.get('action') || 'status').toLowerCase()

    if (req.method === 'GET' && action === 'status') {
      const summary = await getDemoSummary()
      return new Response(JSON.stringify({ ok:true, ...summary }), { status:200, headers:{ ...headers, 'Content-Type':'application/json' } })
    }

    if (req.method === 'POST' && (action === 'seed' || action === 'wipe')) {
      const gate = await requireTeacherOrAdmin(req)
      if (!('ok' in gate) || !gate.ok) {
        return new Response(JSON.stringify(gate.body), { status:gate.status!, headers:{ ...headers, 'Content-Type':'application/json' } })
      }

      if (action === 'wipe') {
        await wipeDemoData()
        return new Response(JSON.stringify({ ok:true, message:'Demo data wiped' }), { status:200, headers:{ ...headers, 'Content-Type':'application/json' } })
      } else {
        const result = await seedDemoData(gate.user.id)
        return new Response(JSON.stringify({ ok:true, message:'Demo data seeded', ...result }), { status:200, headers:{ ...headers, 'Content-Type':'application/json' } })
      }
    }

    return new Response(JSON.stringify({ code:'BAD_REQUEST', message:'Use GET ?action=status or POST ?action=seed|wipe' }), { status:400, headers:{ ...headers, 'Content-Type':'application/json' } })
  } catch (e) {
    console.error('seed-demo-tenant error:', e)
    return new Response(JSON.stringify({ code:'UNEXPECTED', message:String((e as Error).message || e) }), { status:500, headers:{ ...headers, 'Content-Type':'application/json' } })
  }
})
