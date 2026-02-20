import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';
import { getStreakData, getShinyOddsLabel } from '@/components/systems/shiny/shinySystem';

function getStreakBonus(streak) {
  if (streak >= 25) return 5;
  if (streak >= 20) return 4;
  if (streak >= 15) return 3;
  if (streak >= 10) return 2;
  if (streak >= 5) return 1;
  return 0;
}

function getNextThreshold(streak) {
  if (streak >= 25) return null;
  if (streak >= 20) return 25;
  if (streak >= 15) return 20;
  if (streak >= 10) return 15;
  if (streak >= 5) return 10;
  return 5;
}

export default function CatchStreakBadge({ species = null, compact = false }) {
  const { species: streakSpecies, count } = getStreakData();

  // Only show if we have an active streak for this species (or any species if none specified)
  const activeSpecies = species || streakSpecies;
  if (!streakSpecies || count < 1) return null;
  if (species && streakSpecies !== species) return null;

  const bonus = getStreakBonus(count);
  const nextThreshold = getNextThreshold(count);
  const rolls = 1 + bonus; // base 1 + streak bonus
  const oddsLabel = getShinyOddsLabel(rolls);
  const toNext = nextThreshold ? nextThreshold - count : null;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-1 bg-orange-500/20 border border-orange-500/40 rounded-full px-2 py-0.5 text-xs"
      >
        <Flame className="w-3 h-3 text-orange-400" />
        <span className="text-orange-300 font-semibold">{count}×</span>
        <span className="text-orange-200/80">{streakSpecies}</span>
        {bonus > 0 && <span className="text-yellow-300 font-bold ml-0.5">+{bonus} ✨</span>}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-900/40 to-amber-900/40 border border-orange-500/30 rounded-xl p-3"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Flame className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-semibold text-orange-200">Catch Streak</span>
        <span className="ml-auto text-lg font-bold text-orange-300">{count}×</span>
      </div>
      <p className="text-xs text-slate-300 mb-1">
        Species: <span className="text-white font-medium">{streakSpecies}</span>
      </p>
      <div className="flex items-center gap-2 text-xs">
        <Sparkles className="w-3 h-3 text-yellow-400" />
        <span className="text-slate-400">Shiny bonus rolls:</span>
        <span className="text-yellow-300 font-bold">+{bonus}</span>
        <span className="text-slate-500">({oddsLabel} per encounter)</span>
      </div>
      {bonus < 5 && toNext !== null && (
        <p className="text-xs text-slate-500 mt-1">
          {toNext} more for +{bonus + 1} rolls
        </p>
      )}
      {bonus === 5 && (
        <p className="text-xs text-yellow-400/80 mt-1 font-semibold">✨ Max streak bonus reached!</p>
      )}
    </motion.div>
  );
}