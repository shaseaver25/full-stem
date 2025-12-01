import { supabase } from '@/integrations/supabase/client';

/**
 * Removes duplicate lessons from a class, keeping only the earliest created version
 * of each duplicated title.
 */
export async function removeDuplicateLessons(classId: string) {
  try {
    // Fetch all lessons for this class
    const { data: lessons, error: fetchError } = await supabase
      .from('lessons')
      .select('id, title, created_at')
      .eq('class_id', classId)
      .order('title')
      .order('created_at');

    if (fetchError) throw fetchError;
    if (!lessons) return { deleted: 0 };

    // Group lessons by title to find duplicates
    const lessonsByTitle = lessons.reduce((acc, lesson) => {
      if (!acc[lesson.title]) {
        acc[lesson.title] = [];
      }
      acc[lesson.title].push(lesson);
      return acc;
    }, {} as Record<string, typeof lessons>);

    // Find duplicates (keep first, delete rest)
    const toDelete: string[] = [];
    Object.values(lessonsByTitle).forEach(group => {
      if (group.length > 1) {
        // Keep the first (earliest), delete the rest
        const [_keep, ...duplicates] = group;
        toDelete.push(...duplicates.map(d => d.id));
      }
    });

    if (toDelete.length === 0) {
      return { deleted: 0 };
    }

    // Delete duplicates
    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .in('id', toDelete);

    if (deleteError) throw deleteError;

    return { deleted: toDelete.length };
  } catch (error) {
    console.error('Error removing duplicate lessons:', error);
    throw error;
  }
}
