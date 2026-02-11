import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Heart, Edit2, Trash2, ArrowLeftRight, Sparkles, TrendingUp, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import StatsTab from './summary-tabs/StatsTab';
import TalentsTab from './summary-tabs/TalentsTab';
import MovesTab from './summary-tabs/MovesTab';
import EvolutionTab from './summary-tabs/EvolutionTab';
import ItemsTab from './summary-tabs/ItemsTab';

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
  Fairy: 'from-pink-400 to-pink-500'
};

export default function PokemonSummary({ pokemon, onClose }) {
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState(pokemon.nickname || '');
  const queryClient = useQueryClient();

  const gradientClass = typeColors[pokemon.type1] || 'from-indigo-500 to-purple-600';

  const updateMutation = useMutation({
    mutationFn: (updateData) => base44.entities.Pokemon.update(pokemon.id, updateData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pokemon'] });
    }
  });

  const handleToggleFavorite = () => {
    updateMutation.mutate({ isFavorite: !pokemon.isFavorite });
  };

  const handleSaveNickname = () => {
    if (nickname.length > 12) {
      alert('Nickname must be 12 characters or less');
      return;
    }
    updateMutation.mutate({ nickname: nickname || undefined });
    setIsEditingNickname(false);
  };

  const handleToggleTeam = () => {
    updateMutation.mutate({ isInTeam: !pokemon.isInTeam });
  };

  const handleRelease = async () => {
    if (confirm(`Are you sure you want to release ${pokemon.nickname || pokemon.species}? This action cannot be undone.`)) {
      try {
        await base44.entities.Pokemon.delete(pokemon.id);
        queryClient.invalidateQueries({ queryKey: ['pokemon'] });
        onClose();
      } catch (err) {
        console.error('Failed to release Pokémon:', err);
      }
    }
  };

  return (
    <div className="pb-8">
      {/* Header with Sprite */}
      <div className={`-mx-6 -mt-6 mb-6 h-56 bg-gradient-to-br ${gradientClass} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent" />

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 z-10">

          <X className="w-5 h-5" />
        </Button>

        {/* Level Badge */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <Badge className="bg-black/30 text-white border-white/20 backdrop-blur-sm">
            Lv. {pokemon.level}
          </Badge>
          {pokemon.isStarter &&
          <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/50 backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1" /> Starter
            </Badge>
          }
        </div>

        {/* Favorite Toggle */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-4 right-16 z-10 p-2 rounded-lg bg-black/20 hover:bg-black/30 backdrop-blur-sm transition-all">

          <Heart
            className={`w-5 h-5 ${pokemon.isFavorite ? 'fill-red-500 text-red-500' : 'text-white/70'}`} />

        </button>

        {/* Sprite */}
        <div className="absolute inset-0 flex items-center justify-center">
          {pokemon.spriteUrl ?
          <motion.img
            src={pokemon.spriteUrl}
            alt={pokemon.species}
            className="w-40 h-40 object-contain drop-shadow-2xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} /> :


          <Sparkles className="w-20 h-20 text-white/30" />
          }
        </div>
      </div>

      {/* Identity Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {isEditingNickname ?
            <div className="flex gap-2">
                <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter nickname..."
                maxLength={12}
                className="bg-slate-800 border-slate-700"
                autoFocus />

                <Button size="sm" onClick={handleSaveNickname}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditingNickname(false)}>
                  Cancel
                </Button>
              </div> :

            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">
                  {pokemon.nickname || pokemon.species}
                </h2>
                <button
                onClick={() => setIsEditingNickname(true)}
                className="p-1 hover:bg-slate-800 rounded transition-colors">

                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            }
            {pokemon.nickname &&
            <p className="text-slate-400 text-sm">{pokemon.species}</p>
            }
          </div>
        </div>

        {/* Types */}
        <div className="flex gap-2 mb-3">
          {pokemon.type1 &&
          <Badge className={`bg-gradient-to-r ${typeColors[pokemon.type1]} text-white border-0`}>
              {pokemon.type1}
            </Badge>
          }
          {pokemon.type2 &&
          <Badge className={`bg-gradient-to-r ${typeColors[pokemon.type2]} text-white border-0`}>
              {pokemon.type2}
            </Badge>
          }
        </div>

        {/* Roles */}
        {pokemon.roles && pokemon.roles.length > 0 &&
        <div className="flex gap-2 flex-wrap">
            {pokemon.roles.map((role) => {
            const roleIcons = {
              Tank: Shield,
              Striker: Zap,
              Support: Heart,
              Medic: Heart,
              Scout: Zap,
              Juggernaut: Shield
            };
            const Icon = roleIcons[role];
            return (
              <Badge key={role} variant="outline" className="bg-indigo-500/10 text-slate-50 px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-indigo-500/30">
                  {Icon && <Icon className="w-3 h-3 mr-1" />}
                  {role}
                </Badge>);

          })}
          </div>
        }
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
          <TabsTrigger value="stats" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="talents" className="text-xs">
            <Star className="w-3 h-3 mr-1" />
            Talents
          </TabsTrigger>
          <TabsTrigger value="moves" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            Moves
          </TabsTrigger>
          <TabsTrigger value="evolution" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Evolve
          </TabsTrigger>
          <TabsTrigger value="items" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-4">
          <StatsTab pokemon={pokemon} />
        </TabsContent>

        <TabsContent value="talents" className="mt-4">
          <TalentsTab pokemon={pokemon} />
        </TabsContent>

        <TabsContent value="moves" className="mt-4">
          <MovesTab pokemon={pokemon} />
        </TabsContent>

        <TabsContent value="evolution" className="mt-4">
          <EvolutionTab pokemon={pokemon} />
        </TabsContent>

        <TabsContent value="items" className="mt-4">
          <ItemsTab pokemon={pokemon} />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        <Button
          onClick={handleToggleTeam}
          className="w-full"
          variant="outline">

          <ArrowLeftRight className="w-4 h-4 mr-2" />
          {pokemon.isInTeam ? 'Move to Storage' : 'Add to Party'}
        </Button>
        <Button
          onClick={handleRelease}
          className="w-full"
          variant="destructive">

          <Trash2 className="w-4 h-4 mr-2" />
          Release Pokémon
        </Button>
      </div>
    </div>);

}