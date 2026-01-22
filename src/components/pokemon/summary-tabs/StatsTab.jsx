import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award } from 'lucide-react';
import { getPokemonStats } from '../usePokemonStats';
import { getNatureDescription } from '../statCalculations';

export default function StatsTab({ pokemon }) {
  const fullStats = getPokemonStats(pokemon);
  const stats = fullStats.stats;

  // Calculate EXP progress
  const expForNextLevel = Math.floor(Math.pow(pokemon.level + 1, 3));
  const expProgress = (pokemon.experience / expForNextLevel) * 100;

  // Nature description
  const natureDesc = getNatureDescription(pokemon.nature);

  return (
    <div className="space-y-4">
      {/* Experience Progress */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Experience</span>
          <span className="text-sm font-semibold text-indigo-400">
            {pokemon.experience} / {expForNextLevel} XP
          </span>
        </div>
        <Progress value={expProgress} className="h-2" />
        <p className="text-xs text-slate-500 mt-1">
          {expForNextLevel - pokemon.experience} XP to Level {pokemon.level + 1}
        </p>
      </div>

      {/* Nature */}
      {pokemon.nature && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Nature</h3>
          </div>
          <Badge className="bg-purple-500/20 border-purple-500/30 text-purple-300">
            {pokemon.nature}
          </Badge>
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
                    <Badge variant="outline" className="text-xs py-0 px-1">
                      IV: {iv}
                    </Badge>
                    <Badge variant="outline" className="text-xs py-0 px-1">
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