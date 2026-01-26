import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { getBaseStats } from './baseStats';
import { calculateAllStats, getNatureDescription, NATURES } from './statCalculations';

export default function StatDisplay({ pokemon }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const baseStats = getBaseStats(pokemon.species);
  const calculatedStats = calculateAllStats(pokemon, baseStats);
  
  const ivs = pokemon.ivs || { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, spd: 15 };
  const evs = pokemon.evs || { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 };
  const totalEVs = Object.values(evs).reduce((sum, val) => sum + val, 0);

  const statNames = {
    hp: 'HP',
    atk: 'Attack',
    def: 'Defense',
    spAtk: 'Sp. Atk',
    spDef: 'Sp. Def',
    spd: 'Speed'
  };

  const statColors = {
    hp: 'text-red-400',
    atk: 'text-orange-400',
    def: 'text-amber-400',
    spAtk: 'text-blue-400',
    spDef: 'text-cyan-400',
    spd: 'text-yellow-400'
  };

  const getIVQuality = (iv) => {
    if (iv >= 31) return 'text-purple-400';
    if (iv >= 25) return 'text-blue-400';
    if (iv >= 20) return 'text-green-400';
    if (iv >= 15) return 'text-yellow-400';
    return 'text-slate-400';
  };

  // Get nature modifier for a specific stat
  const getNatureModifier = (stat) => {
    const nature = NATURES[pokemon.nature || 'Hardy'];
    if (!nature) return 1.0;
    return nature[stat] || 1.0;
  };

  return (
    <div className="space-y-4">
      {/* Header with Nature */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Stats Overview</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="border-slate-700"
          >
            {showAdvanced ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-300 font-semibold">
              Nature: {pokemon.nature || 'Hardy'}
            </Badge>
            <Badge className="bg-indigo-500/20 text-indigo-300">
              Lv. {pokemon.level}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            {getNatureDescription(pokemon.nature || 'Hardy')}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Total EVs:</span>
            <Badge className="bg-emerald-500/20 text-emerald-300">
              {totalEVs} / 510
            </Badge>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all"
                style={{ width: `${(totalEVs / 510) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Stat Table */}
      {showAdvanced ? (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="text-left p-3 text-slate-300 font-semibold">Stat</th>
                  <th className="text-center p-3 text-slate-300 font-semibold">Base</th>
                  <th className="text-center p-3 text-slate-300 font-semibold">IV</th>
                  <th className="text-center p-3 text-slate-300 font-semibold">EV</th>
                  <th className="text-center p-3 text-slate-300 font-semibold">Nature</th>
                  <th className="text-right p-3 text-slate-300 font-semibold">Final</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(statNames).map((stat) => {
                  const modifier = stat === 'hp' ? 1.0 : getNatureModifier(stat);
                  const isBoosted = modifier > 1.0;
                  const isReduced = modifier < 1.0;
                  const evProgress = (evs[stat] / 252) * 100;
                  
                  return (
                    <tr key={stat} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="p-3">
                        <span className={`font-medium ${statColors[stat]} flex items-center gap-1`}>
                          {statNames[stat]}
                          {isBoosted && <ArrowUp className="w-3 h-3 text-green-400" />}
                          {isReduced && <ArrowDown className="w-3 h-3 text-red-400" />}
                        </span>
                      </td>
                      <td className="text-center p-3 text-slate-300">{baseStats[stat]}</td>
                      <td className="text-center p-3">
                        <span className={getIVQuality(ivs[stat])}>{ivs[stat]}</span>
                      </td>
                      <td className="text-center p-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-emerald-400 font-medium">{evs[stat]}</span>
                          <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all"
                              style={{ width: `${evProgress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-3">
                        {stat === 'hp' ? (
                          <span className="text-slate-500">–</span>
                        ) : isBoosted ? (
                          <span className="text-green-400 font-semibold">↑ 1.1</span>
                        ) : isReduced ? (
                          <span className="text-red-400 font-semibold">↓ 0.9</span>
                        ) : (
                          <span className="text-slate-500">–</span>
                        )}
                      </td>
                      <td className="text-right p-3">
                        <span className={`font-bold text-lg ${
                          isBoosted ? 'text-green-400' : 
                          isReduced ? 'text-red-400' : 
                          'text-white'
                        }`}>
                          {calculatedStats[stat]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="p-3 bg-slate-800/30 border-t border-slate-700">
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-slate-400">IV: 31 (Perfect)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-slate-400">IV: 25-30 (Excellent)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-slate-400">IV: 20-24 (Good)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-slate-400">IV: 15-19 (Average)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-2 rounded-full bg-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 w-1/2 bg-emerald-500" />
                </div>
                <span className="text-slate-400">EV Progress (max 252)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Simple Stats Display */
        <div className="space-y-2">
          {Object.keys(statNames).map((stat) => {
            const modifier = stat === 'hp' ? 1.0 : getNatureModifier(stat);
            const isBoosted = modifier > 1.0;
            const isReduced = modifier < 1.0;
            
            return (
              <motion.div
                key={stat}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass p-3 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${statColors[stat]} flex items-center gap-1`}>
                    {statNames[stat]}
                    {isBoosted && <ArrowUp className="w-3 h-3 text-green-400" />}
                    {isReduced && <ArrowDown className="w-3 h-3 text-red-400" />}
                  </span>
                  <span className={`font-bold text-lg ${
                    isBoosted ? 'text-green-400' : 
                    isReduced ? 'text-red-400' : 
                    'text-white'
                  }`}>
                    {calculatedStats[stat]}
                  </span>
                </div>
                
                {/* Stat bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className={`bg-gradient-to-r ${
                      stat === 'hp' ? 'from-red-500 to-pink-500' :
                      stat === 'atk' ? 'from-orange-500 to-red-500' :
                      stat === 'def' ? 'from-amber-500 to-orange-500' :
                      stat === 'spAtk' ? 'from-blue-500 to-cyan-500' :
                      stat === 'spDef' ? 'from-cyan-500 to-teal-500' :
                      'from-yellow-500 to-amber-500'
                    } h-1.5 rounded-full transition-all`}
                    style={{ width: `${Math.min((calculatedStats[stat] / 200) * 100, 100)}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Total Stats */}
      <div className="glass p-4 rounded-xl border border-indigo-500/30">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Total Stats</span>
          <span className="text-white font-bold text-xl">
            {Object.values(calculatedStats).reduce((sum, val) => sum + val, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}