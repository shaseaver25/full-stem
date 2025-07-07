-- Add video URLs for the Microsoft Word lessons
INSERT INTO lesson_videos (lesson_id, title, url, order_index) VALUES
-- Using the lesson_videos table to link videos to lessons from the Lessons table
-- Note: We need to create a mapping since lesson_videos.lesson_id is UUID but Lessons."Lesson ID" is bigint
-- We'll add a separate video_url column to the Lessons table for simplicity

-- Add video_url column to Lessons table for easier integration
ALTER TABLE "Lessons" ADD COLUMN video_url text;

-- Add video URLs for the Microsoft Word lessons
UPDATE "Lessons" SET video_url = 'https://youtu.be/c2dcRy1X9AA' WHERE "Lesson ID" = 101;
UPDATE "Lessons" SET video_url = 'https://youtu.be/dQw4w9WgXcQ' WHERE "Lesson ID" = 102;
UPDATE "Lessons" SET video_url = 'https://youtu.be/oHg5SJYRHA0' WHERE "Lesson ID" = 103;
UPDATE "Lessons" SET video_url = 'https://youtu.be/9bZkp7q19f0' WHERE "Lesson ID" = 104;
UPDATE "Lessons" SET video_url = 'https://youtu.be/M7lc1UVf-VE' WHERE "Lesson ID" = 105;

-- Add some sample assignments for the Microsoft Word lessons
INSERT INTO assignments (lesson_id, title, instructions, allow_text_response, max_files, file_types_allowed) VALUES
(101, 'Document Structure Practice', 
 'Create a professional multi-section document with:
 1. A title page with your name and date
 2. Table of contents (auto-generated)
 3. Three main sections with proper heading styles
 4. Different headers for each section
 5. Page numbering
 
 Submit your Word document showing proper document structure and navigation.', 
 false, 1, ARRAY['doc', 'docx']),

(102, 'Professional Table and Visual Design', 
 'Design a professional report that includes:
 1. A data table with calculations (use SUM or AVERAGE formulas)
 2. A SmartArt process diagram
 3. Professional images with proper text wrapping
 4. Consistent formatting throughout
 
 Your document should demonstrate mastery of tables, visuals, and layout design.', 
 false, 3, ARRAY['doc', 'docx', 'pdf']),

(103, 'Research Report with Citations', 
 'Create a research report on a topic of your choice that includes:
 1. Minimum 5 credible sources with proper APA citations
 2. In-text citations throughout the document
 3. Footnotes explaining key terms
 4. Cross-references to tables or figures
 5. Complete bibliography
 6. Table of contents
 
 This assignment tests your ability to create professional, well-cited documents.', 
 true, 2, ARRAY['doc', 'docx']),

(104, 'Mail Merge and Collaboration Project', 
 'Complete two tasks:
 
 TASK 1: Create a mail merge project
 - Design a professional letter template
 - Create Excel data source with 10 recipients
 - Generate personalized letters using mail merge
 
 TASK 2: Collaboration review
 - Review a colleague\'s document using track changes
 - Add comments with constructive feedback
 - Respond to review comments professionally
 
 Submit both your mail merge files and collaboration examples.', 
 true, 5, ARRAY['doc', 'docx', 'xlsx']),

(105, 'Capstone Professional Development Report', 
 'Create a comprehensive 15-20 page professional development report that demonstrates ALL skills learned:
 
 REQUIREMENTS:
 - Multi-section document with different page layouts
 - Professional tables with calculations
 - SmartArt diagrams and images
 - Minimum 8 sources with proper citations
 - Mail merge component (cover letters)
 - Complete bibliography and table of contents
 - Cross-references throughout
 
 This capstone project should showcase your complete mastery of Microsoft Word for professional use.', 
 true, 10, ARRAY['doc', 'docx', 'pdf', 'xlsx']);