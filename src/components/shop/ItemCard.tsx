import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Check, Palette, Award, Tag, Zap, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ShopItem, EquipSlot } from '../../lib/types';

interface ItemCardProps {
  item: ShopItem;
  owned: boolean;
  equipped: boolean;
  gold: number;
  onPurchase: (itemId: string) => Promise<void>;
  onEquip: (itemId: string) => Promise<void>;
  onUnequip: (slot: EquipSlot) => Promise<void>;
}

const typeIcons: Record<string, typeof Palette> = {
  theme: Palette,
  badge: Award,
  cosmetic: Tag,
};

const typeLabels: Record<string, string> = {
  theme: 'Theme',
  badge: 'Badge',
  cosmetic: 'Cosmetic',
};

/** Maps item_type → equip slot name used by the unequip RPC */
const slotForType: Record<string, EquipSlot> = {
  theme: 'theme',
  badge: 'badge',
  cosmetic: 'title',
};

export function ItemCard({ item, owned, equipped, gold, onPurchase, onEquip, onUnequip }: ItemCardProps) {
  const [purchasing, setPurchasing] = useState(false);
  const [equipping, setEquipping] = useState(false);
  const canAfford = gold >= item.cost;
  const TypeIcon = typeIcons[item.item_type] || Tag;

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await onPurchase(item.id);
    } finally {
      setPurchasing(false);
    }
  };

  const handleEquip = async () => {
    setEquipping(true);
    try {
      await onEquip(item.id);
    } finally {
      setEquipping(false);
    }
  };

  const handleUnequip = async () => {
    setEquipping(true);
    try {
      await onUnequip(slotForType[item.item_type]);
    } finally {
      setEquipping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={
        `card-texture relative rounded-lg border p-5 flex flex-col ` +
        `${equipped
          ? 'bg-void/30 border-gold/50 shadow-gold-sm'
          : owned
            ? 'bg-void/30 border-gold-dim/20'
            : 'bg-void-light/50 border-violet/25 shadow-inner-glow'
        }`
      }
    >
      {/* Type badge + Equipped state */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body font-semibold uppercase tracking-wider text-violet-muted bg-violet-deep/40 border border-violet/20">
          <TypeIcon className="h-3 w-3" strokeWidth={1.5} />
          {typeLabels[item.item_type] || item.item_type}
        </span>
        {equipped && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body font-semibold uppercase tracking-wider text-abyss bg-gold border border-gold/60">
            <Check className="h-3 w-3" strokeWidth={2} />
            Equipped
          </span>
        )}
        {owned && !equipped && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body font-semibold uppercase tracking-wider text-gold bg-gold/10 border border-gold/20">
            <Check className="h-3 w-3" strokeWidth={2} />
            Owned
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="font-display text-base text-parchment tracking-wide mb-1">
        {item.name}
      </h3>

      {/* Description */}
      {item.description && (
        <p className="text-xs font-body text-bone/50 leading-relaxed mb-4 flex-1">
          {item.description}
        </p>
      )}

      {/* Cost + Action */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-violet/10">
        <div className="flex items-center gap-1.5">
          <Coins className="h-4 w-4 text-gold" strokeWidth={1.5} />
          <span className="font-display text-sm text-gold">{item.cost}</span>
          <span className="text-[10px] font-body text-bone/30 uppercase tracking-wider">gold</span>
        </div>

        {equipped ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleUnequip}
            loading={equipping}
          >
            <X className="h-3 w-3" strokeWidth={1.5} />
            Unequip
          </Button>
        ) : owned ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleEquip}
            loading={equipping}
          >
            <Zap className="h-3 w-3" strokeWidth={1.5} />
            Equip
          </Button>
        ) : (
          <Button
            size="sm"
            variant={canAfford ? 'primary' : 'secondary'}
            disabled={!canAfford}
            loading={purchasing}
            onClick={handlePurchase}
          >
            {canAfford ? 'Acquire' : 'Insufficient Gold'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
