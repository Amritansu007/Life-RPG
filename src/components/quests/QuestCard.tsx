import { motion } from 'framer-motion';
import { Check, Trash2, Coins } from 'lucide-react';
import { ATTRIBUTE_META } from '../../lib/constants';
import type { Task, Attribute } from '../../lib/types';

interface QuestCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  completing?: boolean;
}

export function QuestCard({ task, onComplete, onDelete, completing }: QuestCardProps) {
  const meta = ATTRIBUTE_META[task.attribute as Attribute];
  const Icon = meta?.icon;
  const isCompleted = task.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={
        `card-texture relative rounded-lg border p-4 transition-colors duration-200 ` +
        `${isCompleted
          ? 'bg-void/30 border-violet/10 opacity-60'
          : 'bg-void-light/50 border-violet/25 shadow-inner-glow hover:border-violet-muted/40'
        }`
      }
    >
      <div className="flex items-start gap-3">
        {/* Complete button */}
        <button
          onClick={() => !isCompleted && onComplete(task.id)}
          disabled={isCompleted || completing}
          className={
            `mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ` +
            `transition-all duration-200 ` +
            `${isCompleted
              ? 'bg-gold/20 border-gold/40'
              : 'border-violet-muted/50 hover:border-gold hover:bg-gold/10'
            } ` +
            `disabled:cursor-not-allowed`
          }
          aria-label={isCompleted ? `Quest "${task.title}" conquered` : `Complete quest "${task.title}"`}
        >
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Check className="h-3.5 w-3.5 text-gold" strokeWidth={2.5} />
            </motion.div>
          )}
          {completing && !isCompleted && (
            <span className="inline-block h-3 w-3 animate-spin rounded-full border border-gold border-t-transparent" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={
              `font-body text-sm leading-snug ` +
              `${isCompleted ? 'text-bone/40 line-through' : 'text-parchment'}`
            }
          >
            {task.title}
          </p>

          {/* Attribute + XP + Gold badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Attribute badge */}
            {meta && (
              <span
                className={
                  `inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body font-semibold uppercase tracking-wider ` +
                  `border ${meta.bgColor} ${meta.color} ${meta.borderColor}`
                }
              >
                <Icon className="h-3 w-3" strokeWidth={1.5} />
                {meta.label}
              </span>
            )}

            {/* XP badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body font-medium text-gold/80 bg-gold/5 border border-gold/15">
              +{task.xp_value} XP
            </span>

            {/* Gold badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body font-medium text-gold-dim bg-gold/5 border border-gold/15">
              <Coins className="h-2.5 w-2.5" strokeWidth={1.5} />
              {task.gold_value}
            </span>
          </div>
        </div>

        {/* Delete button */}
        {!isCompleted && (
          <button
            onClick={() => onDelete(task.id)}
            className="flex-shrink-0 p-1.5 rounded text-bone/30 hover:text-crimson hover:bg-crimson/10 transition-colors"
            aria-label={`Delete quest "${task.title}"`}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
