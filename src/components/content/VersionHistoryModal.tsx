
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content_type: string;
  file_url: string;
  thumbnail_url: string;
  tags: string[];
  subject: string;
  grade_level: string;
  is_published: boolean;
  version_number: number;
  created_at: string;
  created_by: string;
}

interface ContentVersion {
  id: string;
  version_number: number;
  title: string;
  description: string;
  changes_summary: string;
  created_at: string;
}

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContent: ContentItem | null;
  versions: ContentVersion[];
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  selectedContent,
  versions
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            {selectedContent?.title} - Version tracking
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {versions.map((version) => (
            <Card key={version.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Version {version.version_number}</h4>
                    <p className="text-sm text-muted-foreground">{version.title}</p>
                    <p className="text-sm mt-1">{version.description}</p>
                    {version.changes_summary && (
                      <p className="text-sm text-blue-600 mt-1">
                        Changes: {version.changes_summary}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(version.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionHistoryModal;
