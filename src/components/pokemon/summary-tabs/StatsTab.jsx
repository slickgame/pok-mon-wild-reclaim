import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Star } from 'lucide-react';
import { getPokemonStats } from '../usePokemonStats';
import { getNatureDescription } from '../statCalculations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// XP needed to level up FROM level N = N * 100
// The game stores leftover XP within the current level (post-level-up remainder)
// So pokemon.experience is already the XP within the current level band.
function expNeededForLevel(level) {
  return level * 100;
}

export default function StatsTab({ pokemon, xpGained = 0 }) {
  const fullStats = getPokemonStats(pokemon);
  const stats = fullStats.stats;

  const displayLevel = pokemon.level ?? 1;
  const expInThisLevel = pokemon.experience ?? 0;
  const expNeededThisLevel = expNeededForLevel(displayLevel);
  const expPercent = Math.min((expInThisLevel / expNeededThisLevel) * 100, 100);

  // Detect if level-up should have triggered (XP >= threshold)
  const correctLevel = expInThisLevel >= expNeededThisLevel ? displayLevel + 1 : displayLevel;

  // Animate bar: start from before XP was gained, sweep to current
  const prevPercent = xpGained > 0
    ? Math.max(0, Math.min(((expInThisLevel - xpGained) / expNeededThisLevel) * 100, 100))
    : expPercent;

  const [barWidth, setBarWidth] = useState(prevPercent);
  const didAnimate = useRef(false);

  useEffect(() => {
    if (xpGained > 0 && !didAnimate.current) {
      setBarWidth(prevPercent);
      const t = setTimeout(() => setBarWidth(expPercent), 80);
      didAnimate.current = true;
      return () => clearTimeout(t);
    } else if (xpGained === 0) {
      setBarWidth(expPercent);
    }
  }, [pokemon.experience, xpGained]);

  const natureDesc = getNatureDescription(pokemon.nature);
  const levelMismatch = correctLevel !== pokemon.level;

  return (
    <div className="space-y-4">
      {/* Experience Progress */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-slate-400">Experience</span>
          <div className="flex items-center gap-2">
            {xpGained > 0 && (
              <motion.span
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold text-green-400"
              >
                +{xpGained} XP
              </motion.span>
            )}
            <span className="text-sm font-semibold text-indigo-400">
              {expInThisLevel} / {expNeededThisLevel} XP
            </span>
          </div>
        </div>

        {/* Animated XP bar */}
        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mt-2 mb-1">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000 ease-out"
            style={{ width: `${barWidth}%` }}
          />
          {xpGained > 0 && (
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {Math.max(0, expNeededThisLevel - expInThisLevel)} XP to Level {displayLevel + 1}
          </p>
          {correctLevel > displayLevel && (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <Star className="w-3 h-3" /> Level up pending!
            </span>
          )}
        </div>
      </div>

      {/* Nature */}
      {pokemon.nature && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Nature</h3>
          </div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-purple-500/20 border-purple-500/30 text-purple-300 cursor-help">
                  {pokemon.nature}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs border border-white/10 bg-slate-900/95 p-2 text-xs text-slate-100 shadow-lg">
                <p>{natureDesc || 'Affects stat growth patterns.'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {natureDesc && (
            <p className="text-xs text-slate-400 mt-2">{natureDesc}</p>
          )}
        </div>
      )}

      {/* Stats Breakdown */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Stats Breakdown</h3>
        </div>

        <div className="space-y-3">
          {[
            { key: 'maxHp', label: 'HP', color: 'bg-green-500' },
            { key: 'atk', label: 'Attack', color: 'bg-red-500' },
            { key: 'def', label: 'Defense', color: 'bg-blue-500' },
            { key: 'spAtk', label: 'Sp. Atk', color: 'bg-purple-500' },
            { key: 'spDef', label: 'Sp. Def', color: 'bg-cyan-500' },
            { key: 'spd', label: 'Speed', color: 'bg-yellow-500' }
          ].map(({ key, label, color }) => {
            const value = stats[key];
            const iv = pokemon.ivs?.[key] || 0;
            const ev = pokemon.evs?.[key] || 0;
            
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300">{label}</span>
                  <span className="text-sm font-bold text-white">{value}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} transition-all`}
                      style={{ width: `${Math.min((value / 200) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex gap-1 text-xs">
                    <Badge variant="outline" className="text-xs py-0 px-1 text-slate-300">
                      IV: {iv}
                    </Badge>
                    <Badge variant="outline" className="text-xs py-0 px-1 text-slate-300">
                      EV: {ev}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IV/EV Info */}
      <div className="glass rounded-xl p-4">
        <h4 className="text-xs font-semibold text-white mb-2">About Stats</h4>
        <div className="space-y-1 text-xs text-slate-400">
          <p><strong className="text-slate-300">IV (Individual Values):</strong> Innate stats (0-31). Higher is better.</p>
          <p><strong className="text-slate-300">EV (Effort Values):</strong> Gained from battles. Max 252 per stat, 510 total.</p>
          <p><strong className="text-slate-300">Nature:</strong> Boosts one stat by 10%, lowers another by 10%.</p>
        </div>
      </div>
    </div>
  );
}