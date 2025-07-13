import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LayoutGrid, ArrowUpDown, Settings } from 'lucide-react';
import { useGlobalSetting, useUpdateGlobalSetting } from '@/hooks/useGlobalSettings';
import { useToast } from '@/hooks/use-toast';

const LessonViewModeToggle: React.FC = () => {
  const { data: setting, isLoading } = useGlobalSetting('lesson_view_mode');
  const updateSetting = useUpdateGlobalSetting();
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    const newMode = checked ? 'modular' : 'scroll';
    
    try {
      await updateSetting.mutateAsync({
        key: 'lesson_view_mode',
        value: newMode,
      });
      
      toast({
        title: 'Settings Updated',
        description: `Lesson view mode changed to ${newMode === 'modular' ? 'Tabbed/Swipe' : 'Vertical Scroll'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lesson view mode',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentMode = setting?.setting_value || 'scroll';
  const isModular = currentMode === 'modular';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Lesson Layout Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Current Layout</p>
            <p className="text-sm text-muted-foreground">
              All lessons will use this layout style
            </p>
          </div>
          <Badge variant={isModular ? 'default' : 'secondary'}>
            {isModular ? 'Tabbed/Swipe Layout' : 'Vertical Scroll Layout'}
          </Badge>
        </div>

        {/* Toggle Control */}
        <div className="flex items-center space-x-3 p-4 border rounded-lg">
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="layout-mode">Vertical Scroll</Label>
          </div>
          
          <Switch
            id="layout-mode"
            checked={isModular}
            onCheckedChange={handleToggle}
            disabled={updateSetting.isPending}
          />
          
          <div className="flex items-center space-x-2">
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="layout-mode">Tabbed/Swipe</Label>
          </div>
        </div>

        {/* Layout Descriptions */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`p-4 border rounded-lg ${!isModular ? 'border-primary bg-primary/5' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpDown className="h-4 w-4" />
              <h4 className="font-medium">Vertical Scroll (Current)</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Traditional lesson layout with all content in a single scrollable page. 
              Good for reading flow and printing.
            </p>
          </div>

          <div className={`p-4 border rounded-lg ${isModular ? 'border-primary bg-primary/5' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <LayoutGrid className="h-4 w-4" />
              <h4 className="font-medium">Tabbed/Swipe (New)</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Component-based layout with tabbed navigation. 
              Better for mobile, modular content, and focused learning.
            </p>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Supported Features</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Read-aloud support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Translation ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Mobile responsive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Component management</span>
            </div>
          </div>
        </div>

        {updateSetting.isPending && (
          <div className="text-sm text-muted-foreground text-center">
            Updating layout mode...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonViewModeToggle;