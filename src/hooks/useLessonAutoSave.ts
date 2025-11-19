import { useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export function useLessonAutoSave(
  lessonId: string | undefined,
  components: any[],
  title: string,
  objectives: string[]
) {
  const debouncedComponents = useDebounce(components, 2000); // 2 second delay

  useEffect(() => {
    if (!lessonId) return; // Only auto-save for existing lessons
    
    // Don't save empty drafts (prevents overwriting real data with empty state on initial load)
    if (!title && (!components || components.length === 0) && (!objectives || objectives.length === 0 || (objectives.length === 1 && !objectives[0]))) {
      console.log('⏭️ Skipping auto-save: no meaningful data yet');
      return;
    }

    const draft = {
      lessonId,
      title,
      objectives,
      components: debouncedComponents,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(`lesson-draft-${lessonId}`, JSON.stringify(draft));
    console.log('💾 Auto-saved draft to localStorage');

  }, [lessonId, title, objectives, debouncedComponents]);

  // Recovery function to load draft
  const loadDraft = (lessonId: string) => {
    const draftKey = `lesson-draft-${lessonId}`;
    const draft = localStorage.getItem(draftKey);
    return draft ? JSON.parse(draft) : null;
  };

  // Clear draft after successful save
  const clearDraft = (lessonId: string) => {
    localStorage.removeItem(`lesson-draft-${lessonId}`);
  };

  return { loadDraft, clearDraft };
}
