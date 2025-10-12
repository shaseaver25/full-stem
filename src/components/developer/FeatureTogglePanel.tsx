import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface FeatureToggle {
  id: string;
  feature_name: string;
  enabled: boolean;
  description: string | null;
  environment: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const FeatureTogglePanel = () => {
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const [newFeature, setNewFeature] = useState({
    feature_name: '',
    description: '',
    environment: 'staging',
    enabled: false,
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feature toggles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_toggles')
        .update({ enabled: !currentState })
        .eq('id', id);

      if (error) throw error;

      setFeatures(features.map(f => 
        f.id === id ? { ...f, enabled: !currentState } : f
      ));

      toast({
        title: 'Success',
        description: `Feature ${!currentState ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle feature',
        variant: 'destructive',
      });
    }
  };

  const addFeature = async () => {
    if (!newFeature.feature_name) {
      toast({
        title: 'Error',
        description: 'Feature name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('feature_toggles')
        .insert([newFeature])
        .select()
        .single();

      if (error) throw error;

      setFeatures([data, ...features]);
      setNewFeature({
        feature_name: '',
        description: '',
        environment: 'staging',
        enabled: false,
      });
      setShowAddForm(false);

      toast({
        title: 'Success',
        description: 'Feature toggle created',
      });
    } catch (error) {
      console.error('Error adding feature:', error);
      toast({
        title: 'Error',
        description: 'Failed to create feature toggle',
        variant: 'destructive',
      });
    }
  };

  const deleteFeature = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feature_toggles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFeatures(features.filter(f => f.id !== id));

      toast({
        title: 'Success',
        description: 'Feature toggle deleted',
      });
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete feature toggle',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Toggles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Feature Toggles</CardTitle>
            <CardDescription>
              Manage experimental features across environments
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="feature_name">Feature Name</Label>
              <Input
                id="feature_name"
                value={newFeature.feature_name}
                onChange={(e) => setNewFeature({ ...newFeature, feature_name: e.target.value })}
                placeholder="e.g., new_dashboard_layout"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newFeature.description}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                placeholder="What does this feature do?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={newFeature.environment}
                onValueChange={(value) => setNewFeature({ ...newFeature, environment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={newFeature.enabled}
                onCheckedChange={(checked) => setNewFeature({ ...newFeature, enabled: checked })}
              />
              <Label>Enable immediately</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={addFeature}>Create</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {features.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No feature toggles configured. Add one to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{feature.feature_name}</h4>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 rounded">
                      {feature.environment}
                    </span>
                  </div>
                  {feature.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={feature.enabled}
                    onCheckedChange={() => toggleFeature(feature.id, feature.enabled)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteFeature(feature.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
