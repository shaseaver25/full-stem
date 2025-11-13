import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Lightbulb } from 'lucide-react';

interface DiscussionEditorProps {
  content: any;
  onChange: (content: any) => void;
}

export function DiscussionEditor({ content, onChange }: DiscussionEditorProps) {
  const [prompt, setPrompt] = useState(content?.prompt || '');
  const [description, setDescription] = useState(content?.description || '');
  const [settings, setSettings] = useState(content?.settings || {
    allowStudentReplies: true,
    requireModeration: false,
    allowEditing: true,
    allowAnonymous: false,
    maxPostLength: 1000,
  });
  const [seedPosts, setSeedPosts] = useState(content?.seedPosts || []);

  // Update parent component when content changes
  useEffect(() => {
    onChange({
      prompt,
      description,
      settings,
      seedPosts,
    });
  }, [prompt, description, settings, seedPosts, onChange]);

  return (
    <div className="space-y-6">
      {/* Main Prompt */}
      <div>
        <Label htmlFor="prompt">Discussion Prompt *</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What question or topic should students discuss?"
          rows={3}
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          This is the main question students will respond to
        </p>
      </div>

      {/* Description/Context */}
      <div>
        <Label htmlFor="description">Instructions (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide context, guidelines, or expectations..."
          rows={2}
          className="mt-2"
        />
      </div>

      {/* Settings */}
      <div className="border rounded-lg p-4 space-y-4 bg-card">
        <h4 className="font-medium text-sm">Discussion Settings</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allowReplies" className="cursor-pointer font-normal">
              Allow student-to-student replies
            </Label>
            <p className="text-xs text-muted-foreground">Students can reply to each other's posts</p>
          </div>
          <Switch
            id="allowReplies"
            checked={settings.allowStudentReplies}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, allowStudentReplies: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="requireModeration" className="cursor-pointer font-normal">
              Require teacher approval
            </Label>
            <p className="text-xs text-muted-foreground">Posts need approval before appearing</p>
          </div>
          <Switch
            id="requireModeration"
            checked={settings.requireModeration}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, requireModeration: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allowEditing" className="cursor-pointer font-normal">
              Allow students to edit posts
            </Label>
            <p className="text-xs text-muted-foreground">Students can edit after posting</p>
          </div>
          <Switch
            id="allowEditing"
            checked={settings.allowEditing}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, allowEditing: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allowAnonymous" className="cursor-pointer font-normal">
              Allow anonymous posting
            </Label>
            <p className="text-xs text-muted-foreground">Hide student names on posts</p>
          </div>
          <Switch
            id="allowAnonymous"
            checked={settings.allowAnonymous}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, allowAnonymous: checked })
            }
          />
        </div>

        <div>
          <Label htmlFor="maxLength">Maximum post length</Label>
          <Input
            id="maxLength"
            type="number"
            value={settings.maxPostLength}
            onChange={(e) => 
              setSettings({ ...settings, maxPostLength: parseInt(e.target.value) || 1000 })
            }
            min={100}
            max={5000}
            className="mt-2 max-w-xs"
          />
          <p className="text-xs text-muted-foreground mt-1">Characters (100-5000)</p>
        </div>
      </div>

      {/* Seed Posts (Example Responses) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <Label className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Example Responses (Optional)
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Model the kind of discussion you want to see
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSeedPosts([...seedPosts, { content: '', authorName: 'Example' }])}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Example
          </Button>
        </div>
        
        {seedPosts.map((post: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 mb-3 space-y-3 bg-muted/50">
            <div className="flex items-center justify-between gap-3">
              <Input
                placeholder="Author name (e.g., 'Example Teacher')"
                value={post.authorName}
                onChange={(e) => {
                  const updated = [...seedPosts];
                  updated[index].authorName = e.target.value;
                  setSeedPosts(updated);
                }}
                className="bg-background"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSeedPosts(seedPosts.filter((_: any, i: number) => i !== index))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <Textarea
              placeholder="Example response to model good discussion..."
              value={post.content}
              onChange={(e) => {
                const updated = [...seedPosts];
                updated[index].content = e.target.value;
                setSeedPosts(updated);
              }}
              rows={3}
              className="bg-background"
            />
          </div>
        ))}
        
        {seedPosts.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              No example responses yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
