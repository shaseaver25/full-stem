import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

const DesmosEmbed = lazy(() => import('@/components/interactive/DesmosEmbed'));

interface DesmosSectionProps {
  desmosType: 'calculator' | 'geometry' | 'activity';
  activityId?: string;
  lessonId?: string;
  readOnly?: boolean;
  saveState?: boolean;
  className?: string;
}

const DesmosSection: React.FC<DesmosSectionProps> = ({ 
  desmosType, 
  activityId,
  lessonId,
  readOnly = false,
  saveState = true,
  className = '' 
}) => {
  // Legacy support: geometry mode falls back to iframe
  if (desmosType === 'geometry') {
    return (
      <section className={`my-6 ${className}`}>
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">📐</span>
            Desmos Geometry Tool
          </h3>
          <iframe
            src="https://www.desmos.com/geometry"
            width="100%"
            height="600"
            className="rounded border w-full"
            allowFullScreen
            title="Desmos Geometry Tool"
            loading="lazy"
          />
        </div>
      </section>
    );
  }

  return (
    <section className={`my-6 ${className}`}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[600px] border rounded-lg bg-card">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading Desmos...</span>
            </div>
          </div>
        }
      >
        <DesmosEmbed
          mode={desmosType === 'activity' ? 'activity' : 'calculator'}
          activityId={activityId}
          lessonId={lessonId}
          readOnly={readOnly}
          saveState={saveState}
        />
      </Suspense>
    </section>
  );
};

export default DesmosSection;