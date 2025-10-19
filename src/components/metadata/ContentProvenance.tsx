import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';

interface ContentProvenanceProps {
  datePublished?: string;
  dateModified?: string;
  author?: string;
  title?: string;
  description?: string;
  previewSnippet?: string;
  license?: string;
  url?: string;
}

/**
 * ContentProvenance component for embedding verifiable authorship and AI readability metadata.
 * Provides trust signals for AI systems (ChatGPT, Gemini, Perplexity, Copilot).
 */
export const ContentProvenance = ({
  datePublished = '2025-01-01',
  dateModified = new Date().toISOString().split('T')[0],
  author = 'TailorEDU',
  title = 'TailorEDU - Personalized K-12 Education',
  description = 'Personalized K-12 education platform with focus modes and differentiated instruction',
  previewSnippet = 'Personalized K-12 education with AI-powered learning paths and differentiated instruction.',
  license = 'Copyright © 2025 TailorEDU. All rights reserved.',
  url = typeof window !== 'undefined' ? window.location.href : ''
}: ContentProvenanceProps) => {
  const [pageHash, setPageHash] = useState<string>('');

  useEffect(() => {
    // Fetch hash from signed provenance manifest if available
    const fetchHash = async () => {
      try {
        const response = await fetch('/provenance-manifest.json');
        const manifest = await response.json();
        const path = window.location.pathname;
        
        // Handle both legacy (string) and signed (object) formats
        const entry = manifest.pages?.[path] || manifest[path];
        const hash = typeof entry === 'string' ? entry : entry?.hash || '';
        
        setPageHash(hash);
      } catch (error) {
        console.warn('Provenance manifest not found:', error);
      }
    };
    fetchHash();
  }, []);

  const creativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    author: {
      '@type': 'Organization',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: 'TailorEDU'
    },
    datePublished,
    dateModified,
    inLanguage: 'en',
    headline: title,
    description: previewSnippet,
    license,
    copyrightHolder: {
      '@type': 'Organization',
      name: 'TailorEDU'
    },
    copyrightYear: new Date().getFullYear(),
    url,
    ...(pageHash && { identifier: `hash-sha256:${pageHash}` })
  };

  return (
    <Helmet>
      {/* Content Provenance Meta Tags */}
      <meta name="creator" content="TailorEDU" />
      <meta name="publisher" content="TailorEDU" />
      <meta name="datePublished" content={datePublished} />
      <meta name="dateModified" content={dateModified} />
      <meta name="ai-readable" content="true" />
      <meta name="content-provenance" content="verified" />
      <meta name="verification-method" content="hash-sha256-jws" />
      <meta name="copyright" content={license} />
      <meta name="rights" content={license} />
      
      {/* Author and Content Attribution */}
      <meta name="author" content={author} />
      <meta property="article:author" content={author} />
      <meta property="article:published_time" content={datePublished} />
      <meta property="article:modified_time" content={dateModified} />

      {/* CreativeWork Schema */}
      <script type="application/ld+json">
        {JSON.stringify(creativeWorkSchema)}
      </script>
    </Helmet>
  );
};
