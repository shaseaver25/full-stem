import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableComponentCard } from './SortableComponentCard';

interface LessonComponent {
  id?: string;
  component_type: string;
  title?: string;
  content: any;
  order: number;
  enabled: boolean;
  is_assignable: boolean;
  reading_level?: number;
  language_code: string;
  read_aloud: boolean;
  teacher_only?: boolean;
}

interface ComponentListProps {
  components: LessonComponent[];
  onUpdate: (index: number, updates: Partial<LessonComponent>) => void;
  onDelete: (index: number) => void;
  onReorder: (components: LessonComponent[]) => void;
  lessonId?: string;
}

export function ComponentList({ components, onUpdate, onDelete, onReorder, lessonId }: ComponentListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getComponentId = (component: LessonComponent, index: number) => {
    return component.id || `temp-${component.component_type}-${index}`;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = components.findIndex((c, i) => getComponentId(c, i) === active.id);
      const newIndex = components.findIndex((c, i) => getComponentId(c, i) === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(components, oldIndex, newIndex));
      }
    }
  };

  if (components.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No components yet. Click "Add Component" to get started.
      </div>
    );
  }

  const itemIds = components.map((c, i) => getComponentId(c, i));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {components.map((component, index) => (
            <SortableComponentCard
              key={getComponentId(component, index)}
              id={getComponentId(component, index)}
              component={component}
              index={index}
              onUpdate={onUpdate}
              onDelete={onDelete}
              lessonId={lessonId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
