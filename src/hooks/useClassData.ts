
import { useState, useEffect } from 'react';
import { SaveClassData, getFullClassData, saveClass, updateClass } from '@/services/classService';
import { useToast } from '@/hooks/use-toast';

export const useClassData = (existingClassId?: string) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [classId, setClassId] = useState<string | null>(existingClassId || null);
  const [isDirty, setIsDirty] = useState(false);

  // Load existing class data if classId is provided
  useEffect(() => {
    const loadClassData = async () => {
      if (existingClassId) {
        setIsLoading(true);
        const result = await getFullClassData(existingClassId);
        if (result.success && result.data) {
          // This would populate the form data - for now we'll skip this
          // as it requires integration with the existing useClassCreation hook
        } else {
          toast({
            title: "Error",
            description: "Failed to load class data.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    loadClassData();
  }, [existingClassId, toast]);

  const saveClassData = async (data: SaveClassData) => {
    setIsSaving(true);
    
    try {
      let result;
      if (classId) {
        // Update existing class
        result = await updateClass(classId, data);
      } else {
        // Create new class
        result = await saveClass(data);
        if (result.success && result.classId) {
          setClassId(result.classId);
        }
      }

      if (result.success) {
        setIsDirty(false);
        toast({
          title: "Success!",
          description: classId ? "Class updated successfully." : "Class saved successfully.",
        });
        return result;
      } else {
        toast({
          title: "Error",
          description: "Failed to save class. Please try again.",
          variant: "destructive",
        });
        return result;
      }
    } catch (error) {
      console.error('Error saving class:', error);
      toast({
        title: "Error",
        description: "Failed to save class. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsSaving(false);
    }
  };

  const markDirty = () => {
    setIsDirty(true);
  };

  return {
    isLoading,
    isSaving,
    classId,
    isDirty,
    saveClassData,
    markDirty
  };
};
