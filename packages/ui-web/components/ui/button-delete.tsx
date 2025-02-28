import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, Trash } from 'lucide-react';

interface ButtonDeleteProps {
  onDelete?: (arg0?: any) => void;
  className?: string;
}

export const ButtonDelete: React.FC<ButtonDeleteProps> = ({ onDelete, className = '' }) => {
  const [deleteState, setDeleteState] = React.useState<'normal' | 'confirm'>('normal');
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleDelete = (e) => {
    if (deleteState === 'normal') {
      setDeleteState('confirm');
      timeoutRef.current = setTimeout(() => {
        setDeleteState('normal');
      }, 3000);

    } else {
      if (onDelete) {
        onDelete(e);
      }
      setDeleteState('normal');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  return (
    <button
      className={cn(`p-1 hover:bg-gray-100 rounded-full ${deleteState === 'confirm' ? 'bg-red-100' : ''}`, className)}
      aria-label="Delete"
      title={deleteState === 'normal' ? "Delete" : "Confirm delete"}
      onClick={handleDelete}
    >
      <span className={`h-3.5 w-3.5 ${deleteState === 'confirm' ? 'text-red-500' : 'text-gray-500'}`}>
        {deleteState === 'normal' ? (
          <Trash className="h-3.5 w-3.5" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
}