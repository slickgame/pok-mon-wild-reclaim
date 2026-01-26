import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ContestScorecard({ roundScores, roundNumber }) {
  const totalScore = (roundScores.baseMoveScore || 0) + 
                    (roundScores.comboBonus || 0) + 
                    (roundScores.audienceReaction || 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Round {roundNumber}</h3>
        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 text-lg px-3 py-1">
          {totalScore} pts
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Base Move Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-slate-400">Base Moves</span>
          </div>
          <span className="text-white font-medium">{roundScores.baseMoveScore || 0}</span>
        </div>

        {/* Combo Bonus */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-400">Combo Bonus</span>
          </div>
          <span className="text-cyan-300 font-medium">+{roundScores.comboBonus || 0}</span>
        </div>

        {/* Audience Reaction */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-slate-400">Audience</span>
          </div>
          <span className="text-orange-300 font-medium">+{roundScores.audienceReaction || 0}</span>
        </div>
      </div>

      {/* Judge Feedback */}
      {roundScores.judgeFeedback && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-sm text-slate-300 italic">
            "{roundScores.judgeFeedback}"
          </p>
        </div>
      )}
    </motion.div>
  );
}