import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileEdit, Sparkles, Upload } from 'lucide-react';
import { ManualEntryTab } from './ManualEntryTab';
import { AIGenerateTab } from './AIGenerateTab';
import { BenchmarkUploadTab } from './BenchmarkUploadTab';

interface CreateAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onSuccess?: () => void;
}

export const CreateAssessmentDialog = ({
  open,
  onOpenChange,
  classId,
  onSuccess,
}: CreateAssessmentDialogProps) => {
  const [activeTab, setActiveTab] = useState('manual');

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Class Assessment</DialogTitle>
          <DialogDescription>
            Create a comprehensive assessment covering multiple lessons in your class
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileEdit className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="benchmark" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Benchmark
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <ManualEntryTab
              classId={classId}
              onSuccess={handleSuccess}
            />
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <AIGenerateTab
              classId={classId}
              onSuccess={handleSuccess}
            />
          </TabsContent>

          <TabsContent value="benchmark" className="space-y-4 mt-4">
            <BenchmarkUploadTab
              classId={classId}
              onSuccess={handleSuccess}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};