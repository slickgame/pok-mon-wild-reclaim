import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, X, Heart, Swords, Shield, Zap, Sparkles, Star, RotateCcw, ArrowUpCircle, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import PokemonCard from '@/components/pokemon/PokemonCard';
import PokemonSummary from '@/components/pokemon/PokemonSummary';

const typeColors = {
  Normal: 'from-gray-400 to-gray-500',
  Fire: 'from-orange-500 to-red-500',
  Water: 'from-blue-400 to-blue-600',
  Electric: 'from-yellow-400 to-amber-500',
  Grass: 'from-green-400 to-emerald-600',
  Ice: 'from-cyan-300 to-blue-400',
  Fighting: 'from-red-600 to-red-800',
  Poison: 'from-purple-500 to-purple-700',
  Ground: 'from-amber-600 to-amber-800',
  Flying: 'from-indigo-300 to-purple-400',
  Psychic: 'from-pink-500 to-purple-500',
  Bug: 'from-lime-500 to-green-600',
  Rock: 'from-stone-500 to-stone-700',
  Ghost: 'from-purple-600 to-indigo-800',
  Dragon: 'from-indigo-600 to-purple-700',
  Dark: 'from-gray-700 to-gray-900',
  Steel: 'from-slate-400 to-slate-600',
  Fairy: 'from-pink-400 to-pink-500',
};

const gradeColors = {
  Bronze: 'bg-amber-700/30 text-amber-400 border-amber-600/50',
  Silver: 'bg-slate-400/30 text-slate-200 border-slate-400/50',
  Gold: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50',
  Diamond: 'bg-cyan-400/30 text-cyan-200 border-cyan-400/50',
};

export default function PokemonPage() {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [filter, setFilter] = useState('team');
  const queryClient = useQueryClient();

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });

  const { data: pokemon = [], isLoading } = useQuery({
    queryKey: ['pokemon'],
    queryFn: () => base44.entities.Pokemon.list(),
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: false
  });

  const filteredPokemon = React.useMemo(() => {
    if (filter === 'team') {
      const teamPokemon = pokemon.filter(p => p.isInTeam && !p.isWildInstance);
      
      // Use player.partyOrder to maintain consistent order with PartyManager
      if (!player?.partyOrder?.length) {
        return teamPokemon;
      }

      return player.partyOrder
        .map(id => teamPokemon.find(p => p.id === id))
        .filter(Boolean);
    }
    return pokemon.filter(p => !p.isWildInstance);
  }, [pokemon, filter, player]);

  return (
    <div>
      <PageHeader 
        title="Pokémon Team" 
        subtitle={`${filteredPokemon.length} Pokémon`}
        icon={PawPrint}
        action={
          <Tabs value={filter} onValueChange={setFilter} className="w-auto">
            <TabsList className="bg-slate-800/50">
              <TabsTrigger value="team" className="data-[state=active]:bg-indigo-500">Team</TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-indigo-500">All</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-64 bg-slate-800" />
          ))}
        </div>
      ) : filteredPokemon.length > 0 ? (
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredPokemon.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <PokemonCard 
                pokemon={p} 
                onClick={() => setSelectedPokemon(p)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <PawPrint className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">No Pokémon Found</h3>
          <p className="text-slate-400">Go explore zones to catch wild Pokémon!</p>
        </div>
      )}

      {/* Pokemon Detail Sheet */}
      <Sheet open={!!selectedPokemon} onOpenChange={() => setSelectedPokemon(null)}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-lg overflow-y-auto">
          {selectedPokemon && (
            <PokemonSummary pokemon={selectedPokemon} onClose={() => setSelectedPokemon(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}