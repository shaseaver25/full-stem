
-- Add sample translated content to test the translation functionality
UPDATE public."Lessons" 
SET "Translated Content" = '{
  "spanish": "Esta es una lección de muestra en español para probar la funcionalidad de traducción.",
  "es": "Esta es una lección de muestra en español para probar la funcionalidad de traducción.",
  "somali": "Tani waa casharo tilmaame ah oo Soomaali ah si loo tijaabiyo hawlaha turjumaadda.",
  "so": "Tani waa casharo tilmaame ah oo Soomaali ah si loo tijaabiyo hawlaha turjumaadda.",
  "french": "Ceci est un exemple de leçon en français pour tester la fonctionnalité de traduction.",
  "fr": "Ceci est un exemple de leçon en français pour tester la fonctionnalité de traduction."
}'::jsonb
WHERE "Lesson ID" = 1;

-- Add sample content for different reading levels for lesson 1
UPDATE public."Lessons" 
SET 
  "Text (Grade 3)" = 'This is a simple lesson about Excel. Excel is a computer program. It helps you work with numbers and data. You can make charts and tables with Excel.',
  "Text (Grade 5)" = 'Microsoft Excel is a powerful spreadsheet application that allows users to organize, analyze, and visualize data. It is widely used in business, education, and personal projects for creating charts, performing calculations, and managing information effectively.',
  "Text (Grade 8)" = 'Microsoft Excel is a comprehensive spreadsheet application that serves as a cornerstone tool for data analysis and management across various industries. It enables users to perform complex calculations, create sophisticated charts and graphs, and develop automated workflows through formulas and macros.',
  "Text (High School)" = 'Microsoft Excel represents a sophisticated data management and analysis platform that integrates mathematical computation, statistical analysis, and visualization capabilities. Its advanced features include pivot tables, complex formulas, macro programming, and integration with other Microsoft Office applications, making it an essential tool for professional data analysis and business intelligence.'
WHERE "Lesson ID" = 1;

-- Add a comment to explain the structure
COMMENT ON COLUMN public."Lessons"."Translated Content" IS 'JSON object containing translated versions of content by language code and full language name, e.g., {"es": "Spanish content", "spanish": "Spanish content", "so": "Somali content", "somali": "Somali content"}';
