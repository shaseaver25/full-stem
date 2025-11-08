import React, { useMemo } from 'react';
import ReactWordcloud from 'react-wordcloud';
import { processWordCloudResponses, type WordFrequency } from '@/utils/processWordCloudResponses';

interface WordCloudVisualizationProps {
  responses: string[];
  minResponses?: number;
  maxWords?: number;
  colors?: string[];
  fontSizes?: [number, number];
  onWordClick?: (word: string, count: number) => void;
}

export const WordCloudVisualization = ({
  responses,
  minResponses = 5,
  maxWords = 50,
  colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'],
  fontSizes = [14, 72],
  onWordClick,
}: WordCloudVisualizationProps) => {
  const wordData = useMemo(() => {
    if (responses.length < minResponses) {
      return [];
    }

    const frequencies = processWordCloudResponses(responses, { maxWords });
    return frequencies.map(f => ({ text: f.text, value: f.value }));
  }, [responses, minResponses, maxWords]);

  const options = {
    colors,
    enableTooltip: true,
    deterministic: false,
    fontFamily: 'inherit',
    fontSizes: fontSizes as [number, number],
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: 4,
    rotations: 2,
    rotationAngles: [0, 0] as [number, number],
    scale: 'sqrt' as const,
    spiral: 'archimedean' as const,
    transitionDuration: 1000,
  };

  const callbacks = {
    onWordClick: onWordClick
      ? (word: any) => onWordClick(word.text, word.value)
      : undefined,
  };

  if (responses.length < minResponses) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <p>Waiting for at least {minResponses} responses to display word cloud...</p>
      </div>
    );
  }

  if (wordData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <p>No valid words to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <ReactWordcloud words={wordData} options={options} callbacks={callbacks} />
    </div>
  );
};
