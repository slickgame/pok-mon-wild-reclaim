import React from 'react';
import { motion } from 'framer-motion';
import { Book, CheckCircle2, Circle, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const categoryColors = {
  Legendary: 'from-purple-500 to-pink-500',
  Crafting: 'from-orange-500 to-red-500',
  'NPC Bond': 'from-cyan-500 to-blue-500',
  Exploration: 'from-green-500 to-emerald-500',
};

export default function MythicQuestCard({ quest, onClick }) {
  const gradient = categoryColors[quest.category];
  const totalStages = quest.stages?.length || 0;
  const currentStage = quest.currentStage || 1;
  const progress = (currentStage / totalStages) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      className="glass rounded-xl p-5 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">{quest.name}</h3>
            <p className="text-xs text-slate-400">{quest.category} Quest</p>
          </div>
        </div>
        {quest.isCompleted && (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Complete
          </Badge>
        )}
      </div>

      <p className="text-sm text-slate-300 mb-4">{quest.description}</p>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Stage {currentStage}/{totalStages}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${gradient} transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Objectives */}
      {quest.stages && quest.stages[currentStage - 1] && (
        <div className="space-y-1">
          {quest.stages[currentStage - 1].objectives?.slice(0, 2).map((obj, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              {obj.completed ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <Circle className="w-3 h-3 text-slate-600" />
              )}
              <span className={obj.completed ? 'text-slate-500 line-through' : 'text-slate-300'}>
                {obj.description}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}