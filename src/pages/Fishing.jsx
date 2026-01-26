import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Fish, MapPin, Clock, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/common/PageHeader';
import AnglerProgressBar from '@/components/fishing/AnglerProgressBar';
import BaitSelector from '@/components/fishing/BaitSelector';
import FishingMinigame from '@/components/fishing/FishingMinigame';
import CatchResult from '@/components/fishing/CatchResult';

export default function FishingPage() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedBait, setSelectedBait] = useState(null);
  const [gameState, setGameState] = useState('setup'); // setup, fishing, result
  const [lastCatch, setLastCatch] = useState(null);

  const queryClient = useQueryClient();

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: fishingZones = [], isLoading } = useQuery({
    queryKey: ['fishingZones'],
    queryFn: () => base44.entities.FishingZone.list()
  });

  const { data: baits = [] } = useQuery({
    queryKey: ['baits'],
    queryFn: async () => {
      const items = await base44.entities.Item.filter({ type: 'Bait' });
      return items.filter(item => item.quantity > 0);
    }
  });

  const { data: recentCatches = [] } = useQuery({
    queryKey: ['recentCatches'],
    queryFn: async () => {
      const catches = await base44.entities.FishingCatch.list();
      return catches.slice(0, 10);
    }
  });

  const startFishing = () => {
    if (!selectedZone || !selectedBait) return;
    setGameState('fishing');
  };

  const handleMinigameComplete = ({ success }) => {
    if (success) {
      // Simulate catch result
      const catchTypes = ['Pokemon', 'Treasure', 'Material'];
      const catchType = catchTypes[Math.floor(Math.random() * catchTypes.length)];
      const wasRare = Math.random() < 0.15;

      const result = {
        success: true,
        catchType,
        pokemonSpecies: catchType === 'Pokemon' ? 'Magikarp' : null,
        pokemonLevel: catchType === 'Pokemon' ? Math.floor(Math.random() * 10) + 5 : null,
        itemsReceived: catchType === 'Treasure' ? ['Treasure Capsule'] : catchType === 'Material' ? ['Fish Scales', 'Glowworm'] : [],
        xpGained: wasRare ? 50 : 20,
        wasRare,
      };

      setLastCatch(result);
      setGameState('result');

      // TODO: Save catch to database, update player stats
    } else {
      setLastCatch({ success: false });
      setGameState('result');
    }
  };

  const handleContinue = () => {
    setGameState('setup');
    setLastCatch(null);
  };

  const anglerLevel = player?.anglerLevel || 1;
  const anglerXp = player?.anglerXp || 0;

  const unlockedZones = fishingZones.filter(zone => 
    zone.isUnlocked && zone.requiredAnglerLevel <= anglerLevel
  );

  const lockedZones = fishingZones.filter(zone =>
    !zone.isUnlocked || zone.requiredAnglerLevel > anglerLevel
  );

  return (
    <div>
      <PageHeader 
        title="Fishing" 
        subtitle="Cast your line and discover what lies beneath"
        icon={Fish}
      />

      {/* Angler Progress */}
      <AnglerProgressBar level={anglerLevel} xp={anglerXp} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Fishing Area */}
        <div className="lg:col-span-2">
          {gameState === 'setup' && (
            <div className="space-y-6">
              {/* Zone Selection */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Select Fishing Zone</h3>
                <div className="space-y-3">
                  {unlockedZones.map(zone => (
                    <motion.button
                      key={zone.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedZone(zone)}
                      className={`w-full glass rounded-lg p-4 text-left transition-all ${
                        selectedZone?.id === zone.id ? 'ring-2 ring-cyan-500 bg-cyan-500/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-semibold mb-1">{zone.name}</h4>
                          <p className="text-sm text-slate-400 mb-2">{zone.description}</p>
                          <div className="flex gap-2">
                            <Badge className="text-xs bg-blue-500/20 text-blue-300">
                              {zone.waterType}
                            </Badge>
                            {zone.timeRestriction !== 'Any' && (
                              <Badge className="text-xs bg-purple-500/20 text-purple-300">
                                <Clock className="w-3 h-3 mr-1" />
                                {zone.timeRestriction}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <MapPin className={`w-5 h-5 ${selectedZone?.id === zone.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                      </div>
                    </motion.button>
                  ))}

                  {lockedZones.map(zone => (
                    <div
                      key={zone.id}
                      className="glass rounded-lg p-4 opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-slate-500" />
                        <div>
                          <h4 className="text-slate-400 font-semibold">{zone.name}</h4>
                          <p className="text-xs text-slate-500">
                            Requires Angler Level {zone.requiredAnglerLevel}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bait Selection */}
              {selectedZone && (
                <div className="glass rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Select Bait</h3>
                  {baits.length > 0 ? (
                    <BaitSelector
                      baits={baits}
                      selectedBait={selectedBait}
                      onSelect={setSelectedBait}
                    />
                  ) : (
                    <p className="text-slate-400 text-center py-8">
                      No bait available. Craft some at the Crafting Bench!
                    </p>
                  )}
                </div>
              )}

              {/* Cast Button */}
              {selectedZone && selectedBait && (
                <Button
                  onClick={startFishing}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-lg py-6"
                >
                  🎣 Cast Line
                </Button>
              )}
            </div>
          )}

          {gameState === 'fishing' && (
            <FishingMinigame
              onComplete={handleMinigameComplete}
              difficulty={selectedZone?.requiredAnglerLevel || 1}
            />
          )}

          {gameState === 'result' && lastCatch && (
            <CatchResult
              result={lastCatch}
              onContinue={handleContinue}
            />
          )}
        </div>

        {/* Sidebar - Stats & Recent Catches */}
        <div className="space-y-6">
          {/* Fishing Stats */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Fishing Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Catches</span>
                <span className="text-white font-semibold">{player?.fishingStats?.totalCatches || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pokémon Caught</span>
                <span className="text-white font-semibold">{player?.fishingStats?.pokemonCaught || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Treasures Found</span>
                <span className="text-white font-semibold">{player?.fishingStats?.treasuresFound || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rare Encounters</span>
                <span className="text-cyan-300 font-semibold">{player?.fishingStats?.rareEncounters || 0}</span>
              </div>
            </div>
          </div>

          {/* Recent Catches */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Catches</h3>
            <div className="space-y-2">
              {recentCatches.length > 0 ? (
                recentCatches.map((catch_, idx) => (
                  <div key={idx} className="glass rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">
                        {catch_.pokemonSpecies || catch_.catchType}
                      </span>
                      <Badge className={`text-xs ${
                        catch_.wasRare ? 'bg-yellow-500/20 text-yellow-300' : 'bg-slate-700/50 text-slate-300'
                      }`}>
                        {catch_.wasRare ? 'Rare' : 'Common'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm text-center py-4">
                  No catches yet. Start fishing!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}