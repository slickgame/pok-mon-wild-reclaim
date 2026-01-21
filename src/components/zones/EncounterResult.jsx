import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Eye, MapPin, Zap, Swords, Package, Scan, X } from 'lucide-react';

const encounterTypes = {
  pokemon: { icon: Eye, gradient: 'from-emerald-500 to-green-600' },
  material: { icon: Sparkles, gradient: 'from-cyan-500 to-blue-600' },
  poi: { icon: MapPin, gradient: 'from-purple-500 to-indigo-600' },
  special: { icon: Zap, gradient: 'from-amber-500 to-orange-600' }
};

export default function EncounterResult({ result, onContinue, onAction }) {
  const type = encounterTypes[result.type] || encounterTypes.special;
  const Icon = type.icon;

  const rarityColors = {
    common: 'bg-slate-700/50 text-slate-300',
    uncommon: 'bg-blue-600/20 text-blue-300',
    rare: 'bg-purple-600/20 text-purple-300',
    legendary: 'bg-amber-600/20 text-amber-300'
  };

  const handleAction = (action) => {
    if (onAction) {
      onAction(action, result);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-6 border-2 border-indigo-500/30"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white">{result.title}</h3>
            {result.firstDiscovery && (
              <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
                First Discovery!
              </Badge>
            )}
          </div>
          <p className="text-slate-300 text-sm">{result.description}</p>
        </div>
      </div>

      {/* Pokémon Encounter Actions */}
      {result.type === 'pokemon' && result.pokemon && (
        <div className="space-y-3 mb-4">
          <div className="glass rounded-lg p-3 flex items-center justify-between">
            <span className="text-white font-medium">{result.pokemon}</span>
            <Badge className={rarityColors[result.rarity]}>
              Lv. {result.pokemonLevel}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => handleAction('battle')}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <Swords className="w-4 h-4 mr-2" />
              Battle
            </Button>
            <Button 
              onClick={() => handleAction('capture')}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              <Package className="w-4 h-4 mr-2" />
              Capture
            </Button>
            <Button 
              onClick={() => handleAction('scan')}
              variant="outline"
              className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
            >
              <Scan className="w-4 h-4 mr-2" />
              Scan
            </Button>
            <Button 
              onClick={onContinue}
              variant="outline"
              className="border-slate-600 text-slate-400 hover:bg-slate-800"
            >
              <X className="w-4 h-4 mr-2" />
              Flee
            </Button>
          </div>
        </div>
      )}

      {/* Material Found Actions */}
      {result.type === 'material' && result.materials && (
        <div className="space-y-3 mb-4">
          <div className="glass rounded-lg p-3">
            <span className="text-white font-medium">Found: {result.materials.join(', ')}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => handleAction('collect')}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
            >
              <Package className="w-4 h-4 mr-2" />
              Add to Inventory
            </Button>
            <Button 
              onClick={onContinue}
              variant="outline"
              className="border-slate-600 text-slate-400 hover:bg-slate-800"
            >
              Leave It
            </Button>
          </div>
        </div>
      )}

      {/* POI Discovered */}
      {result.type === 'poi' && result.poi && (
        <div className="space-y-3 mb-4">
          <div className="glass rounded-lg p-3">
            <span className="text-white font-medium">Location: {result.poi}</span>
          </div>
          
          <Button 
            onClick={() => handleAction('reveal')}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Reveal on Map
          </Button>
        </div>
      )}

      {/* Special Events */}
      {result.type === 'special' && (
        <div className="mb-4">
          <Button 
            onClick={() => handleAction('investigate')}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Zap className="w-4 h-4 mr-2" />
            Investigate
          </Button>
        </div>
      )}

      {result.progressGained > 0 && (
        <div className="text-center">
          <Badge className="bg-indigo-500/20 text-indigo-300">
            +{result.progressGained}% Discovery Progress
          </Badge>
        </div>
      )}
    </motion.div>
  );
}