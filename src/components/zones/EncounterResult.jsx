import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Package, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function EncounterResult({ result, onContinue }) {
  const typeIcons = {
    pokemon: '🔵',
    material: '🟢',
    poi: '🟡',
    special: '🔴',
  };

  const typeColors = {
    pokemon: 'from-blue-500 to-cyan-500',
    material: 'from-green-500 to-emerald-500',
    poi: 'from-yellow-500 to-orange-500',
    special: 'from-red-500 to-pink-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-8"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-6xl mb-4"
        >
          {typeIcons[result.type]}
        </motion.div>

        <h3 className="text-2xl font-bold text-white mb-2">{result.title}</h3>
        <p className="text-slate-400 mb-6">{result.description}</p>

        {result.firstDiscovery && (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            First Discovery!
          </Badge>
        )}

        {/* Rewards */}
        <div className="glass rounded-lg p-4 mb-6">
          {result.pokemon && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Pokémon Encountered</span>
              <span className="text-white font-semibold">{result.pokemon}</span>
            </div>
          )}
          {result.materials && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Materials Gathered</span>
              <span className="text-white font-semibold">{result.materials.join(', ')}</span>
            </div>
          )}
          {result.poi && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400">Location Found</span>
              <span className="text-white font-semibold">{result.poi}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-slate-700">
            <span className="text-cyan-400">Discovery</span>
            <span className="text-cyan-300 font-bold">+{result.progressGained}%</span>
          </div>
        </div>

        <Button
          onClick={onContinue}
          className={`w-full bg-gradient-to-r ${typeColors[result.type]}`}
        >
          Continue Exploring
        </Button>
      </div>
    </motion.div>
  );
}