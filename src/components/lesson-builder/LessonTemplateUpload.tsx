import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, Download, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mammoth from "mammoth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LessonTemplateUploadProps {
  lessonId?: string;
  onImportComplete?: (lessonId: string, componentsCreated: number) => void;
}

export function LessonTemplateUpload({ lessonId, onImportComplete }: LessonTemplateUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const { toast } = useToast();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const downloadTemplate = async () => {
    try {
      console.log("📥 Downloading lesson template...");

      const { data, error } = await supabase.functions.invoke("generate-lesson-template-docx");

      if (error) throw error;
      if (!data.success || !data.file) throw new Error("Invalid response");

      const binaryString = atob(data.file);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename || "TailorEDU_Lesson_Template.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Template Downloaded",
        description: "Fill out the Word document and upload it when ready.",
      });
    } catch (err: any) {
      console.error("❌ Error downloading template:", err);
      toast({
        title: "Download Failed",
        description: err.message || "Failed to download template.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.docx,.md";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement)?.files?.[0];
      if (!file) return;

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["txt", "docx", "md"].includes(ext || "")) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a .txt, .docx, or .md file.",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);

      try {
        console.log("📤 Uploading lesson template:", file.name);
        const auth = await supabase.auth.getSession();
        const accessToken = auth.data.session?.access_token;

        let parsedText = "";
        
        if (ext === "docx") {
          console.log("📄 Parsing DOCX on client side with mammoth.js...");
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          parsedText = result.value;
          console.log("✅ Extracted text length:", parsedText.length);
        } else {
          console.log("📄 Reading TXT/MD file...");
          parsedText = await file.text();
        }

        console.log("📡 Sending parsed text to edge function...");
        const response = await fetch(`${supabaseUrl}/functions/v1/parse-lesson-template`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parsedContent: parsedText,
            lessonId: lessonId || null,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error("❌ Error from function:", data);
          throw new Error(data.error || "Template parsing failed");
        }

        console.log("✅ Lesson imported:", data);
        setImportResult(data);
        setShowResultDialog(true);
        if (onImportComplete) {
          onImportComplete(data.lessonId, data.componentsCreated);
        }

        toast({
          title: "Lesson Imported Successfully",
          description: `Created ${data.componentsCreated || 0} components from template.`,
        });
      } catch (err: any) {
        console.error("❌ Error uploading template:", err);
        toast({
          title: "Upload Failed",
          description: err.message || "Failed to upload template.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  };

  return (
    <>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={downloadTemplate} className="gap-2">
          <Download className="h-4 w-4" />
          Download Template
        </Button>

        <Button type="button" variant="outline" onClick={handleFileUpload} disabled={isUploading} className="gap-2">
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Upload Template
            </>
          )}
        </Button>
      </div>

      {/* Import Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <DialogTitle>Lesson Imported Successfully</DialogTitle>
            </div>
            <DialogDescription>
              Your lesson template has been parsed and components have been created.
            </DialogDescription>
          </DialogHeader>

          {importResult && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>{importResult.componentsCreated || 0} components</strong> were created from your template.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Lesson Details:</h4>
                <ul className="text-sm space-y-1">
                  <li>
                    <strong>Title:</strong> {importResult.metadata?.title || "Untitled"}
                  </li>
                  {importResult.metadata?.subject && (
                    <li>
                      <strong>Subject:</strong> {importResult.metadata.subject}
                    </li>
                  )}
                  {importResult.metadata?.grade_level && (
                    <li>
                      <strong>Grade Level:</strong> {importResult.metadata.grade_level}
                    </li>
                  )}
                  {importResult.metadata?.duration && (
                    <li>
                      <strong>Duration:</strong> {importResult.metadata.duration} minutes
                    </li>
                  )}
                </ul>
              </div>

              {importResult.components?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Created Components:</h4>
                  <div className="max-h-60 overflow-y-auto">
                    <ul className="text-sm space-y-1">
                      {importResult.components.map((comp: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-primary">•</span>
                          <span className="capitalize">{comp.type}</span>
                          <span className="text-muted-foreground">—</span>
                          <span>{comp.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <Alert variant="default">
                <AlertDescription className="text-xs">
                  💡 <strong>Next Steps:</strong> Review and edit the imported components below. You can customize,
                  reorder, and publish when ready.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>Continue Editing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
