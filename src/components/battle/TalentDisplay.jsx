import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const gradeColors = {
  Bronze: 'bg-amber-700/30 text-amber-400 border-amber-600/50',
  Silver: 'bg-slate-400/30 text-slate-200 border-slate-400/50',
  Gold: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50',
  Diamond: 'bg-cyan-400/30 text-cyan-200 border-cyan-400/50',
};

export default function TalentDisplay({ talents, showDescription = false, compact = false }) {
  if (!talents || talents.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {talents.map((talent, idx) => (
          <Badge key={idx} className={`text-xs ${gradeColors[talent.grade]}`}>
            {talent.name}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {talents.map((talent, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="glass rounded-lg p-3"
        >
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              gradeColors[talent.grade]?.replace('text-', 'bg-').replace('/30', '/20')
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-semibold text-sm">{talent.name}</span>
                <Badge className={`text-xs ${gradeColors[talent.grade]}`}>
                  {talent.grade}
                </Badge>
              </div>
              {showDescription && talent.description && (
                <p className="text-xs text-slate-400">{talent.description}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}