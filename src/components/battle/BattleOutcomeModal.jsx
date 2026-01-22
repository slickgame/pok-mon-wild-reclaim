import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Skull, Sparkles, Star, Package, Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BattleOutcomeModal({ outcome, onClose, onCapture }) {
  const isVictory = outcome.result === 'victory';
  const isCaptured = outcome.result === 'captured';
  const isSuccess = isVictory || isCaptured;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className={`glass rounded-2xl p-8 max-w-md w-full border-2 ${
          isCaptured ? 'border-purple-500/50' :
          isVictory ? 'border-emerald-500/50' : 'border-red-500/50'
        }`}
      >
        {/* Icon */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              isCaptured
                ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                : isVictory
                ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                : 'bg-gradient-to-br from-red-500 to-orange-600'
            }`}
          >
            {isCaptured ? (
              <Heart className="w-10 h-10 text-white" />
            ) : isVictory ? (
              <Trophy className="w-10 h-10 text-white" />
            ) : (
              <Skull className="w-10 h-10 text-white" />
            )}
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">
            {isCaptured ? 'Gotcha!' : isVictory ? 'Victory!' : 'Defeat'}
          </h2>
          <p className="text-slate-400">
            {isCaptured
              ? `${outcome.enemyName} was caught!`
              : isVictory
              ? `You defeated ${outcome.enemyName}!`
              : `${outcome.enemyName} was too strong...`}
          </p>
        </div>

        {/* Rewards */}
        {isSuccess && (
          <div className="space-y-3 mb-6">
            <div className="glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Experience
                </span>
                <span className="text-yellow-300 font-bold">+{outcome.xpGained} XP</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Gold
                </span>
                <span className="text-amber-300 font-bold">+{outcome.goldGained} G</span>
              </div>
              {outcome.itemsReceived?.length > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Package className="w-4 h-4 text-cyan-400" />
                    Materials
                  </span>
                  <span className="text-cyan-300 font-semibold text-sm">
                    {outcome.itemsReceived.join(', ')}
                  </span>
                </div>
              )}
              {outcome.synergyChains > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <span className="text-slate-400">Synergy Chains</span>
                  <Badge className="bg-purple-500/20 text-purple-300">{outcome.synergyChains}</Badge>
                </div>
              )}
            </div>

            {/* EV Gains */}
            {outcome.evsGained && outcome.totalEVsGained > 0 && (
              <div className="glass rounded-lg p-4 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Effort Values Gained</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300">+{outcome.totalEVsGained}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {outcome.evsGained.hp > 0 && (
                    <div className="text-center">
                      <div className="text-red-400 font-bold">+{outcome.evsGained.hp}</div>
                      <div className="text-slate-500">HP</div>
                    </div>
                  )}
                  {outcome.evsGained.atk > 0 && (
                    <div className="text-center">
                      <div className="text-orange-400 font-bold">+{outcome.evsGained.atk}</div>
                      <div className="text-slate-500">ATK</div>
                    </div>
                  )}
                  {outcome.evsGained.def > 0 && (
                    <div className="text-center">
                      <div className="text-amber-400 font-bold">+{outcome.evsGained.def}</div>
                      <div className="text-slate-500">DEF</div>
                    </div>
                  )}
                  {outcome.evsGained.spAtk > 0 && (
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">+{outcome.evsGained.spAtk}</div>
                      <div className="text-slate-500">SpA</div>
                    </div>
                  )}
                  {outcome.evsGained.spDef > 0 && (
                    <div className="text-center">
                      <div className="text-cyan-400 font-bold">+{outcome.evsGained.spDef}</div>
                      <div className="text-slate-500">SpD</div>
                    </div>
                  )}
                  {outcome.evsGained.spd > 0 && (
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold">+{outcome.evsGained.spd}</div>
                      <div className="text-slate-500">SPD</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isCaptured && (
              <div className="glass rounded-lg p-4 border-2 border-purple-500/30 text-center">
                <Badge className="bg-purple-500/20 text-purple-300 mb-2">
                  New Pokémon Added
                </Badge>
                <p className="text-sm text-slate-300">
                  {outcome.enemyName} has been added to your collection!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <Button onClick={onClose} variant="outline" className="w-full">
          {isSuccess ? 'Continue' : 'Return'}
        </Button>
      </motion.div>
    </motion.div>
  );
}