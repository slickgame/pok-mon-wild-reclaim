import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Clock, Users, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function LegendaryZoneCard({ zone, onClick }) {
  const isUnlocked = zone.isUnlocked;
  const isDefeated = zone.isDefeated;
  const cluesFound = zone.cluesDiscovered?.length || 0;

  return (
    <motion.div
      whileHover={{ scale: isUnlocked ? 1.02 : 1, y: isUnlocked ? -4 : 0 }}
      onClick={isUnlocked ? onClick : null}
      className={`glass rounded-xl overflow-hidden ${
        isUnlocked ? 'cursor-pointer' : 'opacity-60'
      }`}
    >
      {/* Header */}
      <div className="h-32 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 relative">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-3 left-3">
          {isDefeated ? (
            <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/50">
              <Trophy className="w-3 h-3 mr-1" />
              Defeated
            </Badge>
          ) : isUnlocked ? (
            <Badge className="bg-emerald-500/30 text-emerald-300 border-emerald-500/50">
              Unlocked
            </Badge>
          ) : (
            <Badge className="bg-red-500/30 text-red-300 border-red-500/50">
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </Badge>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-16 h-16 text-white/20" />
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2">{zone.name}</h3>
        <p className="text-sm text-slate-400 mb-4">{zone.description}</p>

        {/* Legendary Pokemon */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Legendary</p>
            <p className="text-white font-semibold">{zone.legendaryPokemon}</p>
          </div>
        </div>

        {/* Unlock Conditions */}
        {!isUnlocked && zone.unlockConditions && (
          <div className="glass rounded-lg p-3 mb-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 mb-2">Unlock Requirements:</p>
            {zone.unlockConditions.minLevel && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Trophy className="w-3 h-3" />
                Level {zone.unlockConditions.minLevel}+
              </div>
            )}
            {zone.unlockConditions.timeRequired && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Clock className="w-3 h-3" />
                {zone.unlockConditions.timeRequired} only
              </div>
            )}
            {zone.unlockConditions.npcTrust && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Users className="w-3 h-3" />
                {zone.unlockConditions.npcTrust.npcName} Trust {zone.unlockConditions.npcTrust.minTrust}+
              </div>
            )}
            {zone.unlockConditions.itemRequired && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Sparkles className="w-3 h-3" />
                {zone.unlockConditions.itemRequired}
              </div>
            )}
          </div>
        )}

        {/* Clues */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {cluesFound} clue{cluesFound !== 1 ? 's' : ''} discovered
          </span>
          {isUnlocked && !isDefeated && (
            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
              Challenge
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}