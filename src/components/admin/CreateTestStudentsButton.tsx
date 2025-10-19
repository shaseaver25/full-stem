import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Loader2 } from 'lucide-react';
import { useCreateTestStudents } from '@/hooks/useCreateTestStudents';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CreateTestStudentsButton: React.FC = () => {
  const { mutate: createTestStudents, isPending, data } = useCreateTestStudents();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleCreate = () => {
    createTestStudents(undefined, {
      onSuccess: () => {
        setIsOpen(true);
      }
    });
  };

  return (
    <>
      <Button
        onClick={handleCreate}
        disabled={isPending}
        variant="outline"
        size="lg"
        className="gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Test Students...
          </>
        ) : (
          <>
            <Users className="h-4 w-4" />
            Create Test Students
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>✅ Test Students Created Successfully</DialogTitle>
            <DialogDescription>
              Three test student accounts have been created and enrolled in "Adaptive Engine Test – Fall 2025"
            </DialogDescription>
          </DialogHeader>

          {data && (
            <ScrollArea className="max-h-[500px] pr-4">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Class Information</h3>
                  <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                    <p><strong>Class Name:</strong> {data.className}</p>
                    <p><strong>Class ID:</strong> <code className="text-xs">{data.classId}</code></p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Test Credentials</h3>
                  <div className="space-y-4">
                    {data.credentials.map((student, index) => (
                      <div key={index} className="bg-muted p-4 rounded-md space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{student.name}</h4>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {student.language === 'es' ? '🇪🇸 Spanish' : '🇺🇸 English'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><strong>Email:</strong> <code className="text-xs">{student.email}</code></p>
                          <p><strong>Password:</strong> <code className="text-xs">{student.password}</code></p>
                          <p><strong>Reading Level:</strong> {student.readingLevel.replace('_', ' ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md text-sm">
                  <p className="font-semibold mb-2">🧪 For UX Testers:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Log in with each student account to test adaptive features</li>
                    <li>Verify lessons adjust based on reading level and language</li>
                    <li>Test TTS and translation features</li>
                    <li>Document any UX issues in the QA Test Plan</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};