import React from 'react';
import { Toast, ToastProvider, ToastViewport } from './toast';
import { useToast } from '../../hooks/use-toast';

// Toaster component for rendering toast notifications
export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <div className="toast-title">{title}</div>}
              {description && (
                <div className="toast-description">{description}</div>
              )}
            </div>
            {action}
          </Toast>
        );
      })}
      {/* ToastViewport renders the toast container */}
      <ToastViewport />
    </ToastProvider>
  );
}
