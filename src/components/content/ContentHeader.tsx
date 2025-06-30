
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import ContentForm from './ContentForm';

interface ContentHeaderProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  onCreateContent: () => void;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  formData,
  setFormData,
  onCreateContent
}) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Content Library</h1>
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogTrigger asChild>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Add Content
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
            <DialogDescription>
              Add new educational content to your library
            </DialogDescription>
          </DialogHeader>
          <ContentForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={onCreateContent}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentHeader;
