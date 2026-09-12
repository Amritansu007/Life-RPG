import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[10000] bg-crimson-deep border-b border-crimson text-white px-4 py-2 text-xs font-body font-medium flex items-center justify-center gap-2 shadow-lg"
          role="alert"
          aria-live="assertive"
        >
          <WifiOff className="h-4 w-4" strokeWidth={2} />
          <span>Connection lost to the realm. Changes will sync once reconnected.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
