import React from 'react';
import { cn } from '../../lib/utils';

export const TooltipProvider = ({ children }) => {
  return <>{children}</>;
};

export const Tooltip = ({ children }) => {
  return <div className="tooltip">{children}</div>;
};
