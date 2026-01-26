import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const statNames = {
  hp: 'HP',
  atk: 'Attack',
  def: 'Defense',
  spAtk: 'Sp. Atk',
  spDef: 'Sp. Def',
  spd: 'Speed'
};

export default function ResearchSubmitModal({ quest, onClose, onSuccess }) {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const queryClient = useQueryClient();

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: allPokemon = [] } = useQuery({
    queryKey: ['allPokemon'],
    queryFn: () => base44.entities.Pokemon.list()
  });

  // Filter eligible Pokémon
  const eligiblePokemon = allPokemon.filter(p => {
    if (p.isWildInstance) return false;
    if (p.species !== quest.species) return false;
    
    if (quest.requirementType === 'nature') {
      return p.nature === quest.nature;
    } else {
      return p.ivs && p.ivs[quest.ivStat] >= quest.ivThreshold;
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (pokemon) => {
      const reward = quest.rewardBase * pokemon.level;
      
      // Award gold
      await base44.entities.Player.update(player.id, {
        gold: (player.gold || 0) + reward
      });

      // Release Pokémon
      await base44.entities.Pokemon.delete(pokemon.id);

      // Mark quest as complete
      await base44.entities.ResearchQuest.update(quest.id, {
        active: false
      });

      return reward;
    },
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: ['player'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
      queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
      onSuccess(reward);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              Submit Research Pokémon
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-400 mb-2">Quest Requirements:</p>
            <p className="text-lg font-bold text-white mb-2">{quest.species}</p>
            {quest.requirementType === 'nature' ? (
              <p className="text-indigo-300">Nature: {quest.nature}</p>
            ) : (
              <p className="text-purple-300">
                {statNames[quest.ivStat]} ≥ {quest.ivThreshold}
              </p>
            )}
          </div>

          {eligiblePokemon.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No Eligible Pokémon
              </h3>
              <p className="text-slate-400 text-sm">
                None of your Pokémon meet the research requirements.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <p className="text-sm text-slate-400">
                Select a Pokémon to submit ({eligiblePokemon.length} eligible):
              </p>
              {eligiblePokemon.map(pokemon => {
                const reward = quest.rewardBase * pokemon.level;
                return (
                  <motion.button
                    key={pokemon.id}
                    onClick={() => setSelectedPokemon(pokemon)}
                    whileHover={{ scale: 1.02 }}
                    className={`w-full glass rounded-lg p-4 text-left transition-all ${
                      selectedPokemon?.id === pokemon.id
                        ? 'ring-2 ring-indigo-500 bg-indigo-500/10'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">
                          {pokemon.nickname || pokemon.species}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-slate-700">Lv. {pokemon.level}</Badge>
                          {pokemon.nature && (
                            <Badge className="bg-indigo-700">{pokemon.nature}</Badge>
                          )}
                        </div>
                        {pokemon.ivs && (
                          <div className="text-xs text-slate-400 mt-2 space-y-1">
                            <div>IVs: HP {pokemon.ivs.hp} / Atk {pokemon.ivs.atk} / Def {pokemon.ivs.def} / SpA {pokemon.ivs.spAtk} / SpD {pokemon.ivs.spDef} / Spd {pokemon.ivs.spd}</div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Reward:</p>
                        <p className="text-yellow-400 font-bold flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {reward}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {selectedPokemon && (
            <div className="border-t border-slate-700 pt-6 space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm font-semibold mb-1">
                  ⚠️ Warning: This Pokémon will be RELEASED
                </p>
                <p className="text-red-300/70 text-xs">
                  Submitted Pokémon are permanently released to advance research. This cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => submitMutation.mutate(selectedPokemon)}
                  disabled={submitMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit & Release'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}