import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Package, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function expNeededForLevel(level) {
  return level * 100;
}

function XpBar({ result, index }) {
  const level = result.level ?? 1;
  const expNow = result.expAfter ?? 0;
  const xpGained = result.xpGained ?? 0;
  const expNeeded = expNeededForLevel(level);

  const startExp = Math.max(0, expNow - xpGained);
  const startPct = Math.min((startExp / expNeeded) * 100, 100);
  const endPct = Math.min((expNow / expNeeded) * 100, 100);

  const [barWidth, setBarWidth] = useState(startPct);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(endPct), 200 + index * 120);
    return () => clearTimeout(t);
  }, []);

  if (result.fainted) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 opacity-50">
        <span className="text-slate-500 font-medium">{result.name}</span>
        <span className="text-slate-500 text-sm">Fainted — No XP</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="p-3 rounded-lg bg-slate-800/40"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white text-sm">{result.name}</span>
          {result.leveledUp && (
            <Badge className="bg-yellow-500/20 text-yellow-300 text-xs px-1.5 py-0">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              Lv {result.newLevel}!
            </Badge>
          )}
        </div>
        <span className="text-cyan-400 font-semibold text-sm">+{xpGained} XP</span>
      </div>

      {/* XP bar */}
      <div className="relative h-2.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000 ease-out"
          style={{ width: `${barWidth}%` }}
        />
        <motion.div
          initial={{ opacity: 0.5, x: '-100%' }}
          animate={{ opacity: 0, x: '100%' }}
          transition={{ duration: 1.2, delay: 0.3 + index * 0.12, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
      </div>

      <div className="flex justify-between mt-0.5">
        <span className="text-xs text-slate-500">{expNow} / {expNeeded} XP</span>
        {!result.leveledUp && (
          <span className="text-xs text-slate-500">{Math.max(0, expNeeded - expNow)} to next</span>
        )}
      </div>
    </motion.div>
  );
}

export default function BattleSummaryModal({ summary, onClose }) {
  if (!summary) return null;

  const isVictory = summary.result === 'victory';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isVictory
              ? 'bg-gradient-to-br from-yellow-500 to-amber-500'
              : 'bg-gradient-to-br from-red-500 to-orange-600'
          }`}>
            {isVictory ? <Trophy className="w-8 h-8 text-white" /> : <Skull className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {isVictory ? 'Victory!' : 'Defeat'}
          </h2>
          <p className="text-slate-400 text-sm">Battle against {summary.enemyName}</p>
        </div>

        {/* XP Results with bars */}
        {summary.xpResults && summary.xpResults.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Experience Gained
            </h3>
            <div className="space-y-2">
              {summary.xpResults.map((result, idx) => (
                <XpBar key={idx} result={result} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Materials Dropped */}
        {summary.materialsDropped && summary.materialsDropped.length > 0 && (
          <div className="glass rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Materials Obtained
            </h3>
            <div className="flex flex-wrap gap-2">
              {summary.materialsDropped.map((item, idx) => (
                <Badge key={idx} className="bg-amber-700/50 text-white">{item}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Items Used */}
        {summary.itemsUsed && summary.itemsUsed.length > 0 && (
          <div className="glass rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Items Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {summary.itemsUsed.map((item, idx) => (
                <Badge key={idx} className="bg-purple-700/50 text-white">{item}</Badge>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
        >
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}