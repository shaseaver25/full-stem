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
  console.log('CSV Parser - Input length:', csvContent.length);
  const lines = csvContent.trim().split('\n');
  console.log('CSV Parser - Total lines:', lines.length);
  const sessions: ParsedSession[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Find the room (always starts with "Breakout")
    const roomMatch = line.match(/,(Breakout [^,]+)$/);
    if (!roomMatch) {
      console.log('CSV Parser - Line skipped (no room match):', line);
      continue;
    }
    
    const room = roomMatch[1];
    const beforeRoom = line.substring(0, line.lastIndexOf(',' + room));
    
    // First comma separates time from title
    const firstCommaIndex = beforeRoom.indexOf(',');
    if (firstCommaIndex === -1) {
      console.log('CSV Parser - Line skipped (no comma):', line);
      continue;
    }
    
    const time = beforeRoom.substring(0, firstCommaIndex).trim();
    const title = beforeRoom.substring(firstCommaIndex + 1).trim();
    
    sessions.push({
      time,
      title,
      room,
      timeBlock: time
    });
  }
  
  console.log('CSV Parser - Total sessions parsed:', sessions.length);
  
  // Group by time blocks
  const blockMap = new Map<string, ParsedSession[]>();
  
  sessions.forEach(session => {
    if (!blockMap.has(session.timeBlock)) {
      blockMap.set(session.timeBlock, []);
    }
    blockMap.get(session.timeBlock)!.push(session);
  });
  
  console.log('CSV Parser - Unique time blocks:', blockMap.size);
  
  // Convert to array and sort by time
  const blocks: SessionBlock[] = Array.from(blockMap.entries()).map(([timeSlot, sessions]) => ({
    timeSlot,
    sessions: sessions.sort((a, b) => a.room.localeCompare(b.room))
  }));
  
  console.log('CSV Parser - Blocks before sorting:', blocks.length);
  
  // Sort blocks by time chronologically
  const sortedBlocks = blocks.sort((a, b) => {
    const parseTime = (timeStr: string): number => {
      const timePart = timeStr.split('–')[0].trim();
      const match = timePart.match(/(\d+):(\d+)(am|pm)/i);
      
      if (!match) {
        console.warn('CSV Parser - Invalid time format:', timeStr);
        return 0;
      }
      
      const [, hoursStr, minutesStr, period] = match;
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      let hour24 = hours;
      if (period.toLowerCase() === 'pm' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period.toLowerCase() === 'am' && hours === 12) {
        hour24 = 0;
      }
      
      return hour24 * 60 + minutes;
    };
    
    return parseTime(a.timeSlot) - parseTime(b.timeSlot);
  });
  
  console.log('CSV Parser - Final sorted blocks:', sortedBlocks.length);
  console.log('CSV Parser - Sample block:', sortedBlocks[0]);
  
  return sortedBlocks;
}
