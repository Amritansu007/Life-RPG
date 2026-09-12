import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ATTRIBUTE_META, ALL_ATTRIBUTES } from '../../lib/constants';
import type { Attribute } from '../../lib/types';

interface QuestFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, attribute: Attribute, xpValue: number, goldValue: number) => Promise<void>;
}

const XP_OPTIONS = [
  { value: 10, label: '10 XP', desc: 'Minor' },
  { value: 25, label: '25 XP', desc: 'Standard' },
  { value: 50, label: '50 XP', desc: 'Major' },
];

const GOLD_OPTIONS = [
  { value: 5, label: '5g' },
  { value: 10, label: '10g' },
  { value: 25, label: '25g' },
];

export function QuestForm({ open, onClose, onCreate }: QuestFormProps) {
  const [title, setTitle] = useState('');
  const [attribute, setAttribute] = useState<Attribute>('discipline');
  const [xpValue, setXpValue] = useState(10);
  const [goldValue, setGoldValue] = useState(5);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Every quest needs a name. What will you conquer?');
      return;
    }
    if (title.trim().length > 200) {
      setError('Your quest name exceeds the scroll\'s capacity. Keep it under 200 characters.');
      return;
    }

    setLoading(true);
    try {
      await onCreate(title, attribute, xpValue, goldValue);
      // Reset form
      setTitle('');
      setAttribute('discipline');
      setXpValue(10);
      setGoldValue(5);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'The scroll rejected your inscription.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Inscribe a Quest">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Quest Title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Read 30 pages of philosophy"
          autoFocus
        />

        {/* Attribute selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-body font-semibold uppercase tracking-wider text-bone/70">
            Attribute
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_ATTRIBUTES.map(attr => {
              const meta = ATTRIBUTE_META[attr];
              const Icon = meta.icon;
              const isSelected = attribute === attr;
              return (
                <button
                  key={attr}
                  type="button"
                  onClick={() => setAttribute(attr)}
                  className={
                    `flex items-center gap-2 px-3 py-2 rounded border text-left text-xs font-body ` +
                    `transition-all duration-150 ` +
                    `${isSelected
                      ? `${meta.bgColor} ${meta.color} ${meta.borderColor} ring-1 ring-current/20`
                      : 'bg-void/40 border-violet/20 text-bone/50 hover:border-violet-muted/40'
                    }`
                  }
                  aria-pressed={isSelected}
                  aria-label={`Attribute: ${meta.label}`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  <span className="font-medium">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* XP value selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-body font-semibold uppercase tracking-wider text-bone/70">
            Difficulty (XP Reward)
          </label>
          <div className="flex gap-2">
            {XP_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setXpValue(opt.value)}
                className={
                  `flex-1 px-3 py-2 rounded border text-center text-xs font-body ` +
                  `transition-all duration-150 ` +
                  `${xpValue === opt.value
                    ? 'bg-gold/10 border-gold/30 text-gold font-semibold'
                    : 'bg-void/40 border-violet/20 text-bone/50 hover:border-violet-muted/40'
                  }`
                }
                aria-pressed={xpValue === opt.value}
              >
                <span className="block font-medium">{opt.label}</span>
                <span className="block text-[10px] opacity-60">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gold value selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-body font-semibold uppercase tracking-wider text-bone/70">
            Gold Bounty
          </label>
          <div className="flex gap-2">
            {GOLD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGoldValue(opt.value)}
                className={
                  `flex-1 px-3 py-2 rounded border text-center text-xs font-body font-medium ` +
                  `transition-all duration-150 ` +
                  `${goldValue === opt.value
                    ? 'bg-gold/10 border-gold/30 text-gold'
                    : 'bg-void/40 border-violet/20 text-bone/50 hover:border-violet-muted/40'
                  }`
                }
                aria-pressed={goldValue === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-crimson font-body" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Inscribe Quest
          </Button>
        </div>
      </form>
    </Modal>
  );
}
