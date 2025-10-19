/**
 * Schema.org JSON-LD Usage Examples for TailorEDU
 * 
 * This file demonstrates how to use the schema markup system
 * across different page types.
 */

import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { useClassSchema } from '@/hooks/useClassSchema';
import { useBreadcrumbSchema } from '@/hooks/useBreadcrumbSchema';
import {
  generateOrganizationSchema,
  generateCourseSchema,
  generatePersonSchema,
  generateLearningResourceSchema,
  generateWebPageSchema,
} from '@/utils/schemaGenerators';

// ============================================
// Example 1: Class/Course Page
// ============================================
export function ClassPageWithSchema({ classId }: { classId: string }) {
  // Automatically fetches class data from Supabase and generates Course schema
  const courseSchema = useClassSchema(classId);
  
  // Auto-generated breadcrumbs based on URL
  const breadcrumbSchema = useBreadcrumbSchema();

  return (
    <div>
      {/* Inject schema markup into <head> */}
      {courseSchema && <SchemaMarkup json={courseSchema} />}
      {breadcrumbSchema && <SchemaMarkup json={breadcrumbSchema} />}
      
      <h1>Class Details</h1>
      {/* Rest of page content */}
    </div>
  );
}

// ============================================
// Example 2: Lesson/Learning Resource Page
// ============================================
export function LessonPageWithSchema({ 
  lessonId, 
  lessonName, 
  description, 
  gradeLevel 
}: { 
  lessonId: string;
  lessonName: string;
  description: string;
  gradeLevel: string;
}) {
  const learningResourceSchema = generateLearningResourceSchema({
    id: lessonId,
    name: lessonName,
    description,
    learningResourceType: 'Lesson',
    educationalLevel: gradeLevel,
    timeRequired: 'PT1H', // ISO 8601 duration format (1 hour)
  });

  return (
    <div>
      <SchemaMarkup json={learningResourceSchema} />
      
      <h1>{lessonName}</h1>
      {/* Lesson content */}
    </div>
  );
}

// ============================================
// Example 3: Teacher Profile Page
// ============================================
export function TeacherProfileWithSchema({ 
  teacher 
}: { 
  teacher: {
    name: string;
    email: string;
    bio: string;
  }
}) {
  const personSchema = generatePersonSchema({
    name: teacher.name,
    jobTitle: 'Educator',
    affiliation: 'TailorEDU',
    email: teacher.email,
  });

  return (
    <div>
      <SchemaMarkup json={personSchema} />
      
      <h1>About {teacher.name}</h1>
      <p>{teacher.bio}</p>
    </div>
  );
}

// ============================================
// Example 4: Landing/Home Page (Multiple Schemas)
// ============================================
export function LandingPageWithSchema() {
  // Organization schema
  const orgSchema = generateOrganizationSchema({
    name: 'TailorEDU',
    description: 'AI-powered personalized education platform for K-12',
    sameAs: [
      'https://twitter.com/tailoredu',
      'https://linkedin.com/company/tailoredu',
      'https://github.com/shaseaver25/full-stem'
    ],
  });

  // WebPage schema with primary action
  const webPageSchema = generateWebPageSchema({
    name: 'TailorEDU - Personalized K-12 Education',
    description: 'Transform education with AI-powered personalization, focus modes, and differentiated instruction',
    primaryAction: {
      name: 'Start Free Trial',
      url: `${window.location.origin}/trial`,
    },
  });

  // Combine multiple schemas
  const schemas = [orgSchema, webPageSchema];

  return (
    <div>
      <SchemaMarkup json={schemas} />
      
      <h1>Welcome to TailorEDU</h1>
      {/* Landing page content */}
    </div>
  );
}

// ============================================
// Example 5: Dynamic Schema with Fallbacks
// ============================================
export function DynamicClassPage({ classId }: { classId?: string }) {
  // Hook returns null if classId is undefined or data unavailable
  const courseSchema = useClassSchema(classId);

  // Fallback to generic schema if specific course data unavailable
  const fallbackSchema = generateCourseSchema({
    id: classId || 'unknown',
    name: 'TailorEDU Course',
    description: 'Personalized learning experience',
    instructor: {
      name: 'TailorEDU Instructor',
    },
  });

  return (
    <div>
      {/* Use dynamic schema if available, otherwise fallback */}
      <SchemaMarkup json={courseSchema || fallbackSchema} />
      
      <h1>Course Page</h1>
    </div>
  );
}

// ============================================
// Example 6: Custom Schema (Not in generators)
// ============================================
export function FAQPageWithSchema() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Focus Mode?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Focus Mode reduces distractions by hiding non-essential UI elements and providing a streamlined learning experience.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does differentiated instruction work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'TailorEDU adapts content based on student reading level, learning style, and IEP accommodations.',
        },
      },
    ],
  };

  return (
    <div>
      <SchemaMarkup json={faqSchema} />
      
      <h1>Frequently Asked Questions</h1>
      {/* FAQ content */}
    </div>
  );
}
