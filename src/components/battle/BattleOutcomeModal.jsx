import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, XCircle, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BattleOutcomeModal({ outcome, onClose, onCapture }) {
  const isVictory = outcome.result === 'victory';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className={`glass rounded-2xl p-8 max-w-md w-full ${
          isVictory ? 'border-2 border-emerald-500' : 'border-2 border-red-500'
        }`}
      >
        <div className="text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isVictory 
                ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                : 'bg-gradient-to-br from-red-500 to-pink-500'
            }`}
          >
            {isVictory ? (
              <Trophy className="w-10 h-10 text-white" />
            ) : (
              <XCircle className="w-10 h-10 text-white" />
            )}
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-2">
            {isVictory ? 'Victory!' : 'Defeat'}
          </h2>
          
          <p className="text-slate-300 mb-6">
            {isVictory 
              ? `You defeated ${outcome.enemyName}!`
              : `Your Pokémon fainted. Train harder and try again!`
            }
          </p>

          {/* Rewards */}
          {isVictory && (
            <div className="glass rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Experience</span>
                <span className="text-emerald-400 font-bold">+{outcome.xpGained} XP</span>
              </div>
              
              {outcome.goldGained > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Gold</span>
                  <span className="text-yellow-400 font-bold">+{outcome.goldGained}g</span>
                </div>
              )}

              {outcome.synergyChains > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Synergy Chains
                  </span>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                    {outcome.synergyChains}
                  </Badge>
                </div>
              )}

              {outcome.itemsReceived && outcome.itemsReceived.length > 0 && (
                <div>
                  <p className="text-slate-400 text-sm mb-2">Items Received:</p>
                  <div className="flex flex-wrap gap-2">
                    {outcome.itemsReceived.map((item, idx) => (
                      <Badge key={idx} className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Capture Option (for wild battles) */}
          {isVictory && outcome.canCapture && outcome.enemyHP > 0 && (
            <Button
              onClick={onCapture}
              className="w-full mb-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Star className="w-4 h-4 mr-2" />
              Attempt Capture
            </Button>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            className={`w-full ${
              isVictory 
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800'
            }`}
          >
            {isVictory ? 'Continue' : 'Return'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}