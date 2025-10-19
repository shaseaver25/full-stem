import { SchemaMarkup } from './SchemaMarkup';
import { generateOrganizationSchema } from '@/utils/schemaGenerators';

/**
 * GlobalSchemaMarkup component that adds organization-level structured data
 * Should be included once at the app level
 */
export const GlobalSchemaMarkup = () => {
  const organizationSchema = generateOrganizationSchema({
    name: 'TailorEDU',
    description: 'Personalized K-12 education platform with AI-powered focus modes, differentiated instruction, and adaptive learning experiences',
    sameAs: [
      'https://twitter.com/tailoredu',
      'https://linkedin.com/company/tailoredu',
      'https://github.com/shaseaver25/full-stem'
    ],
    contactEmail: 'support@tailoredu.com'
  });

  return <SchemaMarkup json={organizationSchema} />;
};
