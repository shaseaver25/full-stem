import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { CreateAssessmentDialog } from './CreateAssessmentDialog';

interface CreateAssessmentButtonProps {
  classId: string;
  onSuccess?: () => void;
}

export const CreateAssessmentButton = ({
  classId,
  onSuccess,
}: CreateAssessmentButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        className="w-full sm:w-auto"
        variant="outline"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Class Assessment
      </Button>

      <CreateAssessmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        classId={classId}
        onSuccess={onSuccess}
      />
    </>
  );
};