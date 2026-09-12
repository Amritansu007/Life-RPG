import { motion } from 'framer-motion';
import { xpForLevel } from '../../lib/constants';

interface XPBarProps {
  currentXp: number;
  level: number;
  /** Whether to animate the fill (e.g., after a quest completion) */
  animate?: boolean;
}

export function XPBar({ currentXp, level, animate = true }: XPBarProps) {
  const xpNeeded = xpForLevel(level);
  const pct = Math.min((currentXp / xpNeeded) * 100, 100);

  return (
    <div className="space-y-1.5" role="progressbar" aria-valuenow={currentXp} aria-valuemin={0} aria-valuemax={xpNeeded} aria-label={`Experience: ${currentXp} of ${xpNeeded} XP`}>
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-body font-semibold text-bone/60 uppercase tracking-wider">
          Experience
        </span>
        <span className="text-xs font-body text-bone/50">
          <span className="text-gold font-semibold">{currentXp}</span>
          <span className="text-bone/30"> / {xpNeeded}</span>
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-void overflow-hidden border border-violet/20">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #b8962e 0%, #d4af37 50%, #f0d060 100%)',
          }}
          initial={animate ? { width: '0%' } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={
            animate
              ? { type: 'spring', stiffness: 80, damping: 18, delay: 0.2 }
              : { duration: 0 }
          }
        />
        {/* Subtle shine overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
          }}
        />
      </div>
    </div>
  );
}
