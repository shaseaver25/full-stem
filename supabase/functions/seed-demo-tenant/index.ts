// supabase/functions/seed-demo-tenant/index.ts
// Demo seeding + wiping + public status (CORS-safe, returns counts)

import { createClient, type User } from 'https://esm.sh/@supabase/supabase-js@2'

// ── ENV ──────────────────────────────────────────────────────────────────────
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY     = Deno.env.get('SUPABASE_ANON_KEY')!

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const TEACHER_EMAIL = 'demo@creatempls.org'
const CLASS_NAME    = 'Outlook Odyssey: Professional Communication Training'
const STUDENT_EMAIL = (i: number) => `student${String(i).padStart(2,'0')}@demo.school`
const PARENT_EMAIL  = (i: number) => `parent${String(i).padStart(2,'0')}@demo.family`
const NUM_STUDENTS = 12
// Generate proper UUIDs for assignments
const generateAssignmentIds = (count: number) => Array(count).fill(0).map(() => crypto.randomUUID())

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
      id: crypto.randomUUID(), student_id:s.id, parent_id:p.id,
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
  // Generate a proper UUID for the class ID
  const classId = existingClass?.id ?? crypto.randomUUID()
  
  const { error: classError } = await db.from('classes').upsert({
    id:classId, teacher_id:teacherProfileId, name:CLASS_NAME,
    grade_level:'9th-12th Grade', subject:'Career & Technical Education / Digital Communications', school_year:'2024-2025',
    description:'Master Microsoft Outlook and professional communication skills for workplace success. Prepare for MOS certification.', 
    duration:'4 Weeks', instructor:'Demo Teacher',
    schedule:'Mon-Thu 9:00-11:00 AM', 
    learning_objectives:'Navigate Outlook efficiently, compose professional emails, manage calendars and tasks, practice AI-assisted communication, prepare for MOS Outlook certification',
    prerequisites:'Basic computer literacy',
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
      await db.from('enrollments').upsert({ id: crypto.randomUUID(), class_id:classId, student_id:ids[i], created_at:nowISO() })
    }
  }

  // create 4 comprehensive lessons based on Outlook curriculum
  console.log('Creating lessons...')
  const lessons = [
    {
      id: crypto.randomUUID(),
      class_id: classId,
      title: 'Day 1: Getting Started with Outlook',
      description: 'Navigate Outlook interface, manage inbox, folders, and basic features',
      objectives: ['Navigate Outlook interface efficiently', 'Manage inbox and folders', 'Use search and tags effectively', 'Set up email signature'],
      materials: ['Computer with Outlook access', 'Video: https://youtu.be/pWGtXWumb4A', 'Outlook Treasure Hunt worksheet'],
      content: { introduction: 'Welcome to Outlook! Today we begin our journey to master professional email communication.' },
      duration: 120,
      order_index: 1,
      created_at: nowISO(),
      updated_at: nowISO()
    },
    {
      id: crypto.randomUUID(),
      class_id: classId,
      title: 'Day 2: Email Writing & Professional Etiquette',
      description: 'Learn professional email formatting, tone, and communication best practices',
      objectives: ['Write professional emails with proper formatting', 'Understand formal vs informal tone', 'Apply email etiquette rules', 'Revise using AI feedback'],
      materials: ['Email examples handout', 'Case study scenarios', 'Peer review rubric', 'AI Email Coach activity'],
      content: { introduction: 'Professional communication is key to workplace success. Let us master email etiquette.' },
      duration: 120,
      order_index: 2,
      created_at: nowISO(),
      updated_at: nowISO()
    },
    {
      id: crypto.randomUUID(),
      class_id: classId,
      title: 'Day 3: Calendar & Task Management',
      description: 'Master Outlook Calendar for scheduling meetings, events, and task coordination',
      objectives: ['Schedule meetings and calendar events', 'Assign and manage tasks', 'Coordinate team schedules effectively', 'Use Outlook To Do'],
      materials: ['Outlook Calendar access', 'Task manager guide', 'Real-world simulation scenarios', 'Weekly Calendar Blocking Template'],
      content: { introduction: 'Effective scheduling is crucial for productivity. Learn to manage your time like a pro.' },
      duration: 120,
      order_index: 3,
      created_at: nowISO(),
      updated_at: nowISO()
    },
    {
      id: crypto.randomUUID(),
      class_id: classId,
      title: 'Day 4: Certification Practice & Phishing Security',
      description: 'MOS Outlook certification prep and cybersecurity awareness training',
      objectives: ['Practice MOS certification exam questions', 'Identify phishing attempts', 'Apply security best practices', 'Complete course reflection'],
      materials: ['CertPREP practice tests', 'Phishing examples', 'Security checklist', 'Course survey'],
      content: { introduction: 'Final day! Let us prepare for certification and learn to stay safe online.' },
      duration: 120,
      order_index: 4,
      created_at: nowISO(),
      updated_at: nowISO()
    }
  ]
  
  const { data: createdLessons, error: lessonsError } = await db.from('lessons').insert(lessons).select()
  if (lessonsError) {
    console.error('Failed to create lessons:', lessonsError)
    throw new Error(`Failed to create lessons: ${lessonsError.message}`)
  }
  console.log(`Created ${createdLessons.length} lessons`)

  // create lesson components for interactive content
  console.log('Creating lesson components...')
  const lessonComponents = []
  for (const lesson of createdLessons) {
    lessonComponents.push(
      {
        id: crypto.randomUUID(),
        lesson_id: lesson.id,
        component_type: 'video',
        content: { 
          url: 'https://youtu.be/pWGtXWumb4A',
          title: 'Outlook Navigation Overview',
          description: 'Learn the basics of navigating Microsoft Outlook'
        },
        order: 1,
        enabled: true,
        created_at: nowISO(),
        updated_at: nowISO()
      },
      {
        id: crypto.randomUUID(),
        lesson_id: lesson.id,
        component_type: 'instructions',
        content: {
          title: lesson.title,
          text: `<h2>${lesson.title}</h2><p>${lesson.description}</p><h3>Learning Objectives:</h3><ul>${lesson.objectives.map((obj: string) => `<li>${obj}</li>`).join('')}</ul><h3>Materials Needed:</h3><ul>${lesson.materials.map((mat: string) => `<li>${mat}</li>`).join('')}</ul>`
        },
        order: 2,
        enabled: true,
        created_at: nowISO(),
        updated_at: nowISO()
      },
      {
        id: crypto.randomUUID(),
        lesson_id: lesson.id,
        component_type: 'activity',
        content: {
          title: 'Hands-On Practice',
          description: 'Complete the practice activities to reinforce your learning',
          instructions: lesson.description
        },
        order: 3,
        enabled: true,
        created_at: nowISO(),
        updated_at: nowISO()
      }
    )
  }
  
  const { error: componentsError } = await db.from('lesson_components').insert(lessonComponents)
  if (componentsError) {
    console.error('Warning: Failed to create lesson components:', componentsError)
  } else {
    console.log(`Created ${lessonComponents.length} lesson components`)
  }

  // assignments with rich realistic content
  const ASSIGNMENT_IDS = generateAssignmentIds(4)
  const bodies: Array<{title:string;html:string;rubric:string;days:number;}> = [
    { 
      title:'Outlook Treasure Hunt', 
      html:`<h2>Outlook Treasure Hunt Assignment</h2>
<p>Complete the following tasks to familiarize yourself with Outlook's key features:</p>
<ol>
  <li><strong>Send a test email</strong> to yourself with the subject "Outlook Test"</li>
  <li><strong>Create three custom folders</strong>: Work, Personal, and Archive</li>
  <li><strong>Search for messages</strong> using keywords and date filters</li>
  <li><strong>Apply tags/categories</strong> to 3 different emails</li>
  <li><strong>Set up an email signature</strong> with your name and role</li>
</ol>
<p><strong>Submission Requirements:</strong> Take screenshots of each completed task and upload them as a single document or zip file.</p>`,
      rubric:`<h3>Grading Rubric (100 points)</h3>
<ul>
  <li><strong>All 5 tasks completed:</strong> 50 points</li>
  <li><strong>Screenshots clearly show completion:</strong> 30 points</li>
  <li><strong>Organization and presentation:</strong> 20 points</li>
</ul>`,
      days:3 
    },
    { 
      title:'Professional Email Writing', 
      html:`<h2>Professional Email Assignment</h2>
<p>Write professional emails for the following three workplace scenarios:</p>
<h3>Scenario 1: Requesting Time Off</h3>
<p>Write an email to your supervisor requesting 2 days off next month. Include dates and reason.</p>
<h3>Scenario 2: Client Follow-Up</h3>
<p>Follow up with a client about the status of a project. Be professional and clear about next steps.</p>
<h3>Scenario 3: Meeting Response</h3>
<p>Respond to a meeting invitation, confirming your attendance and requesting the agenda.</p>
<p><strong>Requirements for each email:</strong></p>
<ul>
  <li>Appropriate subject line</li>
  <li>Professional greeting and closing</li>
  <li>Clear, concise body text with proper tone</li>
  <li>Proper email structure</li>
</ul>
<p><strong>Bonus:</strong> Submit your drafts to ChatGPT for feedback, then revise and highlight the changes you made.</p>`,
      rubric:`<h3>Grading Rubric (100 points)</h3>
<ul>
  <li><strong>Content and clarity:</strong> 40 points</li>
  <li><strong>Professional tone:</strong> 30 points</li>
  <li><strong>Format and structure:</strong> 20 points</li>
  <li><strong>AI revision reflection (bonus):</strong> 10 points</li>
</ul>`,
      days:5 
    },
    { 
      title:'Calendar Coordination Challenge', 
      html:`<h2>Calendar Management Assignment</h2>
<p>You need to coordinate a team meeting with the following requirements:</p>
<ul>
  <li><strong>4 team members</strong> in different time zones (EST, CST, PST, GMT)</li>
  <li><strong>Meeting duration:</strong> 1 hour</li>
  <li><strong>Conference room booking</strong> required</li>
  <li><strong>Send calendar invitations</strong> to all participants</li>
  <li><strong>Create task assignments</strong> for meeting preparation</li>
</ul>
<h3>Deliverables:</h3>
<ol>
  <li>Screenshot of calendar with meeting scheduled showing all participants</li>
  <li>Screenshot of task list with assigned prep items</li>
  <li>Brief explanation of how you handled the time zone coordination</li>
</ol>
<p><strong>Tip:</strong> Use Outlook's "Scheduling Assistant" feature to find the best meeting time.</p>`,
      rubric:`<h3>Grading Rubric (100 points)</h3>
<ul>
  <li><strong>Correct time zone coordination:</strong> 35 points</li>
  <li><strong>Proper calendar invitation format:</strong> 25 points</li>
  <li><strong>Task creation and assignment:</strong> 25 points</li>
  <li><strong>Professional meeting details:</strong> 15 points</li>
</ul>`,
      days:7 
    },
    { 
      title:'Phishing Detection Challenge', 
      html:`<h2>Cybersecurity Challenge: Identify Phishing Attempts</h2>
<p>Review the 10 emails in your practice inbox and complete the following:</p>
<ol>
  <li><strong>Identify the 3 phishing emails</strong> among the 10 provided</li>
  <li><strong>List the red flags</strong> you noticed for each phishing attempt</li>
  <li><strong>Describe the proper response</strong> for each suspicious email</li>
  <li><strong>Create a security checklist</strong> (5-10 items) for your team to use when evaluating suspicious emails</li>
</ol>
<h3>Common Phishing Indicators to Watch For:</h3>
<ul>
  <li>Urgent or threatening language</li>
  <li>Suspicious sender addresses</li>
  <li>Unexpected requests for personal information</li>
  <li>Poor grammar and spelling</li>
  <li>Generic greetings ("Dear Customer")</li>
  <li>Suspicious links or attachments</li>
</ul>
<p><strong>Real-World Scams to Know:</strong> Package delivery notices, fake job offers, student loan forgiveness scams, tech support scams, QR code traps</p>`,
      rubric:`<h3>Grading Rubric (100 points)</h3>
<ul>
  <li><strong>Correctly identified phishing emails:</strong> 40 points</li>
  <li><strong>Explanation of red flags:</strong> 30 points</li>
  <li><strong>Response procedures:</strong> 20 points</li>
  <li><strong>Security checklist quality:</strong> 10 points</li>
</ul>`,
      days:10 
    },
  ]
  
  for (let i = 0; i < ASSIGNMENT_IDS.length; i++) {
    const id = ASSIGNMENT_IDS[i]
    const body = bodies[i]
    const due = new Date(); due.setDate(due.getDate()+body.days)
    await db.from('published_assignments').upsert({
      id, class_assignment_id:id, class_id:classId, lesson_id: createdLessons[i]?.id,
      title:body.title, instructions:body.html, description:`Week ${i+1} assignment for Outlook training`,
      rubric: body.rubric,
      due_date:due.toISOString(), max_points:100, allow_text_response:true, max_files:5, 
      file_types_allowed:['pdf','doc','docx','txt','jpg','jpeg','png','zip'],
      published_at:nowISO(), is_active:true, created_at:nowISO(), updated_at:nowISO()
    })
  }
  console.log(`Created ${ASSIGNMENT_IDS.length} assignments`)

  // grades scaffolding
  let { data: cat } = await db.from('grade_categories').select('id').eq('name','Assignments').maybeSingle()
  if (!cat) {
    const categoryId = crypto.randomUUID()
    const { data: newCat } = await db.from('grade_categories')
      .insert({ id: categoryId, name:'Assignments', weight:100, color:'#3B82F6' })
      .select('id').maybeSingle()
    cat = newCat || { id: categoryId }
  }

  // submissions + grades
  const submissionRates = [0.75, 0.5, 0.33, 0.17]
  const sampleAnswers = [
    "Completed all 5 tasks. Screenshots attached showing: 1) Test email sent to myself, 2) Three folders created (Work, Personal, Archive), 3) Search results using keyword filters, 4) Tags applied to emails, 5) Email signature configured with name and role.",
    "Three professional emails completed:\n\n1. Time Off Request: Requested Nov 15-16 for family event, offered to complete urgent tasks beforehand.\n\n2. Client Follow-Up: Checked in on Q3 deliverables, proposed Friday meeting to review roadmap.\n\n3. Meeting Response: Confirmed attendance for Team Sync, requested agenda to prepare.\n\nAI feedback helped me improve tone and clarity - made language more concise and professional.",
    "Scheduled team meeting for Tuesday 2pm EST (11am PST, 7pm GMT). Used Scheduling Assistant to find time that works for all 4 participants. Booked Conference Room B. Created task list: John - prepare slides, Maria - send pre-read materials, Chen - set up video conference, Lisa - take notes. Time zone coordination was tricky but I used world clock feature to verify.",
    "Identified 3 phishing emails:\n\nEmail #3 (Free Gift Card): Red flags - suspicious sender, urgent tone, unverified link\n\nEmail #6 (Account Suspension): Red flags - threatening language, requests immediate action, fake sender address\n\nEmail #9 (Inheritance): Red flags - too good to be true, requests bank details, poor grammar\n\nProper response: Don't click links, report to IT, delete immediately.\n\nSecurity Checklist:\n1. Verify sender address\n2. Check for urgent/threatening language\n3. Hover over links before clicking\n4. Look for grammar errors\n5. Question unexpected requests\n6. Never share passwords/bank info\n7. Report suspicious emails to IT"
  ]
  for (let a=0;a<ASSIGNMENT_IDS.length;a++) {
    const assnId = ASSIGNMENT_IDS[a]
    const num = Math.floor(NUM_STUDENTS * submissionRates[a])
    for (let i=0;i<num;i++) {
      const studentId = ids[i]
      await db.from('assignment_submissions').upsert({
        id: crypto.randomUUID(), assignment_id:assnId, user_id:studentId,
        text_response:sampleAnswers[a], status:'submitted',
        submitted_at:new Date(Date.now()-Math.random()*7*24*60*60*1000).toISOString(),
        created_at:nowISO(), updated_at:nowISO()
      })
      const pts = Math.floor(Math.random()*31)+70
      await db.from('grades').upsert({
        id: crypto.randomUUID(), student_id:studentId, assignment_id:assnId, category_id:cat?.id,
        points_earned:pts, points_possible:100, percentage:pts,
        letter_grade: pts>=90?'A':pts>=80?'B':'C',
        graded_by: teacherProfileId, comments: pts>=90?'Excellent work!':pts>=80?'Good job!':'Keep practicing!',
        graded_at:nowISO(), created_at:nowISO(), updated_at:nowISO()
      })
    }
  }

  // announcements
  const announcements = [
    { title:'Welcome to AI Class!', content:"Please read Assignment #1 and click Play for Read-Aloud. Try Translate for the Spanish sample." },
    { title:'Project Reminder',    content:'Bring 2 objects to photograph for Assignment #3 (classifier project).' }
  ]
  for (let i=0;i<announcements.length;i++) {
    const a = announcements[i]
    await db.from('class_messages').upsert({
      id: crypto.randomUUID(), class_id:classId, teacher_id:teacherProfileId, title:a.title, content:a.content,
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
      id: crypto.randomUUID(), user_id:parentId, title:'Missing Assignment Alert',
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
