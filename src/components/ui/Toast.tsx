import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

let toastId = 0;

const icons: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const typeStyles: Record<ToastType, string> = {
  success: 'border-emerald/40 text-emerald',
  error: 'border-crimson/40 text-crimson',
  info: 'border-gold-dim/40 text-gold',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[9998] flex flex-col gap-2 max-w-sm"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={
                  `flex items-start gap-3 rounded-lg bg-void-light/90 backdrop-blur-sm ` +
                  `border px-4 py-3 shadow-inner-glow ${typeStyles[t.type]}`
                }
                role="alert"
              >
                <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-sm font-body text-parchment flex-1">{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-bone/50 hover:text-parchment transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
