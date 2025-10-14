import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Library } from 'lucide-react';
import { ClassesGrid } from '@/components/teacher/ClassesGrid';
import { BrowseClassesModal } from '@/components/teacher/BrowseClassesModal';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  enrollment_count: number;
  current_lesson?: string;
  average_grade?: number;
  created_at: string;
  description?: string;
}

interface ClassesListProps {
  classes: ClassItem[];
  loading: boolean;
}

export const ClassesList = ({ classes, loading }: ClassesListProps) => {
  const [showBrowseModal, setShowBrowseModal] = useState(false);

  // Ensure classes have created_at field for ClassesGrid compatibility
  const classesWithDates = classes.map(cls => ({
    ...cls,
    created_at: cls.created_at || new Date().toISOString(),
  }));

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>Manage your active classes</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowBrowseModal(true)}
            >
              <Library className="h-4 w-4 mr-2" />
              Browse Classes
            </Button>
            <Link to="/teacher/build-class">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Class
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ClassesGrid 
            classes={classesWithDates} 
            loading={loading}
            showSearch={false}
            showStats={false}
            showCreateButton={false}
          />
        </CardContent>
      </Card>

      <BrowseClassesModal 
        open={showBrowseModal}
        onOpenChange={setShowBrowseModal}
      />
    </>
  );
};
