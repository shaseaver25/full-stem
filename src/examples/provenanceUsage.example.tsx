/**
 * Content Provenance Usage Examples
 * 
 * This file demonstrates how to use the ContentProvenance component
 * to add verifiable authorship and AI-readable metadata to pages.
 */

import { ContentProvenance } from '@/components/metadata/ContentProvenance';

// ============================================================================
// Example 1: Basic Usage (Default Values)
// ============================================================================
// Use in any page that needs provenance metadata
function BasicExample() {
  return (
    <>
      {/* Uses default values for organization */}
      <ContentProvenance />
      
      <main>
        <h1>Page Content</h1>
      </main>
    </>
  );
}

// ============================================================================
// Example 2: Course Page with Dynamic Data
// ============================================================================
function CoursePageExample({ course }: { course: any }) {
  return (
    <>
      <ContentProvenance 
        datePublished={course.created_at}
        dateModified={course.updated_at}
        author={course.teacher_name || 'TailorEDU Team'}
        title={course.name}
        description={course.description}
        url={`https://tailoredu.example.com/courses/${course.id}`}
      />
      
      <article>
        <header>
          <h1>{course.name}</h1>
          <p>{course.description}</p>
        </header>
        
        <section>
          {/* Course content */}
        </section>
      </article>
    </>
  );
}

// ============================================================================
// Example 3: Blog Post / Article
// ============================================================================
function BlogPostExample({ post }: { post: any }) {
  return (
    <>
      <ContentProvenance 
        datePublished={post.published_at}
        dateModified={post.last_updated}
        author={post.author_name}
        title={post.title}
        description={post.excerpt}
      />
      
      <article itemScope itemType="https://schema.org/Article">
        <header>
          <h1 itemProp="headline">{post.title}</h1>
          <time itemProp="datePublished" dateTime={post.published_at}>
            {new Date(post.published_at).toLocaleDateString()}
          </time>
        </header>
        
        <section itemProp="articleBody">
          {post.content}
        </section>
        
        <footer>
          <p>Author: <span itemProp="author">{post.author_name}</span></p>
        </footer>
      </article>
    </>
  );
}

// ============================================================================
// Example 4: Lesson Page with Teacher Attribution
// ============================================================================
function LessonPageExample({ lesson, teacher }: { lesson: any; teacher: any }) {
  return (
    <>
      <ContentProvenance 
        datePublished={lesson.created_at}
        dateModified={lesson.updated_at}
        author={teacher.full_name}
        title={`${lesson.title} - TailorEDU`}
        description={lesson.description}
      />
      
      <article>
        <header>
          <h1>{lesson.title}</h1>
          <p>Created by: {teacher.full_name}</p>
        </header>
        
        <section>
          {/* Lesson content */}
        </section>
      </article>
    </>
  );
}

// ============================================================================
// Example 5: Static Page (About, Contact, etc.)
// ============================================================================
function StaticPageExample() {
  return (
    <>
      <ContentProvenance 
        datePublished="2025-01-01"
        dateModified={new Date().toISOString().split('T')[0]}
        title="About TailorEDU"
        description="Learn about our mission to provide personalized K-12 education"
      />
      
      <main>
        <section>
          <h1>About TailorEDU</h1>
          <p>Our mission and values...</p>
        </section>
      </main>
    </>
  );
}

// ============================================================================
// Example 6: Resource Library Page
// ============================================================================
function ResourcePageExample({ resource }: { resource: any }) {
  return (
    <>
      <ContentProvenance 
        datePublished={resource.upload_date}
        dateModified={resource.last_modified}
        author="TailorEDU Content Team"
        title={resource.title}
        description={resource.summary}
      />
      
      <article itemScope itemType="https://schema.org/LearningResource">
        <h1 itemProp="name">{resource.title}</h1>
        <p itemProp="description">{resource.summary}</p>
        
        <div>
          <a href={resource.download_url} download>
            Download Resource
          </a>
        </div>
      </article>
    </>
  );
}

// ============================================================================
// Example 7: Dashboard with Multiple Content Types
// ============================================================================
function DashboardExample({ user }: { user: any }) {
  return (
    <>
      {/* Dashboard pages can use generic provenance */}
      <ContentProvenance 
        title={`${user.name}'s Dashboard - TailorEDU`}
        description="Personalized student dashboard"
        author="TailorEDU"
      />
      
      <main>
        <h1>Welcome, {user.name}!</h1>
        {/* Dashboard content */}
      </main>
    </>
  );
}

// ============================================================================
// Example 8: Integration with GlobalSchemaMarkup
// ============================================================================
import { GlobalSchemaMarkup } from '@/components/seo/GlobalSchemaMarkup';
import { SchemaMarkup } from '@/components/seo/SchemaMarkup';
import { generateCourseSchema } from '@/utils/schemaGenerators';

function CompleteExampleWithSchemas({ course }: { course: any }) {
  const courseSchema = generateCourseSchema({
    id: course.id,
    name: course.name,
    description: course.description,
    instructor: { name: course.teacher_name }
  });

  return (
    <>
      {/* Organization-level schema (global) */}
      <GlobalSchemaMarkup />
      
      {/* Content provenance metadata */}
      <ContentProvenance 
        datePublished={course.created_at}
        dateModified={course.updated_at}
        author={course.teacher_name}
        title={course.name}
        description={course.description}
      />
      
      {/* Course-specific schema */}
      <SchemaMarkup json={courseSchema} />
      
      <article>
        <h1>{course.name}</h1>
        {/* Course content */}
      </article>
    </>
  );
}

// ============================================================================
// Best Practices
// ============================================================================
/**
 * 1. ALWAYS include ContentProvenance on public-facing pages
 * 2. Use dynamic data from Supabase when available
 * 3. Keep dateModified current to reflect content freshness
 * 4. Use descriptive, accurate titles and descriptions
 * 5. Attribute authorship clearly (individual or team)
 * 6. Combine with SchemaMarkup for maximum AI discoverability
 * 7. Test with Google Rich Results Test
 * 8. Verify hashes after deployment with hash-provenance.js
 */

// ============================================================================
// Troubleshooting
// ============================================================================
/**
 * Q: Component doesn't fetch provenance manifest?
 * A: Ensure manifest is generated during build: `node scripts/hash-provenance.js`
 * 
 * Q: Hash mismatch in CI/CD?
 * A: Rebuild and regenerate manifest before deployment
 * 
 * Q: Missing metadata in page source?
 * A: Check that ContentProvenance is rendered before content
 * 
 * Q: GEO audit fails provenance checks?
 * A: Verify all three components: manifest, hash, and metadata tags
 */

export {
  BasicExample,
  CoursePageExample,
  BlogPostExample,
  LessonPageExample,
  StaticPageExample,
  ResourcePageExample,
  DashboardExample,
  CompleteExampleWithSchemas
};
