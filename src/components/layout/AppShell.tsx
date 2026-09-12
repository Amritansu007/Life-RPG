import { type ReactNode, type Dispatch, type SetStateAction, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sword, LogOut, ShoppingBag, ScrollText } from 'lucide-react';
import type { ViewState } from '../../lib/types';

interface AppShellProps {
  children: ReactNode;
  username: string;
  currentView: ViewState;
  equippedTheme?: string;
  onViewChange: Dispatch<SetStateAction<ViewState>>;
  onSignOut: () => void;
}

export function AppShell({ children, username, currentView, equippedTheme, onViewChange, onSignOut }: AppShellProps) {
  // Only set data-theme when it's not the default — :root values apply otherwise
  const themeAttr = equippedTheme && equippedTheme !== 'default' ? equippedTheme : undefined;
  const mainRef = useRef<HTMLElement>(null);

  const handleSkipToContent = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    mainRef.current?.focus();
    window.history.pushState(null, '', '#main-content');
  };

  return (
    <div className="min-h-screen flex flex-col" data-theme={themeAttr}>
      {/* Skip to content — lives here so it has access to the main ref */}
      <a
        href="#main-content"
        onClick={handleSkipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-gold focus:text-abyss focus:px-4 focus:py-2 focus:rounded focus:font-body focus:font-semibold focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-abyss/80 backdrop-blur-md border-b border-violet/15" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mr-auto">
            <Sword className="h-5 w-5 text-gold" strokeWidth={1.5} />
            <span className="font-display text-sm text-gold tracking-wider hidden sm:inline">
              Life RPG
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <NavButton
              active={currentView === 'dashboard'}
              onClick={() => onViewChange('dashboard')}
              icon={<ScrollText className="h-4 w-4" strokeWidth={1.5} />}
              label="Quests"
            />
            <NavButton
              active={currentView === 'shop'}
              onClick={() => onViewChange('shop')}
              icon={<ShoppingBag className="h-4 w-4" strokeWidth={1.5} />}
              label="Emporium"
            />
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-violet/15">
            <span className="text-xs font-body text-bone/40 hidden sm:inline truncate max-w-[100px]">
              {username}
            </span>
            <button
              onClick={onSignOut}
              className="p-1.5 rounded text-bone/40 hover:text-crimson hover:bg-crimson/10 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Content — tabIndex={-1} makes it programmatically focusable for skip link */}
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 outline-none focus:ring-2 focus:ring-gold/40 focus-visible:ring-2 focus-visible:ring-gold/40 focus:ring-offset-2 focus-visible:ring-offset-2 focus:ring-offset-abyss focus-visible:ring-offset-abyss rounded-sm"
      >
        {children}
      </main>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={
        `relative flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-3 sm:px-3 py-1 sm:py-1.5 rounded font-body font-medium ` +
        `transition-colors duration-150 ` +
        `${active
          ? 'text-gold'
          : 'text-bone/50 hover:text-parchment hover:bg-violet-deep/30'
        }`
      }
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      <span className="text-[9px] sm:text-xs leading-tight">{label}</span>
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-[9px] left-2 right-2 h-[2px] bg-gold rounded-full"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
