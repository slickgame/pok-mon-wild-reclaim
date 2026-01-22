import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Star, Search, SortAsc, PawPrint, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import StorageCard from '@/components/storage/StorageCard';
import NicknameModal from '@/components/storage/NicknameModal';
import PartySwapModal from '@/components/storage/PartySwapModal';

export default function StoragePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('level');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [nicknameModalOpen, setNicknameModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('storage');
  
  const queryClient = useQueryClient();

  // Fetch all Pokémon
  const { data: allPokemon = [], isLoading } = useQuery({
    queryKey: ['allPokemon'],
    queryFn: async () => {
      const pokemon = await base44.entities.Pokemon.list();
      return pokemon;
    }
  });

  // Separate party and storage
  const partyPokemon = allPokemon.filter(p => p.isInTeam);
  const storagePokemon = allPokemon.filter(p => !p.isInTeam);

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (pokemon) => {
      await base44.entities.Pokemon.update(pokemon.id, {
        isFavorite: !pokemon.isFavorite
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
    }
  });

  // Move to party mutation
  const moveToPartyMutation = useMutation({
    mutationFn: async (pokemonId) => {
      await base44.entities.Pokemon.update(pokemonId, { isInTeam: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
    }
  });

  // Move to storage mutation
  const moveToStorageMutation = useMutation({
    mutationFn: async (pokemonId) => {
      await base44.entities.Pokemon.update(pokemonId, { isInTeam: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
    }
  });

  // Filter and sort
  const filterAndSort = (pokemonList) => {
    let filtered = [...pokemonList];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        (p.nickname || p.species).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Favorite filter
    if (filterFavorites) {
      filtered = filtered.filter(p => p.isFavorite);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return b.level - a.level;
        case 'name':
          return (a.nickname || a.species).localeCompare(b.nickname || b.species);
        case 'favorite':
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        case 'type':
          return (a.type1 || '').localeCompare(b.type1 || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleMoveToParty = (pokemon) => {
    if (partyPokemon.length >= 6) {
      setSelectedPokemon(pokemon);
      setSwapModalOpen(true);
    } else {
      moveToPartyMutation.mutate(pokemon.id);
    }
  };

  const handleSwapComplete = async (partyPokemonToRemove, storagePokemonToAdd) => {
    await moveToStorageMutation.mutateAsync(partyPokemonToRemove.id);
    await moveToPartyMutation.mutateAsync(storagePokemonToAdd.id);
    setSwapModalOpen(false);
    setSelectedPokemon(null);
  };

  const filteredStorage = filterAndSort(storagePokemon);
  const filteredParty = filterAndSort(partyPokemon);

  return (
    <div>
      <PageHeader
        title="Pokémon Storage"
        subtitle={`${storagePokemon.length} Pokémon in storage • ${partyPokemon.length}/6 in party`}
        icon={Box}
      />

      {/* Search and Filters */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search Pokémon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="level">Level</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="favorite">Favorite</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={filterFavorites ? 'default' : 'outline'}
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={filterFavorites ? 'bg-yellow-500 hover:bg-yellow-600' : 'border-slate-600'}
          >
            <Star className={`w-4 h-4 mr-2 ${filterFavorites ? 'fill-white' : ''}`} />
            Favorites
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass w-full justify-start mb-4">
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Box className="w-4 h-4" />
            Storage ({filteredStorage.length})
          </TabsTrigger>
          <TabsTrigger value="party" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Party ({filteredParty.length}/6)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="storage">
          {filteredStorage.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <Box className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No Pokémon in Storage</h3>
              <p className="text-slate-400">
                {searchQuery || filterFavorites ? 'No Pokémon match your filters' : 'Catch more Pokémon to fill your storage!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredStorage.map((pokemon) => (
                  <StorageCard
                    key={pokemon.id}
                    pokemon={pokemon}
                    onToggleFavorite={() => toggleFavoriteMutation.mutate(pokemon)}
                    onNickname={() => {
                      setSelectedPokemon(pokemon);
                      setNicknameModalOpen(true);
                    }}
                    onMoveToParty={() => handleMoveToParty(pokemon)}
                    isInParty={false}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="party">
          {partyPokemon.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <PawPrint className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No Pokémon in Party</h3>
              <p className="text-slate-400">Add Pokémon from storage to your party</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredParty.map((pokemon) => (
                  <StorageCard
                    key={pokemon.id}
                    pokemon={pokemon}
                    onToggleFavorite={() => toggleFavoriteMutation.mutate(pokemon)}
                    onNickname={() => {
                      setSelectedPokemon(pokemon);
                      setNicknameModalOpen(true);
                    }}
                    onMoveToStorage={() => {
                      if (partyPokemon.length === 1) {
                        alert('You must have at least one Pokémon in your party!');
                        return;
                      }
                      moveToStorageMutation.mutate(pokemon.id);
                    }}
                    isInParty={true}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Nickname Modal */}
      {nicknameModalOpen && selectedPokemon && (
        <NicknameModal
          pokemon={selectedPokemon}
          onClose={() => {
            setNicknameModalOpen(false);
            setSelectedPokemon(null);
          }}
          onSave={async (nickname) => {
            await base44.entities.Pokemon.update(selectedPokemon.id, { nickname });
            queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
            setNicknameModalOpen(false);
            setSelectedPokemon(null);
          }}
        />
      )}

      {/* Party Swap Modal */}
      {swapModalOpen && selectedPokemon && (
        <PartySwapModal
          partyPokemon={partyPokemon}
          storagePokemon={selectedPokemon}
          onClose={() => {
            setSwapModalOpen(false);
            setSelectedPokemon(null);
          }}
          onSwap={handleSwapComplete}
        />
      )}
    </div>
  );
}