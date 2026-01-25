import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, X, Sparkles, Skull, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BattleSummaryModal({ summary, onClose }) {
  if (!summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {summary.result === 'victory' ? 'Victory!' : summary.result === 'captured' ? 'Pokémon Caught!' : 'Battle Summary'}
          </h2>
          <p className="text-slate-400">Battle against {summary.enemyName}</p>
        </div>

        {/* Caught Pokémon */}
        {summary.caughtPokemon && (
          <div className="glass rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Pokémon Caught
            </h3>
            <p className="text-white font-semibold">{summary.caughtPokemon}</p>
          </div>
        )}

        {/* XP Results */}
        {summary.xpResults && summary.xpResults.length > 0 && (
          <div className="glass rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Experience Gained
            </h3>
            <div className="space-y-2">
              {summary.xpResults.map((result, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    result.fainted ? 'bg-slate-800/50 opacity-50' : 'bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${result.fainted ? 'text-slate-500' : 'text-white'}`}>
                      {result.name}
                    </span>
                    {result.fainted && (
                      <Badge variant="outline" className="text-slate-500 border-slate-600">
                        Fainted
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    {!result.fainted && (
                      <>
                        <p className="text-cyan-400 font-semibold">+{result.xpGained} XP</p>
                        {result.leveledUp && (
                          <p className="text-xs text-yellow-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Level {result.newLevel}!
                          </p>
                        )}
                      </>
                    )}
                    {result.fainted && (
                      <p className="text-slate-500 text-sm">No XP</p>
                    )}
                  </div>
                </div>
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
                <Badge key={idx} className="bg-purple-700/50 text-white">
                  {item}
                </Badge>
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
                <Badge key={idx} className="bg-amber-700/50 text-white">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
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