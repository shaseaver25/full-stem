
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { Resource } from '@/types/buildClassTypes';

interface ResourcesFormProps {
  resources: Resource[];
  currentResource: Partial<Resource>;
  setCurrentResource: React.Dispatch<React.SetStateAction<Partial<Resource>>>;
  addResource: () => void;
  removeResource: (id: string) => void;
}

const ResourcesForm: React.FC<ResourcesFormProps> = ({
  resources,
  currentResource,
  setCurrentResource,
  addResource,
  removeResource
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Resource
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Resource Title</Label>
            <Input
              value={currentResource.title || ''}
              onChange={(e) => setCurrentResource({...currentResource, title: e.target.value})}
              placeholder="Enter resource title"
            />
          </div>

          <div className="space-y-2">
            <Label>Resource Type</Label>
            <Select 
              value={currentResource.type} 
              onValueChange={(value) => setCurrentResource({...currentResource, type: value as any})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="link">External Link</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={currentResource.url || ''}
              onChange={(e) => setCurrentResource({...currentResource, url: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={currentResource.description || ''}
              onChange={(e) => setCurrentResource({...currentResource, description: e.target.value})}
              placeholder="Brief description of the resource"
              rows={3}
            />
          </div>

          <Button onClick={addResource} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resources ({resources.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources.map((resource) => (
              <div key={resource.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{resource.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResource(resource.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <Badge variant="outline" className="text-xs">
                    {resource.type}
                  </Badge>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Resource
                  </a>
                </div>
              </div>
            ))}
            {resources.length === 0 && (
              <p className="text-gray-500 text-center py-8">No resources added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesForm;
