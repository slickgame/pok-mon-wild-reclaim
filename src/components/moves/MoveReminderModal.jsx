import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, X, AlertCircle, Coins } from 'lucide-react';
import { getLevelUpLearnset, getMovesLearnableUpToLevel } from '@/components/pokemon/levelUpLearnsets';
import { getMoveData } from '@/components/pokemon/moveData';

const RELEARN_COST = 500; // Gold cost to relearn a move

export default function MoveReminderModal({ pokemon, playerGold, onClose, onRelearn }) {
  const [selectedMove, setSelectedMove] = useState(null);
  const [moveToForget, setMoveToForget] = useState(null);
  const [step, setStep] = useState('select'); // 'select' | 'forget'

  // Get all moves learnable up to current level
  const learnableMoves = getMovesLearnableUpToLevel(pokemon.species, pokemon.level);
  
  // Filter out moves already known
  const knownMoveNames = pokemon.abilities || [];
  const availableMoves = learnableMoves.filter(move => !knownMoveNames.includes(move));

  const canAfford = playerGold >= RELEARN_COST;

  const handleSelectMove = (moveName) => {
    if (!canAfford) return;
    
    setSelectedMove(moveName);
    
    // If Pokémon has 4 moves, need to forget one
    if (knownMoveNames.length >= 4) {
      setStep('forget');
    } else {
      // Can learn directly
      handleConfirmRelearn(moveName, null);
    }
  };

  const handleConfirmRelearn = (moveName, forgetMove) => {
    onRelearn(pokemon, moveName, forgetMove, RELEARN_COST);
  };

  if (availableMoves.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-indigo-500/30 rounded-2xl p-6 max-w-md w-full"
        >
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">Move Reminder</h2>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-200 text-sm">
              {pokemon.nickname || pokemon.species} hasn't forgotten any moves that can be relearned.
            </p>
          </div>

          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-indigo-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-indigo-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Move Reminder</h2>
              <p className="text-slate-400 text-sm">
                {pokemon.nickname || pokemon.species} - Level {pokemon.level}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="text-slate-300 text-sm">
            Cost per move: <span className="font-bold text-yellow-400">{RELEARN_COST} gold</span>
          </span>
          <span className="ml-auto text-slate-400 text-sm">
            Your gold: <span className={playerGold >= RELEARN_COST ? 'text-green-400' : 'text-red-400'}>
              {playerGold}
            </span>
          </span>
        </div>

        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <p className="text-slate-300 mb-4">
                Select a move to relearn:
              </p>
              
              <div className="space-y-2">
                {availableMoves.map((moveName) => {
                  const moveData = getMoveData(moveName);
                  if (!moveData) return null;

                  const typeColors = {
                    Fire: 'from-red-500/20 to-orange-500/20 border-red-500/30',
                    Water: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
                    Grass: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
                    Electric: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
                    Normal: 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
                    Fighting: 'from-orange-700/20 to-red-700/20 border-orange-700/30',
                    Flying: 'from-sky-500/20 to-indigo-500/20 border-sky-500/30',
                    Poison: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
                    Ground: 'from-yellow-700/20 to-orange-700/20 border-yellow-700/30',
                    Rock: 'from-amber-700/20 to-stone-700/20 border-amber-700/30',
                    Bug: 'from-lime-500/20 to-green-500/20 border-lime-500/30',
                    Ghost: 'from-purple-700/20 to-indigo-700/20 border-purple-700/30',
                    Steel: 'from-slate-500/20 to-gray-500/20 border-slate-500/30',
                    Psychic: 'from-pink-500/20 to-purple-500/20 border-pink-500/30',
                    Ice: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
                    Dragon: 'from-indigo-700/20 to-purple-700/20 border-indigo-700/30',
                    Dark: 'from-gray-800/20 to-slate-900/20 border-gray-800/30',
                  };

                  return (
                    <motion.button
                      key={moveName}
                      onClick={() => handleSelectMove(moveName)}
                      disabled={!canAfford}
                      className={`w-full p-4 bg-gradient-to-r ${typeColors[moveData.type] || typeColors.Normal} 
                        rounded-xl border-2 text-left transition-all
                        ${canAfford ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                      whileHover={canAfford ? { y: -2 } : {}}
                      whileTap={canAfford ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-bold text-lg">{moveName}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {moveData.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {moveData.category}
                            </Badge>
                            {moveData.signature && (
                              <Badge className="text-xs bg-purple-500/20 text-purple-300">
                                Signature
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          {moveData.power > 0 && (
                            <div className="text-red-300">PWR: {moveData.power}</div>
                          )}
                          {moveData.accuracy && (
                            <div className="text-blue-300">ACC: {moveData.accuracy}</div>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm">{moveData.description}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 'forget' && (
            <motion.div
              key="forget"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <p className="text-slate-300 mb-4">
                {pokemon.nickname || pokemon.species} already knows 4 moves. Which move should be forgotten?
              </p>
              
              <div className="space-y-2 mb-4">
                {knownMoveNames.map((moveName) => {
                  const moveData = getMoveData(moveName);
                  if (!moveData) return null;

                  return (
                    <motion.button
                      key={moveName}
                      onClick={() => setMoveToForget(moveName)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all
                        ${moveToForget === moveName 
                          ? 'bg-red-500/20 border-red-500' 
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                        }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-semibold">{moveName}</h4>
                          <p className="text-slate-400 text-sm">{moveData.type} - {moveData.category}</p>
                        </div>
                        {moveToForget === moveName && (
                          <Badge className="bg-red-500 text-white">Forget</Badge>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('select');
                    setSelectedMove(null);
                    setMoveToForget(null);
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => handleConfirmRelearn(selectedMove, moveToForget)}
                  disabled={!moveToForget}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  Confirm
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!canAfford && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm text-center">
              Not enough gold to relearn moves
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}