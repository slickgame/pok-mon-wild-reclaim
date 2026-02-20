/**
 * TargetPickerModal — Step 3
 *
 * Shown when a player uses a single-target move and there are multiple active
 * enemy Pokémon to choose from.
 *
 * Props:
 *   move         object   — move data
 *   attackerName string
 *   enemyActive  string[] — active enemy IDs
 *   pokemonMap   { [id]: Pokemon }
 *   hpMap        { [id]: number }
 *   onSelect     (defenderIds: string[]) => void
 *   onCancel     () => void
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Target, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TargetPickerModal({
  move,
  attackerName,
  enemyActive = [],
  pokemonMap = {},
  hpMap = {},
  onSelect,
  onCancel,
}) {
  const aliveEnemies = enemyActive.filter(id => (hpMap[id] ?? 0) > 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-2xl p-5 max-w-sm w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white">Choose Target</h3>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-400 text-sm mb-4">
          <span className="text-white">{attackerName}</span> uses{' '}
          <span className="text-indigo-300">{move?.name}</span>. Select a target:
        </p>

        <div className="space-y-2">
          {aliveEnemies.map(id => {
            const mon = pokemonMap[id];
            if (!mon) return null;
            const hp = hpMap[id] ?? mon.currentHp ?? 0;
            const maxHp = mon.stats?.maxHp || mon.stats?.hp || 100;
            const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
            const hpColor = hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500';

            return (
              <button
                key={id}
                onClick={() => onSelect([id])}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                    {mon.nickname || mon.species}
                  </span>
                  <Badge className="bg-slate-700 text-xs">Lv.{mon.level}</Badge>
                </div>
                {/* HP bar */}
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${hpColor} transition-all`} style={{ width: `${hpPct}%` }} />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{hp} / {maxHp} HP</div>
              </button>
            );
          })}
        </div>

        <Button variant="ghost" onClick={onCancel} className="w-full mt-3 text-slate-400 hover:text-white">
          Cancel
        </Button>
      </motion.div>
    </div>
  );
}