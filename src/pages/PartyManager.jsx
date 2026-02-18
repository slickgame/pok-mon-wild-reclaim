import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Users, Box, Star, Info, ChevronUp, ChevronDown } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import PartyPokemonCard from '@/components/party/PartyPokemonCard';
import PokemonSummary from '@/components/pokemon/PokemonSummary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function PartyManager() {
  const [filter, setFilter] = useState('all');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const queryClient = useQueryClient();

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const { data: allPokemon = [], isLoading } = useQuery({
    queryKey: ['allPokemon'],
    queryFn: async () => {
      return await base44.entities.Pokemon.list();
    },
    staleTime: 15000,
    refetchOnWindowFocus: false
  });

  // Use player.partyOrder as single source of truth
  const party = useMemo(() => {
    const teamPokemon = allPokemon.filter(p => p.isInTeam && !p.isWildInstance);
    
    if (!player?.partyOrder?.length) {
      return teamPokemon;
    }

    return player.partyOrder
      .map(id => teamPokemon.find(p => p.id === id))
      .filter(Boolean);
  }, [allPokemon, player]);

  const storagePokemon = allPokemon.filter(p => !p.isInTeam && !p.isWildInstance);

  const moveMutation = useMutation({
    mutationFn: async ({ pokemonId, toParty, atIndex }) => {
      await base44.entities.Pokemon.update(pokemonId, { isInTeam: toParty });
      
      // Update party order when moving to party
      if (toParty && player) {
        const players = await base44.entities.Player.list();
        if (players[0]) {
          const currentOrder = players[0].partyOrder || [];
          // Remove from current position if it exists to prevent duplication
          const newOrder = currentOrder.filter(id => id !== pokemonId);
          
          // Insert at specific position or append
          if (atIndex !== undefined) {
            newOrder.splice(atIndex, 0, pokemonId);
          } else {
            newOrder.push(pokemonId);
          }
          
          await base44.entities.Player.update(players[0].id, { partyOrder: newOrder });
        }
      }
      
      // Remove from party order when moving to storage
      if (!toParty && player) {
        const players = await base44.entities.Player.list();
        if (players[0]) {
          const currentOrder = players[0].partyOrder || [];
          const newOrder = currentOrder.filter(id => id !== pokemonId);
          await base44.entities.Player.update(players[0].id, { partyOrder: newOrder });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
      queryClient.invalidateQueries({ queryKey: ['pokemon'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
    }
  });

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const pokemon = allPokemon.find(p => p.id === draggableId);
    if (!pokemon) return;

    // Moving to party
    if (destination.droppableId === 'party' && source.droppableId === 'storage') {
      if (party.length >= 6) {
        alert('Party is full! Maximum 6 Pokémon allowed.');
        return;
      }
      moveMutation.mutate({ pokemonId: pokemon.id, toParty: true, atIndex: destination.index });
    }

    // Moving to storage
    if (destination.droppableId === 'storage' && source.droppableId === 'party') {
      if (party.length <= 1) {
        alert('You must keep at least 1 Pokémon in your party!');
        return;
      }
      moveMutation.mutate({ pokemonId: pokemon.id, toParty: false });
    }

    // Reordering within party
    if (source.droppableId === 'party' && destination.droppableId === 'party') {
      const reorderedParty = Array.from(party);
      const [removed] = reorderedParty.splice(source.index, 1);
      reorderedParty.splice(destination.index, 0, removed);

      const partyOrder = reorderedParty.map(p => p.id);

      // Update database - partyOrder is source of truth
      if (player) {
        await base44.entities.Player.update(player.id, { partyOrder });
        // Invalidate queries to persist the change
        queryClient.invalidateQueries({ queryKey: ['player'] });
        queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
        queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
      }
    }
  };

  const moveUp = async (index) => {
    if (index === 0 || !player) return;
    
    const reorderedParty = Array.from(party);
    [reorderedParty[index - 1], reorderedParty[index]] = [reorderedParty[index], reorderedParty[index - 1]];
    
    const partyOrder = reorderedParty.map(p => p.id);
    
    await base44.entities.Player.update(player.id, { partyOrder });
    queryClient.invalidateQueries({ queryKey: ['player'] });
    queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
    queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
  };

  const moveDown = async (index) => {
    if (index === party.length - 1 || !player) return;
    
    const reorderedParty = Array.from(party);
    [reorderedParty[index], reorderedParty[index + 1]] = [reorderedParty[index + 1], reorderedParty[index]];
    
    const partyOrder = reorderedParty.map(p => p.id);
    
    await base44.entities.Player.update(player.id, { partyOrder });
    queryClient.invalidateQueries({ queryKey: ['player'] });
    queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
    queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
  };

  const filteredStorage = storagePokemon.filter(p => {
    if (filter === 'favorite') return p.isFavorite;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Party Manager"
        subtitle="Drag Pokémon to organize your team"
        icon={Users}
      />

      <div className="glass rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-300">
          <strong className="text-white">Drag & Drop:</strong> Move Pokémon between your party and storage. 
          Party can hold up to 6 Pokémon. Click on a card to view details.
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Party Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Active Party</h2>
              <Badge className="bg-indigo-600">
                {party.length}/6
              </Badge>
            </div>
          </div>

          <Droppable droppableId="party" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 min-h-[200px] p-4 rounded-xl border-2 border-dashed transition-all ${
                  snapshot.isDraggingOver
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 bg-slate-800/30'
                }`}
              >
                {party.length === 0 && !snapshot.isDraggingOver && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
                    <Users className="w-16 h-16 mb-3" />
                    <p>Drag Pokémon here to build your party</p>
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
                        onClick={() => setSelectedPokemon(pokemon)}
                      >
                        <PartyPokemonCard
                          pokemon={pokemon}
                          isDragging={snapshot.isDragging}
                          position={index + 1}
                        />
                        {/* Reorder Buttons */}
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveUp(index);
                            }}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveDown(index);
                            }}
                            disabled={index === party.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
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
        </div>

        {/* Storage Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Storage Box</h2>
              <Badge className="bg-cyan-600">
                {storagePokemon.length}
              </Badge>
            </div>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="bg-slate-800/50">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="favorite">
                  <Star className="w-3 h-3 mr-1" />
                  Favorites
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Droppable droppableId="storage" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 min-h-[200px] p-4 rounded-xl border-2 border-dashed transition-all ${
                  snapshot.isDraggingOver
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-700 bg-slate-800/30'
                }`}
              >
                {filteredStorage.length === 0 && !snapshot.isDraggingOver && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
                    <Box className="w-16 h-16 mb-3" />
                    <p>{filter === 'favorite' ? 'No favorite Pokémon in storage' : 'Storage is empty'}</p>
                  </div>
                )}

                {filteredStorage.map((pokemon, index) => (
                  <Draggable key={pokemon.id} draggableId={pokemon.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <PartyPokemonCard
                          pokemon={pokemon}
                          isDragging={snapshot.isDragging}
                          isDisabled={party.length >= 6 && !pokemon.isInTeam}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
}