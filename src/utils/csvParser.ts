export interface ParsedSession {
  time: string;
  title: string;
  room: string;
  timeBlock: string; // Normalized time block for grouping
}

export interface SessionBlock {
  timeSlot: string;
  sessions: ParsedSession[];
}

/**
 * Parse CSV content and group sessions by time blocks
 */
export function parseConferenceSessions(csvContent: string): SessionBlock[] {
  const lines = csvContent.trim().split('\n');
  const sessions: ParsedSession[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^([^,]+),([^,]+(?:,[^,]+)*),([^,]+)$/);
    
    if (match) {
      const [, time, titleWithCommas, room] = match;
      sessions.push({
        time: time.trim(),
        title: titleWithCommas.trim(),
        room: room.trim(),
        timeBlock: time.trim()
      });
    }
  }
  
  // Group by time blocks
  const blockMap = new Map<string, ParsedSession[]>();
  
  sessions.forEach(session => {
    if (!blockMap.has(session.timeBlock)) {
      blockMap.set(session.timeBlock, []);
    }
    blockMap.get(session.timeBlock)!.push(session);
  });
  
  // Convert to array and sort by time
  const blocks: SessionBlock[] = Array.from(blockMap.entries()).map(([timeSlot, sessions]) => ({
    timeSlot,
    sessions: sessions.sort((a, b) => a.room.localeCompare(b.room))
  }));
  
  // Sort blocks by time chronologically
  return blocks.sort((a, b) => {
    const parseTime = (timeStr: string): number => {
      const timePart = timeStr.split('–')[0].trim();
      const [time, period] = timePart.split(/(am|pm)/i);
      const [hours, minutes] = time.split(':').map(Number);
      
      let hour24 = hours;
      if (period.toLowerCase() === 'pm' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period.toLowerCase() === 'am' && hours === 12) {
        hour24 = 0;
      }
      
      return hour24 * 60 + (minutes || 0);
    };
    
    return parseTime(a.timeSlot) - parseTime(b.timeSlot);
  });
}
