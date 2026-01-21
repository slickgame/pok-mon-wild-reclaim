import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, TrendingUp, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const professionIcons = {
  Crafter: '🔨',
  Angler: '🎣',
  Performer: '✨',
  Explorer: '🗺️',
};

const professionColors = {
  Crafter: 'from-orange-500 to-red-500',
  Angler: 'from-cyan-500 to-blue-500',
  Performer: 'from-purple-500 to-pink-500',
  Explorer: 'from-green-500 to-emerald-500',
};

export default function PrestigeCard({ prestige, currentLevel, maxLevel, onPrestige }) {
  const gradient = professionColors[prestige.professionType];
  const isMaxLevel = currentLevel >= maxLevel;
  const canPrestige = isMaxLevel && prestige.readyToPrestige;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl`}>
            {professionIcons[prestige.professionType]}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{prestige.professionType}</h3>
            <div className="flex items-center gap-2">
              <Badge className={`bg-gradient-to-r ${gradient} text-white text-xs`}>
                <Crown className="w-3 h-3 mr-1" />
                Prestige {prestige.prestigeLevel}
              </Badge>
              <span className="text-xs text-slate-400">Level {currentLevel}</span>
            </div>
          </div>
        </div>
        {prestige.title && (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
            <Award className="w-3 h-3 mr-1" />
            {prestige.title}
          </Badge>
        )}
      </div>

      {/* Active Bonuses */}
      {prestige.bonuses && prestige.bonuses.length > 0 && (
        <div className="glass rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-slate-400 mb-2">Active Bonuses</p>
          <div className="space-y-1">
            {prestige.bonuses.map((bonus, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{bonus.name}</span>
                <span className="text-cyan-300 font-medium">+{bonus.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prestige Button */}
      {canPrestige ? (
        <Button
          onClick={onPrestige}
          className={`w-full bg-gradient-to-r ${gradient}`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Prestige (Reset to Lv.1 + Bonus)
        </Button>
      ) : (
        <div className="text-center py-3 glass rounded-lg">
          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-slate-500" />
          <p className="text-xs text-slate-400">
            {isMaxLevel ? 'Complete requirements to prestige' : `Reach level ${maxLevel} to prestige`}
          </p>
        </div>
      )}
    </motion.div>
  );
}