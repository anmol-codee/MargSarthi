import React from 'react';
import { Badge } from './Badge';

export function PriorityBadge({ priority }: { priority: string }) {
  const getProps = () => {
    switch (priority.toUpperCase()) {
      case 'LOW':
        return { variant: 'default' as const, label: 'Low' };
      case 'MEDIUM':
        return { variant: 'warning' as const, label: 'Medium' };
      case 'HIGH':
        return { variant: 'danger' as const, label: 'High' };
      case 'URGENT':
        return { variant: 'danger' as const, label: 'Urgent' };
      default:
        return { variant: 'default' as const, label: priority };
    }
  };

  const { variant, label } = getProps();

  return <Badge variant={variant}>{label}</Badge>;
}
