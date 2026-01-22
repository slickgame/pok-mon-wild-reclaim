import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, CheckCircle, AlertCircle, Coins, Package } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PokemonCard from '@/components/pokemon/PokemonCard';

export default function MoveTutorModal({ tutor, move, onClose }) {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [teaching, setTeaching] = useState(false);
  const queryClient = useQueryClient();

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: playerPokemon = [] } = useQuery({
    queryKey: ['playerPokemon'],
    queryFn: async () => {
      const pokemon = await base44.entities.Pokemon.filter({ isInTeam: true });
      return pokemon;
    }
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const items = await base44.entities.Item.list();
      return items;
    }
  });

  // Filter eligible Pokémon
  const eligiblePokemon = playerPokemon.filter(p => 
    move.teachableTo.includes(p.species)
  );

  // Check if player meets requirements
  const playerTrust = player?.trustLevels?.[tutor.npcId] || 0;
  const hasRequiredTrust = playerTrust >= move.trustRequired;
  const hasGold = (player?.gold || 0) >= move.cost.gold;
  
  // Check materials
  const hasMaterials = move.cost.materials.every(req => {
    const available = inventory
      .filter(item => item.name === req.name)
      .reduce((sum, item) => sum + (item.quantity || 1), 0);
    return available >= req.quantity;
  });

  const canAfford = hasGold && hasMaterials && hasRequiredTrust;

  const handleTeach = async () => {
    if (!selectedPokemon || !canAfford) return;
    
    setTeaching(true);
    
    try {
      // Get current moves
      const currentMoves = selectedPokemon.abilities || [];
      
      // Check if already knows the move
      if (currentMoves.includes(move.name)) {
        alert(`${selectedPokemon.nickname || selectedPokemon.species} already knows ${move.name}!`);
        setTeaching(false);
        return;
      }
      
      // If at move limit, need to replace
      if (currentMoves.length >= 4) {
        alert(`${selectedPokemon.nickname || selectedPokemon.species} already knows 4 moves. This feature will be enhanced to let you choose which move to replace.`);
        setTeaching(false);
        return;
      }
      
      // Deduct gold
      await base44.entities.Player.update(player.id, {
        gold: player.gold - move.cost.gold
      });
      
      // Consume materials
      for (const req of move.cost.materials) {
        let remaining = req.quantity;
        const items = inventory.filter(item => item.name === req.name);
        
        for (const item of items) {
          if (remaining <= 0) break;
          
          const toRemove = Math.min(item.quantity || 1, remaining);
          remaining -= toRemove;
          
          if (toRemove >= (item.quantity || 1)) {
            await base44.entities.Item.delete(item.id);
          } else {
            await base44.entities.Item.update(item.id, {
              quantity: item.quantity - toRemove
            });
          }
        }
      }
      
      // Add the move
      const updatedMoves = [...currentMoves, move.name];
      await base44.entities.Pokemon.update(selectedPokemon.id, {
        abilities: updatedMoves
      });
      
      queryClient.invalidateQueries({ queryKey: ['player'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
      
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
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/30 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  <h2 className="text-2xl font-bold text-white">Learn from {tutor.npcName}</h2>
                </div>
                <p className="text-slate-300">{tutor.description}</p>
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
            {/* Move Details */}
            <div className="glass rounded-xl p-4 mb-6 border-2 border-amber-500/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">{move.name}</h3>
                  <p className="text-sm text-slate-400">{move.description}</p>
                </div>
              </div>
              
              {/* Cost */}
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-700">
                <div className={`flex items-center gap-2 ${hasGold ? 'text-emerald-400' : 'text-red-400'}`}>
                  <Coins className="w-4 h-4" />
                  <span className="text-sm font-medium">{move.cost.gold} Gold</span>
                  {!hasGold && <X className="w-3 h-3" />}
                </div>
                
                {move.cost.materials.map((req, idx) => {
                  const available = inventory
                    .filter(item => item.name === req.name)
                    .reduce((sum, item) => sum + (item.quantity || 1), 0);
                  const hasEnough = available >= req.quantity;
                  
                  return (
                    <div key={idx} className={`flex items-center gap-2 ${hasEnough ? 'text-emerald-400' : 'text-red-400'}`}>
                      <Package className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {req.name} ({available}/{req.quantity})
                      </span>
                      {!hasEnough && <X className="w-3 h-3" />}
                    </div>
                  );
                })}
                
                {!hasRequiredTrust && (
                  <Badge className="bg-red-500/20 text-red-300">
                    Requires Trust Level {move.trustRequired}
                  </Badge>
                )}
              </div>
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
                      className={`cursor-pointer rounded-xl transition-all relative ${
                        selectedPokemon?.id === pokemon.id
                          ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-900'
                          : ''
                      }`}
                    >
                      <PokemonCard pokemon={pokemon} compact />
                      {selectedPokemon?.id === pokemon.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-6 h-6 text-amber-400" />
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
                disabled={!selectedPokemon || !canAfford || teaching}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {teaching ? 'Teaching...' : `Teach ${move.name}`}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}