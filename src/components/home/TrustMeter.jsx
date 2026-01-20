import React from 'react';
import { motion } from 'framer-motion';
import StatBar from '@/components/ui/StatBar';

const npcData = {
  wells: { name: 'Wells', role: 'Crafting Mentor', color: 'bg-gradient-to-r from-amber-500 to-orange-500', emoji: '🔧' },
  maple: { name: 'Prof. Maple', role: 'Professor', color: 'bg-gradient-to-r from-emerald-500 to-green-600', emoji: '📚' },
  jenny: { name: 'Nurse Jenny', role: 'Nurse', color: 'bg-gradient-to-r from-pink-500 to-rose-500', emoji: '💊' },
  merra: { name: 'Merra', role: 'Merchant', color: 'bg-gradient-to-r from-purple-500 to-violet-600', emoji: '🏪' },
};

export default function TrustMeter({ trustLevels = {} }) {
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-lg">🤝</span> NPC Trust Levels
      </h3>
      <div className="space-y-4">
        {Object.entries(npcData).map(([key, npc]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Object.keys(npcData).indexOf(key) * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="text-lg">{npc.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{npc.name}</span>
                  <span className="text-xs text-slate-400">{trustLevels[key] || 0}/100</span>
                </div>
                <StatBar
                  value={trustLevels[key] || 0}
                  maxValue={100}
                  color={npc.color}
                  showValue={false}
                  size="sm"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}