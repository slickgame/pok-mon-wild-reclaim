import React from 'react';
import { motion } from 'framer-motion';
import { Fish, TrendingUp } from 'lucide-react';

const LEVEL_UNLOCKS = {
  1: 'Basic Fishing',
  2: 'Shimmer Bait Recipe',
  3: 'River Zones',
  4: 'Night Fishing',
  5: 'Deep Sea Access',
  6: 'Legendary Lure Recipe',
  7: 'Weather Fishing',
  8: 'Tournament Entry',
  9: 'Master Angler',
};

export default function AnglerProgressBar({ level, xp }) {
  const nextLevelXp = level * 100;
  const percentage = Math.min((xp / nextLevelXp) * 100, 100);
  const nextUnlock = LEVEL_UNLOCKS[level + 1];

  return (
    <div className="glass rounded-xl p-6 border border-cyan-500/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <Fish className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Angler Level {level}</h3>
            <p className="text-xs text-slate-400">{xp}/{nextLevelXp} XP</p>
          </div>
        </div>
        {level < 9 && (
          <div className="text-right">
            <TrendingUp className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">Next: {nextUnlock}</p>
          </div>
        )}
      </div>

      <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
        />
      </div>

      {level === 9 && (
        <p className="text-center text-cyan-300 text-sm mt-3 font-semibold">
          🎣 Master Angler Achieved!
        </p>
      )}
    </div>
  );
}