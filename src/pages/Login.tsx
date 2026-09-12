import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';

interface LoginPageProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, username: string) => Promise<void>;
}

export function LoginPage({ onSignIn, onSignUp }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Atmospheric background radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(76,58,110,0.15) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-deep/60 border border-violet/40 mb-5"
          >
            <Sword className="h-8 w-8 text-gold" strokeWidth={1.5} />
          </motion.div>
          <h1 className="font-display text-3xl text-gold tracking-wider text-shadow-gold">
            Life RPG
          </h1>
          <p className="mt-2 font-body text-sm text-bone/50 tracking-wide">
            Forge your legend through discipline
          </p>
        </div>

        {/* Form card */}
        <div className="card-texture rounded-lg bg-void-light/60 border border-violet/25 shadow-inner-glow p-6">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <h2 className="font-display text-base text-parchment tracking-wide mb-5">
                  Return, Adventurer
                </h2>
                <LoginForm
                  onSubmit={onSignIn}
                  onSwitchToSignup={() => setMode('signup')}
                />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <h2 className="font-display text-base text-parchment tracking-wide mb-5">
                  Inscribe Your Name
                </h2>
                <SignupForm
                  onSubmit={onSignUp}
                  onSwitchToLogin={() => setMode('login')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-bone/30 font-body">
          Your journey is encrypted and secured by ancient protocols.
        </p>
      </motion.div>
    </div>
  );
}
