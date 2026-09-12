-- =============================================================================
-- Life RPG — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================

-- ── Tables ───────────────────────────────────────────────────────────────────

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null,
  level int not null default 1,
  current_xp int not null default 0,
  gold int not null default 0,
  equipped_theme text default 'default',
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  attribute text not null, -- 'intellect' | 'strength' | 'discipline' | 'charisma'
  xp_value int not null default 10,
  gold_value int not null default 5,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists attributes (
  user_id uuid references auth.users on delete cascade not null,
  attribute text not null,
  value int not null default 0,
  primary key (user_id, attribute)
);

create table if not exists streaks (
  user_id uuid references auth.users on delete cascade primary key,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cost int not null,
  item_type text not null -- 'theme' | 'badge' | 'cosmetic'
);

create table if not exists inventory (
  user_id uuid references auth.users on delete cascade not null,
  item_id uuid references items on delete cascade not null,
  purchased_at timestamptz default now(),
  primary key (user_id, item_id)
);

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table tasks enable row level security;
alter table attributes enable row level security;
alter table streaks enable row level security;
alter table inventory enable row level security;
-- items is a public catalog — no RLS needed, readable by all
-- alter table items enable row level security;

-- Profiles: read-only from client (no update policy for current_xp/level/gold)
create policy "read own profile" on profiles for select using (auth.uid() = id);
-- Allow the trigger function to insert (uses service role internally)
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);

-- Tasks: full CRUD scoped to owner
create policy "read own tasks" on tasks for select using (auth.uid() = user_id);
create policy "insert own tasks" on tasks for insert with check (auth.uid() = user_id);
create policy "update own tasks" on tasks for update using (auth.uid() = user_id);
create policy "delete own tasks" on tasks for delete using (auth.uid() = user_id);

-- Attributes: read-only (written by complete_task RPC)
create policy "read own attributes" on attributes for select using (auth.uid() = user_id);

-- Streaks: read-only (written by complete_task RPC)
create policy "read own streaks" on streaks for select using (auth.uid() = user_id);

-- Inventory: read + insert (for purchases)
create policy "read own inventory" on inventory for select using (auth.uid() = user_id);
create policy "insert own inventory" on inventory for insert with check (auth.uid() = user_id);

-- ── Auto-create profile on signup ────────────────────────────────────────────

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles (id, username)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
    );

  -- Initialize all four attributes
  insert into attributes (user_id, attribute, value) values
    (new.id, 'intellect', 0),
    (new.id, 'strength', 0),
    (new.id, 'discipline', 0),
    (new.id, 'charisma', 0);

  -- Initialize streak
  insert into streaks (user_id, current_streak, longest_streak)
    values (new.id, 0, 0);

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Anti-Cheat RPC: Task Completion ──────────────────────────────────────────
-- Stats (current_xp, level, gold) are NEVER written directly from the client.
-- This security-definer function is the only path to modify those columns,
-- preventing devtools manipulation of XP/gold/level values.

create or replace function complete_task(p_task_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_task tasks%rowtype;
  v_profile profiles%rowtype;
  v_xp_needed int;
  v_leveled_up boolean := false;
  v_streak streaks%rowtype;
begin
  -- Verify task belongs to caller and is not already completed
  select * into v_task from tasks
    where id = p_task_id and user_id = auth.uid() and completed = false;
  if not found then
    raise exception 'Quest not found or already conquered';
  end if;

  -- Mark task as completed
  update tasks set completed = true, completed_at = now() where id = p_task_id;

  -- Award XP and gold
  update profiles
    set current_xp = current_xp + v_task.xp_value,
        gold = gold + v_task.gold_value
    where id = auth.uid()
    returning * into v_profile;

  -- Check for level-up(s) using non-linear curve: 100 * level^1.5
  v_xp_needed := floor(100 * power(v_profile.level, 1.5));
  while v_profile.current_xp >= v_xp_needed loop
    update profiles
      set level = level + 1,
          current_xp = current_xp - v_xp_needed
      where id = auth.uid()
      returning * into v_profile;
    v_leveled_up := true;
    v_xp_needed := floor(100 * power(v_profile.level, 1.5));
  end loop;

  -- Update attribute score
  insert into attributes (user_id, attribute, value)
    values (auth.uid(), v_task.attribute, v_task.xp_value)
    on conflict (user_id, attribute)
    do update set value = attributes.value + v_task.xp_value;

  -- Update daily streak
  select * into v_streak from streaks where user_id = auth.uid();

  if v_streak.last_active_date is null then
    -- First ever task completion
    update streaks
      set current_streak = 1, longest_streak = 1, last_active_date = current_date
      where user_id = auth.uid();
  elsif v_streak.last_active_date = current_date - interval '1 day' then
    -- Consecutive day — extend streak
    update streaks
      set current_streak = current_streak + 1,
          longest_streak = greatest(longest_streak, current_streak + 1),
          last_active_date = current_date
      where user_id = auth.uid();
  elsif v_streak.last_active_date < current_date - interval '1 day' then
    -- Streak broken — reset
    update streaks
      set current_streak = 1,
          longest_streak = greatest(longest_streak, 1),
          last_active_date = current_date
      where user_id = auth.uid();
  end if;
  -- If last_active_date = current_date, no streak change needed (already active today)

  return json_build_object('profile', row_to_json(v_profile), 'leveled_up', v_leveled_up);
end;
$$;

-- ── Purchase Item RPC ────────────────────────────────────────────────────────
-- Gold deduction also goes through a server function to prevent client tampering.

create or replace function purchase_item(p_item_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_item items%rowtype;
  v_profile profiles%rowtype;
  v_already_owned boolean;
begin
  -- Check item exists
  select * into v_item from items where id = p_item_id;
  if not found then
    raise exception 'Artifact not found in the Emporium';
  end if;

  -- Check not already owned
  select exists(
    select 1 from inventory where user_id = auth.uid() and item_id = p_item_id
  ) into v_already_owned;
  if v_already_owned then
    raise exception 'You already possess this artifact';
  end if;

  -- Check sufficient gold
  select * into v_profile from profiles where id = auth.uid();
  if v_profile.gold < v_item.cost then
    raise exception 'Insufficient gold to acquire this artifact';
  end if;

  -- Deduct gold
  update profiles set gold = gold - v_item.cost where id = auth.uid()
    returning * into v_profile;

  -- Add to inventory
  insert into inventory (user_id, item_id) values (auth.uid(), p_item_id);

  return json_build_object('profile', row_to_json(v_profile), 'item', row_to_json(v_item));
end;
$$;

-- ── Seed Shop Items ──────────────────────────────────────────────────────────

insert into items (name, description, cost, item_type) values
  ('Obsidian Veil', 'A darker theme forged in the abyss. Deeper shadows, sharper contrasts.', 150, 'theme'),
  ('Crimson Ember', 'A fiery theme that burns with ambition. Red accents replace gold.', 200, 'theme'),
  ('Seal of the Devoted', 'A badge proving your unwavering commitment to the grind.', 100, 'badge'),
  ('Title: Ascendant', 'Bestowed upon those who rise above. A cosmetic title of honor.', 75, 'cosmetic');

-- =============================================================================
-- Equip System Migration
-- =============================================================================

-- ── Stable slug identifiers for items ────────────────────────────────────────

alter table items add column if not exists slug text;
update items set slug = 'obsidian-veil' where name = 'Obsidian Veil';
update items set slug = 'crimson-ember' where name = 'Crimson Ember';
update items set slug = 'seal-of-the-devoted' where name = 'Seal of the Devoted';
update items set slug = 'title-ascendant' where name = 'Title: Ascendant';

-- ── Equip slots on profiles ──────────────────────────────────────────────────

alter table profiles add column if not exists equipped_badge text;
alter table profiles add column if not exists equipped_title text;
-- equipped_theme text default 'default' already exists on profiles

-- ── Equip Item RPC ───────────────────────────────────────────────────────────
-- Follows the same security-definer pattern as complete_task / purchase_item.
-- Ownership is verified server-side; the client never writes equip columns directly.

create or replace function equip_item(p_item_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item items%rowtype;
  v_owned boolean;
  v_profile profiles%rowtype;
begin
  select * into v_item from items where id = p_item_id;
  if not found then
    raise exception 'Item not found in the Emporium';
  end if;

  select exists(
    select 1 from inventory where user_id = auth.uid() and item_id = p_item_id
  ) into v_owned;
  if not v_owned then
    raise exception 'You do not own this item';
  end if;

  if v_item.item_type = 'theme' then
    update profiles set equipped_theme = v_item.slug where id = auth.uid() returning * into v_profile;
  elsif v_item.item_type = 'badge' then
    update profiles set equipped_badge = v_item.slug where id = auth.uid() returning * into v_profile;
  elsif v_item.item_type = 'cosmetic' then
    update profiles set equipped_title = v_item.slug where id = auth.uid() returning * into v_profile;
  end if;

  return json_build_object('profile', row_to_json(v_profile));
end;
$$;

-- ── Unequip Item RPC ─────────────────────────────────────────────────────────

create or replace function unequip_item(p_slot text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile profiles%rowtype;
begin
  if p_slot = 'theme' then
    update profiles set equipped_theme = 'default' where id = auth.uid() returning * into v_profile;
  elsif p_slot = 'badge' then
    update profiles set equipped_badge = null where id = auth.uid() returning * into v_profile;
  elsif p_slot = 'title' then
    update profiles set equipped_title = null where id = auth.uid() returning * into v_profile;
  else
    raise exception 'Invalid equip slot';
  end if;
  return json_build_object('profile', row_to_json(v_profile));
end;
$$;
