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
    
    // Find the room (always starts with "Breakout")
    const roomMatch = line.match(/,(Breakout [^,]+)$/);
    if (!roomMatch) continue;
    
    const room = roomMatch[1];
    const beforeRoom = line.substring(0, line.lastIndexOf(',' + room));
    
    // First comma separates time from title
    const firstCommaIndex = beforeRoom.indexOf(',');
    if (firstCommaIndex === -1) continue;
    
    const time = beforeRoom.substring(0, firstCommaIndex).trim();
    const title = beforeRoom.substring(firstCommaIndex + 1).trim();
    
    sessions.push({
      time,
      title,
      room,
      timeBlock: time
    });
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
