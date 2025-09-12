import { useState, useEffect } from 'react';
import { CheckSquare, Square, Clock, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLessonComponents } from '@/hooks/useClassManagement';
import { groupComponentsByType, getComponentTypeLabel, validateComponentSelection } from '@/utils/assignmentUtils';
import type { LessonComponent } from '@/types/assignmentTypes';

interface ComponentSelectorProps {
  lessonId: number;
  selectedComponentIds: string[];
  onSelectionChange: (componentIds: string[]) => void;
}

export function ComponentSelector({ 
  lessonId, 
  selectedComponentIds, 
  onSelectionChange 
}: ComponentSelectorProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  
  const { data: components = [], isLoading } = useLessonComponents(lessonId);
  
  // Group components by type
  const groupedComponents = groupComponentsByType(components);
  const componentTypes = Object.keys(groupedComponents);

  // Initialize open groups and select required components
  useEffect(() => {
    if (components.length > 0) {
      // Open all groups initially
      setOpenGroups(new Set(componentTypes));
      
      // Auto-select required components
      const requiredIds = components
        .filter(c => c.is_required)
        .map(c => c.id);
      
      if (requiredIds.length > 0) {
        const newSelection = [...new Set([...selectedComponentIds, ...requiredIds])];
        onSelectionChange(newSelection);
      }
    }
  }, [components, componentTypes]);

  const toggleGroup = (type: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleComponentToggle = (componentId: string, isRequired: boolean) => {
    if (isRequired) return; // Don't allow deselecting required components

    const newSelection = selectedComponentIds.includes(componentId)
      ? selectedComponentIds.filter(id => id !== componentId)
      : [...selectedComponentIds, componentId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = components.map(c => c.id);
    onSelectionChange(allIds);
  };

  const handleSelectNone = () => {
    const requiredIds = components
      .filter(c => c.is_required)
      .map(c => c.id);
    onSelectionChange(requiredIds);
  };

  const getTotalEstimatedTime = () => {
    const selectedComponents = components.filter(c => 
      selectedComponentIds.includes(c.id)
    );
    return selectedComponents.reduce((total, c) => total + (c.estimated_minutes || 0), 0);
  };

  const isValidSelection = validateComponentSelection(selectedComponentIds, components);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-muted rounded animate-pulse" />
        <div className="h-40 bg-muted rounded animate-pulse" />
        <div className="h-40 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <div className="text-lg font-medium text-muted-foreground">No Components Found</div>
          <div className="text-sm text-muted-foreground">
            This lesson doesn't have any components available for assignment.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats and controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <div className="text-lg font-semibold">
                Select Components ({selectedComponentIds.length}/{components.length})
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {getTotalEstimatedTime()} minutes estimated
                </div>
                {!isValidSelection && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Please select at least one component
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleSelectNone}>
                Select None
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component groups */}
      <div className="space-y-4">
        {componentTypes.map(type => {
          const typeComponents = groupedComponents[type];
          const selectedCount = typeComponents.filter(c => 
            selectedComponentIds.includes(c.id)
          ).length;
          
          return (
            <Card key={type}>
              <Collapsible open={openGroups.has(type)} onOpenChange={() => toggleGroup(type)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {openGroups.has(type) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                        <span>{getComponentTypeLabel(type)}</span>
                        <Badge variant="secondary">
                          {selectedCount}/{typeComponents.length}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {typeComponents.map(component => {
                        const isSelected = selectedComponentIds.includes(component.id);
                        const isRequired = component.is_required;
                        
                        return (
                          <div
                            key={component.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                              isSelected 
                                ? 'bg-primary/5 border-primary/20' 
                                : 'hover:bg-muted/50'
                            } ${
                              isRequired ? 'border-amber-200 bg-amber-50/50' : ''
                            }`}
                          >
                            <button
                              onClick={() => handleComponentToggle(component.id, isRequired)}
                              disabled={isRequired}
                              className="mt-0.5 transition-colors"
                            >
                              {isSelected ? (
                                <CheckSquare className={`h-5 w-5 ${
                                  isRequired ? 'text-amber-600' : 'text-primary'
                                }`} />
                              ) : (
                                <Square className="h-5 w-5 text-muted-foreground" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="font-medium text-sm">
                                  {component.title}
                                </div>
                                {isRequired && (
                                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                                    Required
                                  </Badge>
                                )}
                              </div>
                              
                              {component.description && (
                                <div className="text-sm text-muted-foreground mb-2">
                                  {component.description}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {component.estimated_minutes || 30} min
                                </div>
                                {component.requires_submission && (
                                  <Badge variant="outline" className="text-xs">
                                    Requires Submission
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}