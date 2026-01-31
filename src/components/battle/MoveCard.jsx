import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Star, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const categoryColors = {
  Physical: 'from-red-500 to-orange-500',
  Special: 'from-blue-500 to-purple-500',
  Status: 'from-slate-500 to-slate-600',
};

const tagStyles = {
  Drain: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
  Spore: 'bg-lime-500/20 text-lime-200 border border-lime-400/30',
  Powder: 'bg-lime-400/20 text-lime-200 border border-lime-300/30',
  Healing: 'bg-green-500/20 text-green-200 border border-green-400/30',
  Status: 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30',
  Terrain: 'bg-teal-500/20 text-teal-200 border border-teal-400/30'
};

const getTagClass = (tag) => tagStyles[tag] || 'bg-slate-700/50 text-slate-200 border border-slate-500/30';

export default function MoveCard({ move, onUse, disabled, showSynergy = true, pokemon = null }) {
  const [showDetails, setShowDetails] = useState(false);
  const hasSynergy = move.synergyConditions && move.synergyConditions.length > 0;

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`glass rounded-lg p-3 relative ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-semibold text-sm">{move.name}</h4>
            {move.isSignature && (
              <Star className="w-3 h-3 text-yellow-400" />
            )}
          </div>
          <div className="flex gap-1">
            <Badge className={`bg-gradient-to-r ${categoryColors[move.category]} text-white text-xs border-0`}>
              {move.category}
            </Badge>
            <Badge className="bg-slate-700/50 text-slate-300 text-xs">
              {move.type}
            </Badge>
          </div>
        </div>
        {hasSynergy && showSynergy && (
          <div className="flex items-center gap-1 text-xs text-cyan-400">
            <Zap className="w-3 h-3" />
            <span>Synergy</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-xs text-slate-400 mb-2">
        {move.power > 0 && (
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span>{move.power}</span>
          </div>
        )}
        <div>PP: {move.pp}</div>
        {move.accuracy < 100 && <div>Acc: {move.accuracy}%</div>}
        {move.priority !== 0 && (
          <div className={move.priority > 0 ? 'text-emerald-400' : 'text-red-400'}>
            Priority: {move.priority > 0 ? '+' : ''}{move.priority}
          </div>
        )}
      </div>

      {/* Description (on hover) */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-xs text-slate-300 mb-2 pb-2 border-b border-slate-700 italic"
        >
          {move.description || "No description available."}
        </motion.div>
      )}

      {showDetails && move.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {move.tags.map((tag) => (
            <span
              key={tag}
              className={`text-[0.65rem] px-2 py-0.5 rounded-full uppercase tracking-wide ${getTagClass(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Synergy indicators (on hover) */}
      {showDetails && hasSynergy && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-1 mb-2"
        >
          {move.synergyConditions.map((synergy, idx) => (
            <div key={idx} className="text-xs text-cyan-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>{synergy.bonus}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Use button */}
      <Button
        size="sm"
        onClick={() => onUse(move)}
        disabled={disabled}
        className={`w-full ${
          move.isSignature
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        Use Move
      </Button>
    </motion.div>
  );
}
