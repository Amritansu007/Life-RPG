import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Task, Attribute } from '../lib/types';

interface TasksState {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>; // add this
  loading: boolean;
  error: string | null;
  createTask: (title: string, attribute: Attribute, xpValue: number, goldValue: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTasks(userId: string | undefined): TasksState {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTasks(data as Task[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve your quests.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(
    async (title: string, attribute: Attribute, xpValue: number, goldValue: number) => {
      if (!userId) return;

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title: title.trim(),
          attribute,
          xp_value: xpValue,
          gold_value: goldValue,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Prepend new task to top of list
      setTasks(prev => [data as Task, ...prev]);
    },
    [userId]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      // Optimistic removal
      setTasks(prev => prev.filter(t => t.id !== taskId));

      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId!);

      if (deleteError) {
        // Rollback — re-fetch
        await fetchTasks();
        throw deleteError;
      }
    },
    [userId, fetchTasks]
  );

  return { tasks, setTasks, loading, error, createTask, deleteTask, refetch: fetchTasks };
}
