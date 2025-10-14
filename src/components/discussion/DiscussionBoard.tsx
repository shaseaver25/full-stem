import { useState } from 'react';
import { useDiscussionThreads } from '@/hooks/useDiscussionThreads';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, MessageSquare } from 'lucide-react';
import { ThreadCard } from './ThreadCard';
import { CreateThreadModal } from './CreateThreadModal';
import { Skeleton } from '@/components/ui/skeleton';

interface DiscussionBoardProps {
  classId?: string;
  lessonId?: string;
  assignmentId?: string;
  isTeacher?: boolean;
}

export const DiscussionBoard = ({
  classId,
  lessonId,
  assignmentId,
  isTeacher = false
}: DiscussionBoardProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { threads, loading, createThread, togglePin, toggleLock, deleteThread } = useDiscussionThreads(
    classId,
    lessonId,
    assignmentId
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Discussion</h2>
            <p className="text-sm text-muted-foreground">
              {threads.length} {threads.length === 1 ? 'thread' : 'threads'}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Thread
        </Button>
      </div>

      {/* Threads List */}
      {threads.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
          <p className="text-muted-foreground mb-4">
            Start a conversation with your class
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Thread
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {threads.map(thread => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              isTeacher={isTeacher}
              onTogglePin={() => togglePin(thread.id, thread.is_pinned)}
              onToggleLock={() => toggleLock(thread.id, thread.is_locked)}
              onDelete={() => deleteThread(thread.id)}
            />
          ))}
        </div>
      )}

      {/* Create Thread Modal */}
      <CreateThreadModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          await createThread({
            ...data,
            class_id: classId,
            lesson_id: lessonId,
            assignment_id: assignmentId
          });
          setShowCreateModal(false);
        }}
      />
    </div>
  );
};