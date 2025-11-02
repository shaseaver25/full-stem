import { useQuery } from '@tanstack/react-query';
import { parseConferenceSessions } from '@/utils/csvParser';

export interface SessionData {
  title: string;
  time: string;
  room: string;
  speaker?: string;
  description?: string;
}

const fetchSessionData = async (): Promise<SessionData[]> => {
  const response = await fetch('/conference-schedule.csv');
  const csvContent = await response.text();
  const sessionBlocks = parseConferenceSessions(csvContent);
  
  // Flatten all sessions from all blocks
  const allSessions: SessionData[] = sessionBlocks.flatMap(block => 
    block.sessions.map(session => ({
      title: session.title,
      time: session.time,
      room: session.room,
      speaker: session.speaker,
      description: session.description
    }))
  );
  
  return allSessions;
};

export const useSessionData = () => {
  return useQuery({
    queryKey: ['conference-sessions'],
    queryFn: fetchSessionData,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const findSessionByTitle = (sessions: SessionData[], encodedTitle: string): SessionData | undefined => {
  const decodedTitle = decodeURIComponent(encodedTitle);
  return sessions.find(session => session.title === decodedTitle);
};
