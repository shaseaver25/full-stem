import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusChipProps {
  status: 'assigned' | 'draft' | 'submitted' | 'graded' | 'returned' | 'not_released' | 'open' | 'closed';
  size?: 'sm' | 'md';
}

export const StatusChip = ({ status, size = 'md' }: StatusChipProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'assigned':
        return { 
          label: 'Assigned', 
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
        };
      case 'draft':
        return { 
          label: 'Draft', 
          className: 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
        };
      case 'submitted':
        return { 
          label: 'Submitted', 
          className: 'bg-green-100 text-green-800 hover:bg-green-200' 
        };
      case 'graded':
        return { 
          label: 'Graded', 
          className: 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
        };
      case 'returned':
        return { 
          label: 'Returned', 
          className: 'bg-orange-100 text-orange-800 hover:bg-orange-200' 
        };
      case 'not_released':
        return { 
          label: 'Not Released', 
          className: 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
        };
      case 'open':
        return { 
          label: 'Open', 
          className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
        };
      case 'closed':
        return { 
          label: 'Closed', 
          className: 'bg-red-100 text-red-800 hover:bg-red-200' 
        };
      default:
        return { 
          label: status, 
          className: 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
        };
    }
  };

  const { label, className } = getStatusConfig(status);

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        className,
        size === 'sm' && 'text-xs px-2 py-0.5'
      )}
    >
      {label}
    </Badge>
  );
};