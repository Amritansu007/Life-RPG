import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider, useToast } from './components/ui/Toast';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ShopPage } from './pages/Shop';
import { Skeleton } from './components/ui/Skeleton';
import { AppShell } from './components/layout/AppShell';
import { OfflineBanner } from './components/ui/OfflineBanner';
import type { ViewState } from './lib/types';

function AppContent() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  // Fetch profile at the app level so we can thread equipped_theme to AppShell
  const { profile } = useProfile(user?.id);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast('You have left the realm. Return when you are ready.', 'info');
    } catch {
      toast('The realm refuses to release you. Try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-64 space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <AppShell
      username={user.user_metadata?.username || user.email?.split('@')[0] || 'Adventurer'}
      currentView={currentView}
      equippedTheme={profile?.equipped_theme}
      onViewChange={setCurrentView}
      onSignOut={handleSignOut}
    >
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Dashboard userId={user.id} />
          </motion.div>
        )}
        {currentView === 'shop' && (
          <motion.div
            key="shop"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <ShopPage userId={user.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <OfflineBanner />
      <AppContent />
    </ToastProvider>
  );
}
