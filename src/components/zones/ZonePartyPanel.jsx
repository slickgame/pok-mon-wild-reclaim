import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Users, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PartyPokemonCard from '@/components/party/PartyPokemonCard';
import PokemonSummary from '@/components/pokemon/PokemonSummary';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function ZonePartyPanel({ player, allPokemon }) {
  const queryClient = useQueryClient();
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  const party = useMemo(() => {
    const teamPokemon = allPokemon.filter(p => p.isInTeam && !p.isWildInstance);
    if (!player?.partyOrder?.length) return teamPokemon;
    return player.partyOrder.map(id => teamPokemon.find(p => p.id === id)).filter(Boolean);
  }, [allPokemon, player]);

  const saveOrder = async (ordered) => {
    if (!player?.id) return;
    const partyOrder = ordered.map(p => p.id);
    await base44.entities.Player.update(player.id, { partyOrder });
    queryClient.invalidateQueries({ queryKey: ['player'] });
    queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    const reordered = Array.from(party);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    saveOrder(reordered);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const reordered = Array.from(party);
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    saveOrder(reordered);
  };

  const moveDown = (index) => {
    if (index === party.length - 1) return;
    const reordered = Array.from(party);
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    saveOrder(reordered);
  };

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-white">Active Party</h3>
        <Badge className="bg-indigo-600">{party.length}/6</Badge>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="zone-party" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 min-h-[160px] p-3 rounded-xl border-2 border-dashed transition-all ${
                snapshot.isDraggingOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/30'
              }`}
            >
              {party.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-10 text-slate-500 text-sm">
                  No Pokémon in party
                </div>
              )}
              {party.map((pokemon, index) => (
                <Draggable key={pokemon.id} draggableId={pokemon.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="relative"
                    >
                      <div onClick={() => setSelectedPokemon(pokemon)}>
                        <PartyPokemonCard
                          pokemon={pokemon}
                          isDragging={snapshot.isDragging}
                          position={index + 1}
                        />
                      </div>
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-7 w-7 bg-indigo-600 hover:bg-indigo-700 shadow"
                          onClick={(e) => { e.stopPropagation(); moveUp(index); }}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-7 w-7 bg-indigo-600 hover:bg-indigo-700 shadow"
                          onClick={(e) => { e.stopPropagation(); moveDown(index); }}
                          disabled={index === party.length - 1}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={!!selectedPokemon} onOpenChange={() => setSelectedPokemon(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPokemon && (
            <PokemonSummary
              pokemon={selectedPokemon}
              onClose={() => setSelectedPokemon(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}