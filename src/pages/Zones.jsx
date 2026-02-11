import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Search, Compass, Eye, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/common/PageHeader';
import ZoneCard from '@/components/zones/ZoneCard';
import StatBar from '@/components/ui/StatBar';
import NodeletCard from '@/components/zones/NodeletCard';
import ZoneLiberationTracker from '@/components/zones/ZoneLiberationTracker';
import DiscoveryMeter from '@/components/zones/DiscoveryMeter';
import ExplorationFeed from '@/components/zones/ExplorationFeed';
import EncounterResult from '@/components/zones/EncounterResult';
import { getSubmissionCount } from '@/systems/quests/questProgressTracker';
import { advanceGameTime, getTimeLeftLabel, normalizeGameTime, toTotalMinutes } from '@/systems/time/gameTimeSystem';
import { 
  verdantHollowEncounters, 
  generateWildPokemon,
  rollItemDrops,
  calculateWildXP 
} from '@/components/zones/wildPokemonData';

const EXPLORE_TIME_MINUTES = 10;


export default function ZonesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

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

  const { data: gameTime } = useQuery({
    queryKey: ['gameTime'],
    queryFn: async () => {
      const times = await base44.entities.GameTime.list();
      return times[0] || null;
    }
  });

  const discoveredZones = player?.discoveredZones || ['Verdant Hollow'];
  const selectedZoneId = searchParams.get('zoneId');
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId);
  
  const filteredZones = zones.filter(zone => 
    zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    zone.biomeType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trigger first_exploration tutorial on first visit
  useEffect(() => {
    const triggerFirstExploration = async () => {
      if (player && zones.length > 0) {
        const tutorials = await base44.entities.Tutorial.filter({
          trigger: 'first_exploration',
          isCompleted: false,
          isSkipped: false
        });
        
        if (tutorials.length > 0) {
          queryClient.invalidateQueries({ queryKey: ['tutorials'] });
        }
      }
    };
    
    triggerFirstExploration();
  }, [player, zones, queryClient]);

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
      ) : selectedZone ? (
        <ZoneDetailView
          zone={selectedZone}
          onBack={() => setSearchParams({})}
        />
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
                onClick={() => setSearchParams({ zoneId: zone.id })}
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

    </div>
  );
}

function ZoneDetailView({ zone, onBack }) {
  const [activeSection, setActiveSection] = useState('explore');
  const [isExploring, setIsExploring] = useState(false);
  const [explorationEvents, setExplorationEvents] = useState([]);
  const [currentEncounter, setCurrentEncounter] = useState(null);
  const [zoneProgress, setZoneProgress] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: progress, refetch: refetchProgress } = useQuery({
    queryKey: ['zoneProgress', zone.id],
    queryFn: async () => {
      const progs = await base44.entities.ZoneProgress.filter({ zoneId: zone.id });
      return progs[0] || null;
    }
  });

  const { data: gameTime } = useQuery({
    queryKey: ['gameTime'],
    queryFn: async () => {
      const times = await base44.entities.GameTime.list();
      return times[0] || null;
    }
  });

  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list()
  });

  const { data: allPokemon = [] } = useQuery({
    queryKey: ['allPokemon'],
    queryFn: () => base44.entities.Pokemon.list()
  });

  React.useEffect(() => {
    if (progress) {
      setZoneProgress(progress);
    }
  }, [progress]);

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
    console.log('Challenge nodelet:', nodelet);
  };
  
  const handleNodeletInspect = (nodelet) => {
    console.log('Inspect nodelet:', nodelet);
  };

  const handleStartExploring = () => {
    setIsExploring(true);
    setExplorationEvents([]);
  };

  const handleBackToDetails = () => {
    setIsExploring(false);
    setCurrentEncounter(null);
  };

  const handleReturnToTown = () => {
    navigate('/Town');
  };

  const advanceTime = async (minutesToAdd) => {
    const normalized = normalizeGameTime(gameTime);
    const next = advanceGameTime(normalized, minutesToAdd);

    if (gameTime?.id) {
      await base44.entities.GameTime.update(gameTime.id, {
        currentHour: next.currentHour,
        currentMinute: next.currentMinute,
        currentDay: next.currentDay,
        currentWeek: next.currentWeek,
        day: next.day,
        month: next.month,
        year: next.year,
        currentSeason: next.currentSeason || gameTime?.currentSeason || 'Spring'
      });
    } else {
      await base44.entities.GameTime.create({
        currentHour: next.currentHour,
        currentMinute: next.currentMinute,
        currentDay: next.currentDay,
        currentWeek: next.currentWeek,
        day: next.day,
        month: next.month,
        year: next.year,
        currentSeason: gameTime?.currentSeason || 'Spring'
      });
    }

    queryClient.invalidateQueries({ queryKey: ['gameTime'] });
    queryClient.invalidateQueries({ queryKey: ['researchQuests'] });
    queryClient.invalidateQueries({ queryKey: ['player'] });
  };

  const healParty = async (healPercent) => {
    const teamPokemon = allPokemon.filter((pokemon) => pokemon.isInTeam);
    await Promise.all(teamPokemon.map((pokemon) => {
      const maxHp = pokemon.stats?.hp ?? pokemon.maxHp ?? pokemon.currentHp ?? 0;
      const currentHp = pokemon.currentHp ?? maxHp;
      if (currentHp <= 0) {
        return Promise.resolve();
      }
      const healAmount = Math.floor(maxHp * healPercent);
      const nextHp = Math.min(maxHp, currentHp + healAmount);
      return base44.entities.Pokemon.update(pokemon.id, {
        currentHp: nextHp
      });
    }));
    queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
  };

  const handleCampRest = async () => {
    await healParty(0.1);
    await advanceTime(60);
  };

  const handleCampSleep = async () => {
    const teamPokemon = allPokemon.filter((pokemon) => pokemon.isInTeam);
    await Promise.all(teamPokemon.map((pokemon) => {
      const maxHp = pokemon.stats?.hp ?? pokemon.maxHp ?? pokemon.currentHp ?? 0;
      const currentHp = pokemon.currentHp ?? maxHp;
      if (currentHp <= 0) {
        return Promise.resolve();
      }
      return base44.entities.Pokemon.update(pokemon.id, {
        currentHp: maxHp
      });
    }));
    queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
    await advanceTime(480);
  };

  const movePartyMember = async (index, direction) => {
    if (!player || !orderedParty[index]) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedParty.length) return;
    const reordered = [...orderedParty];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    const partyOrder = reordered.map((pokemon) => pokemon.id);
    await base44.entities.Player.update(player.id, { partyOrder });
    queryClient.invalidateQueries({ queryKey: ['player'] });
    queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
  };

  const handleExplore = async () => {
    await advanceTime(10);
    const currentProgress = zoneProgress?.discoveryProgress || 0;
    const progressGain = Math.floor(Math.random() * 11) + 5; // 5-15
    
    // Determine encounter type - 30% chance for wild Pokémon
    const roll = Math.random() * 100;
    let result;
    let actualProgressGain = 0;

    if (roll < 30 && zone.name === "Verdant Hollow") {
      // Wild Pokémon encounter using new system
      const wildPokemon = generateWildPokemon(verdantHollowEncounters);
      
      if (wildPokemon) {
        const firstDiscovery = !(zoneProgress?.discoveredPokemon || []).includes(wildPokemon.species);
        actualProgressGain = firstDiscovery ? progressGain + 5 : 0;
        
        result = {
          type: 'pokemon',
          title: firstDiscovery ? '🆕 New Pokémon Discovered!' : 'Wild Pokémon Encountered',
          description: `A wild ${wildPokemon.species} appeared!`,
          pokemon: wildPokemon.species,
          pokemonLevel: wildPokemon.level,
          pokemonNature: wildPokemon.nature,
          pokemonRole: wildPokemon.roles[0],
          wildPokemonData: wildPokemon,
          progressGained: actualProgressGain,
          firstDiscovery,
          rarity: wildPokemon._speciesData.catchRate > 0.4 ? 'common' : 
                  wildPokemon._speciesData.catchRate > 0.3 ? 'uncommon' : 'rare'
        };
      }
    } else if (roll < 55) {
      // Material Discovery
      const materials = ['Silk Fragment', 'Glowworm', 'Moonleaf', 'River Stone', 'Ancient Shard'];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const firstDiscovery = !(zoneProgress?.discoveredMaterials || []).includes(material);
      actualProgressGain = firstDiscovery ? progressGain : 0;
      
      result = {
        type: 'material',
        title: firstDiscovery ? '🆕 New Material Found!' : 'Materials Found',
        description: `Gathered ${material} from the area`,
        materials: [material],
        progressGained: actualProgressGain,
        firstDiscovery,
        rarity: 'common',
        materialName: material
      };
    } else if (roll < 80) {
      // Point of Interest
      const undiscoveredPOIs = (zone.nodelets || []).filter(
        n => !(zoneProgress?.discoveredPOIs || []).includes(n.id)
      );
      
      if (undiscoveredPOIs.length > 0) {
        const poi = undiscoveredPOIs[Math.floor(Math.random() * undiscoveredPOIs.length)];
        actualProgressGain = progressGain + 10;
        
        result = {
          type: 'poi',
          title: '🆕 Point of Interest Unlocked!',
          description: `Discovered ${poi?.name || 'a hidden location'}`,
          poi: poi?.name || 'Mystery Location',
          poiId: poi?.id,
          progressGained: actualProgressGain,
          firstDiscovery: true,
          rarity: 'uncommon'
        };
      } else {
        // No more POIs to discover, find material instead
        const materials = ['Silk Fragment', 'Glowworm', 'Moonleaf'];
        const material = materials[Math.floor(Math.random() * materials.length)];
        const firstDiscovery = !(zoneProgress?.discoveredMaterials || []).includes(material);
        actualProgressGain = firstDiscovery ? progressGain : 0;
        
        result = {
          type: 'material',
          title: firstDiscovery ? '🆕 New Material Found!' : 'Materials Found',
          description: `Gathered ${material} from the area`,
          materials: [material],
          progressGained: actualProgressGain,
          firstDiscovery,
          rarity: 'common',
          materialName: material
        };
      }
    } else {
      // Special Event
      actualProgressGain = progressGain + 15;
      result = {
        type: 'special',
        title: '⚡ Special Event!',
        description: 'You sense something unusual in the air...',
        progressGained: actualProgressGain,
        firstDiscovery: true,
        rarity: 'rare'
      };
    }

    if (!result) {
      result = {
        type: 'special',
        title: '🌿 Quiet Moment',
        description: 'You scout the area but find no immediate encounter.',
        progressGained: 0,
        firstDiscovery: false,
        rarity: 'common'
      };
    }

    // Add to exploration feed
    setExplorationEvents(prev => [result, ...prev].slice(0, 10));
    
    // Show encounter result
    setCurrentEncounter(result);
    
    // Update zone progress in state and database
    const newProgress = Math.min(currentProgress + actualProgressGain, 100);
    const updatedDiscoveredPokemon = result?.firstDiscovery && result.type === 'pokemon'
      ? [...(zoneProgress?.discoveredPokemon || []), result.pokemon]
      : (zoneProgress?.discoveredPokemon || []);
    
    const updatedDiscoveredMaterials = result?.firstDiscovery && result.type === 'material'
      ? [...(zoneProgress?.discoveredMaterials || []), result.materialName]
      : (zoneProgress?.discoveredMaterials || []);
    
    const updatedDiscoveredPOIs = result?.firstDiscovery && result.type === 'poi'
      ? [...(zoneProgress?.discoveredPOIs || []), result.poiId]
      : (zoneProgress?.discoveredPOIs || []);

    const updatedProgress = {
      ...zoneProgress,
      discoveryProgress: newProgress,
      discoveredPokemon: updatedDiscoveredPokemon,
      discoveredMaterials: updatedDiscoveredMaterials,
      discoveredPOIs: updatedDiscoveredPOIs,
      explorationCount: (zoneProgress?.explorationCount || 0) + 1,
      lastExploredAt: new Date().toISOString()
    };

    setZoneProgress(updatedProgress);

    // Save to database
    try {
      if (zoneProgress?.id) {
        await base44.entities.ZoneProgress.update(zoneProgress.id, updatedProgress);
      } else {
        await base44.entities.ZoneProgress.create({
          zoneId: zone.id,
          zoneName: zone.name,
          ...updatedProgress
        });
      }
      refetchProgress();
    } catch (error) {
      console.error('Failed to save progress:', error);
    }

    // Advance world time after the exploration event resolves.
    await advanceTime(EXPLORE_TIME_MINUTES);
  };

  const handleContinueExploring = () => {
    setCurrentEncounter(null);
  };

  const handleEncounterAction = async (action, encounter) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: encounter.type,
      action: action,
      details: ''
    };

    if (action === 'battle' && encounter.pokemon) {
      // Create wild Pokémon and navigate to battle
      try {
        const wildData = encounter.wildPokemonData;
        const wildPokemon = await base44.entities.Pokemon.create({
          species: wildData.species,
          level: wildData.level,
          nature: wildData.nature,
          ivs: wildData.ivs,
          evs: wildData.evs,
          type1: wildData.type1,
          type2: wildData.type2,
          abilities: wildData.abilities,
          talents: wildData.talents,
          roles: wildData.roles,
          signatureMove: wildData.signatureMove,
          isInTeam: false,
          isWild: true
        });

        logEntry.details = `Started battle with ${encounter.pokemon}`;
        setExplorationEvents(prev => [{
          title: '⚔️ Battle Started',
          description: `Engaging ${encounter.pokemon} in battle!`,
          type: 'special',
          rarity: 'uncommon'
        }, ...prev].slice(0, 10));
        
        // Navigate to battle using React Router
        navigate('/Battle', {
          state: {
            wildPokemonId: wildPokemon.id,
            returnTo: `Zones?zoneId=${zone.id}`
          }
        });
        setCurrentEncounter(null);
      } catch (error) {
        console.error('Failed to create wild Pokémon:', error);
      }
    } 
    else if (action === 'capture' && encounter.pokemon) {
      // Attempt to capture
      try {
        const captureChance = Math.random() * 100;
        const rarityModifier = encounter.rarity === 'legendary' ? 50 : 
                              encounter.rarity === 'rare' ? 30 : 
                              encounter.rarity === 'uncommon' ? 10 : 0;
        const success = captureChance > (30 + rarityModifier);
        
        if (success) {
          // Create the captured Pokémon
          await base44.entities.Pokemon.create({
            species: encounter.pokemon,
            level: encounter.pokemonLevel,
            isInTeam: false,
            stats: {
              hp: encounter.pokemonLevel * 10,
              maxHp: encounter.pokemonLevel * 10,
              atk: encounter.pokemonLevel * 5,
              def: encounter.pokemonLevel * 4,
              spAtk: encounter.pokemonLevel * 5,
              spDef: encounter.pokemonLevel * 4,
              spd: encounter.pokemonLevel * 6
            }
          });
          
          logEntry.details = `Captured ${encounter.pokemon}!`;
          setExplorationEvents(prev => [{
            title: '🎉 Capture Success!',
            description: `${encounter.pokemon} was caught!`,
            type: 'pokemon',
            rarity: 'uncommon',
            firstDiscovery: true
          }, ...prev].slice(0, 10));
        } else {
          logEntry.details = `${encounter.pokemon} broke free!`;
          setExplorationEvents(prev => [{
            title: '💨 Capture Failed',
            description: `${encounter.pokemon} escaped!`,
            type: 'pokemon',
            rarity: 'common'
          }, ...prev].slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to capture Pokémon:', error);
      }
      setCurrentEncounter(null);
    }
    else if (action === 'scan' && encounter.pokemon) {
      // Add to discovered Pokémon list only
      try {
        if (zoneProgress?.id && !zoneProgress.discoveredPokemon?.includes(encounter.pokemon)) {
          const updatedDiscovered = [...(zoneProgress.discoveredPokemon || []), encounter.pokemon];
          await base44.entities.ZoneProgress.update(zoneProgress.id, {
            discoveredPokemon: updatedDiscovered
          });
          refetchProgress();
        }
        
        logEntry.details = `Scanned ${encounter.pokemon}`;
        setExplorationEvents(prev => [{
          title: '📝 Pokémon Scanned',
          description: `${encounter.pokemon} data logged to journal`,
          type: 'pokemon',
          rarity: 'common'
        }, ...prev].slice(0, 10));
      } catch (error) {
        console.error('Failed to scan Pokémon:', error);
      }
      setCurrentEncounter(null);
    }
    else if (action === 'collect' && encounter.materials) {
      // Add materials to inventory
      try {
        for (const material of encounter.materials) {
          await base44.entities.Item.create({
            name: material,
            type: 'Material',
            tier: 1,
            rarity: 'Common',
            description: `A crafting material found in ${zone.name}`,
            quantity: 1,
            stackable: true,
            sellValue: 10
          });
        }
        
        logEntry.details = `Collected ${encounter.materials.join(', ')}`;
        setExplorationEvents(prev => [{
          title: '✅ Materials Collected',
          description: `Added ${encounter.materials.join(', ')} to inventory`,
          type: 'material',
          rarity: 'common',
          firstDiscovery: encounter.firstDiscovery
        }, ...prev].slice(0, 10));

        // Trigger first_material tutorial
        const tutorials = await base44.entities.Tutorial.filter({
          trigger: 'first_material',
          isCompleted: false,
          isSkipped: false
        });
        
        if (tutorials.length > 0) {
          queryClient.invalidateQueries({ queryKey: ['tutorials'] });
        }
      } catch (error) {
        console.error('Failed to collect materials:', error);
      }
      setCurrentEncounter(null);
    }
    else if (action === 'reveal' && encounter.poi) {
      // Reveal POI on map and update progress
      try {
        if (zoneProgress?.id && encounter.poiId && !zoneProgress.discoveredPOIs?.includes(encounter.poiId)) {
          const updatedPOIs = [...(zoneProgress.discoveredPOIs || []), encounter.poiId];
          await base44.entities.ZoneProgress.update(zoneProgress.id, {
            discoveredPOIs: updatedPOIs
          });
          refetchProgress();
        }
        
        logEntry.details = `Revealed ${encounter.poi}`;
        setExplorationEvents(prev => [{
          title: '🗺️ Location Revealed',
          description: `${encounter.poi} is now accessible`,
          type: 'poi',
          rarity: 'uncommon',
          firstDiscovery: true
        }, ...prev].slice(0, 10));
        
        // Refresh zone progress to show the newly revealed POI
        setTimeout(() => {
          setIsExploring(false);
        }, 1500);
      } catch (error) {
        console.error('Failed to reveal POI:', error);
      }
      setCurrentEncounter(null);
    }
    else if (action === 'investigate') {
      // Special event investigation
      logEntry.details = 'Investigated unusual phenomenon';
      setExplorationEvents(prev => [{
        title: '🔍 Mystery Deepens',
        description: 'You sense a powerful presence nearby...',
        type: 'special',
        rarity: 'rare'
      }, ...prev].slice(0, 10));
      setCurrentEncounter(null);
    }
  };

  const discoveredPokemon = zoneProgress?.discoveredPokemon?.length || 0;
  const totalPokemon = zone.availableWildPokemon?.length || 0;
  const discoveredPOIs = zoneProgress?.discoveredPOIs?.length || 0;
  const totalPOIs = zone.nodelets?.length || 0;
  const partyPokemon = allPokemon.filter((pokemon) => pokemon.isInTeam);
  const orderedParty = useMemo(() => {
    if (!player?.partyOrder?.length) {
      return partyPokemon;
    }
    return player.partyOrder
      .map((id) => partyPokemon.find((pokemon) => pokemon.id === id))
      .filter(Boolean);
  }, [partyPokemon, player]);
  const activeQuests = player?.activeQuests || [];

  const currentTimeTotal = toTotalMinutes(normalizeGameTime(gameTime));

  const getQuestTimeLeft = (quest) => {
    if (!Number.isFinite(quest?.expiresAtMinutes)) return 'No expiry';
    return getTimeLeftLabel(currentTimeTotal, quest.expiresAtMinutes);
  };

  const getMatchingPokemonForQuest = (quest) => {
    if (quest?.type !== 'research') return [];
    return allPokemon.filter((pokemon) => {
      if (quest.species && pokemon.species !== quest.species) return false;
      if (quest.nature && pokemon.nature !== quest.nature) return false;
      if (quest.level && (pokemon.level || 0) < quest.level) return false;
      if (Array.isArray(quest.ivConditions) && quest.ivConditions.length > 0) {
        const ivs = pokemon.ivs || {};
        const meetsIv = quest.ivConditions.every((rule) => {
          const key = rule.stat?.charAt(0).toLowerCase() + rule.stat?.slice(1);
          const altKey = rule.stat === 'Speed' ? 'spd' : key;
          const value = ivs[rule.stat] ?? ivs[key] ?? ivs[altKey] ?? 0;
          return value >= (rule.min ?? 0);
        });
        if (!meetsIv) return false;
      }
      return true;
    });
  };

  if (isExploring) {
    return (
      <div className="pb-8">
        <Button
          variant="outline"
          onClick={handleBackToDetails}
          className="mb-4"
        >
          ← Back to Zone
        </Button>

        <h2 className="text-2xl font-bold text-white mb-6">{zone.name} - Exploration</h2>

        <div className="grid grid-cols-1 gap-6">
          <DiscoveryMeter
            progress={zoneProgress?.discoveryProgress || 0}
            discoveredPokemon={discoveredPokemon}
            discoveredPOIs={discoveredPOIs}
            totalPokemon={totalPokemon}
            totalPOIs={totalPOIs}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {currentEncounter ? (
                <EncounterResult
                  result={currentEncounter}
                  onContinue={handleContinueExploring}
                  onAction={handleEncounterAction}
                />
              ) : (
                <Button
                  onClick={handleExplore}
                  className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-lg py-6"
                >
                  <Compass className="w-5 h-5 mr-2" />
                  Explore
                </Button>
              )}
            </div>

            <ExplorationFeed events={explorationEvents} />
          </div>
        </div>
      </div>
    );
  }

  const sectionOptions = [
    { id: 'explore', label: 'Explore' },
    { id: 'places', label: 'Places' },
    { id: 'camp', label: 'Camp' },
    { id: 'items', label: 'Items' },
    { id: 'pokemon', label: 'Pokémon' },
    { id: 'quests', label: 'Quests' },
    { id: 'return', label: 'Return' }
  ];

  return (
    <div className="pb-8">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          ← Back to Zone List
        </Button>
        <div className={`relative h-56 rounded-2xl overflow-hidden bg-gradient-to-br ${gradient}`}>
          {zone.imageUrl && (
            <img src={zone.imageUrl} alt={zone.name} className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge className="bg-black/40 text-white border-white/20 mb-2">{zone.biomeType}</Badge>
            <h2 className="text-3xl font-bold text-white">{zone.name}</h2>
            <p className="text-slate-200 mt-2 max-w-2xl">{zone.description}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {sectionOptions.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'default' : 'outline'}
            onClick={() => {
              if (section.id === 'return') {
                handleReturnToTown();
              } else {
                setActiveSection(section.id);
                if (section.id !== 'explore') {
                  setIsExploring(false);
                }
              }
            }}
            className={activeSection === section.id ? 'bg-indigo-500 text-white' : 'border-slate-700 text-slate-200'}
          >
            {section.label}
          </Button>
        ))}
      </div>

      {activeSection === 'explore' && (
        <div>
          {eclipseNodelets.length > 0 && (
            <div className="mb-4">
              <ZoneLiberationTracker zone={zone} liberatedNodelets={liberatedNodelets} />
            </div>
          )}

          <div className="glass rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              Discovery Progress: {Math.round(zoneProgress?.discoveryProgress || 0)}/100
            </h3>
            <StatBar
              value={zoneProgress?.discoveryProgress || 0}
              maxValue={100}
              color="bg-gradient-to-r from-indigo-500 to-cyan-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{Math.round(zoneProgress?.discoveryProgress || 0)}%</span>
              <span>Explorations: {zoneProgress?.explorationCount || 0}</span>
            </div>
          </div>

          {zone.availableWildPokemon && zone.availableWildPokemon.length > 0 && (
            <div className="glass rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" /> Wild Pokémon
              </h3>
              <div className="space-y-2">
                {zone.availableWildPokemon.map((pokemon, idx) => {
                  const isDiscovered = (zoneProgress?.discoveredPokemon || []).includes(pokemon.species);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                          {isDiscovered ? (
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span className="text-slate-600 text-xs">???</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {isDiscovered ? pokemon.species : '??? Pokémon'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {isDiscovered ? `Lv. ${pokemon.minLevel}-${pokemon.maxLevel}` : 'Not yet discovered'}
                          </p>
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
                  );
                })}
              </div>
            </div>
          )}

          <Button
            onClick={handleStartExploring}
            className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
          >
            <Compass className="w-4 h-4 mr-2" /> Explore
          </Button>
        </div>
      )}

      {activeSection === 'places' && (
        <div className="space-y-4">
          {eclipseNodelets.length > 0 && (
            <div>
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

          {zone.nodelets && zone.nodelets.filter(n => !n.eclipseControlled).length > 0 ? (
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Map className="w-4 h-4 text-amber-400" /> Points of Interest
              </h3>
              <div className="space-y-2">
                {zone.nodelets.filter(n => !n.eclipseControlled).map((nodelet, idx) => {
                  const isDiscovered = (zoneProgress?.discoveredPOIs || []).includes(nodelet.id);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isDiscovered) {
                          handleNodeletInspect(nodelet);
                        }
                      }}
                      disabled={!isDiscovered}
                      className={`w-full flex items-center justify-between bg-slate-800/50 rounded-lg p-3 transition-colors ${
                        isDiscovered ? 'hover:bg-slate-700/50 cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isDiscovered ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <div className="text-left">
                          <p className="text-white text-sm">
                            {isDiscovered ? nodelet.name : '??? Location'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {isDiscovered ? nodelet.type : 'Not yet discovered'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {nodelet.isCompleted ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Complete</Badge>
                        ) : isDiscovered ? (
                          <>
                            <Badge className="bg-amber-500/20 text-amber-300 text-xs">Available</Badge>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </>
                        ) : (
                          <Badge className="bg-slate-700/50 text-slate-400 text-xs">Hidden</Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-6 text-center text-slate-400">
              No places discovered yet.
            </div>
          )}
        </div>
      )}

      {activeSection === 'camp' && (
        <div className="glass rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Camp</h3>
          <p className="text-sm text-slate-400">
            Rest to recover a little HP and pass one hour, or sleep to heal fully and pass eight hours. Fainted Pokémon are not revived.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <Button onClick={handleCampRest} className="bg-indigo-500 hover:bg-indigo-600">
              Rest (10% heal, +1 hour)
            </Button>
            <Button onClick={handleCampSleep} className="bg-emerald-500 hover:bg-emerald-600">
              Sleep (Full heal, +8 hours)
            </Button>
          </div>
        </div>
      )}

      {activeSection === 'items' && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Inventory</h3>
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.type}</p>
                  </div>
                  <Badge className="bg-slate-700/50 text-slate-300 text-xs">
                    x{item.quantity ?? 1}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No items in your bag yet.</p>
          )}
        </div>
      )}

      {activeSection === 'pokemon' && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Active Party</h3>
          {orderedParty.length > 0 ? (
            <div className="space-y-2">
              {orderedParty.map((pokemon, index) => (
                <div key={pokemon.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <div>
                    <p className="text-white font-medium text-sm">{pokemon.species}</p>
                    <p className="text-xs text-slate-400">Lv. {pokemon.level ?? 1}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span>HP {pokemon.currentHp ?? pokemon.stats?.hp ?? 0}/{pokemon.stats?.hp ?? pokemon.maxHp ?? 0}</span>
                    <span className="text-slate-500">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => movePartyMember(index, -1)}
                      disabled={index === 0}
                      className="border-slate-700 text-slate-200"
                    >
                      ↑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => movePartyMember(index, 1)}
                      disabled={index === orderedParty.length - 1}
                      className="border-slate-700 text-slate-200"
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No Pokémon in your party yet.</p>
          )}
        </div>
      )}

      {activeSection === 'quests' && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Active Quests</h3>
          {activeQuests.length > 0 ? (
            <div className="space-y-3">
              {activeQuests.map((quest) => {
                const questProgress = quest.type === 'research' && quest.questId
                  ? getSubmissionCount(quest.questId)
                  : quest.progress ?? 0;
                const matchingPokemon = getMatchingPokemonForQuest(quest);
                return (
                <div key={quest.id} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium text-sm">{quest.name}</p>
                    <Badge className="bg-indigo-500/20 text-indigo-200 text-xs">{quest.type || 'Quest'}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{quest.description}</p>
                  <div className="mt-2 text-xs text-slate-300">
                    Progress: {questProgress}/{quest.goal ?? 1}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Time Left: <span className="text-slate-200">{getQuestTimeLeft(quest)}</span>
                  </div>
                  {quest.type === 'research' && (
                    <div className="mt-2 text-xs text-slate-400">
                      Fulfilling Pokémon: {matchingPokemon.length
                        ? matchingPokemon.map((pokemon) => pokemon.species).join(', ')
                        : 'None in your roster'}
                    </div>
                  )}
                  {quest.type === 'research' && (
                    <p className="mt-1 text-[11px] text-slate-500">Submit research quests only at Professor Maple.</p>
                  )}
                </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400">No active quests. Accept quests from NPCs to track them here.</p>
          )}
        </div>
      )}
    </div>
  );
}

