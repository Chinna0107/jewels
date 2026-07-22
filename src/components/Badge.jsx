import React from 'react';
import { cn } from '../utils/cn';

export function Badge({ children, className }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-brand-gold",
      className
    )}>
      {children}
    </span>
  );
}
