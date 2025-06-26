
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Edit } from 'lucide-react';
import { EditClassModal } from './EditClassModal';

interface ClassOverviewHeaderProps {
  classId: string;
}

export const ClassOverviewHeader = ({ classId }: ClassOverviewHeaderProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: classData, isLoading } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: studentCount } = useQuery({
    queryKey: ['studentCount', classId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classId);

      if (error) throw error;
      return count || 0;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!classData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Class not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{classData.name}</CardTitle>
              <div className="flex gap-2 mt-2">
                {classData.grade_level && (
                  <Badge variant="secondary">Grade {classData.grade_level}</Badge>
                )}
                {classData.subject && (
                  <Badge variant="outline">{classData.subject}</Badge>
                )}
                {classData.school_year && (
                  <Badge variant="outline">{classData.school_year}</Badge>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Class Info
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span>{studentCount} students enrolled</span>
          </div>
        </CardContent>
      </Card>

      <EditClassModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        classData={classData}
      />
    </>
  );
};
