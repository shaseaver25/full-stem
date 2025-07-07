-- Replace existing Word lessons with comprehensive MOS-focused curriculum

-- First, delete existing Word lessons to avoid conflicts
DELETE FROM "Lessons" WHERE "Track" = 'Microsoft Word';

-- Lesson 1: Document Structure & Layout
INSERT INTO "Lessons" ("Lesson ID", "Title", "Description", "Track", "Order", "Text") VALUES (
  101,
  'Document Structure & Layout',
  'Master professional document organization with section breaks, headers/footers, and consistent formatting using styles - essential skills for any workplace.',
  'Microsoft Word',
  1,
  'Welcome to Document Structure & Layout! 🏗️

LEARNING OBJECTIVE: Create multi-section professional documents with consistent formatting, navigation tools, and proper layout structure for workplace readiness.

WHY THIS MATTERS FOR INTERNS:
In your internship, you''ll create reports, proposals, and presentations that need to look professional and be easy to navigate. Employers expect documents with consistent formatting and clear structure.

GOOGLE DOCS VS. WORD:
If you''re used to Google Docs, Word offers much more powerful formatting tools! While Google Docs has basic headers and page breaks, Word gives you precise control over document sections, professional templates, and advanced navigation.

KEY CONCEPTS:

1. SECTION VS. PAGE BREAKS
- Page Break: Starts new page (think of it like pressing Enter many times)
- Section Break: Creates completely separate sections with different formatting
- Use Case: Different headers for each chapter, or mixing portrait/landscape pages

2. PAGE SETUP MASTERY
- Margins: Professional documents typically use 1" margins
- Orientation: Portrait for letters, Landscape for wide tables/charts
- Pro Tip: Always check margins before printing - saves paper and looks professional!

3. HEADERS & FOOTERS
- Headers: Company name, document title, date
- Footers: Page numbers, your name, file path
- Different first page: Title pages don''t need headers!

4. STYLES - YOUR FORMATTING SUPERPOWER
- Heading 1: Main sections (like chapter titles)
- Heading 2: Subsections 
- Normal: Body text
- Benefits: Click once to format, automatic Table of Contents, consistent look

5. NAVIGATION PANE
- Shows document outline
- Click headings to jump to sections
- Perfect for long documents!

HANDS-ON PROJECT: Create a Professional Internship Report
You''ll create a 4-section document:
- Title Page (no header/footer)
- Executive Summary (different header)
- Main Report (numbered pages)
- Appendix (different formatting)

ACCESSIBILITY FEATURES:
- Use proper heading hierarchy for screen readers
- Meaningful page numbers and section titles
- High contrast colors for visual clarity

PRACTICE TASKS:
1. Insert section breaks between document parts
2. Create different headers for each section
3. Apply consistent heading styles
4. Generate automatic page numbering
5. Use Navigation Pane to jump between sections

Remember: Consistency is key! Use styles instead of manual formatting every time.'
);

-- Lesson 2: Tables & Visuals  
INSERT INTO "Lessons" ("Lesson ID", "Title", "Description", "Track", "Order", "Text") VALUES (
  102,
  'Tables & Visuals',
  'Design professional tables with calculations and integrate visuals effectively - skills that make your documents stand out in any workplace.',
  'Microsoft Word',
  2,
  'Welcome to Tables & Visuals! 📊✨

LEARNING OBJECTIVE: Design professional tables with calculations and integrate visuals (SmartArt, images, icons) that enhance document clarity and visual appeal.

WHY THIS MATTERS FOR INTERNS:
Data presentation is crucial in any internship! Whether you''re creating budget reports, project timelines, or client presentations, well-designed tables and visuals make complex information easy to understand.

GOOGLE DOCS VS. WORD:
Word''s table tools are much more powerful than Google Docs! You get built-in calculations, advanced formatting options, and professional table styles that automatically adjust.

PROFESSIONAL TABLE DESIGN:

1. TABLE STRUCTURE BASICS
- Always include clear headers
- Use consistent alignment (numbers right-aligned, text left-aligned)
- Apply professional table styles for instant polish
- Keep data organized and easy to scan

2. TABLE CALCULATIONS
- SUM: Add up columns of numbers
- AVERAGE: Calculate averages automatically  
- COUNT: Count entries in a column
- Pro Tip: Tables can do basic math like Excel!

3. TABLE FORMATTING BEST PRACTICES
- Alternate row colors for readability
- Bold headers to separate from data
- Adjust column widths for content
- Use borders strategically (not every line needs a border!)

WORKING WITH VISUALS:

4. SMARTART FOR CONCEPTS
- Process diagrams: Show workflow steps
- Hierarchy charts: Organizational structures
- Cycle diagrams: Ongoing processes
- Perfect for making abstract concepts visual!

5. IMAGES & ICONS
- Professional photos only (no personal pics in work docs!)
- Icons for bullet points and emphasis
- Always include alt text for accessibility
- Compress images to keep file size manageable

6. TEXT WRAPPING MASTERY
- Square: Text flows around rectangular shape
- Tight: Text follows image outline
- Through: Text flows through transparent areas
- Behind Text: Image stays in background

MINI PROJECTS:

PROJECT A: Professional Resume Table
Create a skills table with:
- Skill categories
- Proficiency levels
- Years of experience
- Automatic calculations

PROJECT B: Visual Process Guide
Design a how-to guide with:
- SmartArt process flow
- Supporting images with proper wrapping
- Professional table for reference data

ACCESSIBILITY REQUIREMENTS:
- Alt text for all images (describe what''s shown)
- High contrast in tables
- Logical reading order for screen readers
- Meaningful table headers

PRACTICE CHALLENGES:
1. Create a budget table with SUM calculations
2. Insert and format a process SmartArt
3. Add images with proper text wrapping
4. Write descriptive alt text for visuals
5. Apply professional table styles

PRO TIPS FOR INTERNS:
- Save images separately before inserting (easier to update later)
- Use company brand colors if available
- Keep visuals relevant to your content
- When in doubt, ask your supervisor about visual guidelines!'
);

-- Lesson 3: References & Citations
INSERT INTO "Lessons" ("Lesson ID", "Title", "Description", "Track", "Order", "Text") VALUES (
  103,
  'References & Citations', 
  'Master academic and professional citation tools to create credible, well-structured documents that meet workplace and educational standards.',
  'Microsoft Word',
  3,
  'Welcome to References & Citations! 📚🔗

LEARNING OBJECTIVE: Structure professional documents using Table of Contents, citations, footnotes, and cross-references to create credible, navigable documents.

WHY THIS MATTERS FOR INTERNS:
In professional settings, you''ll often write reports that reference other sources, create proposals that need citations, or develop training materials that require structured navigation. These skills show attention to detail and academic rigor.

GOOGLE DOCS VS. WORD:
While Google Docs has basic citation tools, Word offers comprehensive academic formatting with automatic bibliography generation, advanced cross-referencing, and professional TOC creation.

DOCUMENT STRUCTURE TOOLS:

1. TABLE OF CONTENTS (TOC)
- Automatically generated from heading styles
- Updates when you add new sections
- Clickable links for easy navigation
- Professional appearance for reports and proposals

2. FOOTNOTES VS. ENDNOTES
- Footnotes: Bottom of same page (quick references)
- Endnotes: End of document (detailed sources)
- Use Case: Footnotes for definitions, endnotes for full citations
- Auto-numbering prevents mistakes

3. CROSS-REFERENCES
- Link to figures, tables, or sections within document
- "See Figure 2 on page 15" - automatically updates!
- Prevents broken references when content moves
- Essential for technical documents

CITATION MASTERY:

4. CITATION STYLES
- APA: Psychology, Education, Sciences
- MLA: Literature, Humanities
- Chicago: History, Arts
- Choose based on your field or company preference

5. SOURCE MANAGEMENT
- Add sources as you research (don''t wait!)
- Include all required information
- Edit source details for accuracy
- Word remembers sources for future documents

6. BIBLIOGRAPHY GENERATION
- Automatic formatting based on style chosen
- Updates when you add new sources
- Properly formatted every time
- Saves hours of manual formatting!

GUIDED DOCUMENT PROJECT: Research Report Creation

You''ll create a structured research report with:
- Title page with proper formatting
- Table of Contents (auto-generated)
- Multiple sections with headings
- In-text citations (minimum 5 sources)
- Footnotes for additional information
- Cross-references to tables/figures
- Bibliography/Works Cited page

STEP-BY-STEP PROCESS:

PHASE 1: Document Setup
1. Create heading structure
2. Set citation style (APA recommended)
3. Plan your sections

PHASE 2: Content Creation
1. Write content with placeholder citations
2. Add sources to bibliography as you go
3. Insert footnotes for clarifications
4. Create tables/figures with captions

PHASE 3: Finalization
1. Generate Table of Contents
2. Add cross-references
3. Update all fields
4. Review formatting consistency

ACCESSIBILITY & UDL SUPPORT:
- Use proper heading hierarchy (H1→H2→H3)
- Meaningful link text for cross-references
- Alt text for any figures or charts
- Clear, descriptive footnote text

PRACTICE EXERCISES:
1. Insert 3 different citation types (book, website, journal)
2. Create footnotes explaining technical terms
3. Add cross-references to figures and tables
4. Generate and format Table of Contents
5. Create complete bibliography

COMMON MISTAKES TO AVOID:
- Forgetting to update fields before final submission
- Missing information in source citations
- Inconsistent citation style within document
- Manual page numbers instead of automatic references

PRO TIPS FOR WORKPLACE SUCCESS:
- Always verify source information is complete
- Use company citation style if they have one
- Keep a master source list for ongoing projects
- Backup your sources in a separate document!'
);

-- Lesson 4: Mail Merge & Review Tools
INSERT INTO "Lessons" ("Lesson ID", "Title", "Description", "Track", "Order", "Text") VALUES (
  104,
  'Mail Merge & Review Tools',
  'Automate document creation with mail merge and master collaboration tools - essential skills for efficient workplace communication.',
  'Microsoft Word',
  4,
  'Welcome to Mail Merge & Review Tools! 📧⚡

LEARNING OBJECTIVE: Generate personalized documents efficiently using mail merge and collaborate professionally using track changes, comments, and editing controls.

WHY THIS MATTERS FOR INTERNS:
Interns often handle mass communications (sending invitations, creating name tags, personalizing letters) and collaborate on documents with supervisors. These tools save hours and ensure professional collaboration.

GOOGLE DOCS VS. WORD:
Google Docs has basic commenting and suggestion mode, but Word''s mail merge is far superior for bulk document creation, and its review tools are more comprehensive for professional environments.

MAIL MERGE MASTERY:

1. UNDERSTANDING MAIL MERGE
- Creates personalized documents from one template
- Pulls data from Excel, Access, or Outlook contacts
- Perfect for: letters, labels, envelopes, certificates
- One template → hundreds of personalized documents!

2. DATA SOURCE SETUP
- Excel spreadsheet with column headers
- Each row = one recipient
- Include: Name, Address, Title, Custom fields
- Clean data = perfect results (garbage in, garbage out!)

3. MERGE TYPES
- Letters: Personalized correspondence
- Labels: Mailing labels, name tags
- Envelopes: Professional mailing
- Email: Bulk personalized emails

COLLABORATION TOOLS:

4. TRACK CHANGES
- Shows exactly what was added, deleted, or moved
- Color-coded by reviewer
- Accept or reject individual changes
- Essential for document approval workflows

5. COMMENTS
- Add feedback without changing document
- Reply to comments for discussion
- Resolve when addressed
- Perfect for supervisor feedback

6. RESTRICT EDITING
- Control what others can change
- Protect formatting while allowing content edits
- Password protection for sensitive documents
- Set specific sections as editable

HANDS-ON PROJECTS:

PROJECT A: Event Invitation Mail Merge
Create personalized invitations for company event:
- Set up Excel data source with guest information
- Design professional invitation template
- Insert merge fields (name, title, department)
- Generate individual invitations
- Create matching name tags

PROJECT B: Collaborative Document Review
Work with a partner to:
- Enable track changes on a shared document
- Make edits and suggestions
- Add comments for feedback
- Respond to reviewer comments
- Accept/reject changes professionally

STEP-BY-STEP MAIL MERGE:

PHASE 1: Preparation
1. Create clean Excel data source
2. Design document template
3. Identify merge field locations

PHASE 2: Setup
1. Start Mail Merge wizard
2. Select document type
3. Connect to data source
4. Insert merge fields

PHASE 3: Execution
1. Preview merged documents
2. Complete merge
3. Save results
4. Quality check final documents

COLLABORATION BEST PRACTICES:

REVIEW WORKFLOW:
1. Enable track changes before editing
2. Use comments for questions/suggestions
3. Make changes in suggestion mode
4. Resolve comments when addressed
5. Accept/reject changes thoughtfully

PROFESSIONAL ETIQUETTE:
- Clear, specific comments
- Constructive feedback only
- Respond to feedback promptly
- Keep track of version history

PRACTICE SCENARIOS:

SCENARIO 1: Internship Certificates
- Create certificate template
- Mail merge with intern names and completion dates
- Generate certificates for 20 interns

SCENARIO 2: Department Update Letter
- Personalized letters to different departments
- Include department-specific information
- Professional letterhead and formatting

SCENARIO 3: Document Review Simulation
- Review a colleague''s report
- Provide feedback using comments
- Suggest improvements using track changes
- Collaborate on final version

ACCESSIBILITY CONSIDERATIONS:
- Screen reader compatibility with review tools
- Clear comment descriptions
- Logical merge field order
- High contrast for track changes

TROUBLESHOOTING TIPS:
- Preview before completing merge
- Check data source formatting
- Test with small batch first
- Save frequently during collaboration

TIME-SAVING PRO TIPS:
- Create reusable templates
- Maintain clean contact databases
- Use keyboard shortcuts for review tools
- Set up standard collaboration workflows!'
);

-- Lesson 5: Capstone Project & Practice Test
INSERT INTO "Lessons" ("Lesson ID", "Title", "Description", "Track", "Order", "Text") VALUES (
  105,
  'Capstone Project & Practice Test',
  'Demonstrate mastery through a comprehensive project and prepare for MOS certification with timed practice scenarios.',
  'Microsoft Word',
  5,
  'Welcome to Your Capstone Challenge! 🎯🏆

LEARNING OBJECTIVE: Demonstrate comprehensive Word mastery through a multi-section project integrating all learned skills, then prove your readiness with MOS-style practice scenarios.

WHY THIS CAPSTONE MATTERS:
This project simulates real internship deliverables - complex documents that showcase your technical skills and attention to detail. Employers will be impressed by your ability to create professional, comprehensive documents.

COMPREHENSIVE CAPSTONE PROJECT: "Professional Development Report"

You''ll create a complete professional development report that incorporates ALL skills from previous lessons:

PROJECT OVERVIEW:
Create a 15-20 page professional development report for your internship supervisor, including research, analysis, recommendations, and supporting materials.

REQUIRED COMPONENTS:

📋 DOCUMENT STRUCTURE (Lesson 1):
- Title page (no header/footer)
- Executive summary (different header)
- Table of contents (auto-generated)
- Main sections with consistent heading styles
- Appendix (different page numbering)
- Different page orientations as needed

📊 TABLES & VISUALS (Lesson 2):
- Professional data table with calculations
- SmartArt process diagram
- Integrated images with proper text wrapping
- Icons for enhanced readability
- Professional formatting throughout

📚 REFERENCES & CITATIONS (Lesson 3):
- Minimum 8 credible sources
- Proper in-text citations (APA style)
- Footnotes for additional information
- Cross-references to tables and figures
- Complete bibliography

📧 MAIL MERGE COMPONENT (Lesson 4):
- Personalized cover letters for 5 different supervisors
- Professional recommendation request templates
- Name tags for presentation attendees

CAPSTONE PROJECT TIMELINE:

WEEK 1: PLANNING & SETUP
- Choose professional development topic
- Research and gather sources
- Create document structure outline
- Set up Excel data for mail merge

WEEK 2: CONTENT CREATION
- Write main content sections
- Create tables with real data
- Design SmartArt diagrams
- Insert and format images

WEEK 3: INTEGRATION & REFINEMENT
- Add citations and footnotes
- Generate table of contents
- Create cross-references
- Complete mail merge components

WEEK 4: FINALIZATION & PRESENTATION
- Final formatting review
- Accessibility check
- Practice presentation
- Submit complete package

ASSESSMENT RUBRIC:

TECHNICAL SKILLS (40 points):
- Document structure and navigation (10 pts)
- Table design and calculations (10 pts)
- Visual integration and formatting (10 pts)
- Citation accuracy and completeness (10 pts)

PROFESSIONAL QUALITY (30 points):
- Consistent formatting throughout (10 pts)
- Professional appearance and layout (10 pts)
- Error-free content and mechanics (10 pts)

CREATIVITY & INNOVATION (20 points):
- Effective use of advanced features (10 pts)
- Creative problem-solving in design (10 pts)

ACCESSIBILITY & UDL (10 points):
- Proper heading hierarchy (5 pts)
- Alt text and inclusive design (5 pts)

MOS CERTIFICATION PRACTICE TEST:

After completing your capstone, you''ll take a comprehensive practice test that simulates the actual MOS Word certification exam.

PRACTICE TEST FORMAT:
- 90 minutes timed session
- 35-40 task-based questions
- Live scoring and feedback
- Retake opportunities for improvement

SAMPLE PRACTICE TASKS:

TASK 1: Document Setup (5 minutes)
"Create a new document with 1.25" margins, landscape orientation, and a custom header containing your name and the current date."

TASK 2: Table Creation (8 minutes)
"Insert a 4x6 table, apply Medium Shading 1 style, add a SUM formula to calculate totals, and sort data alphabetically by the first column."

TASK 3: Citation Integration (10 minutes)
"Add three sources using APA style, insert in-text citations, create footnotes explaining technical terms, and generate a bibliography."

TASK 4: Mail Merge Setup (12 minutes)
"Create a mail merge letter using the provided Excel data source, insert merge fields for name and address, and complete the merge for 5 recipients."

TASK 5: Document Navigation (6 minutes)
"Apply heading styles to create a document outline, generate a table of contents, and insert cross-references to figures and tables."

TEST PREPARATION STRATEGIES:

TECHNICAL PREPARATION:
- Practice keyboard shortcuts for efficiency
- Memorize common formatting commands
- Review mail merge process thoroughly
- Master citation tools and automation

TIME MANAGEMENT:
- Read all instructions carefully
- Allocate time based on point values
- Don''t spend too long on any single task
- Use remaining time for quality checks

STRESS MANAGEMENT:
- Take practice tests in realistic conditions
- Build confidence through repetition
- Focus on accuracy over speed initially
- Develop consistent workflows

FINAL PREPARATION CHECKLIST:

✅ Capstone project completed and polished
✅ All technical skills demonstrated successfully
✅ Practice test taken with passing score (700+)
✅ Time management strategies practiced
✅ Keyboard shortcuts memorized
✅ Backup plans ready for technical difficulties

CAREER READINESS REFLECTION:

After completing this comprehensive module, you''ll be able to:
- Create professional documents that impress employers
- Collaborate effectively in workplace settings
- Manage complex formatting and citation requirements
- Automate repetitive tasks for efficiency
- Meet industry standards for document quality

NEXT STEPS AFTER CERTIFICATION:
- Schedule official MOS exam
- Add certification to resume and LinkedIn
- Share capstone project in job interviews
- Continue learning advanced Office features
- Apply skills in internship and career settings

Remember: This capstone represents your journey from beginner to professional. Take pride in demonstrating these valuable workplace skills!

🌟 You''ve got this! Show what you''ve learned and prepare for certification success! 🌟'
);

-- Update track name to match the button in CoreTracks component
UPDATE "Lessons" SET "Track" = 'Microsoft Word' WHERE "Track" = 'Word';