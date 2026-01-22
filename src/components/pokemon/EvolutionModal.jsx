import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, ArrowRight, TrendingUp } from 'lucide-react';
import { getEvolvedStats } from './evolutionData';
import { POKEMON_SPRITES } from './baseStats';

export default function EvolutionModal({ pokemon, evolvesInto, newStats, oldStats, onComplete, onCancel }) {
  const [stage, setStage] = useState('confirm'); // 'confirm', 'evolving', 'stats', 'complete'
  const [showNewForm, setShowNewForm] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (stage === 'evolving') {
      // Show evolution animation
      setShowSparkles(true);
      
      const timer1 = setTimeout(() => {
        setShowNewForm(true);
      }, 2000);
      
      const timer2 = setTimeout(() => {
        setStage('stats');
      }, 3500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [stage]);
  
  const evolvedSprite = POKEMON_SPRITES[evolvesInto] || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Math.floor(Math.random() * 150) + 1}.png`;
  
  const statDifferences = newStats && oldStats ? {
    hp: newStats.maxHp - oldStats.maxHp,
    atk: newStats.atk - oldStats.atk,
    def: newStats.def - oldStats.def,
    spAtk: newStats.spAtk - oldStats.spAtk,
    spDef: newStats.spDef - oldStats.spDef,
    spd: newStats.spd - oldStats.spd
  } : null;

  const handleStartEvolution = () => {
    setStage('evolving');
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        {/* Animated sparkle particles */}
        {showSparkles && (
          <>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: '50vw', 
                  y: '50vh', 
                  scale: 0,
                  opacity: 1
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{ 
                  boxShadow: '0 0 10px rgba(250, 204, 21, 0.8)'
                }}
              />
            ))}
          </>
        )}
        {stage === 'confirm' && (
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass rounded-2xl max-w-md w-full p-8"
          >
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">What?</h2>
              <p className="text-slate-300">
                {pokemon.nickname || pokemon.species} is evolving!
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-2">
                  {pokemon.spriteUrl ? (
                    <img src={pokemon.spriteUrl} alt={pokemon.species} className="w-12 h-12" />
                  ) : (
                    <span className="text-2xl">?</span>
                  )}
                </div>
                <p className="text-sm text-slate-400">{pokemon.species}</p>
              </div>

              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6 text-indigo-400" />
              </motion.div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center mb-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <p className="text-sm text-white font-semibold">{evolvesInto}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 border-slate-600 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartEvolution}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Evolve
              </Button>
            </div>
          </motion.div>
        )}

        {stage === 'evolving' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center relative"
          >
            {/* Glowing aura background */}
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 mx-auto w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400 via-indigo-500 to-cyan-500 blur-3xl"
            />
            
            <motion.div
              animate={{
                scale: showNewForm ? [1, 1.3, 1] : [1, 1.1, 1],
                rotate: showNewForm ? [0, 360] : [0, 0]
              }}
              transition={{
                scale: { duration: 1, repeat: showNewForm ? 0 : Infinity, ease: "easeInOut" },
                rotate: { duration: 0.5 }
              }}
              className="relative w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-2xl"
            >
              {/* White flash effect */}
              {showNewForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 rounded-full bg-white z-10"
                />
              )}
              
              <motion.div
                animate={{ 
                  opacity: [0.4, 1, 0.4],
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent"
              />
              
              <AnimatePresence mode="wait">
                {!showNewForm ? (
                  <motion.div
                    key="old"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-20"
                  >
                    {pokemon.spriteUrl ? (
                      <img src={pokemon.spriteUrl} alt={pokemon.species} className="w-24 h-24" />
                    ) : (
                      <Zap className="w-20 h-20 text-white" />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="new"
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    className="relative z-20"
                  >
                    <img src={evolvedSprite} alt={evolvesInto} className="w-24 h-24" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-3xl font-bold text-white relative z-10"
            >
              {!showNewForm ? 'Evolving...' : (
                <motion.span
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent"
                >
                  {evolvesInto}!
                </motion.span>
              )}
            </motion.p>
          </motion.div>
        )}
        
        {stage === 'stats' && statDifferences && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl max-w-lg w-full p-8"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", stiffness: 150 }}
                className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg"
              >
                <TrendingUp className="w-12 h-12 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Stats Increased!</h2>
              <p className="text-slate-300 text-sm">
                {pokemon.nickname || pokemon.species} → {evolvesInto}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {Object.entries({
                HP: { old: oldStats.maxHp, new: newStats.maxHp, diff: statDifferences.hp },
                ATK: { old: oldStats.atk, new: newStats.atk, diff: statDifferences.atk },
                DEF: { old: oldStats.def, new: newStats.def, diff: statDifferences.def },
                SP.ATK: { old: oldStats.spAtk, new: newStats.spAtk, diff: statDifferences.spAtk },
                SP.DEF: { old: oldStats.spDef, new: newStats.spDef, diff: statDifferences.spDef },
                SPD: { old: oldStats.spd, new: newStats.spd, diff: statDifferences.spd }
              }).map(([stat, values], idx) => (
                <motion.div
                  key={stat}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                >
                  <span className="text-sm font-semibold text-slate-300 w-20">{stat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{values.old}</span>
                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                    <span className="text-white font-bold">{values.new}</span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 + 0.2 }}
                      className="text-green-400 text-sm font-semibold ml-2"
                    >
                      +{values.diff}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={() => setStage('complete')}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
            >
              Continue
            </Button>
          </motion.div>
        )}

        {stage === 'complete' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl max-w-md w-full p-8"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0, y: -50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative w-32 h-32 mx-auto mb-4"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 blur-xl"
                />
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl">
                  <img src={evolvedSprite} alt={evolvesInto} className="w-20 h-20" />
                </div>
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent mb-3"
              >
                Congratulations!
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-slate-300 leading-relaxed"
              >
                Your <strong className="text-white">{pokemon.nickname || pokemon.species}</strong> evolved into <strong className="text-indigo-400 text-xl">{evolvesInto}</strong>!
              </motion.p>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-lg py-6 shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Continue
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}