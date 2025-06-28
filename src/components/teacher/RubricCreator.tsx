
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useRubrics } from '@/hooks/useRubrics';

interface RubricCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  onRubricCreated: () => void;
}

interface CriterionData {
  id: string;
  name: string;
  description: string;
  max_points: number;
}

const RubricCreator = ({ open, onOpenChange, assignmentId, onRubricCreated }: RubricCreatorProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<CriterionData[]>([
    { id: '1', name: '', description: '', max_points: 10 }
  ]);
  const { createRubric, loading } = useRubrics();

  const addCriterion = () => {
    const newId = (criteria.length + 1).toString();
    setCriteria([...criteria, { id: newId, name: '', description: '', max_points: 10 }]);
  };

  const removeCriterion = (id: string) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter(c => c.id !== id));
    }
  };

  const updateCriterion = (id: string, field: keyof CriterionData, value: string | number) => {
    setCriteria(criteria.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSubmit = async () => {
    if (!name.trim() || criteria.some(c => !c.name.trim() || c.max_points <= 0)) {
      return;
    }

    const success = await createRubric({
      assignment_id: assignmentId,
      name: name.trim(),
      description: description.trim() || undefined,
      criteria: criteria.map(c => ({
        name: c.name.trim(),
        description: c.description.trim() || undefined,
        max_points: c.max_points,
      })),
    });

    if (success) {
      // Reset form
      setName('');
      setDescription('');
      setCriteria([{ id: '1', name: '', description: '', max_points: 10 }]);
      onRubricCreated();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Grading Rubric</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Rubric Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="rubric-name">Rubric Name</Label>
              <Input
                id="rubric-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter rubric name..."
              />
            </div>
            
            <div>
              <Label htmlFor="rubric-description">Description (Optional)</Label>
              <Textarea
                id="rubric-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the rubric..."
                rows={2}
              />
            </div>
          </div>

          {/* Criteria */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">Grading Criteria</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCriterion}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Criterion
              </Button>
            </div>

            {criteria.map((criterion, index) => (
              <Card key={criterion.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Criterion {index + 1}</Label>
                      {criteria.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCriterion(criterion.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <Label htmlFor={`criterion-name-${criterion.id}`}>Name</Label>
                        <Input
                          id={`criterion-name-${criterion.id}`}
                          value={criterion.name}
                          onChange={(e) => updateCriterion(criterion.id, 'name', e.target.value)}
                          placeholder="e.g., Content Quality"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`criterion-points-${criterion.id}`}>Max Points</Label>
                        <Input
                          id={`criterion-points-${criterion.id}`}
                          type="number"
                          min="1"
                          value={criterion.max_points}
                          onChange={(e) => updateCriterion(criterion.id, 'max_points', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`criterion-description-${criterion.id}`}>Description (Optional)</Label>
                      <Textarea
                        id={`criterion-description-${criterion.id}`}
                        value={criterion.description}
                        onChange={(e) => updateCriterion(criterion.id, 'description', e.target.value)}
                        placeholder="Describe what this criterion evaluates..."
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total Points Display */}
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Points:</span>
              <span className="text-lg font-bold">
                {criteria.reduce((sum, c) => sum + (c.max_points || 0), 0)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!name.trim() || criteria.some(c => !c.name.trim() || c.max_points <= 0) || loading}
            >
              {loading ? 'Creating...' : 'Create Rubric'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RubricCreator;
