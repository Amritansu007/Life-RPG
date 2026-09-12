import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ShopItem, InventoryEntry, Profile, EquipSlot } from '../lib/types';

interface ShopData {
  items: ShopItem[];
  inventory: InventoryEntry[];
  loading: boolean;
  error: string | null;
  purchaseItem: (itemId: string) => Promise<Profile>;
  equipItem: (itemId: string) => Promise<Profile>;
  unequipItem: (slot: EquipSlot) => Promise<Profile>;
  refetch: () => Promise<void>;
}

export function useShop(userId: string | undefined): ShopData {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const [itemsRes, invRes] = await Promise.all([
        supabase.from('items').select('*').order('cost', { ascending: true }),
        supabase.from('inventory').select('*').eq('user_id', userId),
      ]);

      if (itemsRes.error) throw itemsRes.error;
      if (invRes.error) throw invRes.error;

      setItems(itemsRes.data as ShopItem[]);
      setInventory(invRes.data as InventoryEntry[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'The Emporium is unreachable.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const purchaseItem = useCallback(
    async (itemId: string): Promise<Profile> => {
      // Gold deduction goes through a server function to prevent client tampering.
      const { data, error: rpcError } = await supabase.rpc('purchase_item', {
        p_item_id: itemId,
      });

      if (rpcError) throw rpcError;

      // Add to local inventory
      setInventory(prev => [
        ...prev,
        { user_id: userId!, item_id: itemId, purchased_at: new Date().toISOString() },
      ]);

      return (data as { profile: Profile; item: ShopItem }).profile;
    },
    [userId]
  );

  const equipItem = useCallback(
    async (itemId: string): Promise<Profile> => {
      const { data, error: rpcError } = await supabase.rpc('equip_item', {
        p_item_id: itemId,
      });

      if (rpcError) throw rpcError;

      return (data as { profile: Profile }).profile;
    },
    []
  );

  const unequipItem = useCallback(
    async (slot: EquipSlot): Promise<Profile> => {
      const { data, error: rpcError } = await supabase.rpc('unequip_item', {
        p_slot: slot,
      });

      if (rpcError) throw rpcError;

      return (data as { profile: Profile }).profile;
    },
    []
  );

  return { items, inventory, loading, error, purchaseItem, equipItem, unequipItem, refetch: fetchAll };
}
