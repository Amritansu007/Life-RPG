import { Brain, Dumbbell, Shield, Sparkles, type LucideIcon } from 'lucide-react';
import type { Attribute } from './types';

interface AttributeMeta {
  label: string;
  icon: LucideIcon;
  color: string;       // Tailwind text color
  bgColor: string;     // Tailwind bg color for badges
  borderColor: string; // Tailwind border color
}

export const ATTRIBUTE_META: Record<Attribute, AttributeMeta> = {
  intellect: {
    label: 'Intellect',
    icon: Brain,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30',
  },
  strength: {
    label: 'Strength',
    icon: Dumbbell,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/30',
  },
  discipline: {
    label: 'Discipline',
    icon: Shield,
    color: 'text-emerald',
    bgColor: 'bg-emerald/10',
    borderColor: 'border-emerald/30',
  },
  charisma: {
    label: 'Charisma',
    icon: Sparkles,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
  },
};

export const ALL_ATTRIBUTES: Attribute[] = ['intellect', 'strength', 'discipline', 'charisma'];

/**
 * XP required to advance from a given level.
 * Uses the non-linear curve: 100 * level^1.5
 */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Display metadata for equipped items.
 * Maps item slugs → display-friendly labels so the CharacterPanel
 * doesn't need to fetch from the shop catalog.
 */
export const EQUIP_DISPLAY: Record<string, { label: string; emoji: string }> = {
  'seal-of-the-devoted': { label: 'Seal of the Devoted', emoji: '🔰' },
  'title-ascendant': { label: 'Ascendant', emoji: '✦' },
};
