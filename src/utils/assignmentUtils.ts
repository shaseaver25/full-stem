import type { AssignmentStatus, AssignmentStatusInfo, ClassAssignment } from '@/types/assignmentTypes';

export const getAssignmentStatus = (assignment: ClassAssignment): AssignmentStatusInfo => {
  const now = new Date();
  const releaseAt = assignment.release_at ? new Date(assignment.release_at) : null;
  const dueAt = assignment.due_at ? new Date(assignment.due_at) : null;

  if (releaseAt && now < releaseAt) {
    return {
      status: 'not_released',
      label: 'Not Released',
      color: 'bg-gray-100 text-gray-800'
    };
  }

  if (dueAt && now > dueAt) {
    return {
      status: 'closed',
      label: 'Closed',
      color: 'bg-red-100 text-red-800'
    };
  }

  if (releaseAt && dueAt && now >= releaseAt && now <= dueAt) {
    return {
      status: 'open',
      label: 'Open',
      color: 'bg-green-100 text-green-800'
    };
  }

  // Default to open if no specific timing constraints
  return {
    status: 'open',
    label: 'Open',
    color: 'bg-green-100 text-green-800'
  };
};

export const formatDueDate = (dueAt: string | null | undefined): string => {
  if (!dueAt) return 'No due date';
  
  const date = new Date(dueAt);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Due today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Due tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays > 1 && diffDays <= 7) {
    return `Due in ${diffDays} days`;
  } else if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} days`;
  } else {
    return `Due ${date.toLocaleDateString()}`;
  }
};

export const getSubmissionStats = (assignment: any): { submitted: number; total: number } => {
  if (!assignment.submissions || !Array.isArray(assignment.submissions)) {
    return { submitted: 0, total: 0 };
  }

  const total = assignment.submissions.length;
  const submitted = assignment.submissions.filter(
    (sub: any) => sub.status === 'submitted' || sub.status === 'graded'
  ).length;

  return { submitted, total };
};

export const groupComponentsByType = (components: any[]) => {
  return components.reduce((groups, component) => {
    const type = component.type || 'other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(component);
    return groups;
  }, {} as Record<string, any[]>);
};

export const getComponentTypeLabel = (type: string): string => {
  switch (type) {
    case 'activity':
      return 'Activities';
    case 'resource':
      return 'Resources';
    case 'quiz':
      return 'Quizzes';
    case 'formative_check':
      return 'Formative Checks';
    case 'homework':
      return 'Homework';
    default:
      return 'Other';
  }
};

export const validateComponentSelection = (selectedIds: string[], allComponents: any[]): boolean => {
  if (selectedIds.length === 0) return false;
  
  // Check if all required components are selected
  const requiredComponents = allComponents.filter(c => c.is_required);
  const selectedRequiredIds = requiredComponents
    .filter(c => selectedIds.includes(c.id))
    .map(c => c.id);
  
  return selectedRequiredIds.length === requiredComponents.length;
};