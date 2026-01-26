import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const rarityColors = {
  common: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
  uncommon: 'bg-green-500/20 text-green-300 border-green-500/50',
  rare: 'bg-purple-500/20 text-purple-300 border-purple-500/50'
};

const statNames = {
  hp: 'HP',
  atk: 'Attack',
  def: 'Defense',
  spAtk: 'Sp. Atk',
  spDef: 'Sp. Def',
  spd: 'Speed'
};

export default function ResearchQuestCard({ quest, onSubmit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 hover:border-indigo-500/50 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Research Request
          </h3>
          <Badge className={`mt-2 ${rarityColors[quest.rarity]}`}>
            {quest.rarity.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-2">Required Pokémon:</p>
          <p className="text-xl font-bold text-white">{quest.species}</p>
          
          {quest.requirementType === 'nature' ? (
            <div className="mt-3">
              <p className="text-sm text-slate-400">Nature Required:</p>
              <p className="text-lg font-semibold text-indigo-300">{quest.nature}</p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-slate-400">IV Requirement:</p>
              <p className="text-lg font-semibold text-purple-300">
                {statNames[quest.ivStat]} ≥ {quest.ivThreshold}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Reward:</span>
          <span className="text-yellow-400 font-semibold flex items-center gap-1">
            <Zap className="w-4 h-4" />
            {quest.rewardBase} × Level
          </span>
        </div>
      </div>

      <Button
        onClick={() => onSubmit(quest)}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
      >
        Submit Pokémon
      </Button>
    </motion.div>
  );
}