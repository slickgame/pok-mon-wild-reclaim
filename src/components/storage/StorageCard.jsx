import React from 'react';
import { motion } from 'framer-motion';
import { Star, Edit, ArrowUpCircle, ArrowDownCircle, Shield, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function StorageCard({
  pokemon,
  onToggleFavorite,
  onNickname,
  onMoveToParty,
  onMoveToStorage,
  onClick,
  isInParty
}) {
  const roleIcons = {
    Tank: Shield,
    Medic: Heart,
    Scout: Zap,
    Striker: Zap,
    Juggernaut: Shield,
    Support: Heart
  };

  const primaryRole = pokemon.roles?.[0];
  const RoleIcon = primaryRole ? roleIcons[primaryRole] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`glass rounded-xl p-3 relative group hover:border-indigo-500/50 transition-all ${
      isInParty ? 'border-2 border-indigo-500/30' : ''}`
      }>

      {/* Favorite Star */}
      <button
        onClick={onToggleFavorite}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-slate-900/80 hover:bg-slate-800 transition-colors">

        <Star
          className={`w-4 h-4 ${
          pokemon.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'}`
          } />

      </button>

      {/* Party Badge */}
      {isInParty &&
      <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-indigo-500 text-xs">Party</Badge>
        </div>
      }

      {/* Sprite */}
      <div className="flex justify-center mb-2 mt-4">
        {pokemon.spriteUrl ?
        <img
          src={pokemon.spriteUrl}
          alt={pokemon.species}
          className="w-20 h-20 object-contain" /> :


        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-3xl">?</span>
          </div>
        }
      </div>

      {/* Name & Level */}
      <div className="text-center mb-2">
        <h3 className="font-bold text-white text-sm truncate">
          {pokemon.nickname || pokemon.species}
        </h3>
        {pokemon.nickname &&
        <p className="text-xs text-slate-400">{pokemon.species}</p>
        }
        <div className="flex items-center justify-center gap-2 mt-1">
          <Badge variant="outline" className="text-slate-50 px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            Lv. {pokemon.level}
          </Badge>
          {RoleIcon &&
          <Badge variant="outline" className="text-xs flex items-center gap-1">
              <RoleIcon className="w-3 h-3" />
              {primaryRole}
            </Badge>
          }
        </div>
      </div>

      {/* Type Badges */}
      <div className="flex gap-1 justify-center mb-3">
        {pokemon.type1 &&
        <Badge className="text-xs bg-slate-700">{pokemon.type1}</Badge>
        }
        {pokemon.type2 &&
        <Badge className="text-xs bg-slate-700">{pokemon.type2}</Badge>
        }
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onNickname}
          className="w-full text-xs border-slate-600 hover:bg-slate-800">

          <Edit className="w-3 h-3 mr-1" />
          Rename
        </Button>

        {isInParty ?
        <Button
          size="sm"
          onClick={onMoveToStorage}
          className="w-full text-xs bg-slate-700 hover:bg-slate-600">

            <ArrowDownCircle className="w-3 h-3 mr-1" />
            To Storage
          </Button> :

        <Button
          size="sm"
          onClick={onMoveToParty}
          className="w-full text-xs bg-indigo-600 hover:bg-indigo-700">

            <ArrowUpCircle className="w-3 h-3 mr-1" />
            To Party
          </Button>
        }
      </div>
    </motion.div>);

}