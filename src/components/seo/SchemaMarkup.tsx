import { Helmet } from 'react-helmet';

interface SchemaMarkupProps {
  json: Record<string, any> | Record<string, any>[];
}

/**
 * SchemaMarkup component for injecting structured data (JSON-LD) into the page head.
 * Supports single or multiple schema objects.
 */
export const SchemaMarkup = ({ json }: SchemaMarkupProps) => {
  // Handle both single schema object and array of schemas
  const schemas = Array.isArray(json) ? json : [json];
  
  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script 
          key={index} 
          type="application/ld+json"
        >
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
