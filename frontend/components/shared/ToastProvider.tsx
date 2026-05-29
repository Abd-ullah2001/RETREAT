'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastId = 0;
let listeners: ((toast: Toast) => void)[] = [];

export function showToast(type: ToastType, message: string, duration = 3000) {
  const id = `toast-${++toastId}`;
  const toast = { id, type, message, duration };
  listeners.forEach((listener) => listener(toast));
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
  return id;
}

export function removeToast(id: string) {
  listeners.forEach((listener) => listener({ id, type: 'info', message: '', duration: 0 }));
}

export function subscribeToToasts(listener: (toast: Toast) => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-ember-500" />,
    info: <Info className="h-5 w-5 text-ocean-500" />,
  };

  const backgrounds = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-ember-100 border-ember-200',
    info: 'bg-ocean-100 border-ocean-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 100 }}
      className={`glass-card flex items-center gap-3 border px-4 py-3 ${backgrounds[toast.type]}`}
    >
      {icons[toast.type]}
      <p className="text-sm font-medium text-navy-800">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-auto text-slate-400 hover:text-navy-700"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      if (toast.message) {
        setToasts((prev) => [...prev, toast]);
      } else {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }
    });
    return unsubscribe;
  }, []);

  return (
    <>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-3 md:right-6 md:top-20">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
