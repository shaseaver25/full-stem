
import { supabase } from "@/integrations/supabase/client";
import { ClassData, Lesson, Assignment, ClassroomActivity, IndividualActivity, Resource } from "@/types/buildClassTypes";

export interface SaveClassData {
  classData: ClassData;
  lessons: Lesson[];
  assignments: Assignment[];
  classroomActivities: ClassroomActivity[];
  individualActivities: IndividualActivity[];
  resources: Resource[];
}

// For now, we'll save to the existing classes table and store the complex data as JSON
// This is a temporary solution until we can properly migrate the database
export const saveClass = async (data: SaveClassData) => {
  try {
    console.log('Saving class data:', data);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Save to existing classes table with JSON metadata
    const { data: classResult, error: classError } = await supabase
      .from('classes')
      .insert({
        name: data.classData.title, // Use 'name' field that exists in current schema
        grade_level: data.classData.gradeLevel,
        subject: data.classData.subject,
        teacher_id: user.id,
        // Store the complex class data as JSON in a way that doesn't break the existing schema
        // We'll add proper columns later through migration
      })
      .select()
      .single();

    if (classError) {
      console.error('Error saving to classes table:', classError);
      throw classError;
    }

    console.log('Class saved successfully:', classResult);

    // For now, we'll also save the full class data to a temporary storage
    // This could be localStorage or a separate service until we have proper tables
    const fullClassData = {
      ...data,
      classId: classResult.id,
      createdAt: new Date().toISOString()
    };

    // Store in localStorage as backup until we have proper database structure
    const existingClasses = JSON.parse(localStorage.getItem('tailored_classes') || '[]');
    existingClasses.push(fullClassData);
    localStorage.setItem('tailored_classes', JSON.stringify(existingClasses));

    return { success: true, classId: classResult.id };
  } catch (error) {
    console.error('Error saving class:', error);
    return { success: false, error };
  }
};

export const publishClass = async (classId: string) => {
  try {
    // For now, just mark the class as published in localStorage
    const existingClasses = JSON.parse(localStorage.getItem('tailored_classes') || '[]');
    const updatedClasses = existingClasses.map((cls: any) => 
      cls.classId === classId ? { ...cls, published: true } : cls
    );
    localStorage.setItem('tailored_classes', JSON.stringify(updatedClasses));

    return { success: true };
  } catch (error) {
    console.error('Error publishing class:', error);
    return { success: false, error };
  }
};

export const getMyClasses = async () => {
  try {
    // Get from both database and localStorage
    const { data: dbClasses, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching from database:', error);
    }

    // Also get from localStorage
    const localClasses = JSON.parse(localStorage.getItem('tailored_classes') || '[]');

    // Combine both sources
    const allClasses = [
      ...(dbClasses || []),
      ...localClasses.map((cls: any) => ({
        id: cls.classId,
        name: cls.classData.title,
        grade_level: cls.classData.gradeLevel,
        subject: cls.classData.subject,
        created_at: cls.createdAt,
        fullData: cls // Include full data for detailed view
      }))
    ];

    return { success: true, data: allClasses };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { success: false, error };
  }
};

// Helper function to get full class data including lessons, activities, etc.
export const getFullClassData = async (classId: string) => {
  try {
    const localClasses = JSON.parse(localStorage.getItem('tailored_classes') || '[]');
    const fullClass = localClasses.find((cls: any) => cls.classId === classId);
    
    if (fullClass) {
      return { success: true, data: fullClass };
    }

    // If not found in localStorage, return basic data from database
    const { data: dbClass, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (error) throw error;

    return { 
      success: true, 
      data: {
        classId: dbClass.id,
        classData: {
          title: dbClass.name,
          gradeLevel: dbClass.grade_level,
          subject: dbClass.subject,
          description: '',
          duration: '',
          instructor: '',
          schedule: '',
          learningObjectives: '',
          prerequisites: '',
          maxStudents: 25
        },
        lessons: [],
        assignments: [],
        classroomActivities: [],
        individualActivities: [],
        resources: []
      }
    };
  } catch (error) {
    console.error('Error fetching full class data:', error);
    return { success: false, error };
  }
};
