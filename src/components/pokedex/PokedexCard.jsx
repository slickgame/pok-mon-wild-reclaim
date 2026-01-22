import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Eye, HelpCircle, Shield, Heart, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PokedexCard({ species, onClick }) {
  const roleIcons = {
    Tank: Shield,
    Striker: Zap,
    Support: Heart,
    Medic: Heart,
    Scout: Zap,
    Juggernaut: Shield
  };

  const RoleIcon = roleIcons[species.role];

  const statusColors = {
    Caught: 'bg-green-500/20 border-green-500/50',
    Seen: 'bg-blue-500/20 border-blue-500/50',
    Unknown: 'bg-slate-800/50 border-slate-700'
  };

  const statusIcons = {
    Caught: Trophy,
    Seen: Eye,
    Unknown: HelpCircle
  };

  const StatusIcon = statusIcons[species.status];

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`glass rounded-xl p-3 border-2 transition-all hover:border-indigo-500/50 text-left ${
        statusColors[species.status]
      }`}
    >
      {/* Dex Number */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-slate-500">
          #{String(species.dexNumber).padStart(3, '0')}
        </span>
        <StatusIcon className="w-4 h-4 text-slate-400" />
      </div>

      {/* Sprite */}
      <div className="flex justify-center mb-2">
        {species.spriteUrl && species.seen ? (
          <img
            src={species.spriteUrl}
            alt={species.species}
            className="w-20 h-20 object-contain"
          />
        ) : (
          <div 
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              species.seen ? 'bg-slate-700' : 'bg-slate-800'
            }`}
            style={species.seen ? {} : { 
              backgroundImage: 'radial-gradient(circle, rgba(100,100,100,0.3) 0%, rgba(50,50,50,0.3) 100%)',
              border: '2px dashed rgba(100,100,100,0.3)'
            }}
          >
            <HelpCircle className="w-8 h-8 text-slate-600" />
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="font-bold text-white text-sm text-center mb-2 truncate">
        {species.seen ? species.species : '???'}
      </h3>

      {/* Types and Role */}
      {species.seen && (
        <div className="space-y-1">
          <div className="flex gap-1 justify-center">
            {species.types.map(type => (
              <Badge key={type} className="text-xs bg-slate-700">
                {type}
              </Badge>
            ))}
          </div>
          {RoleIcon && (
            <div className="flex items-center justify-center gap-1">
              <RoleIcon className="w-3 h-3 text-indigo-400" />
              <span className="text-xs text-slate-400">{species.role}</span>
            </div>
          )}
        </div>
      )}

      {/* Caught Count */}
      {species.caught && species.caughtCount > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <div className="flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-slate-400">x{species.caughtCount}</span>
          </div>
        </div>
      )}

      {/* Evolution Stage Badge */}
      <div className="mt-2">
        <Badge variant="outline" className="text-xs w-full justify-center">
          {species.evolutionStage}
        </Badge>
      </div>
    </motion.button>
  );
}