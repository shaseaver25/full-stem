import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Cloud storage imports
import { DriveFilePicker, DriveAttachmentsList } from "@/components/drive";
import { OneDriveFilePicker, OneDriveAttachmentsList } from "@/components/onedrive";

// Type definition
interface LessonComponentCardProps {
  component: {
    id?: string | number;
    title?: string;
    content?: string;
    component_type?: string;
  };
  onSave?: (data: any) => void;
  onDelete?: (id: string | number) => void;
}

export default function LessonComponentCard({ component, onSave, onDelete }: LessonComponentCardProps) {
  const [title, setTitle] = useState(component?.title || "");
  const [content, setContent] = useState(component?.content || "");
  const { toast } = useToast();

  const handleSave = () => {
    const data = {
      ...component,
      title,
      content,
    };
    console.log("💾 Saving component:", data);
    toast({
      title: "Component Saved",
      description: `"${title}" has been saved successfully.`,
    });
    onSave?.(data);
  };

  const handleDelete = () => {
    if (!component?.id) return;
    console.log("🗑️ Deleting component:", component.id);
    onDelete?.(component.id);
    toast({
      title: "Component Deleted",
      description: `"${title}" has been removed.`,
    });
  };

  // Cloud file attachment handlers
  const handleDriveFileSelected = (file: any) => {
    console.log("✅ Google Drive file selected:", file);
    // TODO: attach file to component via Supabase mutation
  };

  const handleOneDriveFileSelected = (file: any) => {
    console.log("✅ OneDrive file selected:", file);
    // TODO: attach file to component via Supabase mutation
  };

  return (
    <Card className="mb-6 border-border shadow-sm">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>
          {component?.component_type ? `${component.component_type.toUpperCase()} Component` : "Lesson Component"}
        </CardTitle>
        {component?.id && (
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Title Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this component"
          />
        </div>

        {/* Content Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter lesson content, instructions, or prompts here..."
            rows={5}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Component</Button>
        </div>

        {/* -------------------------------------------------- */}
        {/* CLOUD FILE ATTACHMENTS */}
        {/* -------------------------------------------------- */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-2">Cloud File Attachments</h3>

          {component?.id ? (
            <div className="space-y-4">
              {/* ---------------- GOOGLE DRIVE ---------------- */}
              <div className="border border-border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span>📂 Google Drive Files</span>
                </h4>
                <DriveFilePicker onFileSelected={handleDriveFileSelected} />
                <DriveAttachmentsList componentId={String(component.id)} showEmbeds={false} canDelete={true} />
              </div>

              {/* ---------------- ONEDRIVE ---------------- */}
              <div className="border border-border rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span>💼 OneDrive Files</span>
                </h4>
                <OneDriveFilePicker onFileSelected={handleOneDriveFileSelected} />
                <OneDriveAttachmentsList componentId={String(component.id)} showEmbeds={false} canDelete={true} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Save this component first to attach cloud files.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
