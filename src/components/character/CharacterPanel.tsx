import { motion } from 'framer-motion';
import { Flame, Coins, Trophy, User, Award, Tag } from 'lucide-react';
import { XPBar } from './XPBar';
import { AttributeRadar } from './AttributeRadar';
import { CharacterPanelSkeleton } from '../ui/Skeleton';
import { EQUIP_DISPLAY } from '../../lib/constants';
import type { Profile, AttributeRow, Streak } from '../../lib/types';

interface CharacterPanelProps {
  profile: Profile | null;
  attributes: AttributeRow[];
  streak: Streak | null;
  loading: boolean;
}

export function CharacterPanel({ profile, attributes, streak, loading }: CharacterPanelProps) {
  if (loading || !profile) {
    return (
      <aside
        className="w-full lg:w-72 xl:w-80 shrink-0"
        aria-label="Character panel loading"
      >
        <div className="card-texture rounded-lg bg-void-light/50 border border-violet/25 shadow-inner-glow">
          <CharacterPanelSkeleton />
        </div>
      </aside>
    );
  }

  const equippedTitle = profile.equipped_title ? EQUIP_DISPLAY[profile.equipped_title] : null;
  const equippedBadge = profile.equipped_badge ? EQUIP_DISPLAY[profile.equipped_badge] : null;

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0" aria-label="Character panel">
      <div className="card-texture rounded-lg bg-void-light/50 border border-violet/25 shadow-inner-glow p-5 space-y-6">

        {/* Avatar + Name + Level */}
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-deep/60 border border-violet/40"
          >
            <User className="h-6 w-6 text-gold/80" strokeWidth={1.5} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-base text-parchment tracking-wide truncate">
              {profile.username}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-body text-bone/50">
                Level{' '}
                <span className="font-display text-gold text-sm">{profile.level}</span>
              </p>
              {/* Equipped Title — displayed as a pill next to level */}
              {equippedTitle && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body font-semibold uppercase tracking-wider text-gold bg-gold/10 border border-gold/20"
                >
                  <Tag className="h-2.5 w-2.5" strokeWidth={1.5} />
                  {equippedTitle.label}
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Equipped Badge — below avatar row */}
        {equippedBadge && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded bg-gold/5 border border-gold/15"
          >
            <Award className="h-4 w-4 text-gold/80" strokeWidth={1.5} />
            <span className="text-xs font-body font-semibold text-gold/80 tracking-wide">
              {equippedBadge.label}
            </span>
          </motion.div>
        )}

        {/* XP Bar */}
        <XPBar currentXp={profile.current_xp} level={profile.level} />

        {/* Gold + Streak row */}
        <div className="flex gap-3">
          {/* Gold */}
          <div className="flex-1 flex items-center gap-2 rounded bg-void/60 border border-violet/15 px-3 py-2">
            <Coins className="h-4 w-4 text-gold" strokeWidth={1.5} />
            <div>
              <p className="text-xs font-body text-bone/50">Gold</p>
              <p className="font-display text-sm text-gold">{profile.gold}</p>
            </div>
          </div>

          {/* Streak */}
          <div className="flex-1 flex items-center gap-2 rounded bg-void/60 border border-violet/15 px-3 py-2">
            <Flame className="h-4 w-4 text-amber-500" strokeWidth={1.5} />
            <div>
              <p className="text-xs font-body text-bone/50">Streak</p>
              <p className="font-display text-sm text-parchment">
                {streak?.current_streak ?? 0}
                <span className="text-bone/30 text-xs font-body ml-1">d</span>
              </p>
            </div>
          </div>
        </div>

        {/* Longest streak */}
        {streak && streak.longest_streak > 0 && (
          <div className="flex items-center gap-2 text-xs font-body text-bone/40">
            <Trophy className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>
              Longest streak:{' '}
              <span className="text-bone/60">{streak.longest_streak} days</span>
            </span>
          </div>
        )}

        {/* Attribute Radar */}
        <div className="border-t border-violet/15 pt-5">
          <AttributeRadar attributes={attributes} />
        </div>
      </div>
    </aside>
  );
}
