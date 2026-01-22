import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';

export default function EvolutionModal({ pokemon, evolvesInto, onComplete, onCancel }) {
  const [stage, setStage] = useState('confirm'); // 'confirm', 'evolving', 'complete'
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    if (stage === 'evolving') {
      // Show evolution animation
      const timer1 = setTimeout(() => {
        setShowNewForm(true);
      }, 2000);
      
      const timer2 = setTimeout(() => {
        setStage('complete');
      }, 3500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [stage]);

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
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
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

              <ArrowRight className="w-6 h-6 text-indigo-400" />

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center mb-2">
                  <Sparkles className="w-8 h-8 text-white" />
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
            className="text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
                opacity: showNewForm ? [1, 0] : 1
              }}
              transition={{
                duration: 1,
                repeat: showNewForm ? 0 : Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center relative"
            >
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-white/30"
              />
              {!showNewForm ? (
                pokemon.spriteUrl ? (
                  <img src={pokemon.spriteUrl} alt={pokemon.species} className="w-20 h-20" />
                ) : (
                  <Zap className="w-16 h-16 text-white" />
                )
              ) : (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Sparkles className="w-20 h-20 text-white" />
                </motion.div>
              )}
            </motion.div>

            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl font-bold text-white"
            >
              {!showNewForm ? 'Evolving...' : `${evolvesInto}!`}
            </motion.p>
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Congratulations!
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-slate-300"
              >
                Your {pokemon.nickname || pokemon.species} evolved into <strong className="text-indigo-400">{evolvesInto}</strong>!
              </motion.p>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
              >
                Continue
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}