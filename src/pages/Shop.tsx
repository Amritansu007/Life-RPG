import { useState } from 'react';
import {
  ShoppingBag,
  Coins,
  RefreshCw,
  Package,
} from 'lucide-react';
import { useShop } from '../hooks/useShop';
import { useProfile } from '../hooks/useProfile';
import { ItemCard } from '../components/shop/ItemCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import type { EquipSlot } from '../lib/types';

interface ShopProps {
  userId: string;
}

export function ShopPage({ userId }: ShopProps) {
  const {
    items,
    inventory,
    loading: shopLoading,
    error: shopError,
    purchaseItem,
    equipItem,
    unequipItem,
    refetch,
  } = useShop(userId);

  const {
    profile,
    refetch: refetchProfile,
  } = useProfile(userId);

  const { toast } = useToast();

  const [filter, setFilter] = useState<
    'all' | 'theme' | 'badge' | 'cosmetic'
  >('all');

  const ownedItemIds = new Set(
    inventory.map((inv) => inv.item_id)
  );

  const userGold = profile?.gold ?? 0;

  const filteredItems = items.filter(
    (item) =>
      filter === 'all' || item.item_type === filter
  );

  /**
   * Apply the theme directly to the document body.
   *
   * This makes the theme change immediately without needing
   * App.tsx to re-render and without refreshing the page.
   */
  const applyTheme = (theme: string | null | undefined) => {
    if (theme && theme !== 'default') {
      document.body.setAttribute('data-theme', theme);
    } else {
      document.body.removeAttribute('data-theme');
    }
  };

  /** Check if an item is currently equipped */
  const isEquipped = (item: {
    item_type: string;
    slug: string | null;
  }) => {
    if (!profile || !item.slug) {
      return false;
    }

    if (item.item_type === 'theme') {
      return profile.equipped_theme === item.slug;
    }

    if (item.item_type === 'badge') {
      return profile.equipped_badge === item.slug;
    }

    if (item.item_type === 'cosmetic') {
      return profile.equipped_title === item.slug;
    }

    return false;
  };

  const handlePurchase = async (itemId: string) => {
    const item = items.find(
      (i) => i.id === itemId
    );

    try {
      await purchaseItem(itemId);

      // Keep the current Shop profile up to date.
      await refetchProfile();

      toast(
        `Acquired "${item?.name || 'Artifact'}"! It has been added to your collection.`,
        'success'
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'The merchant refused your transaction.';

      toast(msg, 'error');
    }
  };

  const handleEquip = async (itemId: string) => {
    const item = items.find(
      (i) => i.id === itemId
    );

    try {
      /*
       * equipItem() returns the UPDATED profile from Supabase.
       */
      const updatedProfile = await equipItem(itemId);

      /*
       * Apply the theme immediately.
       *
       * No refresh.
       * No navigation.
       * No App.tsx state update required.
       */
      if (item?.item_type === 'theme') {
        applyTheme(updatedProfile.equipped_theme);
      }

      /*
       * Refresh the Shop's profile so the ItemCard
       * immediately changes from "Equip" to "Unequip".
       */
      await refetchProfile();

      toast(
        `Equipped "${item?.name || 'Artifact'}"! Its power is now yours.`,
        'success'
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to equip this artifact.';

      toast(msg, 'error');
    }
  };

  const handleUnequip = async (slot: EquipSlot) => {
    try {
      /*
       * unequipItem() returns the UPDATED profile from Supabase.
       */
      const updatedProfile = await unequipItem(slot);

      /*
       * If the theme slot was unequipped, immediately
       * remove the theme from the body.
       */
      if (slot === 'theme') {
        applyTheme(updatedProfile.equipped_theme);
      }

      /*
       * Refresh the Shop profile so the UI updates
       * from "Unequip" back to "Equip".
       */
      await refetchProfile();

      toast(
        'Item unequipped. The slot awaits a new artifact.',
        'info'
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to unequip this artifact.';

      toast(msg, 'error');
    }
  };

  const ownedItems = items.filter(
    (item) => ownedItemIds.has(item.id)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* Header Banner */}
      <div className="card-texture relative overflow-hidden rounded-xl border border-gold/30 bg-void-light/80 p-6 md:p-8 shadow-inner-glow">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag
                className="h-5 w-5 text-gold"
                strokeWidth={1.5}
              />

              <span className="text-xs font-body font-semibold uppercase tracking-widest text-gold/80">
                Merchant's Hall
              </span>
            </div>

            <h1 className="font-display text-2xl md:text-3xl text-parchment tracking-wide">
              The Grand Emporium
            </h1>

            <p className="text-sm font-body text-bone/60 mt-1 max-w-xl">
              Exchange the gold earned from completed quests for exclusive themes, titles, and prestige badges.
            </p>
          </div>

          {/* Gold Counter */}
          <div className="flex items-center gap-3 bg-abyss/80 border border-gold/40 px-5 py-3 rounded-lg shadow-inner">
            <Coins
              className="h-6 w-6 text-gold animate-pulse"
              strokeWidth={1.5}
            />

            <div>
              <div className="text-[10px] font-body uppercase tracking-wider text-bone/40">
                Treasury
              </div>

              <div className="font-display text-xl text-gold font-bold">
                {userGold} Gold
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-violet/20 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(
            ['all', 'theme', 'badge', 'cosmetic'] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-body font-semibold tracking-wider capitalize transition-all ${filter === tab
                ? 'bg-gold text-abyss shadow-md'
                : 'text-bone/60 hover:text-parchment hover:bg-violet-deep/40'
                }`}
            >
              {tab === 'all'
                ? 'All Catalog'
                : `${tab}s`}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          aria-label="Refresh catalog"
        >
          <RefreshCw
            className="h-3.5 w-3.5"
            strokeWidth={1.5}
          />
        </Button>
      </div>

      {/* Error state */}
      {shopError && (
        <div className="card-texture rounded-lg border border-red-500/30 bg-red-950/20 p-6 text-center">
          <p className="text-sm font-body text-red-200 mb-3">
            {shopError}
          </p>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => refetch()}
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Loading state */}
      {shopLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="card-texture rounded-lg border border-violet/20 p-5 space-y-4"
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-12 w-full" />

              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Catalog Grid */}
      {!shopLoading && !shopError && (
        <>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-bone/40 font-body text-sm">
              No items match your selected filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  owned={ownedItemIds.has(item.id)}
                  equipped={isEquipped(item)}
                  gold={userGold}
                  onPurchase={handlePurchase}
                  onEquip={handleEquip}
                  onUnequip={handleUnequip}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Collection Section */}
      {!shopLoading && ownedItems.length > 0 && (
        <div className="pt-8 border-t border-violet/20 space-y-4">
          <div className="flex items-center gap-2">
            <Package
              className="h-5 w-5 text-gold/80"
              strokeWidth={1.5}
            />

            <h2 className="font-display text-lg text-parchment">
              Your Collection
            </h2>

            <span className="text-xs font-body text-bone/40">
              ({ownedItems.length} acquired)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ownedItems.map((item) => (
              <ItemCard
                key={`collection-${item.id}`}
                item={item}
                owned={true}
                equipped={isEquipped(item)}
                gold={userGold}
                onPurchase={handlePurchase}
                onEquip={handleEquip}
                onUnequip={handleUnequip}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}