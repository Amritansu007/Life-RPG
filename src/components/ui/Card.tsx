import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref' | 'children'> {
  children: ReactNode;
  glow?: boolean;
}

export function Card({ children, glow, className = '', ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={
        `card-texture relative rounded-lg bg-void-light/50 ` +
        `border border-violet/25 shadow-inner-glow ` +
        `${glow ? 'shadow-gold-sm border-gold-dim/30' : ''} ` +
        `${className}`
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}
