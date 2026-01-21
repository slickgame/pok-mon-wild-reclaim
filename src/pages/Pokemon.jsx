import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, X, Heart, Swords, Shield, Zap, Sparkles, Star, RotateCcw, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import PokemonCard from '@/components/pokemon/PokemonCard';
import StatBar from '@/components/ui/StatBar';
import RoleIndicator from '@/components/battle/RoleIndicator';
import TalentDisplay from '@/components/battle/TalentDisplay';
import RevenantIndicator from '@/components/pokemon/RevenantIndicator';

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

  const { data: pokemon = [], isLoading } = useQuery({
    queryKey: ['pokemon'],
    queryFn: () => base44.entities.Pokemon.list()
  });

  const filteredPokemon = filter === 'team' 
    ? pokemon.filter(p => p.isInTeam) 
    : pokemon;

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
            <PokemonDetailView pokemon={selectedPokemon} onClose={() => setSelectedPokemon(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PokemonDetailView({ pokemon, onClose }) {
  const gradientClass = typeColors[pokemon.type1] || 'from-indigo-500 to-purple-600';
  
  return (
    <div className="pb-8">
      {/* Header */}
      <div className={`-mx-6 -mt-6 mb-6 h-48 bg-gradient-to-br ${gradientClass} relative`}>
        <div className="absolute inset-0 bg-black/20" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
        
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-black/30 text-white border-white/20">Lv. {pokemon.level}</Badge>
          {pokemon.isStarter && (
            <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/50">
              <Star className="w-3 h-3 mr-1" /> Starter
            </Badge>
          )}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          {pokemon.spriteUrl ? (
            <img src={pokemon.spriteUrl} alt={pokemon.species} className="w-32 h-32 object-contain drop-shadow-2xl" />
          ) : (
            <Sparkles className="w-16 h-16 text-white/30" />
          )}
        </div>
      </div>

      {/* Name & Type */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">{pokemon.nickname || pokemon.species}</h2>
        {pokemon.nickname && <p className="text-slate-400 text-sm">{pokemon.species}</p>}
        <div className="flex gap-2 mt-2">
          {pokemon.type1 && (
            <Badge className={`bg-gradient-to-r ${typeColors[pokemon.type1]} text-white border-0`}>
              {pokemon.type1}
            </Badge>
          )}
          {pokemon.type2 && (
            <Badge className={`bg-gradient-to-r ${typeColors[pokemon.type2]} text-white border-0`}>
              {pokemon.type2}
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <RevenantIndicator pokemon={pokemon} showEffects />
        </div>
      </div>

      {/* Stats */}
      <div className="glass rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" /> Base Stats
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" /> HP</span>
              <span className="text-white">{pokemon.stats?.hp || 0}/{pokemon.stats?.maxHp || 0}</span>
            </div>
            <StatBar value={pokemon.stats?.hp || 0} maxValue={pokemon.stats?.maxHp || 100} color="bg-rose-500" showValue={false} size="sm" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1"><Swords className="w-3 h-3 text-orange-400" /> Attack</span>
              <span className="text-white">{pokemon.stats?.atk || 0}</span>
            </div>
            <StatBar value={pokemon.stats?.atk || 0} maxValue={200} color="bg-orange-500" showValue={false} size="sm" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1"><Shield className="w-3 h-3 text-blue-400" /> Defense</span>
              <span className="text-white">{pokemon.stats?.def || 0}</span>
            </div>
            <StatBar value={pokemon.stats?.def || 0} maxValue={200} color="bg-blue-500" showValue={false} size="sm" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1"><Sparkles className="w-3 h-3 text-pink-400" /> Sp. Atk</span>
              <span className="text-white">{pokemon.stats?.spAtk || 0}</span>
            </div>
            <StatBar value={pokemon.stats?.spAtk || 0} maxValue={200} color="bg-pink-500" showValue={false} size="sm" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1"><Shield className="w-3 h-3 text-green-400" /> Sp. Def</span>
              <span className="text-white">{pokemon.stats?.spDef || 0}</span>
            </div>
            <StatBar value={pokemon.stats?.spDef || 0} maxValue={200} color="bg-green-500" showValue={false} size="sm" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> Speed</span>
              <span className="text-white">{pokemon.stats?.spd || 0}</span>
            </div>
            <StatBar value={pokemon.stats?.spd || 0} maxValue={200} color="bg-yellow-500" showValue={false} size="sm" />
          </div>
        </div>
      </div>

      {/* Nature & Abilities */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="glass rounded-xl p-4">
          <h4 className="text-xs text-slate-400 mb-1">Nature</h4>
          <p className="text-white font-medium">{pokemon.nature || 'Hardy'}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <h4 className="text-xs text-slate-400 mb-1">Experience</h4>
          <p className="text-white font-medium">{pokemon.experience || 0} XP</p>
        </div>
      </div>

      {/* Talents */}
      {pokemon.talents && pokemon.talents.length > 0 && (
        <div className="glass rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> Talents
            </h3>
          </div>
          <TalentDisplay talents={pokemon.talents} showDescription />
        </div>
      )}

      {/* Roles */}
      {pokemon.roles && pokemon.roles.length > 0 && (
        <div className="glass rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3">Battle Roles</h3>
          <div className="space-y-2">
            {pokemon.roles.map((role, idx) => (
              <RoleIndicator key={idx} role={role} showDescription />
            ))}
          </div>
        </div>
      )}

      {/* Signature Move */}
      {pokemon.signatureMove && (
        <div className="glass rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" /> Signature Move
          </h3>
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-300 font-bold">{pokemon.signatureMove}</p>
            <p className="text-xs text-slate-400 mt-1">Unlocked through leveling and trust</p>
          </div>
        </div>
      )}

      {/* Held Items */}
      {pokemon.heldItems && pokemon.heldItems.length > 0 && (
        <div className="glass rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" /> Held Items
          </h3>
          <div className="space-y-2">
            {pokemon.heldItems.map((itemId, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-white text-sm">{itemId}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">{3 - pokemon.heldItems.length} slot(s) remaining</p>
        </div>
      )}

      {/* Abilities */}
      {pokemon.abilities && pokemon.abilities.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Abilities</h3>
          <div className="flex flex-wrap gap-2">
            {pokemon.abilities.map((ability, idx) => (
              <Badge key={idx} className="bg-slate-700/50 text-slate-300 border-slate-600/50">
                {ability}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}