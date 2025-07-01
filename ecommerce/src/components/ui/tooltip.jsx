import React from 'react';
import { cn } from '../../lib/utils';

// TooltipProvider for wrapping tooltip context (no-op for simple usage)
export const TooltipProvider = ({ children }) => {
  return <>{children}</>;
};

// Tooltip root component for displaying tooltip content
export const Tooltip = ({ children }) => {
  return <div className="tooltip">{children}</div>;
};
