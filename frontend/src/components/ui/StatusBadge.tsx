import React from 'react';
import { Badge } from './Badge';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_STUDENT' | 'RESOLVED' | 'CLOSED';

export function StatusBadge({ status }: { status: TicketStatus | string }) {
  const getProps = () => {
    switch (status) {
      case 'OPEN':
        return { variant: 'info' as const, label: 'Open' };
      case 'IN_PROGRESS':
        return { variant: 'primary' as const, label: 'In Progress' };
      case 'WAITING_FOR_STUDENT':
        return { variant: 'warning' as const, label: 'Waiting for Student' };
      case 'RESOLVED':
        return { variant: 'success' as const, label: 'Resolved' };
      case 'CLOSED':
        return { variant: 'default' as const, label: 'Closed' };
      default:
        return { variant: 'default' as const, label: status };
    }
  };

  const { variant, label } = getProps();

  return <Badge variant={variant}>{label}</Badge>;
}
