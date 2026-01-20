import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award } from 'lucide-react';
import StatBar from '@/components/ui/StatBar';
import { Badge } from '@/components/ui/badge';

const LEVEL_REQUIREMENTS = {
  1: { xp: 0, name: "Novice Crafter", unlocks: "Healing & Buffs" },
  2: { xp: 100, name: "Apprentice", unlocks: "Trinkets" },
  3: { xp: 300, name: "Journeyman", unlocks: "Pokéballs" },
  4: { xp: 600, name: "Expert", unlocks: "Reforging" },
  5: { xp: 1000, name: "Master Crafter", unlocks: "Talent Crystals" },
};

export default function CraftingProgressBar({ level, xp }) {
  const currentLevel = Math.min(level, 5);
  const nextLevel = currentLevel + 1;
  
  const currentReq = LEVEL_REQUIREMENTS[currentLevel]?.xp || 0;
  const nextReq = LEVEL_REQUIREMENTS[nextLevel]?.xp || LEVEL_REQUIREMENTS[5].xp + 1000;
  
  const xpInLevel = xp - currentReq;
  const xpForNextLevel = nextReq - currentReq;
  const percentage = Math.min((xpInLevel / xpForNextLevel) * 100, 100);
  
  const isMaxLevel = currentLevel >= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-5"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-amber-400" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">Level {currentLevel}</h3>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50">
              {LEVEL_REQUIREMENTS[currentLevel]?.name}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {LEVEL_REQUIREMENTS[currentLevel]?.unlocks}
          </p>
        </div>

        {isMaxLevel && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {!isMaxLevel ? (
        <>
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Progress to Level {nextLevel}</span>
            <span>{xpInLevel} / {xpForNextLevel} XP</span>
          </div>
          <StatBar
            value={xpInLevel}
            maxValue={xpForNextLevel}
            color="bg-gradient-to-r from-amber-500 to-orange-500"
            showValue={false}
            size="md"
          />
          <p className="text-xs text-slate-500 mt-2">
            Next unlock: <span className="text-amber-400">{LEVEL_REQUIREMENTS[nextLevel]?.unlocks}</span>
          </p>
        </>
      ) : (
        <div className="text-center py-2">
          <p className="text-emerald-400 font-semibold">✨ Maximum Crafting Level Reached ✨</p>
          <p className="text-xs text-slate-400 mt-1">All recipes unlocked!</p>
        </div>
      )}
    </motion.div>
  );
}