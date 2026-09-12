import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-gold to-gold-dim text-abyss font-semibold ' +
    'hover:from-gold-bright hover:to-gold border border-gold-dim/50',
  secondary:
    'bg-violet-deep/60 text-parchment border border-violet/40 ' +
    'hover:bg-violet-deep hover:border-violet-muted',
  ghost:
    'bg-transparent text-bone hover:bg-violet-deep/40 hover:text-parchment',
  danger:
    'bg-crimson-dark/60 text-parchment border border-crimson/40 ' +
    'hover:bg-crimson-dark hover:border-crimson',
};

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={
          `inline-flex items-center justify-center gap-2 rounded font-body font-medium ` +
          `transition-colors duration-150 cursor-pointer ` +
          `disabled:opacity-40 disabled:cursor-not-allowed ` +
          `${variantClasses[variant]} ${sizeClasses[size]} ${className}`
        }
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" role="status">
            <span className="sr-only">Loading</span>
          </span>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
