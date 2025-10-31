# Lesson Builder Component Types

Complete reference for all available lesson component types, their features, and when to use them.

---

## 1. 📊 PowerPoint/Slides (`slides`)

**Icon**: Presentation | **Color**: Soft Indigo (#E0E7FF / #3730A3)

### What it does
Displays slide presentations with advanced navigation, read-aloud, and translation features for optimal student viewing experience.

### Key Features
- **Slide-by-slide viewer** - Display slides individually with navigation controls
- **Keyboard navigation** - Arrow keys, Home, End, F for fullscreen, ESC to exit
- **Read-aloud capability** - Text-to-speech reads slide content and speaker notes
- **Translation support** - Translate slide text to 50+ languages
- **Progress tracking** - Visual progress bar and completion tracking
- **Fullscreen mode** - Distraction-free viewing
- **Mobile responsive** - Touch swipe gestures for navigation
- **Thumbnail strip** - Quick navigation via slide thumbnails
- **Speaker notes** - Display additional context below slides

### Teacher Configuration
**Required Fields:**
- Title (presentation title)
- Embed URL (Google Slides, Prezi, etc.)

**Optional Settings:**
- Speaker notes (additional context)
- Allow downloads (default: true)
- Require full viewing (default: false)
- Show thumbnails (default: true)
- Enable translation (default: true)

### Supported Platforms
- Google Slides (via embed URL)
- Prezi
- SlideShare  
- Canva presentations
- Any public embed URL

### Student Experience
- Navigate slides with buttons, keyboard, or swipes
- Click volume icon to hear content read aloud
- Select language to translate slide text
- Track progress with visual indicator
- View in fullscreen for better focus

### File Attachments
Can attach supplementary files via Google Drive, OneDrive, or local uploads.

### ⚠️ Important: Not Available in AI Lesson Creation
**Reason**: LLMs (Gemini, GPT) cannot generate actual PowerPoint or slide files - only text content. Teachers must manually upload or provide embed URLs.

### Accessibility
✅ WCAG 2.1 AA compliant - Full keyboard navigation, screen reader support, ARIA labels

---

## 2. 📄 Page (`page`)

**Icon**: FileText | **Color**: Soft Blue

### What it does
Rich text content pages with full formatting capabilities, perfect for reading materials, instructions, and informational content.

### Key Features
- **Rich text editor** - Bold, italic, lists, headings, links, images
- **HTML support** - Embed formatted content
- **Read-aloud** - Text-to-speech for accessibility
- **Translation** - Multi-language support

### Teacher Configuration
**Required Fields:**
- Title
- Body content (rich text)

### Student Experience
- Read formatted content
- Use read-aloud for audio version
- Translate to preferred language

### File Attachments
Yes - Google Drive, OneDrive, local uploads

### AI Generation
✅ Available in AI lesson creation

### Accessibility
✅ WCAG 2.1 AA compliant

---

## 3. 🎥 Multimedia (Video) (`video`)

**Icon**: Video | **Color**: Soft Purple

### What it does
Embed videos, audio files, or interactive multimedia content from YouTube, Vimeo, and other platforms.

### Key Features
- **Video embedding** - YouTube, Vimeo, etc.
- **Audio support** - Embed audio files
- **Captions** - Add video descriptions
- **Responsive player** - Adapts to screen size

### Teacher Configuration
**Required Fields:**
- Title
- Video URL

**Optional Fields:**
- Caption/description

### Student Experience
- Watch embedded videos
- Read captions for context

### File Attachments
Yes - Google Drive, OneDrive, local uploads

### AI Generation
✅ Available in AI lesson creation (AI provides URLs)

### Accessibility
⚠️ Depends on embedded content - Use videos with captions

---

## 4. 💬 Discussion (`discussion`)

**Icon**: MessageSquare | **Color**: Soft Green

### What it does
AI-powered discussion prompts with threaded responses and teacher moderation. Includes AI assistance for generating and regenerating discussion questions.

### Key Features
- **AI-generated prompts** - Lovable AI creates discussion questions
- **Threaded responses** - Students reply to prompt and each other
- **Teacher regeneration** - Regenerate prompts with one click
- **Real-time updates** - See student responses live
- **Moderation tools** - Teachers can manage discussions

### Teacher Configuration
**Required Fields:**
- Discussion prompt (can be AI-generated)

**AI Features:**
- Auto-generate prompts based on lesson context
- Regenerate for better questions
- Context-aware suggestions

### Student Experience
- Read AI-generated discussion prompt
- Post responses
- Reply to classmates
- Engage in threaded conversations

### File Attachments
Yes - Google Drive, OneDrive, local uploads

### AI Generation
✅ Available in AI lesson creation (with AI-generated prompts)

### Accessibility
✅ WCAG 2.1 AA compliant - Screen reader friendly

---

## 5. 💻 Coding IDE (`codingEditor`)

**Icon**: Code | **Color**: Soft Orange

### What it does
Live coding environment for programming exercises, allowing students to write and test code directly in the lesson.

### Key Features
- **Live code editor** - Write code in-browser
- **Syntax highlighting** - Language-aware formatting
- **Multiple languages** - JavaScript, Python, HTML/CSS, etc.
- **Embed external IDEs** - Replit, CodePen, JSFiddle

### Teacher Configuration
**Required Fields:**
- Title
- Embed URL (Replit, CodePen, etc.) OR starter code

**Optional Fields:**
- Instructions
- Starting code

### Student Experience
- Write and run code
- See immediate results
- Follow coding instructions

### File Attachments
Yes - Google Drive, OneDrive, local uploads

### AI Generation
✅ Available in AI lesson creation (AI provides starter code)

### Accessibility
⚠️ Depends on embedded IDE - Use accessible platforms

---

## 6. 🎯 Activity (`activity`)

**Icon**: Activity | **Color**: Soft Teal

### What it does
In-class activities and group work exercises with descriptions and instructions.

### Key Features
- **Activity descriptions** - Clear instructions
- **Resources** - Attach materials needed
- **Time estimates** - Set activity duration
- **Group work support** - Collaborative activities

### Teacher Configuration
**Required Fields:**
- Title
- Description

**Optional Fields:**
- Time estimate
- Materials needed

### Student Experience
- Read activity instructions
- Access attached resources
- Complete activity tasks

### File Attachments
Yes - Google Drive, OneDrive, local uploads

### AI Generation
✅ Available in AI lesson creation

### Accessibility
✅ WCAG 2.1 AA compliant

---

## 7. 📝 Assignment (`assignment`)

**Icon**: FileCheck | **Color**: Soft Red

### What it does
Graded homework and projects with points, due dates, and submission tracking. Automatically marked as assignable.

### Key Features
- **Point values** - Set assignment worth
- **Due dates** - Deadline tracking
- **Submission tracking** - Monitor completions
- **Auto-assignable** - Automatically flagged for grading
- **Instructions** - Detailed assignment requirements

### Teacher Configuration
**Required Fields:**
- Title
- Instructions
- Point value

**Optional Fields:**
- Due date
- Submission guidelines
- Rubric

### Student Experience
- View assignment details
- See point value and due date
- Submit work (via attachments)
- Track completion status

### File Attachments
Yes - Google Drive, OneDrive, local uploads

### AI Generation
✅ Available in AI lesson creation

### Accessibility
✅ WCAG 2.1 AA compliant

---

## 8. 💡 Reflection (`reflection`)

**Icon**: Lightbulb | **Color**: Soft Yellow

### What it does
Student reflection prompts for self-assessment and metacognitive learning.

### Key Features
- **Reflection prompts** - Thought-provoking questions
- **Self-assessment** - Students evaluate their learning
- **Open-ended responses** - Free-form writing
- **Personal growth** - Track learning journey

### Teacher Configuration
**Required Fields:**
- Title
- Reflection prompt

**Optional Fields:**
- Guiding questions

### Student Experience
- Read reflection prompt
- Write personal responses
- Think about learning

### File Attachments
Yes - Google Drive, OneDrive, local uploads

### AI Generation
✅ Available in AI lesson creation (AI generates prompts)

### Accessibility
✅ WCAG 2.1 AA compliant

---

## 9. 📖 Instructions (`instructions`)

**Icon**: BookOpen | **Color**: Soft Indigo

### What it does
Step-by-step procedural instructions for activities, labs, or projects.

### Key Features
- **Sequential steps** - Clear, numbered instructions
- **Visual aids** - Attach images/diagrams
- **Safety notes** - Highlight important warnings
- **Checklists** - Track completion of steps

### Teacher Configuration
**Required Fields:**
- Title
- Step-by-step instructions

**Optional Fields:**
- Safety notes
- Materials list
- Diagrams/images

### Student Experience
- Follow step-by-step instructions
- Check off completed steps
- View visual aids

### File Attachments
Yes - Google Drive, OneDrive, local uploads

### AI Generation
✅ Available in AI lesson creation

### Accessibility
✅ WCAG 2.1 AA compliant

---

## 10. 📁 Resources (`resources`)

**Icon**: FolderOpen | **Color**: Soft Gray

### What it does
Collection of additional materials, references, and supplementary content for students.

### Key Features
- **Resource library** - Links and files
- **Reference materials** - External resources
- **Supplementary content** - Optional reading
- **Organized collection** - Categorized resources

### Teacher Configuration
**Required Fields:**
- Title
- Resource list or links

**Optional Fields:**
- Descriptions for each resource
- Categories

### Student Experience
- Browse available resources
- Access supplementary materials
- Download files
- Visit external links

### File Attachments
Yes - Google Drive, OneDrive, local uploads

### AI Generation
✅ Available in AI lesson creation (AI suggests resources)

### Accessibility
✅ WCAG 2.1 AA compliant

---

## Universal Features

All components support these features:

### ✅ Assignability
- Checkbox to mark component as "assignable"
- Assignments are automatically marked assignable
- Teachers can grade assignable components

### 📎 File Attachments
All components support attaching files from:
- **Google Drive** - Pick files from Google Drive
- **OneDrive** - Pick files from OneDrive  
- **Local uploads** - Upload from computer

### 🔊 Read-Aloud (where applicable)
- Text-to-speech for content
- Multiple languages supported
- Playback controls

### 🌐 Translation (where applicable)
- 50+ language support
- Real-time translation
- Persistent preferences

### 🎨 Management Controls
- **Drag & drop** - Reorder components
- **Expand/collapse** - Show/hide details
- **Enable/disable** - Toggle visibility
- **Delete** - Remove component

### ♿ Accessibility
All components are WCAG 2.1 AA compliant with:
- Keyboard navigation
- Screen reader support
- ARIA labels
- High contrast mode
- Focus indicators

---

## Component Workflow

1. **Add Component** - Click "Add Component" button
2. **Select Type** - Choose from 10 component types
3. **Configure** - Fill in required and optional fields
4. **Attach Files** - Add supplementary materials (optional)
5. **Mark Assignable** - Check if gradable (optional)
6. **Reorder** - Drag to desired position
7. **Save Lesson** - Publish or save as draft

---

## AI Lesson Creation Notes

### ✅ Available in AI Generation
Most components can be auto-generated by AI:
- Page (text content)
- Video (AI provides URLs)
- Discussion (AI-generated prompts)
- Coding IDE (AI provides starter code)
- Activity (AI-generated activities)
- Assignment (AI-generated assignments)
- Reflection (AI-generated prompts)
- Instructions (AI-generated steps)
- Resources (AI-suggested resources)

### ❌ NOT Available in AI Generation
- **Presentation/Slides** - LLMs cannot create actual slide files (only text)

Teachers must manually add presentation components with:
- Upload PowerPoint files
- Provide embed URLs (Google Slides, Prezi, etc.)

### Future Enhancement
If we integrate with a slides API (e.g., Canva), AI could:
1. Generate slide content (text, structure)
2. API creates actual slides
3. Presentation component could then be AI-enabled

---

## Best Practices

### When to Use Each Component

| Component | Best For | Avoid For |
|-----------|----------|-----------|
| Slides | Lectures, presentations | Long reading materials |
| Page | Reading, instructions | Videos or interactive content |
| Video | Demonstrations, lectures | Text-heavy content |
| Discussion | Critical thinking, debate | Factual recall |
| Coding IDE | Programming practice | Non-technical subjects |
| Activity | Hands-on learning, groups | Individual study |
| Assignment | Graded work, projects | Practice exercises |
| Reflection | Self-assessment, growth | Factual knowledge |
| Instructions | Procedures, labs | Conceptual learning |
| Resources | Supplementary materials | Core lesson content |

### Lesson Structure Tips
1. **Start with warm-up** - Page or Discussion
2. **Core content** - Slides, Page, or Video
3. **Practice** - Activity, Coding IDE
4. **Assessment** - Assignment, Discussion
5. **Reflection** - Reflection component
6. **Extras** - Resources component

---

**Version**: 1.0.0  
**Last Updated**: October 31, 2025  
**Components Location**: `src/components/lesson-builder/`  
**Renderer Location**: `src/components/lesson/LessonComponentRenderer.tsx`
