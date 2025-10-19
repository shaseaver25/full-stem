/**
 * Schema.org JSON-LD generators for TailorEDU
 * Provides structured data for improved AI/search visibility
 */

export interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactEmail?: string;
}

export interface CourseSchemaProps {
  id: string;
  name: string;
  description?: string;
  provider?: {
    name: string;
    url: string;
  };
  instructor?: {
    name: string;
    url?: string;
  };
  duration?: string;
  subject?: string;
  url?: string;
}

export interface PersonSchemaProps {
  name: string;
  jobTitle?: string;
  affiliation?: string;
  email?: string;
  url?: string;
  image?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate Organization schema for TailorEDU
 */
export const generateOrganizationSchema = (props?: OrganizationSchemaProps) => {
  const baseUrl = window.location.origin;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: props?.name || 'TailorEDU',
    description: props?.description || 'Personalized K-12 education platform with focus modes and differentiated instruction',
    url: props?.url || baseUrl,
    logo: props?.logo || `${baseUrl}/logo.png`,
    sameAs: props?.sameAs || [
      'https://twitter.com/tailoredu',
      'https://linkedin.com/company/tailoredu',
      'https://github.com/tailoredu'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: props?.contactEmail || 'support@tailoredu.com'
    }
  };
};

/**
 * Generate Course schema for a class or learning program
 */
export const generateCourseSchema = (props: CourseSchemaProps) => {
  const baseUrl = window.location.origin;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${baseUrl}/classes/${props.id}`,
    name: props.name,
    description: props.description || `Learn ${props.name} with personalized instruction`,
    provider: {
      '@type': 'EducationalOrganization',
      name: props.provider?.name || 'TailorEDU',
      url: props.provider?.url || baseUrl
    },
    ...(props.instructor && {
      instructor: {
        '@type': 'Person',
        name: props.instructor.name,
        ...(props.instructor.url && { url: props.instructor.url })
      }
    }),
    ...(props.duration && { timeRequired: props.duration }),
    ...(props.subject && { about: props.subject }),
    url: props.url || `${baseUrl}/classes/${props.id}`
  };
};

/**
 * Generate Person schema for teachers or contributors
 */
export const generatePersonSchema = (props: PersonSchemaProps) => {
  const baseUrl = window.location.origin;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: props.name,
    ...(props.jobTitle && { jobTitle: props.jobTitle }),
    ...(props.affiliation && {
      affiliation: {
        '@type': 'EducationalOrganization',
        name: props.affiliation
      }
    }),
    ...(props.email && { email: props.email }),
    ...(props.url && { url: props.url }),
    ...(props.image && { image: props.image })
  };
};

/**
 * Generate BreadcrumbList schema for navigation
 */
export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

/**
 * Generate WebPage schema with primary action
 */
export const generateWebPageSchema = (props: {
  name: string;
  description?: string;
  url?: string;
  primaryAction?: {
    name: string;
    url: string;
  };
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: props.name,
    ...(props.description && { description: props.description }),
    ...(props.url && { url: props.url }),
    ...(props.primaryAction && {
      potentialAction: {
        '@type': 'Action',
        name: props.primaryAction.name,
        target: props.primaryAction.url
      }
    })
  };
};

/**
 * Generate LearningResource schema for lessons
 */
export const generateLearningResourceSchema = (props: {
  id: string;
  name: string;
  description?: string;
  learningResourceType?: string;
  educationalLevel?: string;
  timeRequired?: string;
  url?: string;
}) => {
  const baseUrl = window.location.origin;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': `${baseUrl}/lessons/${props.id}`,
    name: props.name,
    ...(props.description && { description: props.description }),
    ...(props.learningResourceType && { learningResourceType: props.learningResourceType }),
    ...(props.educationalLevel && { educationalLevel: props.educationalLevel }),
    ...(props.timeRequired && { timeRequired: props.timeRequired }),
    url: props.url || `${baseUrl}/lessons/${props.id}`,
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'TailorEDU',
      url: baseUrl
    }
  };
};
