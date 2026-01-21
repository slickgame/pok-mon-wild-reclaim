import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Package, Sparkles, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CatchResult({ result, onContinue }) {
  if (!result.success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-xl p-8 text-center"
      >
        <XCircle className="w-16 h-16 mx-auto mb-4 text-slate-500" />
        <h3 className="text-xl font-bold text-white mb-2">Nothing This Time</h3>
        <p className="text-slate-400 mb-6">
          {result.reason === 'too_early' ? 'Too early! Wait for the splash.' : 'The fish got away...'}
        </p>
        <Button onClick={onContinue} variant="outline">
          Try Again
        </Button>
      </motion.div>
    );
  }

  const catchIcons = {
    Pokemon: '🐟',
    Treasure: '💎',
    Material: '🧪',
    Junk: '🗑️',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-6xl mb-4"
      >
        {catchIcons[result.catchType]}
      </motion.div>

      <h3 className="text-2xl font-bold text-white mb-2">
        {result.catchType === 'Pokemon' ? `Caught ${result.pokemonSpecies}!` :
         result.catchType === 'Treasure' ? 'Treasure Found!' :
         result.catchType === 'Material' ? 'Materials Gathered!' :
         'Caught Something...'}
      </h3>

      {result.wasRare && (
        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          Rare Encounter!
        </Badge>
      )}

      {/* Rewards */}
      <div className="glass rounded-lg p-4 mb-6 space-y-2">
        {result.pokemonSpecies && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Pokémon</span>
            <span className="text-white font-medium">{result.pokemonSpecies} (Lv. {result.pokemonLevel})</span>
          </div>
        )}
        {result.itemsReceived?.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-slate-400">Item</span>
            <span className="text-white font-medium">{item}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <span className="text-cyan-400">Angler XP</span>
          <span className="text-cyan-300 font-bold">+{result.xpGained}</span>
        </div>
      </div>

      <Button 
        onClick={onContinue}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
      >
        Continue Fishing
      </Button>
    </motion.div>
  );
}