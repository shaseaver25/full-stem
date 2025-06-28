
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface GradebookHeaderProps {
  onExportCSV: () => void;
}

const GradebookHeader = ({ onExportCSV }: GradebookHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Assignment Gradebook</h2>
        <p className="text-gray-600">View and manage assignment grades</p>
      </div>
      <Button onClick={onExportCSV} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
};

export default GradebookHeader;
