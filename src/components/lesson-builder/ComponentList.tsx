import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { LessonComponentCard } from './LessonComponentCard';

interface LessonComponent {
  id?: string;
  component_type: string;
  title?: string;
  content: any;
  order: number;
  enabled: boolean;
  reading_level?: number;
  language_code: string;
  read_aloud: boolean;
}

interface ComponentListProps {
  components: LessonComponent[];
  onUpdate: (index: number, updates: Partial<LessonComponent>) => void;
  onDelete: (index: number) => void;
  onReorder: (components: LessonComponent[]) => void;
}

export function ComponentList({ components, onUpdate, onDelete, onReorder }: ComponentListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  if (components.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No components yet. Click "Add Component" to get started.
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="components">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {components.map((component, index) => (
              <Draggable
                key={`${component.component_type}-${index}`}
                draggableId={`${component.component_type}-${index}`}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={provided.draggableProps.style}
                  >
                    <LessonComponentCard
                      component={component}
                      index={index}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      dragHandleProps={provided.dragHandleProps}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
