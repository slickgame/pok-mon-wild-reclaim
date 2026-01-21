import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const trainerTypeColors = {
  Rival: 'from-red-500 to-orange-500',
  'Gym Leader': 'from-blue-500 to-cyan-500',
  'Legendary Gatekeeper': 'from-purple-500 to-pink-500',
  'Elite Four': 'from-yellow-500 to-orange-500',
};

export default function TrainerRematchCard({ trainer, onChallenge }) {
  const gradient = trainerTypeColors[trainer.trainerType];
  const currentVersion = trainer.teamVersions?.find(v => v.rank === trainer.currentRank);
  const winRate = trainer.totalWins / (trainer.totalWins + trainer.totalLosses) * 100 || 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className={`h-24 bg-gradient-to-br ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <Badge className="bg-black/40 text-white border-white/20">
            {trainer.trainerType}
          </Badge>
          <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/50">
            Rank {trainer.currentRank}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <h3 className="text-white font-bold text-lg">{trainer.trainerName}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-sm text-slate-400 mb-4">{trainer.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="glass rounded-lg p-2 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
            <p className="text-xs text-slate-400">Max Rank</p>
            <p className="text-white font-bold">{trainer.maxRankDefeated || 0}</p>
          </div>
          <div className="glass rounded-lg p-2 text-center">
            <Trophy className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
            <p className="text-xs text-slate-400">Win Rate</p>
            <p className="text-white font-bold">{Math.round(winRate)}%</p>
          </div>
          <div className="glass rounded-lg p-2 text-center">
            <Swords className="w-4 h-4 mx-auto mb-1 text-red-400" />
            <p className="text-xs text-slate-400">Battles</p>
            <p className="text-white font-bold">{trainer.totalWins + trainer.totalLosses}</p>
          </div>
        </div>

        {/* Current Team Theme */}
        {currentVersion && (
          <div className="glass rounded-lg p-3 mb-4">
            <p className="text-xs text-slate-400 mb-1">Current Theme</p>
            <p className="text-white font-semibold">{currentVersion.theme}</p>
          </div>
        )}

        {/* Last Battle */}
        {trainer.lastWinDate && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Calendar className="w-3 h-3" />
            Last win: {format(new Date(trainer.lastWinDate), 'MMM d, yyyy')}
          </div>
        )}

        <Button
          onClick={onChallenge}
          disabled={!trainer.isUnlocked}
          className={`w-full bg-gradient-to-r ${gradient}`}
        >
          <Swords className="w-4 h-4 mr-2" />
          Challenge
        </Button>
      </div>
    </motion.div>
  );
}