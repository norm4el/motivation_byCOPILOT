import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let toastQueue: ToastItem[] = [];
let listeners: ((toasts: ToastItem[]) => void)[] = [];

function notify() {
  listeners.forEach((l) => l([...toastQueue]));
}

export function showToast(message: string, type: ToastType = 'info') {
  const id = `toast_${Date.now()}_${Math.random()}`;
  toastQueue = [...toastQueue, { id, message, type }];
  notify();
  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id);
    notify();
  }, 4000);
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-emerald-500/50 bg-emerald-900/20 text-emerald-300',
  error: 'border-red-500/50 bg-red-900/20 text-red-300',
  info: 'border-violet-500/50 bg-violet-900/20 text-violet-300',
  warning: 'border-amber-500/50 bg-amber-900/20 text-amber-300',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (t: ToastItem[]) => setToasts(t);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm pointer-events-auto',
                'max-w-sm shadow-2xl',
                colors[toast.type]
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                onClick={() => {
                  toastQueue = toastQueue.filter((t) => t.id !== toast.id);
                  notify();
                }}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
