export interface ParsedSession {
  time: string;
  title: string;
  room: string;
  timeBlock: string; // Normalized time block for grouping
  speaker?: string;
  description?: string;
}

export interface SessionBlock {
  timeSlot: string;
  sessions: ParsedSession[];
}

/**
 * Parse CSV content and group sessions by time blocks
 * Format: Time,Room,Title,Speaker,Audience,Description,title_norm
 */
export function parseConferenceSessions(csvContent: string): SessionBlock[] {
  console.log('CSV Parser - Input length:', csvContent.length);
  const lines = csvContent.trim().split('\n');
  console.log('CSV Parser - Total lines:', lines.length);
  const sessions: ParsedSession[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV with quoted fields (handles commas within quotes)
    const parts: string[] = [];
    let currentField = '';
    let insideQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        parts.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    parts.push(currentField.trim()); // Add last field
    
    if (parts.length >= 3) {
      const time = parts[0];
      const room = parts[1];
      const title = parts[2];
      const speaker = parts[3] || '';
      const description = parts[5] || '';
      
      sessions.push({
        time,
        title,
        room,
        timeBlock: time,
        speaker,
        description
      });
      
      console.log('CSV Parser - Parsed session:', { time, title, room, speaker });
    }
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
      // Time format: "9:45–10:30am" or "11:45am–12:30pm"
      // Extract the period (am/pm) from the end of the string
      const periodMatch = timeStr.match(/(am|pm)$/i);
      if (!periodMatch) {
        console.warn('CSV Parser - No period found in time:', timeStr);
        return 0;
      }
      const period = periodMatch[1];
      
      // Extract the start time (before the dash)
      const startTimeMatch = timeStr.match(/^(\d+):(\d+)/);
      if (!startTimeMatch) {
        console.warn('CSV Parser - Invalid time format:', timeStr);
        return 0;
      }
      
      const hours = parseInt(startTimeMatch[1], 10);
      const minutes = parseInt(startTimeMatch[2], 10);
      
      // Convert to 24-hour format
      let hour24 = hours;
      if (period.toLowerCase() === 'pm' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period.toLowerCase() === 'am' && hours === 12) {
        hour24 = 0;
      }
      
      const totalMinutes = hour24 * 60 + minutes;
      console.log(`Parsing ${timeStr}: ${hour24}:${minutes} = ${totalMinutes} minutes`);
      return totalMinutes;
    };
    
    return parseTime(a.timeSlot) - parseTime(b.timeSlot);
  });
  
  console.log('CSV Parser - Final sorted blocks:', sortedBlocks.map(b => b.timeSlot));
  
  return sortedBlocks;
}
