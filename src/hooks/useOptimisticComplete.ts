import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Task, CompleteTaskResponse } from '../lib/types';

interface UseOptimisticCompleteOpts {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onSuccess: (response: CompleteTaskResponse) => void;
  onError: (message: string) => void;
}

/**
 * Optimistic task completion hook.
 *
 * Immediately marks the task as completed in local state,
 * then calls the `complete_task` RPC on the server.
 *
 * Why an RPC? Stats (current_xp, level, gold) are NEVER written directly
 * from the client. The `complete_task` function runs as a security-definer
 * in Postgres, which means it executes with elevated privileges. This
 * prevents any client-side manipulation of XP, gold, or level values
 * through devtools or API tampering.
 *
 * If the RPC fails, the local state is rolled back and an error toast is shown.
 */
export function useOptimisticComplete({
  tasks,
  setTasks,
  onSuccess,
  onError,
}: UseOptimisticCompleteOpts) {
  const [completing, setCompleting] = useState<Set<string>>(new Set());

  const completeTask = useCallback(
    async (taskId: string) => {
      // Prevent double-completion
      if (completing.has(taskId)) return;

      // Snapshot for rollback
      const snapshot = [...tasks];

      // Optimistic update — mark as completed locally
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, completed: true, completed_at: new Date().toISOString() }
            : t
        )
      );

      setCompleting(prev => new Set(prev).add(taskId));

      try {
        // Anti-cheat: Stats are modified exclusively through this server-side
        // RPC function. The client cannot directly update profiles.current_xp,
        // profiles.level, or profiles.gold — only complete_task can.
        const { data, error } = await supabase.rpc('complete_task', {
          p_task_id: taskId,
        });

        if (error) throw error;

        onSuccess(data as CompleteTaskResponse);
      } catch (err) {
        // Rollback optimistic update
        setTasks(snapshot);
        const message =
          err instanceof Error
            ? err.message
            : 'The realm rejected your conquest. The quest remains uncompleted.';
        onError(message);
      } finally {
        setCompleting(prev => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }
    },
    [tasks, completing, setTasks, onSuccess, onError]
  );

  return { completeTask, completing };
}
