import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';
import { getBaseStats } from '@/utils/baseStats';
import { calculateAllStats, getNatureDescription } from '@/utils/statCalculations';

export default function StatDisplay({ pokemon }) {
  const [showIVs, setShowIVs] = useState(false);
  const [showEVs, setShowEVs] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* Nature */}
      <div className="glass p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Nature</p>
            <p className="text-white font-semibold">{pokemon.nature || 'Hardy'}</p>
            <p className="text-slate-500 text-xs">{getNatureDescription(pokemon.nature || 'Hardy')}</p>
          </div>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            Lv. {pokemon.level}
          </Badge>
        </div>
      </div>

      {/* Toggle buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={showIVs ? "default" : "outline"}
          onClick={() => setShowIVs(!showIVs)}
          className="flex-1"
        >
          {showIVs ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
          IVs
        </Button>
        <Button
          size="sm"
          variant={showEVs ? "default" : "outline"}
          onClick={() => setShowEVs(!showEVs)}
          className="flex-1"
        >
          {showEVs ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
          EVs
        </Button>
      </div>

      {showEVs && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Effort Values
            </p>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              {totalEVs} / 510
            </Badge>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
              style={{ width: `${(totalEVs / 510) * 100}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* Stats Display */}
      <div className="space-y-2">
        {Object.keys(statNames).map((stat) => (
          <motion.div
            key={stat}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-3 rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${statColors[stat]}`}>
                {statNames[stat]}
              </span>
              <div className="flex items-center gap-3">
                {showIVs && (
                  <span className={`text-xs ${getIVQuality(ivs[stat])}`}>
                    IV: {ivs[stat]}
                  </span>
                )}
                {showEVs && (
                  <span className="text-xs text-emerald-400">
                    EV: {evs[stat]}
                  </span>
                )}
                <span className="text-white font-bold text-lg">
                  {calculatedStats[stat]}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 text-xs text-slate-400">
              <span>Base: {baseStats[stat]}</span>
            </div>
            
            {/* Stat bar */}
            <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5">
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
        ))}
      </div>

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