import { useState } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, type = "default", duration = 3000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
    
    return id;
  };

  const dismiss = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toast, dismiss, toasts };
};
