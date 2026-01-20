import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Trophy, Sparkles, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ZoneLiberationTracker({ zone, liberatedNodelets = [] }) {
  const eclipseNodelets = zone.nodelets?.filter(n => n.eclipseControlled) || [];
  const liberatedCount = eclipseNodelets.filter(n => 
    liberatedNodelets.some(ln => ln.nodeletId === n.id && ln.zoneId === zone.id)
  ).length;
  
  const totalEclipseNodelets = eclipseNodelets.length;
  const liberationPercent = totalEclipseNodelets > 0 
    ? (liberatedCount / totalEclipseNodelets) * 100 
    : 100;
  
  const isFullyLiberated = liberationPercent === 100;
  const eclipseControlPercent = zone.eclipseControlPercentage || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isFullyLiberated ? (
            <Shield className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          )}
          <span className="text-white font-semibold">Liberation Status</span>
        </div>
        <Badge 
          className={
            isFullyLiberated 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
              : eclipseControlPercent > 50 
              ? 'bg-red-500/20 text-red-300 border-red-500/50' 
              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
          }
        >
          {isFullyLiberated ? 'Liberated' : `${Math.round(eclipseControlPercent)}% Corrupted`}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Nodelets Cleared</span>
          <span className="text-xs font-semibold text-white">
            {liberatedCount}/{totalEclipseNodelets}
          </span>
        </div>
        <Progress 
          value={liberationPercent} 
          className={`h-2 ${
            isFullyLiberated ? 'bg-emerald-900/50' : 'bg-red-900/50'
          }`}
        />
      </div>

      {/* Benefits */}
      {isFullyLiberated && (
        <div className="space-y-2 pt-2 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Sparkles className="w-3 h-3" />
            <span>Full spawn variety restored</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Trophy className="w-3 h-3" />
            <span>Crafting bonuses active</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Shield className="w-3 h-3" />
            <span>Team synergy at 100%</span>
          </div>
        </div>
      )}

      {/* Warning */}
      {!isFullyLiberated && eclipseNodelets.length > 0 && (
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            Clear Eclipse Nodelets to unlock zone benefits and rare crafting materials
          </p>
        </div>
      )}
    </motion.div>
  );
}