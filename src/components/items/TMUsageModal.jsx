import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { canLearnTM } from '@/components/pokemon/tmCompatibility';
import PokemonCard from '@/components/pokemon/PokemonCard';

export default function TMUsageModal({ tmItem, onUse, onClose }) {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [teaching, setTeaching] = useState(false);

  const { data: playerPokemon = [] } = useQuery({
    queryKey: ['playerPokemon'],
    queryFn: async () => {
      const pokemon = await base44.entities.Pokemon.filter({ isInTeam: true });
      return pokemon;
    }
  });

  // Extract move name from TM item (e.g., "TM01: Flamethrower" -> "Flamethrower")
  const moveName = tmItem.name.includes(':') 
    ? tmItem.name.split(':')[1].trim() 
    : tmItem.name.replace(/TM\d+\s*/i, '').trim();

  // Filter eligible Pokémon
  const eligiblePokemon = playerPokemon.filter(p => canLearnTM(p.species, moveName));

  const handleTeach = async () => {
    if (!selectedPokemon) return;
    
    setTeaching(true);
    
    try {
      // Get current moves
      const currentMoves = selectedPokemon.abilities || [];
      
      // Check if already knows the move
      if (currentMoves.includes(moveName)) {
        alert(`${selectedPokemon.nickname || selectedPokemon.species} already knows ${moveName}!`);
        setTeaching(false);
        return;
      }
      
      // If at move limit, need to replace
      if (currentMoves.length >= 4) {
        // For simplicity, show alert - in full version would show move replacement UI
        alert(`${selectedPokemon.nickname || selectedPokemon.species} already knows 4 moves. This feature will be enhanced to let you choose which move to replace.`);
        setTeaching(false);
        return;
      }
      
      // Add the move
      const updatedMoves = [...currentMoves, moveName];
      await base44.entities.Pokemon.update(selectedPokemon.id, {
        abilities: updatedMoves
      });
      
      // Consume the TM
      await onUse(tmItem);
      
      setTeaching(false);
      onClose();
    } catch (error) {
      console.error('Failed to teach move:', error);
      setTeaching(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-b border-purple-500/30 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Use {tmItem.name}</h2>
                </div>
                <p className="text-slate-300">
                  Teach <strong>{moveName}</strong> to one of your Pokémon
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-6">
            {/* Move Description */}
            <div className="glass rounded-xl p-4 mb-6 border-2 border-purple-500/30">
              <h3 className="font-semibold text-white mb-2">{moveName}</h3>
              <p className="text-sm text-slate-400">{tmItem.description || 'A powerful move that can be taught via TM.'}</p>
            </div>

            {/* Eligible Pokémon */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Compatible Pokémon ({eligiblePokemon.length})
              </h3>
              
              {eligiblePokemon.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eligiblePokemon.map((pokemon) => (
                    <motion.div
                      key={pokemon.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPokemon(pokemon)}
                      className={`cursor-pointer rounded-xl transition-all ${
                        selectedPokemon?.id === pokemon.id
                          ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900'
                          : ''
                      }`}
                    >
                      <PokemonCard pokemon={pokemon} compact />
                      {selectedPokemon?.id === pokemon.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-6 h-6 text-purple-400" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-xl p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400">
                    None of your team Pokémon can learn this move
                  </p>
                </div>
              )}
            </div>

            {/* Incompatible Pokémon */}
            {playerPokemon.length > eligiblePokemon.length && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Incompatible Pokémon ({playerPokemon.length - eligiblePokemon.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
                  {playerPokemon
                    .filter(p => !eligiblePokemon.includes(p))
                    .map((pokemon) => (
                      <div key={pokemon.id} className="pointer-events-none">
                        <PokemonCard pokemon={pokemon} compact />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-slate-600 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTeach}
                disabled={!selectedPokemon || teaching}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              >
                {teaching ? 'Teaching...' : `Teach ${moveName}`}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}