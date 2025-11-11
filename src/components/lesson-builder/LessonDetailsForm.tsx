import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface LessonDetailsFormProps {
  title: string;
  setTitle: (value: string) => void;
  lessonNumber: number;
  setLessonNumber: (value: number) => void;
  unitId: string;
  setUnitId: (value: string) => void;
  objectives: string[];
  setObjectives: (value: string[]) => void;
  classId: string;
  setClassId: (value: string) => void;
}

export function LessonDetailsForm({
  title,
  setTitle,
  lessonNumber,
  setLessonNumber,
  unitId,
  setUnitId,
  objectives,
  setObjectives,
  classId,
  setClassId,
}: LessonDetailsFormProps) {
  const [searchParams] = useSearchParams();
  const { lessonId: routeLessonId } = useParams();
  const lessonId = routeLessonId || searchParams.get('lessonId');
  const { toast } = useToast();
  const [desmosEnabled, setDesmosEnabled] = useState(false);

  // Load Desmos settings for existing lesson
  useEffect(() => {
    if (lessonId) {
      supabase
        .from('lessons')
        .select('desmos_enabled')
        .eq('id', lessonId)
        .single()
        .then(({ data }) => {
          if (data) {
            setDesmosEnabled(data.desmos_enabled || false);
          }
        });
    }
  }, [lessonId]);

  const handleDesmosToggle = async (checked: boolean) => {
    setDesmosEnabled(checked);
    
    // Save to database if lesson exists
    if (lessonId) {
      const { error } = await supabase
        .from('lessons')
        .update({ 
          desmos_enabled: checked,
          desmos_type: checked ? 'calculator' : null 
        })
        .eq('id', lessonId);

      if (error) {
        console.error('Error updating Desmos setting:', error);
        toast({
          title: 'Error',
          description: 'Failed to update calculator setting',
          variant: 'destructive',
        });
        setDesmosEnabled(!checked); // Revert on error
      } else {
        toast({
          title: checked ? 'Calculator Enabled' : 'Calculator Disabled',
          description: checked 
            ? 'Students can now access the Desmos calculator from any page in this lesson'
            : 'Calculator has been disabled for this lesson',
        });
      }
    }
  };

  const { data: classes } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get teacher profile ID
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!teacherProfile) return [];

      // Only show classes where the user is the teacher
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('teacher_id', teacherProfile.id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddObjective = () => {
    setObjectives([...objectives, '']);
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleUpdateObjective = (index: number, value: string) => {
    const updated = [...objectives];
    updated[index] = value;
    setObjectives(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lesson Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="class">Class *</Label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes?.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title">Lesson Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter lesson title"
            required
          />
        </div>

        <div>
          <Label htmlFor="lessonNumber">Lesson Number</Label>
          <Input
            id="lessonNumber"
            type="number"
            value={lessonNumber}
            onChange={(e) => setLessonNumber(parseInt(e.target.value) || 1)}
            min={1}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Learning Objectives</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddObjective}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Objective
            </Button>
          </div>
          <div className="space-y-2">
            {objectives.map((objective, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={objective}
                  onChange={(e) => handleUpdateObjective(index, e.target.value)}
                  placeholder={`Objective ${index + 1}`}
                  rows={2}
                />
                {objectives.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveObjective(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <Label htmlFor="desmos-enabled" className="font-semibold">
                  Enable Desmos Calculator
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Students can access a floating calculator from any page in this lesson
              </p>
            </div>
            <Switch
              id="desmos-enabled"
              checked={desmosEnabled}
              onCheckedChange={handleDesmosToggle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
