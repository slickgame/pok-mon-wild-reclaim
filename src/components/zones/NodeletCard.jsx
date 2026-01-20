import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, Trophy, AlertTriangle, CheckCircle2, Skull } from 'lucide-react';

const nodeletIcons = {
  Quest: Trophy,
  Resource: Zap,
  Secret: Lock,
  Boss: Skull,
  Eclipse: AlertTriangle,
};

export default function NodeletCard({ nodelet, isLiberated, onChallenge, onInspect, canChallenge = true }) {
  const Icon = nodeletIcons[nodelet.type] || AlertTriangle;
  const isEclipse = nodelet.eclipseControlled && !isLiberated;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`glass rounded-xl p-4 relative overflow-hidden ${
        isEclipse ? 'border border-red-500/30' : isLiberated ? 'border border-emerald-500/30' : 'border border-slate-700'
      }`}
    >
      {/* Eclipse corruption overlay */}
      {isEclipse && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-purple-900/10 pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isEclipse 
              ? 'bg-red-500/20 border border-red-500/50' 
              : isLiberated 
              ? 'bg-emerald-500/20 border border-emerald-500/50' 
              : 'bg-slate-700/50 border border-slate-600'
          }`}>
            {isLiberated ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Icon className={`w-5 h-5 ${isEclipse ? 'text-red-400' : 'text-slate-400'}`} />
            )}
          </div>
          <div>
            <h4 className="text-white font-semibold">{nodelet.name}</h4>
            <p className="text-xs text-slate-400">{nodelet.type} Nodelet</p>
          </div>
        </div>
        
        <Badge 
          className={
            isLiberated 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
              : isEclipse 
              ? 'bg-red-500/20 text-red-300 border-red-500/50' 
              : 'bg-slate-700/50 text-slate-400'
          }
        >
          {isLiberated ? 'Liberated' : isEclipse ? 'Corrupted' : 'Inactive'}
        </Badge>
      </div>

      {/* Revenant encounter info */}
      {isEclipse && nodelet.revenantEncounter && (
        <div className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Skull className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-300">Revenant Encounter</span>
          </div>
          <p className="text-xs text-slate-300">
            {nodelet.revenantEncounter.species} • Lv. {nodelet.revenantEncounter.level}
            {nodelet.revenantEncounter.isBoss && ' • Boss'}
          </p>
        </div>
      )}

      {/* Liberation rewards */}
      {nodelet.liberationRewards && (
        <div className="mb-3 space-y-1">
          {nodelet.liberationRewards.unlockRecipes?.length > 0 && (
            <p className="text-xs text-slate-400">
              🔓 Unlocks {nodelet.liberationRewards.unlockRecipes.length} recipe(s)
            </p>
          )}
          {nodelet.liberationRewards.unlockMaterials?.length > 0 && (
            <p className="text-xs text-slate-400">
              ✨ Unlocks rare materials
            </p>
          )}
          {nodelet.liberationRewards.bonusXp > 0 && (
            <p className="text-xs text-slate-400">
              +{nodelet.liberationRewards.bonusXp} XP reward
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 relative z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={onInspect}
          className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Inspect
        </Button>
        {isEclipse && (
          <Button
            size="sm"
            onClick={onChallenge}
            disabled={!canChallenge}
            className={`flex-1 ${
              canChallenge
                ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            Challenge
          </Button>
        )}
      </div>
    </motion.div>
  );
}