import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Trophy, Sparkles, Users, Music } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const themeIcons = {
  Sparkle: Sparkles,
  Harmony: Music,
  Drama: Users,
};

const themeColors = {
  Sparkle: 'from-pink-500 to-purple-500',
  Harmony: 'from-cyan-500 to-blue-500',
  Drama: 'from-orange-500 to-red-500',
};

export default function ContestCard({ contest, onEnter, hasEntered = false }) {
  const Icon = themeIcons[contest.theme];
  const gradient = themeColors[contest.theme];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className={`h-32 bg-gradient-to-br ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-4 left-4">
          <Badge className="bg-black/40 text-white border-white/20">
            {contest.theme} Contest
          </Badge>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-16 h-16 text-white/30" />
        </div>
        {hasEntered && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-emerald-500/30 text-emerald-300 border-emerald-500/50">
              Entered
            </Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(contest.startDate), 'MMM d')} - {format(new Date(contest.endDate), 'MMM d')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="w-4 h-4" />
            <span>{contest.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>{contest.rewards?.first?.gold || 500}g + Trinket Recipe</span>
          </div>
        </div>

        <Button
          onClick={onEnter}
          disabled={hasEntered || !contest.isActive}
          className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90`}
        >
          {hasEntered ? 'Already Entered' : 'Enter Contest'}
        </Button>
      </div>
    </motion.div>
  );
}