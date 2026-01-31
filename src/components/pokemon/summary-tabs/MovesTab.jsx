import React, { useState } from 'react';
import { Zap, Brain, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MoveReminderModal from '@/components/moves/MoveReminderModal';
import { getMoveData } from '@/components/utils/getMoveData';

const tagStyles = {
  Drain: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
  Spore: 'bg-lime-500/20 text-lime-200 border border-lime-400/30',
  Powder: 'bg-lime-400/20 text-lime-200 border border-lime-300/30',
  Healing: 'bg-green-500/20 text-green-200 border border-green-400/30',
  Status: 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30',
  Terrain: 'bg-teal-500/20 text-teal-200 border border-teal-400/30'
};

const getTagClass = (tag) => tagStyles[tag] || 'bg-slate-700/50 text-slate-200 border border-slate-500/30';

export default function MovesTab({ pokemon }) {
  const [showMoveReminder, setShowMoveReminder] = useState(false);
  const [selectedMove, setSelectedMove] = useState(null);
  const queryClient = useQueryClient();

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (moveName) => {
      const updatedMoves = (pokemon.abilities || []).filter((m) => m !== moveName);
      await base44.entities.Pokemon.update(pokemon.id, {
        abilities: updatedMoves
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pokemon'] });
    }
  });

  const handleRelearn = async (pokemon, moveName, forgetMove, cost) => {
    try {
      if (player && player.gold >= cost) {
        await base44.entities.Player.update(player.id, {
          gold: player.gold - cost
        });
      }

      let updatedMoves = [...(pokemon.abilities || [])];
      if (forgetMove) {
        const index = updatedMoves.indexOf(forgetMove);
        if (index !== -1) {
          updatedMoves[index] = moveName;
        }
      } else {
        updatedMoves.push(moveName);
      }

      await base44.entities.Pokemon.update(pokemon.id, {
        abilities: updatedMoves
      });

      queryClient.invalidateQueries({ queryKey: ['pokemon'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
      setShowMoveReminder(false);
    } catch (err) {
      console.error('Failed to relearn move:', err);
    }
  };

  const handleForgetMove = (moveName) => {
    if (confirm(`Forget ${moveName}? You can relearn it later for gold.`)) {
      deleteMutation.mutate(moveName);
    }
  };

  if (!pokemon.abilities || pokemon.abilities.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <Zap className="w-16 h-16 mx-auto mb-4 text-slate-600" />
        <h3 className="text-lg font-semibold text-white mb-2">No Moves</h3>
        <p className="text-slate-400 mb-4">This Pokémon hasn't learned any moves yet.</p>
        <Button onClick={() => setShowMoveReminder(true)}>
          <Brain className="w-4 h-4 mr-2" />
          Learn Moves
        </Button>
        {showMoveReminder &&
        <MoveReminderModal
          pokemon={pokemon}
          playerGold={player?.gold || 0}
          onClose={() => setShowMoveReminder(false)}
          onRelearn={handleRelearn} />

        }
      </div>);

  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Known Moves ({pokemon.abilities.length}/4)</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowMoveReminder(true)}>

          <Brain className="w-3 h-3 mr-1" />
          Relearn
        </Button>
      </div>

      <div className="space-y-3">
        {pokemon.abilities.map((moveName) => {
          const moveData = getMoveData(moveName, pokemon);

          return (
            <div key={moveName} className="glass rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{moveName}</h4>
                  {moveData &&
                  <div className="text-slate-50 mt-1 rounded flex gap-2 flex-wrap">
                      <Badge className="text-xs bg-slate-700">
                        {moveData.type}
                      </Badge>
                      <Badge className="text-xs bg-slate-700">
                        {moveData.category}
                      </Badge>
                      {moveData.power &&
                    <Badge variant="outline" className="text-slate-50 px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          Power: {moveData.power}
                        </Badge>
                    }
                      {moveData.accuracy &&
                    <Badge variant="outline" className="text-slate-50 px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          Acc: {moveData.accuracy}%
                        </Badge>
                    }
                      {moveData.pp &&
                    <Badge variant="outline" className="text-slate-50 px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          PP: {moveData.pp}
                        </Badge>
                    }
                    </div>
                  }
                  {moveData?.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {moveData.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[0.65rem] px-2 py-0.5 rounded-full uppercase tracking-wide ${getTagClass(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleForgetMove(moveName)}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors">

                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
              {moveData?.description &&
              <p className="text-xs text-slate-400 mt-2">{moveData.description}</p>
              }
              {moveData?.effect &&
              <div className="mt-2 flex items-start gap-1">
                  <Info className="w-3 h-3 text-indigo-400 mt-0.5" />
                  <p className="text-xs text-indigo-300">
                    {(() => {
                      if (typeof moveData.effect === 'string') {
                        return moveData.effect;
                      } else if (typeof moveData.effect === 'object' && moveData.effect !== null) {
                        if (moveData.effect.targetStatChange) {
                          const changes = Object.entries(moveData.effect.targetStatChange)
                            .map(([stat, stages]) => {
                              const direction = stages > 0 ? 'raises' : 'lowers';
                              const absStages = Math.abs(stages);
                              return `${direction} target's ${stat} by ${absStages} stage${absStages > 1 ? 's' : ''}`;
                            });
                          return changes.join(', ');
                        }
                        if (moveData.effect.stealBerry) {
                          return 'steals and consumes target\'s Berry if holding one';
                        }
                        return JSON.stringify(moveData.effect);
                      }
                      return '';
                    })()}
                  </p>
                </div>
              }
            </div>);

        })}
      </div>

      {showMoveReminder &&
      <MoveReminderModal
        pokemon={pokemon}
        playerGold={player?.gold || 0}
        onClose={() => setShowMoveReminder(false)}
        onRelearn={handleRelearn} />

      }
    </div>);

}
