import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, AlertCircle, Info } from 'lucide-react';

const typeColors = {
  Normal: 'bg-gray-500',
  Fire: 'bg-orange-500',
  Water: 'bg-blue-500',
  Electric: 'bg-yellow-500',
  Grass: 'bg-green-500',
  Ice: 'bg-cyan-400',
  Fighting: 'bg-red-600',
  Poison: 'bg-purple-600',
  Ground: 'bg-amber-700',
  Flying: 'bg-indigo-400',
  Psychic: 'bg-pink-500',
  Bug: 'bg-lime-600',
  Rock: 'bg-stone-600',
  Ghost: 'bg-purple-800',
  Dragon: 'bg-indigo-700',
  Dark: 'bg-gray-800',
  Steel: 'bg-slate-500',
  Fairy: 'bg-pink-400',
};

export default function MoveLearnModal({ 
  pokemon, 
  newMoves, 
  currentMoves = [],
  onLearn, 
  onCancel 
}) {
  const [selectedMove, setSelectedMove] = useState(null);
  const [replacingMove, setReplacingMove] = useState(null);

  const handleLearn = (newMove) => {
    if (currentMoves.length < 4) {
      // Room to learn without replacing
      onLearn(newMove, null);
    } else {
      // Need to select which move to replace
      setSelectedMove(newMove);
    }
  };

  const handleReplace = (oldMove) => {
    if (selectedMove) {
      onLearn(selectedMove, oldMove);
      setSelectedMove(null);
      setReplacingMove(null);
    }
  };

  const handleSkip = () => {
    setSelectedMove(null);
    setReplacingMove(null);
    onCancel();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={selectedMove ? null : handleSkip}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border-b border-indigo-500/30 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">
                    {selectedMove ? 'Replace a Move?' : 'New Move!'}
                  </h2>
                </div>
                <p className="text-slate-300">
                  {selectedMove 
                    ? `${pokemon.nickname || pokemon.species} wants to learn ${selectedMove}, but already knows 4 moves.`
                    : `${pokemon.nickname || pokemon.species} wants to learn new moves!`
                  }
                </p>
              </div>
              {!selectedMove && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-4">
            {!selectedMove ? (
              // Show new moves to learn
              <>
                <div className="space-y-3">
                  {newMoves.map((moveName, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass rounded-xl p-4 border-2 border-indigo-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-white text-lg">{moveName}</h3>
                            <Badge className="bg-indigo-500/20 text-indigo-300 text-xs">
                              NEW
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">
                            A powerful move learned at level {pokemon.level}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleLearn(moveName)}
                          className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
                        >
                          Learn
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-200">
                    {currentMoves.length < 4 
                      ? `You can learn these moves without replacing any existing ones.`
                      : `You'll need to choose which move to replace since your Pokémon already knows 4 moves.`
                    }
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="w-full border-slate-600 hover:bg-slate-800"
                >
                  Skip All
                </Button>
              </>
            ) : (
              // Show move replacement UI
              <>
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-200">
                    Select a move to forget and replace with <strong>{selectedMove}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Current Moves</h4>
                  {currentMoves.map((moveName, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleReplace(moveName)}
                      className="w-full glass rounded-lg p-4 border-2 border-slate-700 hover:border-red-500/50 transition-colors text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-red-300 transition-colors">
                            {moveName}
                          </h4>
                          <p className="text-xs text-slate-400">Tap to forget this move</p>
                        </div>
                        <X className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="flex-1 border-slate-600 hover:bg-slate-800"
                  >
                    Don't Learn
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}