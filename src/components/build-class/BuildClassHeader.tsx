
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Save } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

interface BuildClassHeaderProps {
  completionPercentage: number;
  onSave: () => void;
  isSaving: boolean;
}

const BuildClassHeader: React.FC<BuildClassHeaderProps> = ({
  completionPercentage,
  onSave,
  isSaving
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <RouterLink to="/admin/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </RouterLink>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Build New Class</h1>
          <p className="text-gray-600">Create a comprehensive learning experience</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm text-gray-600">Progress</p>
          <Progress value={completionPercentage} className="w-32" />
        </div>
        <Button 
          onClick={onSave} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Class'}
        </Button>
      </div>
    </div>
  );
};

export default BuildClassHeader;
