export type Attribute = 'intellect' | 'strength' | 'discipline' | 'charisma';

export type EquipSlot = 'theme' | 'badge' | 'title';

export interface Profile {
  id: string;
  username: string;
  level: number;
  current_xp: number;
  gold: number;
  equipped_theme: string;
  equipped_badge: string | null;
  equipped_title: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  attribute: Attribute;
  xp_value: number;
  gold_value: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface AttributeRow {
  user_id: string;
  attribute: Attribute;
  value: number;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export interface ShopItem {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  cost: number;
  item_type: 'theme' | 'badge' | 'cosmetic';
}

export interface InventoryEntry {
  user_id: string;
  item_id: string;
  purchased_at: string;
}

export interface CompleteTaskResponse {
  profile: Profile;
  leveled_up: boolean;
}

export type ViewState = 'dashboard' | 'shop';
