import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Profile, AttributeRow, Streak } from '../lib/types';

interface ProfileData {
  profile: Profile | null;
  attributes: AttributeRow[];
  streak: Streak | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfile(userId: string | undefined): ProfileData {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attributes, setAttributes] = useState<AttributeRow[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);

      const [profileRes, attrsRes, streakRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('attributes').select('*').eq('user_id', userId),
        supabase.from('streaks').select('*').eq('user_id', userId).single(),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (attrsRes.error) throw attrsRes.error;
      // Streak might not exist yet — that's ok
      if (streakRes.error && streakRes.error.code !== 'PGRST116') {
        throw streakRes.error;
      }

      setProfile(profileRes.data as Profile);
      setAttributes(attrsRes.data as AttributeRow[]);
      setStreak((streakRes.data as Streak) ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve your character data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Real-time subscription for profile changes (level-ups, gold changes)
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`profile-changes-${userId}-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  return { profile, attributes, streak, loading, error, refetch: fetchAll };
}
