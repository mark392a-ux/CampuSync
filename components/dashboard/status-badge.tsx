import { cn, getStatusColor, getLeaveTypeColor, getLeaveTypeLabel } from '@/lib/utils';
import type { LeaveStatus, LeaveType } from '@/types';

interface StatusBadgeProps {
  status: LeaveStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const labels: Record<LeaveStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  const dots: Record<LeaveStatus, string> = {
    pending: 'bg-amber-400',
    approved: 'bg-emerald-500',
    rejected: 'bg-red-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        getStatusColor(status),
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dots[status])} />
      {labels[status]}
    </span>
  );
}

interface LeaveTypeBadgeProps {
  type: LeaveType;
  className?: string;
}

export function LeaveTypeBadge({ type, className }: LeaveTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        getLeaveTypeColor(type),
        className
      )}
    >
      {getLeaveTypeLabel(type)}
    </span>
  );
}
