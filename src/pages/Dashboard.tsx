import { useState, useCallback } from 'react';
import { CharacterPanel } from '../components/character/CharacterPanel';
import { QuestList } from '../components/quests/QuestList';
import { LevelUpBanner } from '../components/character/LevelUpBanner';
import { useProfile } from '../hooks/useProfile';
import { useTasks } from '../hooks/useTasks';
import { useOptimisticComplete } from '../hooks/useOptimisticComplete';
import { useToast } from '../components/ui/Toast';
import type { Task, CompleteTaskResponse } from '../lib/types';

interface DashboardProps {
  userId: string;
}

export function Dashboard({ userId }: DashboardProps) {
  const { profile, attributes, streak, loading: profileLoading, refetch: refetchProfile } = useProfile(userId);
  const { tasks, setTasks, loading: tasksLoading, error: tasksError, createTask, deleteTask } = useTasks(userId);
  const { toast } = useToast();

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);

  const handleSuccess = useCallback(
    (response: CompleteTaskResponse) => {
      if (response.leveled_up) {
        setLevelUpLevel(response.profile.level);
        setShowLevelUp(true);
      }
      // Refetch profile to get updated stats
      refetchProfile();
      toast('Quest conquered! XP and gold awarded.', 'success');
    },
    [refetchProfile, toast]
  );

  const handleError = useCallback(
    (message: string) => {
      toast(message, 'error');
    },
    [toast]
  );



  const { completeTask, completing } = useOptimisticComplete({
    tasks,
    setTasks,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const handleDelete = useCallback(
    async (taskId: string) => {
      try {
        await deleteTask(taskId);
        toast('Quest banished from your scroll.', 'info');
      } catch {
        toast('Failed to remove the quest. The scroll resists.', 'error');
      }
    },
    [deleteTask, toast]
  );

  const handleCreate = useCallback(
    async (title: string, attribute: string, xpValue: number, goldValue: number) => {
      await createTask(title, attribute as Task['attribute'], xpValue, goldValue);
      toast('New quest inscribed upon your scroll.', 'success');
    },
    [createTask, toast]
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Character sidebar */}
        <CharacterPanel
          profile={profile}
          attributes={attributes}
          streak={streak}
          loading={profileLoading}
        />

        {/* Quest list — main content */}
        <QuestList
          tasks={tasks}
          loading={tasksLoading}
          error={tasksError}
          onComplete={completeTask}
          onCreate={handleCreate}
          onDelete={handleDelete}
          completingIds={completing}
        />
      </div>

      {/* Level-up celebration overlay */}
      <LevelUpBanner
        show={showLevelUp}
        newLevel={levelUpLevel}
        onDismiss={() => setShowLevelUp(false)}
      />
    </>
  );
}
