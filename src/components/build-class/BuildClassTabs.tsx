
import React from 'react';
import ClassDetailsForm from '@/components/build-class/ClassDetailsForm';
import { ClassData } from '@/types/buildClassTypes';

interface BuildClassTabsProps {
  classData: ClassData;
  handleClassDataChange: (field: string, value: string | number) => void;
}

const BuildClassTabs: React.FC<BuildClassTabsProps> = ({
  classData,
  handleClassDataChange,
}) => {
  return (
    <div className="space-y-6">
      <ClassDetailsForm 
        classData={classData}
        onClassDataChange={handleClassDataChange}
      />
    </div>
  );
};

export default BuildClassTabs;
