import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useClasses } from '@/hooks/useClassManagement';
import Header from '@/components/Header';
import { ClassesGrid } from '@/components/teacher/ClassesGrid';

export default function TeacherClasses() {
  const navigate = useNavigate();
  const { data: classes = [], isLoading } = useClasses();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Classes</h1>
            <p className="text-muted-foreground">
              Manage your classes and assignments
            </p>
          </div>
          <Button onClick={() => navigate('/teacher/build-class')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        </div>

        {/* Classes Grid with all features */}
        <ClassesGrid 
          classes={classes} 
          loading={isLoading}
          showSearch={true}
          showStats={true}
          showCreateButton={true}
        />
      </div>
    </div>
  );
}