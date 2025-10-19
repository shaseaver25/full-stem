import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Presentation, FileText, Video, MessageSquare, Code, Calculator, Activity, FileCheck, BarChart, Lightbulb, BookOpen, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AddComponentButtonProps {
  onSelect: (type: string) => void;
}

const componentTypes = [
  { type: 'slides', label: 'PowerPoint/Slides', icon: Presentation, description: 'Upload or embed slide presentations' },
  { type: 'page', label: 'Page', icon: FileText, description: 'Rich text content page' },
  { type: 'video', label: 'Multimedia', icon: Video, description: 'Video, audio, or interactive media' },
  { type: 'discussion', label: 'Discussion', icon: MessageSquare, description: 'Class discussion prompt' },
  { type: 'codingEditor', label: 'Coding IDE', icon: Code, description: 'Live coding environment' },
  { type: 'activity', label: 'Activity', icon: Activity, description: 'In-class activity' },
  { type: 'assignment', label: 'Assignment', icon: FileCheck, description: 'Homework or project' },
  { type: 'reflection', label: 'Reflection', icon: Lightbulb, description: 'Student reflection prompt' },
  { type: 'instructions', label: 'Instructions', icon: BookOpen, description: 'Step-by-step instructions' },
  { type: 'resources', label: 'Resources', icon: FolderOpen, description: 'Additional materials' },
];

export function AddComponentButton({ onSelect }: AddComponentButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: string) => {
    onSelect(type);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full" aria-label="Add lesson component">
          <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
          Add Component
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-3xl max-h-[80vh] overflow-y-auto"
        aria-describedby="add-component-description"
      >
        <DialogHeader>
          <DialogTitle>Add Lesson Component</DialogTitle>
          <DialogDescription id="add-component-description">
            Choose a component type to add to your lesson
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {componentTypes.map((comp) => {
            const Icon = comp.icon;
            return (
              <Card
                key={comp.type}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleSelect(comp.type)}
                role="button"
                tabIndex={0}
                aria-label={`Add ${comp.label} component`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(comp.type);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10" aria-hidden="true">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{comp.label}</h3>
                      <p className="text-xs text-muted-foreground">{comp.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
