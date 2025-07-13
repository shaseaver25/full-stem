import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DesmosSectionProps {
  desmosType: 'calculator' | 'geometry';
  className?: string;
}

const DesmosSection: React.FC<DesmosSectionProps> = ({ desmosType, className = '' }) => {
  const desmosUrls = {
    calculator: "https://www.desmos.com/calculator",
    geometry: "https://www.desmos.com/geometry",
  };

  const title = desmosType === 'geometry' ? 'Desmos Geometry Tool' : 'Desmos Graphing Calculator';

  return (
    <section className={`my-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">📐</span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <iframe
            src={desmosUrls[desmosType]}
            width="100%"
            height="450"
            className="rounded border w-full"
            allowFullScreen
            title={title}
            loading="lazy"
          />
        </CardContent>
      </Card>
    </section>
  );
};

export default DesmosSection;