import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

const toasts: Toast[] = [];
const listeners: ((toasts: Toast[]) => void)[] = [];

function notify(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substring(7);
  const newToast = { ...toast, id };
  toasts.push(newToast);
  listeners.forEach((listener) => listener([...toasts]));

  // Auto dismiss after 5 seconds
  setTimeout(() => {
    dismiss(id);
  }, 5000);

  return id;
}

function dismiss(id: string) {
  const index = toasts.findIndex((t) => t.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    listeners.forEach((listener) => listener([...toasts]));
  }
}

export function useToast() {
  const [, setToasts] = useState<Toast[]>([]);

  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const toast = useCallback((options: Omit<Toast, 'id'>) => {
    return notify(options);
  }, []);

  return {
    toast,
    dismiss,
    toasts: [...toasts],
  };
}
