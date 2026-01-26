import React from 'react';
import { Flame, Droplet, Zap, Skull, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

const statusIcons = {
  burn: { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  poison: { icon: Skull, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  paralyze: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  paralysis: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  paralyzed: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  freeze: { icon: Droplet, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  sleep: { icon: Wind, color: 'text-slate-400', bg: 'bg-slate-500/20' }
};

export default function StatusIndicator({ status }) {
  if (!status?.conditions || status.conditions.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {status.conditions.map((condition, idx) => {
        const config = statusIcons[condition.toLowerCase()] || statusIcons.poison;
        const Icon = config.icon;
        
        return (
          <motion.div
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`${config.bg} rounded-full p-1.5`}
          >
            <Icon className={`w-3 h-3 ${config.color}`} />
          </motion.div>
        );
      })}
    </div>
  );
}
