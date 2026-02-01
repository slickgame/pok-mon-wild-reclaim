import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Brain, Microscope, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PokemonSelector from '@/components/pokemon/PokemonSelector';
import { getMovesLearnableUpToLevel } from '@/components/pokemon/levelUpLearnsets';
import { getMoveData } from '@/components/utils/getMoveData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import MoveLearnModal from '@/components/battle/MoveLearnModal';

export default function MoveTutorTab() {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pendingMove, setPendingMove] = useState(null);
  const queryClient = useQueryClient();

  const { data: pokemon = [], isLoading } = useQuery({
    queryKey: ['playerPokemon'],
    queryFn: async () => {
      const team = await base44.entities.Pokemon.filter({ isInTeam: true });
      return team;
    }
  });

  const knownMoves = selectedPokemon?.abilities || [];

  const relearnableMoves = useMemo(() => {
    if (!selectedPokemon) return [];
    const learnable = getMovesLearnableUpToLevel(selectedPokemon.species, selectedPokemon.level);
    const uniqueMoves = Array.from(new Set(learnable));
    return uniqueMoves.filter((move) => !knownMoves.includes(move));
  }, [selectedPokemon, knownMoves]);

  const handleRelearn = async (moveName, forgetMove) => {
    if (!selectedPokemon) return;

    const updatedMoves = [...knownMoves];
    if (forgetMove) {
      const index = updatedMoves.indexOf(forgetMove);
      if (index !== -1) {
        updatedMoves[index] = moveName;
      }
    } else {
      updatedMoves.push(moveName);
    }

    await base44.entities.Pokemon.update(selectedPokemon.id, {
      abilities: updatedMoves,
    });

    setSelectedPokemon({
      ...selectedPokemon,
      abilities: updatedMoves,
    });

    queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
    queryClient.invalidateQueries({ queryKey: ['pokemon'] });

    const displayName = selectedPokemon.nickname || selectedPokemon.species;
    toast({
      title: 'Move Recovery Complete',
      description: forgetMove
        ? `${displayName} replaced ${forgetMove} with ${moveName} in the Memory Matrix.`
        : `${displayName} successfully recalled ${moveName}.`,
    });

    setPendingMove(null);
  };

  const handleRequestRelearn = (moveName) => {
    if (!selectedPokemon) return;

    if (knownMoves.length < 4) {
      handleRelearn(moveName, null);
      return;
    }

    setPendingMove(moveName);
  };

  const handleCancel = () => {
    if (pendingMove && selectedPokemon) {
      const displayName = selectedPokemon.nickname || selectedPokemon.species;
      toast({
        title: 'Recall Protocol Paused',
        description: `${displayName} declined the ${pendingMove} recovery sequence.`,
      });
    }
    setPendingMove(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6 border border-emerald-500/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Microscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Move Recovery Lab</h2>
            <p className="text-slate-300 mt-1">
              Using advanced memory recall techniques, I can help your Pokémon remember powerful moves they’ve forgotten.
            </p>
          </div>
        </div>
      </div>

      <PokemonSelector
        pokemon={pokemon}
        isLoading={isLoading}
        selectedPokemon={selectedPokemon}
        onSelect={setSelectedPokemon}
        title="Select a Pokémon to begin recovery."
      />

      {selectedPokemon && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {selectedPokemon.nickname || selectedPokemon.species}
              </h3>
              <p className="text-xs text-slate-400">
                Neural catalog: Level {selectedPokemon.level} learnset scan
              </p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300">
              Known Moves: {knownMoves.length}/4
            </Badge>
          </div>

          {relearnableMoves.length === 0 ? (
            <div className="glass rounded-xl p-6 text-center">
              <Brain className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-300">No additional moves detected in memory storage.</p>
              <p className="text-xs text-slate-500 mt-2">
                Increase level or record more data to unlock new recall pathways.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {relearnableMoves.map((moveName) => {
                const moveData = getMoveData(moveName, selectedPokemon);
                return (
                  <div key={moveName} className="glass rounded-xl p-4 border border-slate-700/60">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-semibold">{moveName}</h4>
                          {moveData?.type && (
                            <Badge className="text-xs bg-slate-700/60 text-slate-200">
                              {moveData.type}
                            </Badge>
                          )}
                          {moveData?.category && (
                            <Badge className="text-xs bg-slate-700/60 text-slate-200">
                              {moveData.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {moveData?.description || 'Recovered from archived learnset data.'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRequestRelearn(moveName)}
                        className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Relearn
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {pendingMove && selectedPokemon && (
        <MoveLearnModal
          pokemon={selectedPokemon}
          newMoves={[pendingMove]}
          currentMoves={knownMoves}
          onLearn={(moveName, oldMove) => handleRelearn(moveName, oldMove)}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
