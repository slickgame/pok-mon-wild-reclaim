import React from 'react';
import { motion } from 'framer-motion';
import { Target, ChevronRight } from 'lucide-react';
import StatBar from '@/components/ui/StatBar';
import { Badge } from '@/components/ui/badge';

export default function QuestCard({ quest, onClick }) {
  const progressPercent = (quest.progress / quest.goal) * 100;
  
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="glass rounded-xl p-4 cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
          <Target className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-white truncate">{quest.name}</h4>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{quest.description}</p>
          <div className="mt-2">
            <StatBar 
              value={quest.progress} 
              maxValue={quest.goal} 
              color="bg-gradient-to-r from-amber-500 to-orange-500"
              size="sm"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <Badge className="bg-slate-700/50 text-slate-300 text-[10px] border-slate-600/50">
              {quest.reward}
            </Badge>
            <span className="text-[10px] text-slate-500">
              {quest.progress}/{quest.goal}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}