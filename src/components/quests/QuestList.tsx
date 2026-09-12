import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Scroll, ChevronDown } from 'lucide-react';
import { QuestCard } from './QuestCard';
import { QuestForm } from './QuestForm';
import { QuestCardSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';
import type { Task, Attribute } from '../../lib/types';

interface QuestListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onComplete: (id: string) => void;
  onCreate: (title: string, attribute: Attribute, xpValue: number, goldValue: number) => Promise<void>;
  onDelete: (id: string) => void;
  completingIds: Set<string>;
}

export function QuestList({
  tasks,
  loading,
  error,
  onComplete,
  onCreate,
  onDelete,
  completingIds,
}: QuestListProps) {
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);

  if (loading) {
    return (
      <section className="flex-1 space-y-3" aria-label="Loading quests">
        {[1, 2, 3].map(i => (
          <QuestCardSkeleton key={i} />
        ))}
      </section>
    );
  }

  return (
    <section className="flex-1 min-w-0" aria-label="Quest log">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg text-parchment tracking-wide">
            Quest Log
          </h2>
          <p className="text-xs font-body text-bone/40 mt-0.5">
            {activeTasks.length === 0
              ? 'Your scroll awaits new inscriptions'
              : `${activeTasks.length} quest${activeTasks.length !== 1 ? 's' : ''} active`
            }
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          New Quest
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-crimson/30 bg-crimson/5 p-4 mb-4" role="alert">
          <p className="text-sm text-crimson font-body">{error}</p>
        </div>
      )}

      {/* Active quests */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {activeTasks.map(task => (
            <QuestCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
              completing={completingIds.has(task.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {activeTasks.length === 0 && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center py-16"
        >
          <Scroll className="h-12 w-12 text-violet-muted/40 mx-auto mb-4" strokeWidth={1} />
          <p className="font-display text-base text-bone/40 tracking-wide">
            No quests inscribed
          </p>
          <p className="font-body text-xs text-bone/25 mt-1">
            Begin your journey — inscribe your first quest above
          </p>
        </motion.div>
      )}

      {/* Completed quests */}
      {completedTasks.length > 0 && (
        <div className="mt-6 border-t border-violet/15 pt-4">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs font-body text-bone/40 hover:text-bone/60 transition-colors w-full"
            aria-expanded={showCompleted}
          >
            <motion.div
              animate={{ rotate: showCompleted ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
            </motion.div>
            <span className="uppercase tracking-wider font-semibold">
              Conquered ({completedTasks.length})
            </span>
          </button>

          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 pt-3">
                  {completedTasks.map(task => (
                    <QuestCard
                      key={task.id}
                      task={task}
                      onComplete={onComplete}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Quest creation form modal */}
      <QuestForm open={showForm} onClose={() => setShowForm(false)} onCreate={onCreate} />
    </section>
  );
}
