import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Search, Compass, Eye, Sparkles, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import PageHeader from '@/components/common/PageHeader';
import ZoneCard from '@/components/zones/ZoneCard';
import StatBar from '@/components/ui/StatBar';
import NodeletCard from '@/components/zones/NodeletCard';
import ZoneLiberationTracker from '@/components/zones/ZoneLiberationTracker';

export default function ZonesPage() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: () => base44.entities.Zone.list()
  });

  const discoveredZones = player?.discoveredZones || ['Verdant Hollow'];
  
  const filteredZones = zones.filter(zone => 
    zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    zone.biomeType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <PageHeader 
        title="Zone Exploration" 
        subtitle="Discover new areas and catch wild Pokémon"
        icon={Map}
        action={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search zones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-800/50 border-slate-700 w-48"
            />
          </div>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-64 bg-slate-800" />
          ))}
        </div>
      ) : filteredZones.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredZones.map((zone, idx) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ZoneCard 
                zone={zone}
                isDiscovered={discoveredZones.includes(zone.name)}
                onClick={() => setSelectedZone(zone)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <Map className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">No Zones Found</h3>
          <p className="text-slate-400">Try a different search term</p>
        </div>
      )}

      {/* Zone Detail Sheet */}
      <Sheet open={!!selectedZone} onOpenChange={() => setSelectedZone(null)}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-lg overflow-y-auto">
          {selectedZone && (
            <ZoneDetailView zone={selectedZone} onClose={() => setSelectedZone(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ZoneDetailView({ zone, onClose }) {
  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const biomeColors = {
    Forest: 'from-emerald-600 to-green-700',
    Mountain: 'from-stone-500 to-slate-700',
    Lake: 'from-blue-500 to-cyan-600',
    Cave: 'from-slate-700 to-slate-900',
    Plains: 'from-amber-500 to-yellow-600',
    Ruins: 'from-purple-600 to-indigo-800',
    Swamp: 'from-teal-600 to-emerald-800',
  };

  const gradient = biomeColors[zone.biomeType] || 'from-indigo-500 to-purple-600';
  
  const liberatedNodelets = player?.liberatedNodelets || [];
  const eclipseNodelets = zone.nodelets?.filter(n => n.eclipseControlled) || [];
  
  const handleNodeletChallenge = (nodelet) => {
    // TODO: Implement battle system
    console.log('Challenge nodelet:', nodelet);
  };
  
  const handleNodeletInspect = (nodelet) => {
    // TODO: Show detailed nodelet info
    console.log('Inspect nodelet:', nodelet);
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className={`-mx-6 -mt-6 mb-6 h-48 bg-gradient-to-br ${gradient} relative`}>
        {zone.imageUrl && (
          <img src={zone.imageUrl} alt={zone.name} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="absolute bottom-4 left-4 right-4">
          <Badge className="bg-black/40 text-white border-white/20 mb-2">{zone.biomeType}</Badge>
          <h2 className="text-2xl font-bold text-white">{zone.name}</h2>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 mb-6">{zone.description}</p>

      {/* Liberation Tracker */}
      {eclipseNodelets.length > 0 && (
        <div className="mb-4">
          <ZoneLiberationTracker zone={zone} liberatedNodelets={liberatedNodelets} />
        </div>
      )}

      {/* Progress */}
      <div className="glass rounded-xl p-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" /> Exploration Progress
        </h3>
        <StatBar
          value={zone.discoveryProgress || 0}
          maxValue={100}
          color="bg-gradient-to-r from-indigo-500 to-cyan-500"
          label="Discovery"
        />
      </div>

      {/* Wild Pokémon */}
      {zone.availableWildPokemon && zone.availableWildPokemon.length > 0 && (
        <div className="glass rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" /> Wild Pokémon
          </h3>
          <div className="space-y-2">
            {zone.availableWildPokemon.map((pokemon, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{pokemon.species}</p>
                    <p className="text-xs text-slate-400">Lv. {pokemon.minLevel}-{pokemon.maxLevel}</p>
                  </div>
                </div>
                <Badge className={`text-xs ${
                  pokemon.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                  pokemon.rarity === 'Rare' ? 'bg-purple-500/20 text-purple-300' :
                  pokemon.rarity === 'Uncommon' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-slate-700/50 text-slate-300'
                }`}>
                  {pokemon.rarity}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eclipse Nodelets */}
      {eclipseNodelets.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Map className="w-4 h-4 text-red-400" /> Eclipse Control Points
          </h3>
          <div className="space-y-3">
            {eclipseNodelets.map((nodelet) => (
              <NodeletCard
                key={nodelet.id}
                nodelet={nodelet}
                isLiberated={liberatedNodelets.some(ln => ln.nodeletId === nodelet.id && ln.zoneId === zone.id)}
                onChallenge={() => handleNodeletChallenge(nodelet)}
                onInspect={() => handleNodeletInspect(nodelet)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Nodelets */}
      {zone.nodelets && zone.nodelets.filter(n => !n.eclipseControlled).length > 0 && (
        <div className="glass rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Map className="w-4 h-4 text-amber-400" /> Points of Interest
          </h3>
          <div className="space-y-2">
            {zone.nodelets.filter(n => !n.eclipseControlled).map((nodelet, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${nodelet.isDiscovered ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <div>
                    <p className="text-white text-sm">{nodelet.name}</p>
                    <p className="text-xs text-slate-400">{nodelet.type}</p>
                  </div>
                </div>
                {nodelet.isCompleted ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Complete</Badge>
                ) : nodelet.isDiscovered ? (
                  <Badge className="bg-amber-500/20 text-amber-300 text-xs">Available</Badge>
                ) : (
                  <Badge className="bg-slate-700/50 text-slate-400 text-xs">Hidden</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explore Button */}
      <Button className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600">
        <Compass className="w-4 h-4 mr-2" /> Start Exploring
      </Button>
    </div>
  );
}