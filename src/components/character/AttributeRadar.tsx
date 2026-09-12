import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ATTRIBUTE_META, ALL_ATTRIBUTES } from '../../lib/constants';
import type { AttributeRow } from '../../lib/types';

interface AttributeRadarProps {
  attributes: AttributeRow[];
}

export function AttributeRadar({ attributes }: AttributeRadarProps) {
  const attrMap = useMemo(() => {
    const map: Record<string, number> = {};
    attributes.forEach(a => { map[a.attribute] = a.value; });
    return map;
  }, [attributes]);

  const maxVal = useMemo(() => {
    const vals = ALL_ATTRIBUTES.map(a => attrMap[a] ?? 0);
    return Math.max(...vals, 10); // Minimum scale of 10
  }, [attrMap]);

  // SVG radar chart
  const cx = 80;
  const cy = 80;
  const r = 55;
  const levels = 4;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 4 - Math.PI / 2;
    const ratio = value / maxVal;
    return {
      x: cx + r * ratio * Math.cos(angle),
      y: cy + r * ratio * Math.sin(angle),
    };
  };

  const dataPoints = ALL_ATTRIBUTES.map((attr, i) => getPoint(i, attrMap[attr] ?? 0));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-body font-semibold text-bone/60 uppercase tracking-wider">
        Attributes
      </h3>

      <div className="flex justify-center">
        <svg viewBox="0 0 160 160" className="w-full max-w-[200px]" aria-hidden="true">
          {/* Grid rings */}
          {Array.from({ length: levels }).map((_, li) => {
            const ringR = (r * (li + 1)) / levels;
            const ringPoints = ALL_ATTRIBUTES.map((_, i) => {
              const angle = (Math.PI * 2 * i) / 4 - Math.PI / 2;
              return `${cx + ringR * Math.cos(angle)},${cy + ringR * Math.sin(angle)}`;
            }).join(' ');
            return (
              <polygon
                key={li}
                points={ringPoints}
                fill="none"
                stroke="rgba(76,58,110,0.25)"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Axis lines */}
          {ALL_ATTRIBUTES.map((_, i) => {
            const angle = (Math.PI * 2 * i) / 4 - Math.PI / 2;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + r * Math.cos(angle)}
                y2={cy + r * Math.sin(angle)}
                stroke="rgba(76,58,110,0.2)"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Data polygon */}
          <motion.path
            d={dataPath}
            fill="rgba(212,175,55,0.1)"
            stroke="#d4af37"
            strokeWidth="1.5"
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.3 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* Data points */}
          {dataPoints.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#d4af37"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            />
          ))}

          {/* Labels */}
          {ALL_ATTRIBUTES.map((attr, i) => {
            const angle = (Math.PI * 2 * i) / 4 - Math.PI / 2;
            const labelR = r + 16;
            const x = cx + labelR * Math.cos(angle);
            const y = cy + labelR * Math.sin(angle);
            return (
              <text
                key={attr}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-bone/50 font-body"
                fontSize="8"
              >
                {ATTRIBUTE_META[attr].label.slice(0, 3).toUpperCase()}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Attribute list */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {ALL_ATTRIBUTES.map(attr => {
          const meta = ATTRIBUTE_META[attr];
          const Icon = meta.icon;
          const val = attrMap[attr] ?? 0;
          return (
            <div key={attr} className="flex items-center gap-2">
              <Icon className={`h-3.5 w-3.5 ${meta.color}`} strokeWidth={1.5} />
              <span className="text-xs font-body text-bone/70 flex-1">{meta.label}</span>
              <span className="text-xs font-display text-parchment">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
