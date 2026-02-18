import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map as MapIcon, Search, Compass, Eye, Sparkles, ChevronRight } from 'lucide-react';
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
import ZoneBestiary from '@/components/zones/ZoneBestiary';
import ZoneLogbook from '@/components/zones/ZoneLogbook';
import PlantingPlotModal from '@/components/zones/PlantingPlotModal';
import BerryFarmPanel from '@/components/zones/BerryFarmPanel';
import ZonePartyPanel from '@/components/zones/ZonePartyPanel';
import ZoneInventoryPanel from '@/components/zones/ZoneInventoryPanel';
import IrisShopModal from '@/components/zones/IrisShopModal';
import MerraQuestsModal from '@/components/zones/MerraQuestsModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { getBaseStats } from '@/components/pokemon/baseStats';
import { calculateAllStats } from '@/components/pokemon/statCalculations';
import { getSubmissionCount } from '@/components/systems/quests/questProgressTracker';
import { advanceGameTime, getTimeLeftLabel, normalizeGameTime, toTotalMinutes } from '@/components/systems/time/gameTimeSystem';
import {
  verdantHollowEncounters,
  generateWildPokemon,
  createWildPokemonInstance } from
'@/components/zones/wildPokemonData';
import { VERDANT_HOLLOW_NODELETS, shouldSeedVerdantNodelets } from '@/components/zones/verdantHollowNodelets';

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

  useEffect(() => {
    const syncVerdantHollowNodelets = async () => {
      const verdant = zones.find((zone) => zone.name === 'Verdant Hollow');
      if (!verdant || !shouldSeedVerdantNodelets(verdant)) {
        return;
      }

      try {
        await base44.entities.Zone.update(verdant.id, { nodelets: VERDANT_HOLLOW_NODELETS });
        queryClient.invalidateQueries({ queryKey: ['zones'] });
      } catch (error) {
        console.error('Failed to seed Verdant Hollow nodelets:', error);
      }
    };

    if (zones.length > 0) {
      syncVerdantHollowNodelets();
    }
  }, [zones, queryClient]);

  const discoveredZones = player?.discoveredZones || ['Verdant Hollow'];
  const selectedZoneId = searchParams.get('zoneId');
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId);

  const filteredZones = zones.filter((zone) =>
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
        icon={MapIcon}
        action={
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
            placeholder="Search zones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-800/50 border-slate-700 w-48" />

          </div>
        } />


      {isLoading ?
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) =>
        <Skeleton key={i} className="h-64 bg-slate-800" />
        )}
        </div> :
      selectedZone ?
      <ZoneDetailView
        zone={selectedZone}
        onBack={() => setSearchParams({})} /> :

      filteredZones.length > 0 ?
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}>

          {filteredZones.map((zone, idx) =>
        <motion.div
          key={zone.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}>

              <ZoneCard
            zone={zone}
            isDiscovered={discoveredZones.includes(zone.name)}
            onClick={() => setSearchParams({ zoneId: zone.id })} />

            </motion.div>
        )}
        </motion.div> :

      <div className="glass rounded-xl p-12 text-center">
          <MapIcon className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">No Zones Found</h3>
          <p className="text-slate-400">Try a different search term</p>
        </div>
      }

    </div>);

}

function ZoneDetailView({ zone, onBack }) {
  const [activeSection, setActiveSection] = useState('explore');
  const [isExploring, setIsExploring] = useState(false);
  const [explorationEvents, setExplorationEvents] = useState([]);
  const [currentEncounter, setCurrentEncounter] = useState(null);
  const [zoneProgress, setZoneProgress] = useState(null);
  const [selectedNodelet, setSelectedNodelet] = useState(null);
  const [activeNodelet, setActiveNodelet] = useState(null);
  const [showPlantingModal, setShowPlantingModal] = useState(false);
  const [showIrisShop, setShowIrisShop] = useState(false);
  const [showMerraQuests, setShowMerraQuests] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return await base44.auth.me();
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
    },
    refetchInterval: false,
    staleTime: Infinity
  });

  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list(),
    refetchInterval: 5000
  });

  const { data: allPokemon = [] } = useQuery({
    queryKey: ['allPokemon'],
    queryFn: () => base44.entities.Pokemon.list()
  });

  const { data: berryPlots = [] } = useQuery({
    queryKey: ['berryPlots', zone.id, user?.email],
    queryFn: async () => {
      if (!user?.email || !zone?.id) return [];
      return await base44.entities.BerryPlot.filter({
        playerEmail: user.email,
        zoneId: zone.id
      });
    },
    enabled: !!user?.email && !!zone?.id,
    refetchInterval: 5000
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
    Swamp: 'from-teal-600 to-emerald-800'
  };

  const gradient = biomeColors[zone.biomeType] || 'from-indigo-500 to-purple-600';

  const nodeletTemplateMap = useMemo(
    () => new Map(VERDANT_HOLLOW_NODELETS.map((nodelet) => [nodelet.id, nodelet])),
    []
  );

  const resolveNodeletConfig = (nodelet) => {
    if (!nodelet) return nodelet;
    const template = nodeletTemplateMap.get(nodelet.id);
    if (!template) return nodelet;

    const preferArray = (primary, fallback) =>
    Array.isArray(primary) && primary.length > 0 ?
    primary :
    Array.isArray(fallback) ?
    fallback :
    primary || [];


    return {
      ...template,
      ...nodelet,
      actions: preferArray(nodelet.actions, template.actions),
      wildPokemon: preferArray(nodelet.wildPokemon, template.wildPokemon),
      npcs: preferArray(nodelet.npcs, template.npcs),
      items: preferArray(nodelet.items, template.items),
      enemyNPCs: preferArray(nodelet.enemyNPCs, template.enemyNPCs),
      gameplayFeatures: preferArray(nodelet.gameplayFeatures, template.gameplayFeatures),
      npcHooks: preferArray(nodelet.npcHooks, template.npcHooks),
      objectives: preferArray(nodelet.objectives, template.objectives),
      encounterTables: {
        ...(template.encounterTables || {}),
        ...(nodelet.encounterTables || {})
      }
    };
  };

  const liberatedNodelets = player?.liberatedNodelets || [];
  const eclipseNodelets = zone.nodelets?.filter((n) => n.eclipseControlled) || [];

  const handleNodeletChallenge = (nodelet) => {
    const encounter = nodelet?.revenantEncounter;
    if (!encounter?.species) {
      return;
    }

    const level = encounter.level || 12;

    const runChallenge = async () => {
      try {
        const primedNodelets = (zone.nodelets || []).map((currentNodelet) =>
        currentNodelet.id === nodelet.id ?
        {
          ...currentNodelet,
          lastAction: 'Challenge Revenant',
          lastActionAt: new Date().toISOString()
        } :
        currentNodelet
        );

        await base44.entities.Zone.update(zone.id, { nodelets: primedNodelets });
        queryClient.setQueryData(['zones'], (existingZones = []) =>
        existingZones.map((existingZone) =>
        existingZone.id === zone.id ? { ...existingZone, nodelets: primedNodelets } : existingZone
        )
        );

        const revenantTemplate = createWildPokemonInstance(encounter.species, { level });
        if (!revenantTemplate) return;

        const revenantPokemon = await base44.entities.Pokemon.create({
          ...revenantTemplate,
          isInTeam: false,
          isWild: true,
          isRevenant: true
        });

        setExplorationEvents((prev) => [{
          title: '🩸 Eclipse Challenge Begun',
          description: `Confronting Revenant ${encounter.species} at ${nodelet.name}`,
          type: 'special',
          rarity: 'rare'
        }, ...prev].slice(0, 10));

        setSelectedNodelet(null);
        navigate('/Battle', {
          state: {
            wildPokemonId: revenantPokemon.id,
            returnTo: `Zones?zoneId=${zone.id}&nodeletBattle=1&nodeletId=${nodelet.id}&nodeletBattleType=eclipse`,
            nodeletBattleContext: {
              zoneId: zone.id,
              nodeletId: nodelet.id,
              battleType: 'eclipse'
            }
          }
        });
      } catch (error) {
        console.error('Failed to start nodelet challenge:', error);
      }
    };

    runChallenge();
  };

  const buildTrainerRoster = ({ nodelet, leadSpecies, level = 8 }) => {
    const speciesPool = Array.from(new Set([
    leadSpecies,
    ...(nodelet?.wildPokemon || [])].
    filter(Boolean)));

    if (speciesPool.length === 0) {
      return [];
    }

    const minTeamSize = 3;
    const maxTeamSize = 6;
    const teamSize = Math.floor(Math.random() * (maxTeamSize - minTeamSize + 1)) + minTeamSize;

    const selected = [leadSpecies];
    while (selected.length < teamSize) {
      const randomSpecies = speciesPool[Math.floor(Math.random() * speciesPool.length)] || leadSpecies;
      selected.push(randomSpecies);
    }

    return selected.map((speciesName, index) => ({
      species: speciesName,
      level: Math.max(1, (level || 8) + index)
    }));
  };

  const startNodeletWildEncounter = async ({ species, level = 8, nodelet, battleType = 'wild', extraState = {}, isTrainerNPC = false, trainerName = null }) => {
    try {
      const rosterPlan = isTrainerNPC ?
      buildTrainerRoster({ nodelet, leadSpecies: species, level }) :
      [{ species, level }];

      const rosterInstances = [];
      for (const entry of rosterPlan) {
        const wildTemplate = createWildPokemonInstance(entry.species, { level: entry.level });
        if (!wildTemplate) continue;

        const createdPokemon = await base44.entities.Pokemon.create({
          ...wildTemplate,
          isInTeam: false,
          isWild: !isTrainerNPC,
          isTrainerNPC,
          trainerName
        });
        rosterInstances.push(createdPokemon);
      }

      const wildPokemon = rosterInstances[0];
      if (!wildPokemon) return false;

      setExplorationEvents((prev) => [{
        title: '⚔️ Location Encounter',
        description: `${species} appeared at ${nodelet.name}!`,
        type: 'pokemon',
        rarity: 'uncommon'
      }, ...prev].slice(0, 10));

      setSelectedNodelet(null);
      navigate('/Battle', {
        state: {
          wildPokemonId: wildPokemon.id,
          returnTo: `Zones?zoneId=${zone.id}&nodeletBattle=1&nodeletId=${nodelet.id}&nodeletBattleType=${battleType}`,
          nodeletBattleContext: {
            zoneId: zone.id,
            nodeletId: nodelet.id,
            battleType
          },
          trainerRoster: isTrainerNPC ? rosterInstances : undefined,
          encounterPokemonIds: rosterInstances.map((pokemon) => pokemon.id),
          ...extraState
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to start location encounter:', error);
      return false;
    }
  };

  const maybeTriggerEnemyNPCEncounter = async (nodelet, chance = 0.2) => {
    nodelet = resolveNodeletConfig(nodelet);
    const contractState = getBrambleberryContractState(nodelet);
    const scaledChance = nodelet?.id === 'vh-brambleberry-thicket' ?
    chance + (contractState.tier1Completed ? 0.06 : 0) + (contractState.tier2Completed ? 0.08 : 0) :
    chance;

    if (!nodelet?.enemyNPCs?.length || Math.random() > scaledChance) {
      return false;
    }

    const enemyTrainer = nodelet.enemyNPCs[Math.floor(Math.random() * nodelet.enemyNPCs.length)];
    const encounter = getNodeletEncounter(nodelet, 'Explore') || { species: nodelet.wildPokemon?.[0], level: 10 };
    if (!encounter?.species) return false;

    setExplorationEvents((prev) => [{
      title: '⚔️ Trainer Ambush',
      description: `${enemyTrainer} challenged you near ${nodelet.name}.`,
      type: 'special',
      rarity: 'rare'
    }, ...prev].slice(0, 10));

    return startNodeletWildEncounter({
      species: encounter.species,
      level: (encounter.level || 10) + 1,
      nodelet,
      battleType: 'enemyNpc',
      isTrainerNPC: true,
      trainerName: enemyTrainer
    });
  };

  const handleExploreNodelet = async (nodelet) => {
    nodelet = resolveNodeletConfig(nodelet);
    // Exploring a location takes 10 in-game minutes - advance time first
    try {
      await advanceTime(EXPLORE_TIME_MINUTES);
    } catch (e) {
      console.error('advanceTime failed during nodelet explore:', e);
    }

    const roll = Math.random();

    if (nodelet.id === 'vh-brambleberry-thicket') {
      if (roll < 0.15) {
        const seeds = ['Oran Berry Seed', 'Pecha Berry Seed', 'Cheri Berry Seed'];
        const foundSeed = seeds[Math.floor(Math.random() * seeds.length)];
        try {
          await upsertItem(foundSeed, 1, {
            type: 'Material',
            rarity: 'Common',
            description: 'A berry seed found in the thicket'
          });
          queryClient.invalidateQueries({ queryKey: ['items'] });
          setExplorationEvents((prev) => [{
            title: '🌱 Seed Found',
            description: `Discovered ${foundSeed} hidden in the brambles!`,
            type: 'material',
            rarity: 'uncommon'
          }, ...prev].slice(0, 10));
          return;
        } catch (error) {
          console.error('Failed to add seed:', error);
        }
      }

      if (roll < 0.35) {
        const enemyTriggered = await maybeTriggerEnemyNPCEncounter(nodelet, 0.25);
        if (enemyTriggered) return;
      }
    }

    const encounter = getNodeletEncounter(nodelet, 'Explore');
    if (!encounter?.species) {
      setExplorationEvents((prev) => [{
        title: '🌿 Quiet Location',
        description: `${nodelet.name} has no active encounter table yet.`,
        type: 'special',
        rarity: 'common'
      }, ...prev].slice(0, 10));
      return;
    }

    const started = await startNodeletWildEncounter({
      species: encounter.species,
      level: encounter.level,
      nodelet,
      battleType: 'locationExplore'
    });

    if (!started) {
      setExplorationEvents((prev) => [{
        title: '⚠️ Encounter Failed',
        description: `Could not start an encounter at ${nodelet.name}.`,
        type: 'special',
        rarity: 'common'
      }, ...prev].slice(0, 10));
    }
  };

  const handleNodeletNpcInteract = (nodelet, npcName) => {
    const resolvedNodelet = resolveNodeletConfig(nodelet);

    if (!resolvedNodelet || !npcName) return;

    if (npcName.toLowerCase().includes('merra')) {
      setShowMerraQuests(true);
      return;
    }

    if (npcName.toLowerCase().includes('iris')) {
      setShowIrisShop(true);
      return;
    }

    setExplorationEvents((prev) => [{
      title: '💬 NPC Interaction',
      description: `You chat with ${npcName} at ${resolvedNodelet.name}.`,
      type: 'special',
      rarity: 'common'
    }, ...prev].slice(0, 10));
  };

  const handleNodeletInspect = (nodelet) => {
    setSelectedNodelet(resolveNodeletConfig(nodelet));
  };

  const handleEnterNodelet = (nodelet) => {
    setActiveNodelet(resolveNodeletConfig(nodelet));
    setActiveSection('nodelet');
  };

  const handleLeaveNodelet = () => {
    setActiveNodelet(null);
    setActiveSection('places');
  };

  const upsertItem = async (name, quantity, overrides = {}) => {
    const existingItem = items.find((item) => item.name === name && item.stackable !== false);

    if (existingItem) {
      await base44.entities.Item.update(existingItem.id, {
        quantity: Math.max(0, (existingItem.quantity || 0) + quantity)
      });
      return;
    }

    if (quantity > 0) {
      await base44.entities.Item.create({
        name,
        type: overrides.type || 'Material',
        tier: overrides.tier || 1,
        rarity: overrides.rarity || 'Common',
        description: overrides.description || `Found in ${zone.name}`,
        quantity,
        stackable: true,
        sellValue: overrides.sellValue || 10
      });
    }
  };

  const handleNodeletAction = async (nodelet, action) => {
    nodelet = resolveNodeletConfig(nodelet);
    if (!zone?.id || !nodelet?.id) return;

    const now = new Date().toISOString();
    const nowGameTs = getCurrentGameTimestamp();

    if (action === 'Harvest') {
      // Harvest is now handled plot-by-plot in BerryFarmPanel via onHarvest prop
      return;
    }

    if (action === '__legacy_harvest__') {
      const BERRY_YIELDS = {
        'Oran Berry Seed': [2, 4],
        'Pecha Berry Seed': [2, 5],
        'Cheri Berry Seed': [3, 6],
        'Sitrus Berry Seed': [1, 3],
        'Lum Berry Seed': [1, 2]
      };

      const readyPlots = berryPlots.filter((plot) =>
      !plot.isHarvested &&
      plot.readyAt <= nowGameTs
      );

      if (readyPlots.length === 0) {
        setExplorationEvents((prev) => [{
          title: '🌱 No Berries Ready',
          description: 'Plant seeds and wait for them to grow before harvesting.',
          type: 'special',
          rarity: 'common'
        }, ...prev].slice(0, 10));
        return;
      }

      try {
        const poacherChance = nodelet.id === 'vh-brambleberry-thicket' ? 0.22 : 0.12;
        const poacherTriggered = await maybeTriggerEnemyNPCEncounter(nodelet, poacherChance);

        if (poacherTriggered) {
          return;
        }

        let totalHarvested = 0;
        const harvestedTypes = {};

        for (const plot of readyPlots) {
          const [min, max] = BERRY_YIELDS[plot.berryType] || [1, 3];
          const quantity = Math.floor(Math.random() * (max - min + 1)) + min;
          const berryName = plot.berryType.replace(' Seed', '');

          await upsertItem(berryName, quantity, {
            type: 'Consumable',
            description: 'A medicinal berry from Brambleberry Thicket'
          });

          harvestedTypes[berryName] = (harvestedTypes[berryName] || 0) + quantity;
          totalHarvested += quantity;

          await base44.entities.BerryPlot.update(plot.id, { isHarvested: true });
        }

        queryClient.invalidateQueries({ queryKey: ['berryPlots'] });
        queryClient.invalidateQueries({ queryKey: ['items'] });

        const harvestEncounterChance = readyPlots.length >= 3 ? 0.45 : 0.25;
        if (Math.random() < harvestEncounterChance) {
          const encounter = getNodeletEncounter(nodelet, 'Harvest');
          const encounteredSpecies = encounter?.species;
          const started = await startNodeletWildEncounter({
            species: encounteredSpecies,
            level: encounter?.level || 6 + Math.floor(Math.random() * 3),
            nodelet,
            battleType: 'berry'
          });

          if (started) {
            return;
          }
        }

        const harvestedSummary = Object.entries(harvestedTypes).
        map(([name, qty]) => `${qty}× ${name}`).
        join(', ');

        setExplorationEvents((prev) => [{
          title: '🫐 Berry Harvest',
          description: `Harvested ${harvestedSummary} from ${readyPlots.length} plot${readyPlots.length > 1 ? 's' : ''}`,
          type: 'material',
          rarity: 'common'
        }, ...prev].slice(0, 10));
      } catch (error) {
        console.error('Failed to harvest berries:', error);
      }
    }

    if (action === 'Plant' || action === 'Replant') {
      // Handled inline by BerryFarmPanel
      return;
    }



    if (action === 'Deliver Berries') {
      // Now handled by MerraQuestsModal — open it directly
      setShowMerraQuests(true);
      return;
    }

    if (action === 'Fish') {
      const baitOptions = ['Basic Bait', 'Quality Bait'];
      const bait = items.find((item) => baitOptions.includes(item.name) && (item.quantity || 0) > 0);

      if (!bait) {
        setExplorationEvents((prev) => [{
          title: '🎣 Need Bait',
          description: 'You need Basic Bait or Quality Bait to fish here.',
          type: 'special',
          rarity: 'common'
        }, ...prev].slice(0, 10));
        return;
      }

      try {
        await base44.entities.Item.update(bait.id, { quantity: Math.max(0, (bait.quantity || 0) - 1) });
        const fishEncounter = getNodeletEncounter(nodelet, 'Fish') || { species: 'Magikarp', level: 7 };
        const hooked = fishEncounter.species;
        const hasSurveyBuff = nodelet.surveyBuffUntil && toNodeletTimestamp(nodelet.surveyBuffUntil) > nowGameTs;
        const isNight = (gameTime?.currentHour ?? 12) >= 18 || (gameTime?.currentHour ?? 12) < 6;
        const isBog = nodelet.id === 'vh-mosswater-bog';
        const escapePenalty = isBog ? 10 : 0;
        const loot = hasSurveyBuff || Math.random() < 0.6 ? 'Bog Reed' : 'River Stone';

        if (Math.random() < (hasSurveyBuff ? 0.45 : 0.25)) {
          const started = await startNodeletWildEncounter({
            species: hooked,
            level: fishEncounter.level,
            nodelet,
            battleType: 'fishing',
            extraState: {
              locationHazardEscapePenalty: isBog ? 15 : 0
            }
          });

          if (started) {
            return;
          }
        }

        await upsertItem(loot, 1, { type: 'Material', description: `Recovered while fishing in ${nodelet.name}` });
        queryClient.invalidateQueries({ queryKey: ['items'] });
        setExplorationEvents((prev) => [{
          title: '🎣 Fishing Success',
          description: `Hooked signs of ${hooked}${isNight && isBog ? ' (night waters)' : ''} and collected ${loot}.${escapePenalty ? ' Mud is thick: flee chance reduced in this area.' : ''}`,
          type: 'special',
          rarity: 'uncommon'
        }, ...prev].slice(0, 10));
      } catch (error) {
        console.error('Failed to fish at nodelet:', error);
      }
    }

    if (action === 'Survey Pool') {
      setExplorationEvents((prev) => [{
        title: '🧭 Pool Surveyed',
        description: 'Fish movement mapped. Better odds for your next casts.',
        type: 'special',
        rarity: 'common'
      }, ...prev].slice(0, 10));
    }

    if (action === 'Collect Reeds') {
      try {
        const qty = 1 + Math.floor(Math.random() * 2);
        await upsertItem('Bog Reed', qty, { type: 'Material', description: `Harvested reeds from ${nodelet.name}` });
        queryClient.invalidateQueries({ queryKey: ['items'] });
        setExplorationEvents((prev) => [{
          title: '🌾 Bog Reeds Collected',
          description: `Collected ${qty} Bog Reed from the shallows.`,
          type: 'material',
          rarity: 'common'
        }, ...prev].slice(0, 10));
      } catch (error) {
        console.error('Failed to collect reeds:', error);
      }
    }

    if (action === 'Inspect Corruption') {
      const puzzleRoll = Math.random();
      const puzzleHint = puzzleRoll < 0.33 ?
      'Water resonance pattern logged.' :
      puzzleRoll < 0.66 ?
      'Strange spores orbit the spring core.' :
      'Corruption signature mapped to Eclipse residue.';
      setExplorationEvents((prev) => [{
        title: '🔍 Corruption Scanned',
        description: `The spring pulses with Eclipse residue. ${puzzleHint} Challenge is now available.`,
        type: 'special',
        rarity: 'uncommon'
      }, ...prev].slice(0, 10));
    }

    if (action === 'Challenge Revenant') {
      handleNodeletChallenge(nodelet);
      return;
    }

    if (
    action === 'Purify Spring' &&
    nodelet.eclipseControlled &&
    nodelet.lastChallengeOutcome !== 'victory')
    {
      setExplorationEvents((prev) => [{
        title: '⚠️ Spring Still Corrupted',
        description: 'Defeat the Revenant first, then return to purify the spring.',
        type: 'special',
        rarity: 'common'
      }, ...prev].slice(0, 10));
      return;
    }

    if (action === 'Set Lure') {
      const lureSource = items.find((item) => ['Wild Honey', 'Basic Bait'].includes(item.name) && (item.quantity || 0) > 0);
      if (!lureSource) {
        setExplorationEvents((prev) => [{
          title: '🍯 Lure Needed',
          description: 'Set Lure requires Wild Honey or Basic Bait.',
          type: 'special',
          rarity: 'common'
        }, ...prev].slice(0, 10));
        return;
      }

      try {
        await base44.entities.Item.update(lureSource.id, { quantity: Math.max(0, (lureSource.quantity || 0) - 1) });
        queryClient.invalidateQueries({ queryKey: ['items'] });
        setExplorationEvents((prev) => [{
          title: '🍯 Lure Set',
          description: 'The hives are stirring. Return soon for activity.',
          type: 'special',
          rarity: 'uncommon'
        }, ...prev].slice(0, 10));
      } catch (error) {
        console.error('Failed to set apiary lure:', error);
      }
    }

    if (action === 'Harvest Hive') {
      if (!nodelet.lureReadyAt || toNodeletTimestamp(nodelet.lureReadyAt) > nowGameTs) {
        setExplorationEvents((prev) => [{
          title: '🐝 Hive Dormant',
          description: 'Set a lure and wait a little before harvesting the hive.',
          type: 'special',
          rarity: 'common'
        }, ...prev].slice(0, 10));
        return;
      }

      try {
        await upsertItem('Wax Comb', 1, { type: 'Material', description: `Recovered from ${nodelet.name}` });
        if (Math.random() < 0.35) {
          await upsertItem('Royal Jelly', 1, {
            type: 'Material',
            rarity: 'Uncommon',
            description: `Rare nectar from ${nodelet.name}`
          });
        }
        queryClient.invalidateQueries({ queryKey: ['items'] });
        setExplorationEvents((prev) => [{
          title: '🐝 Hive Harvest',
          description: 'Recovered hive materials from the apiary ruins.',
          type: 'material',
          rarity: 'uncommon'
        }, ...prev].slice(0, 10));
      } catch (error) {
        console.error('Failed to harvest hive:', error);
      }
    }

    if (action === 'Defend Apiary') {
      if (!nodelet.lureReadyAt || toNodeletTimestamp(nodelet.lureReadyAt) > nowGameTs) {
        setExplorationEvents((prev) => [{
          title: '🛡️ Nothing to Defend Yet',
          description: 'Set a lure and wait for swarms before defending the apiary.',
          type: 'special',
          rarity: 'common'
        }, ...prev].slice(0, 10));
        return;
      }

      const defendEncounter = getNodeletEncounter(nodelet, 'DefendApiary') || { species: 'Combee', level: 10 };
      const started = await startNodeletWildEncounter({
        species: defendEncounter.species,
        level: defendEncounter.level,
        nodelet,
        battleType: 'apiary'
      });

      if (started) {
        return;
      }
    }

    const updatedNodelets = (zone.nodelets || []).map((currentNodelet) => {
      if (currentNodelet.id !== nodelet.id) return currentNodelet;

      const objectives = currentNodelet.objectives || [];
      const objective = objectives.find((entry) => entry.action === action);
      const objectiveProgress = { ...(currentNodelet.objectiveProgress || {}) };
      const objectiveCompletedAt = { ...(currentNodelet.objectiveCompletedAt || {}) };
      const objectiveHistory = [...(currentNodelet.objectiveHistory || [])];

      if (objective) {
        const completedAt = objectiveCompletedAt[objective.id];
        const cooldownEnd = completedAt ?
        (typeof completedAt === 'number' ? completedAt : new Date(completedAt).getTime()) + (objective.repeatMinutes || 0) * 60 * 1000 :
        null;
        const onCooldown = Boolean(cooldownEnd && cooldownEnd > nowGameTs);

        if (!onCooldown) {
          const progress = (objectiveProgress[objective.id] || 0) + 1;
          if (progress >= (objective.goal || 1)) {
            objectiveProgress[objective.id] = 0;
            objectiveCompletedAt[objective.id] = nowGameTs;
            objectiveHistory.unshift({
              id: objective.id,
              label: objective.label,
              completedAt: nowGameTs,
              reward: objective.reward || {},
              claimedAt: null
            });
          } else {
            objectiveProgress[objective.id] = progress;
          }
        }
      }

      if (action === 'Purify Spring') {
        return {
          ...currentNodelet,
          eclipseControlled: false,
          isCompleted: true,
          objectiveProgress,
          objectiveCompletedAt,
          objectiveHistory,
          lastAction: action,
          lastActionAt: now
        };
      }

      if (action === 'Liberate Nodelet') {
        return {
          ...currentNodelet,
          eclipseControlled: false,
          isCompleted: true,
          objectiveProgress,
          objectiveCompletedAt,
          objectiveHistory,
          lastAction: action,
          lastActionAt: now
        };
      }



      if (action === 'Survey Pool') {
        return {
          ...currentNodelet,
          surveyBuffUntil: nowGameTs + 20 * 60 * 1000,
          objectiveProgress,
          objectiveCompletedAt,
          objectiveHistory,
          lastAction: action,
          lastActionAt: now
        };
      }

      if (action === 'Set Lure') {
        return {
          ...currentNodelet,
          lureSetAt: now,
          lureReadyAt: nowGameTs + 15 * 60 * 1000,
          objectiveProgress,
          objectiveCompletedAt,
          objectiveHistory,
          lastAction: action,
          lastActionAt: now
        };
      }

      if (action === 'Harvest') {
        return {
          ...currentNodelet,
          harvestStreak: (currentNodelet.harvestStreak || 0) + 1,
          replantReadyAt:
          currentNodelet.replantReadyAt && toNodeletTimestamp(currentNodelet.replantReadyAt) <= nowGameTs ?
          null :
          currentNodelet.replantReadyAt,
          objectiveProgress,
          objectiveCompletedAt,
          objectiveHistory,
          lastAction: action,
          lastActionAt: now
        };
      }

      if (action === 'HarvestHive') {

        // backward-compat typo guard
      }
      if (action === 'Harvest Hive') {
        return {
          ...currentNodelet,
          lureSetAt: null,
          lureReadyAt: null,
          objectiveProgress,
          objectiveCompletedAt,
          objectiveHistory,
          harvestStreak: action === 'Harvest' ? currentNodelet.harvestStreak || 0 : 0,
          lastAction: action,
          lastActionAt: now
        };
      }

      if (nodelet.actions?.includes(action)) {
        return {
          ...currentNodelet,
          objectiveProgress,
          objectiveCompletedAt,
          objectiveHistory,
          harvestStreak: action === 'Harvest' ? currentNodelet.harvestStreak || 0 : 0,
          lastAction: action,
          lastActionAt: now
        };
      }

      return currentNodelet;
    });

    try {
      const updatedZone = await base44.entities.Zone.update(zone.id, {
        nodelets: updatedNodelets
      });

      queryClient.setQueryData(['zones'], (existingZones = []) =>
      existingZones.map((existingZone) =>
      existingZone.id === zone.id ? { ...existingZone, nodelets: updatedZone.nodelets || updatedNodelets } : existingZone
      )
      );

      const refreshedNodelet = updatedNodelets.find((currentNodelet) => currentNodelet.id === nodelet.id);
      setSelectedNodelet(resolveNodeletConfig(refreshedNodelet) || null);
      setActiveNodelet(resolveNodeletConfig(refreshedNodelet) || null);

      const pendingRewards = getUnclaimedObjectiveRewards(refreshedNodelet || nodelet);
      if (pendingRewards.length > 0) {
        setExplorationEvents((prev) => [{
          title: '🏁 Objective Complete',
          description: `${pendingRewards.length} reward${pendingRewards.length > 1 ? 's are' : ' is'} ready to claim at ${nodelet.name}.`,
          type: 'special',
          rarity: 'rare'
        }, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to update nodelet:', error);
    }
  };


  const handleClaimNodeletRewards = async (nodelet) => {
    const pending = getUnclaimedObjectiveRewards(nodelet);
    if (!pending.length) {
      setExplorationEvents((prev) => [{
        title: '📘 No Rewards Pending',
        description: `${nodelet.name} has no claimable rewards right now.`,
        type: 'special',
        rarity: 'common'
      }, ...prev].slice(0, 10));
      return;
    }

    try {
      const latestPlayers = await base44.entities.Player.list();
      const latestPlayer = latestPlayers?.[0] || player;
      const totalGold = pending.reduce((sum, entry) => sum + (entry.reward?.gold || 0), 0);

      if (totalGold > 0 && latestPlayer?.id) {
        await base44.entities.Player.update(latestPlayer.id, {
          gold: (latestPlayer.gold || 0) + totalGold
        });
        queryClient.invalidateQueries({ queryKey: ['player'] });
      }

      for (const entry of pending) {
        if (Array.isArray(entry.reward?.items)) {
          for (const rewardItem of entry.reward.items) {
            await upsertItem(rewardItem.name, rewardItem.quantity || 1, {
              type: 'Material',
              rarity: 'Uncommon',
              description: `Objective reward from ${nodelet.name}`
            });
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['items'] });

      const claimTime = getCurrentGameTimestamp();
      const updatedNodelets = (zone.nodelets || []).map((existingNodelet) => {
        if (existingNodelet.id !== nodelet.id) return existingNodelet;
        const updatedHistory = (existingNodelet.objectiveHistory || []).map((entry) =>
        entry.claimedAt ? entry : { ...entry, claimedAt: claimTime }
        );
        return { ...existingNodelet, objectiveHistory: updatedHistory };
      });

      const updatedZone = await base44.entities.Zone.update(zone.id, { nodelets: updatedNodelets });
      queryClient.setQueryData(['zones'], (existingZones = []) =>
      existingZones.map((existingZone) =>
      existingZone.id === zone.id ? { ...existingZone, nodelets: updatedZone.nodelets || updatedNodelets } : existingZone
      )
      );

      const refreshedNodelet = updatedNodelets.find((entry) => entry.id === nodelet.id);
      setActiveNodelet(resolveNodeletConfig(refreshedNodelet) || null);
      setSelectedNodelet(resolveNodeletConfig(refreshedNodelet) || null);

      setExplorationEvents((prev) => [{
        title: '🎁 Rewards Claimed',
        description: `Claimed ${pending.length} objective reward${pending.length > 1 ? 's' : ''}${totalGold ? ` (+${totalGold}g)` : ''}.`,
        type: 'special',
        rarity: 'rare'
      }, ...prev].slice(0, 10));
    } catch (error) {
      console.error('Failed to claim nodelet rewards:', error);
    }
  };

  useEffect(() => {
    const nodeletBattle = searchParams.get('nodeletBattle');
    const nodeletId = searchParams.get('nodeletId');
    const battleOutcome = searchParams.get('battleOutcome');
    const nodeletBattleType = searchParams.get('nodeletBattleType');

    if (nodeletBattle !== '1' || !nodeletId || !battleOutcome || !zone?.id) {
      return;
    }

    const updateFromBattle = async () => {
      const targetNodelet = (zone.nodelets || []).find((nodelet) => nodelet.id === nodeletId);
      if (!targetNodelet) return;

      const now = new Date().toISOString();
      const updatedNodelets = (zone.nodelets || []).map((nodelet) => {
        if (nodelet.id !== nodeletId) return nodelet;

        const nextNodelet = {
          ...nodelet,
          lastBattleOutcome: battleOutcome,
          lastBattleAt: now
        };

        if (nodeletBattleType === 'eclipse') {
          nextNodelet.lastChallengeOutcome = battleOutcome === 'victory' ? 'victory' : 'failed';
        }

        return nextNodelet;
      });
      const updatedActiveNodelet = updatedNodelets.find((nodelet) => nodelet.id === nodeletId);

      try {
        const updatedZone = await base44.entities.Zone.update(zone.id, { nodelets: updatedNodelets });
        queryClient.setQueryData(['zones'], (existingZones = []) =>
        existingZones.map((existingZone) =>
        existingZone.id === zone.id ? { ...existingZone, nodelets: updatedZone.nodelets || updatedNodelets } : existingZone
        )
        );
        setActiveNodelet(resolveNodeletConfig(updatedActiveNodelet) || null);

        if (nodeletBattleType === 'eclipse') {
          setExplorationEvents((prev) => [{
            title: battleOutcome === 'victory' ? '✅ Revenant Defeated' : '❌ Revenant Withstood',
            description:
            battleOutcome === 'victory' ?
            'You can now Purify Spring at the Eclipse-Tainted Spring.' :
            'Recover and challenge the Revenant again to purify the spring.',
            type: 'special',
            rarity: battleOutcome === 'victory' ? 'rare' : 'common'
          }, ...prev].slice(0, 10));
        }

        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('nodeletBattle');
        nextParams.delete('nodeletId');
        nextParams.delete('battleOutcome');
        nextParams.delete('nodeletBattleType');
        setSearchParams(nextParams);
      } catch (error) {
        console.error('Failed to apply nodelet battle outcome:', error);
      }
    };

    updateFromBattle();
  }, [searchParams, setSearchParams, zone, queryClient]);

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
    const currentGameTime = queryClient.getQueryData(['gameTime']) || gameTime;

    const normalized = normalizeGameTime(currentGameTime);
    const next = advanceGameTime(normalized, minutesToAdd);

    const payload = {
      currentHour: next.currentHour,
      currentMinute: next.currentMinute,
      currentDay: next.currentDay,
      currentWeek: next.currentWeek,
      day: next.day,
      month: next.month,
      year: next.year,
      currentSeason: next.currentSeason || currentGameTime?.currentSeason || 'Spring',
      lastUpdated: new Date().toISOString()
    };

    // Cancel any in-flight refetches before updating cache
    await queryClient.cancelQueries({ queryKey: ['gameTime'] });

    const updatedTime = { ...(currentGameTime || {}), ...payload };
    queryClient.setQueryData(['gameTime'], updatedTime);

    try {
      let savedTime;
      if (currentGameTime?.id) {
        savedTime = await base44.entities.GameTime.update(currentGameTime.id, payload);
      } else {
        savedTime = await base44.entities.GameTime.create(payload);
      }
      // Write the server-confirmed value back so future refetches won't show stale data
      queryClient.setQueryData(['gameTime'], { ...(savedTime || updatedTime), ...payload });
    } catch (e) {
      console.error('Failed to persist GameTime:', e);
      queryClient.setQueryData(['gameTime'], currentGameTime);
    }
  };

  const healParty = async (healPercent, fullRestorePP = false) => {
    const teamPokemon = allPokemon.filter((pokemon) => pokemon.isInTeam);
    await Promise.all(teamPokemon.map((pokemon) => {
      // Always compute maxHp from base stats formula so it's accurate
      const baseStats = getBaseStats(pokemon.species);
      const calculatedMaxHp = baseStats ?
      calculateAllStats(pokemon, baseStats).hp :
      pokemon.stats?.hp ?? pokemon.stats?.maxHp ?? pokemon.maxHp ?? (pokemon.level ? pokemon.level * 10 : 50);
      const maxHp = calculatedMaxHp;const currentHp = pokemon.currentHp ?? maxHp;
      const isFainted = currentHp <= 0;
      if (isFainted && !fullRestorePP) {
        return Promise.resolve(); // Don't heal fainted pokemon on rest, only full sleep revives
      }
      const newHp = fullRestorePP ? maxHp : Math.min(maxHp, currentHp + Math.floor(maxHp * healPercent));
      const updates = { currentHp: newHp };
      if (fullRestorePP) {
        updates.movePP = {}; // Empty object = full PP (missing keys = max PP)
      }
      return base44.entities.Pokemon.update(pokemon.id, updates);
    }));
    queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
    queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
  };

  const handleCampRest = async () => {
    await healParty(0.1, false);
    await advanceTime(60);
  };

  const handleCampSleep = async () => {
    await healParty(1.0, true); // Full HP + full PP restore
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
        (n) => !(zoneProgress?.discoveredPOIs || []).includes(n.id)
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
    setExplorationEvents((prev) => [result, ...prev].slice(0, 10));

    // Show encounter result
    setCurrentEncounter(result);

    // Update zone progress in state and database
    const newProgress = Math.min(currentProgress + actualProgressGain, 100);
    const updatedDiscoveredPokemon = result?.firstDiscovery && result.type === 'pokemon' ?
    [...(zoneProgress?.discoveredPokemon || []), result.pokemon] :
    zoneProgress?.discoveredPokemon || [];

    const updatedDiscoveredMaterials = result?.firstDiscovery && result.type === 'material' ?
    [...(zoneProgress?.discoveredMaterials || []), result.materialName] :
    zoneProgress?.discoveredMaterials || [];

    const updatedDiscoveredPOIs = result?.firstDiscovery && result.type === 'poi' ?
    [...(zoneProgress?.discoveredPOIs || []), result.poiId] :
    zoneProgress?.discoveredPOIs || [];

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

    // Advance 10 minutes of in-game time for exploring
    try {
      await advanceTime(EXPLORE_TIME_MINUTES);
    } catch (e) {
      console.error('advanceTime failed during main explore:', e);
    }
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
          isWild: true,
          isWildInstance: true
        });

        logEntry.details = `Started battle with ${encounter.pokemon}`;
        setExplorationEvents((prev) => [{
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
    } else
    if (action === 'capture' && encounter.pokemon) {
      // Attempt to capture
      try {
        const captureChance = Math.random() * 100;
        const rarityModifier = encounter.rarity === 'legendary' ? 50 :
        encounter.rarity === 'rare' ? 30 :
        encounter.rarity === 'uncommon' ? 10 : 0;
        const success = captureChance > 30 + rarityModifier;

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
          setExplorationEvents((prev) => [{
            title: '🎉 Capture Success!',
            description: `${encounter.pokemon} was caught!`,
            type: 'pokemon',
            rarity: 'uncommon',
            firstDiscovery: true
          }, ...prev].slice(0, 10));
        } else {
          logEntry.details = `${encounter.pokemon} broke free!`;
          setExplorationEvents((prev) => [{
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
    } else
    if (action === 'scan' && encounter.pokemon) {
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
        setExplorationEvents((prev) => [{
          title: '📝 Pokémon Scanned',
          description: `${encounter.pokemon} data logged to journal`,
          type: 'pokemon',
          rarity: 'common'
        }, ...prev].slice(0, 10));
      } catch (error) {
        console.error('Failed to scan Pokémon:', error);
      }
      setCurrentEncounter(null);
    } else
    if (action === 'collect' && encounter.materials) {
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
        setExplorationEvents((prev) => [{
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
    } else
    if (action === 'reveal' && encounter.poi) {
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
        setExplorationEvents((prev) => [{
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
    } else
    if (action === 'investigate') {
      // Special event investigation
      logEntry.details = 'Investigated unusual phenomenon';
      setExplorationEvents((prev) => [{
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
    return player.partyOrder.
    map((id) => partyPokemon.find((pokemon) => pokemon.id === id)).
    filter(Boolean);
  }, [partyPokemon, player]);
  const activeQuests = player?.activeQuests || [];

  const getNodeletEncounter = (nodelet, trigger = 'Explore') => {
    const isNight = (gameTime?.currentHour ?? 12) >= 18 || (gameTime?.currentHour ?? 12) < 6;
    const harvestStreak = nodelet?.harvestStreak || 0;
    const encounterTables = nodelet?.encounterTables || {};

    let table = encounterTables[trigger];
    if (!table?.length && trigger === 'Explore') {
      table = isNight ? encounterTables.ExploreNight : encounterTables.ExploreDay;
    }
    const contractState = getBrambleberryContractState(nodelet);
    if (!table?.length && trigger === 'Harvest' && (harvestStreak >= 3 || contractState.tier2Completed)) {
      table = encounterTables.HarvestStreak;
    }
    if (!table?.length) {
      table = encounterTables.Explore || encounterTables.ExploreDay || [];
    }
    if (!table.length) return null;

    const adjustedTable = table.map((entry) => {
      if (nodelet?.id !== 'vh-brambleberry-thicket') return entry;
      const species = entry.species;
      let bonus = 0;
      if (contractState.tier1Completed && species === 'Cherubi') bonus += 4;
      if (contractState.tier2Completed && species === 'Bounsweet') bonus += 6;
      return { ...entry, weight: (entry.weight || 0) + bonus };
    });

    const totalWeight = adjustedTable.reduce((sum, entry) => sum + (entry.weight || 0), 0);
    if (totalWeight <= 0) return table[0] || null;

    let random = Math.random() * totalWeight;
    for (const entry of adjustedTable) {
      random -= entry.weight || 0;
      if (random <= 0) {
        const [min = 7, max = 10] = entry.levelRange || [7, 10];
        const level = Math.floor(Math.random() * (max - min + 1)) + min;
        return { species: entry.species, level };
      }
    }

    const fallback = adjustedTable[0] || table[0];
    const [min = 7, max = 10] = fallback.levelRange || [7, 10];
    return { species: fallback.species, level: Math.floor(Math.random() * (max - min + 1)) + min };
  };

  const getCurrentGameTimestamp = () => {
    const year = gameTime?.year || 0;
    const month = gameTime?.month || 0;
    const day = gameTime?.day || gameTime?.currentDay || 1;
    const hour = gameTime?.currentHour || 0;
    const minute = gameTime?.currentMinute || 0;
    return new Date(Date.UTC(year, month, day, hour, minute, 0)).getTime();
  };

  const toNodeletTimestamp = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return null;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getBrambleberryContractState = (nodelet) => {
    const history = Array.isArray(nodelet?.objectiveHistory) ? nodelet.objectiveHistory : [];
    const isClaimed = (id) => history.some((entry) => entry.id === id && Boolean(entry.claimedAt));
    const completed = (id) => history.filter((entry) => entry.id === id).length;

    return {
      tier1Completed: completed('merra-contract-tier1') > 0,
      tier2Completed: completed('merra-contract-tier2') > 0,
      tier1Claimed: isClaimed('merra-contract-tier1'),
      tier2Claimed: isClaimed('merra-contract-tier2'),
      tier1Runs: completed('merra-contract-tier1'),
      tier2Runs: completed('merra-contract-tier2')
    };
  };

  const getUnclaimedObjectiveRewards = (nodelet) =>
  (Array.isArray(nodelet?.objectiveHistory) ? nodelet.objectiveHistory : []).filter((entry) => !entry.claimedAt);


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
          className="mb-4">

          ← Back to Zone
        </Button>

        <h2 className="text-2xl font-bold text-white mb-6">{zone.name} - Exploration</h2>

        <div className="grid grid-cols-1 gap-6">
          <DiscoveryMeter
            progress={zoneProgress?.discoveryProgress || 0}
            discoveredPokemon={discoveredPokemon}
            discoveredPOIs={discoveredPOIs}
            totalPokemon={totalPokemon}
            totalPOIs={totalPOIs} />


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {currentEncounter ?
              <EncounterResult
                result={currentEncounter}
                onContinue={handleContinueExploring}
                onAction={handleEncounterAction} /> :


              <Button
                onClick={handleExplore}
                className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-lg py-6">

                  <Compass className="w-5 h-5 mr-2" />
                  Explore
                </Button>
              }
            </div>

            <ExplorationFeed events={explorationEvents} />
          </div>
        </div>
      </div>);

  }

  const sectionOptions = [
  { id: 'explore', label: 'Explore' },
  { id: 'places', label: 'Places' },
  { id: 'nodelet', label: activeNodelet ? activeNodelet.name : 'Location', hidden: !activeNodelet },
  { id: 'bestiary', label: 'Bestiary' },
  { id: 'logbook', label: 'Logbook' },
  { id: 'camp', label: 'Camp' },
  { id: 'items', label: 'Items' },
  { id: 'pokemon', label: 'Pokémon' },
  { id: 'quests', label: 'Quests' },
  { id: 'return', label: 'Return' }];


  return (
    <div className="pb-8">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          ← Back to Zone List
        </Button>
        <div className={`relative h-56 rounded-2xl overflow-hidden bg-gradient-to-br ${gradient}`}>
          {zone.imageUrl &&
          <img src={zone.imageUrl} alt={zone.name} className="absolute inset-0 w-full h-full object-cover" />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge className="bg-black/40 text-white border-white/20 mb-2">{zone.biomeType}</Badge>
            <h2 className="text-3xl font-bold text-white">{zone.name}</h2>
            <p className="text-slate-200 mt-2 max-w-2xl">{zone.description}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {sectionOptions.filter((section) => !section.hidden).map((section) =>
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
          className={activeSection === section.id ? 'bg-indigo-500 text-white' : 'border-slate-700 text-slate-200'}>

            {section.label}
          </Button>
        )}
      </div>

      {activeSection === 'explore' &&
      <div>
          {eclipseNodelets.length > 0 &&
        <div className="mb-4">
              <ZoneLiberationTracker zone={zone} liberatedNodelets={liberatedNodelets} />
            </div>
        }

          <div className="glass rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              Discovery Progress: {Math.round(zoneProgress?.discoveryProgress || 0)}/100
            </h3>
            <StatBar
            value={zoneProgress?.discoveryProgress || 0}
            maxValue={100}
            color="bg-gradient-to-r from-indigo-500 to-cyan-500" />

            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{Math.round(zoneProgress?.discoveryProgress || 0)}%</span>
              <span>Explorations: {zoneProgress?.explorationCount || 0}</span>
            </div>
          </div>

          {zone.availableWildPokemon && zone.availableWildPokemon.length > 0 &&
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
                          {isDiscovered ?
                      <Sparkles className="w-4 h-4 text-emerald-400" /> :

                      <span className="text-slate-600 text-xs">???</span>
                      }
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
                  'bg-slate-700/50 text-slate-300'}`
                  }>
                        {pokemon.rarity}
                      </Badge>
                    </div>);

            })}
              </div>
            </div>
        }

          <Button
          onClick={handleStartExploring}
          className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600">

            <Compass className="w-4 h-4 mr-2" /> Explore
          </Button>
        </div>
      }

      {activeSection === 'places' &&
      <div className="space-y-4">
          {eclipseNodelets.length > 0 &&
        <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-red-400" /> Eclipse Control Points
              </h3>
              <div className="space-y-3">
                {eclipseNodelets.map((nodelet) =>
            <NodeletCard
              key={nodelet.id}
              nodelet={nodelet}
              isLiberated={liberatedNodelets.some((ln) => ln.nodeletId === nodelet.id && ln.zoneId === zone.id)}
              onChallenge={() => handleNodeletChallenge(nodelet)}
              onInspect={() => handleNodeletInspect(nodelet)} />

            )}
              </div>
            </div>
        }

          {zone.nodelets && zone.nodelets.filter((n) => !n.eclipseControlled).length > 0 ?
        <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-amber-400" /> Points of Interest
              </h3>
              <div className="space-y-2">
                {zone.nodelets.filter((n) => !n.eclipseControlled).map((nodelet, idx) => {
              const isDiscovered = (zoneProgress?.discoveredPOIs || []).includes(nodelet.id);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isDiscovered) {
                      handleEnterNodelet(nodelet);
                    }
                  }}
                  disabled={!isDiscovered}
                  className={`w-full flex items-center justify-between bg-slate-800/50 rounded-lg p-3 transition-colors ${
                  isDiscovered ? 'hover:bg-slate-700/50 cursor-pointer' : 'cursor-default'}`
                  }>

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
                        {nodelet.isCompleted ?
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Complete</Badge> :
                    isDiscovered ?
                    <>
                            <Badge className="bg-amber-500/20 text-amber-300 text-xs">Available</Badge>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </> :

                    <Badge className="bg-slate-700/50 text-slate-400 text-xs">Hidden</Badge>
                    }
                      </div>
                    </button>);

            })}
              </div>
            </div> :

        <div className="glass rounded-xl p-6 text-center text-slate-400">
              No places discovered yet.
            </div>
        }

          {activeNodelet &&
        <div className="glass rounded-xl p-4 border border-indigo-500/30">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">{activeNodelet.name}</h3>
                  <p className="text-xs text-slate-400">{activeNodelet.type} Location</p>
                </div>
                <div className="flex gap-2">
                  <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setActiveSection('nodelet')}>

                    Open Location
                  </Button>
                  <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-200"
                onClick={handleLeaveNodelet}>

                    Leave
                  </Button>
                </div>
              </div>
            </div>
        }
        </div>
      }

      {activeSection === 'nodelet' && activeNodelet &&
      <div className="space-y-4">
          <div className="glass rounded-xl p-4 border border-indigo-500/30">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-semibold text-white">{activeNodelet.name}</h3>
                <p className="text-xs text-slate-400">{zone.name} · {activeNodelet.type} Location</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-200" onClick={() => setActiveSection('places')}>
                  Back to Places
                </Button>
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-200" onClick={handleLeaveNodelet}>
                  Leave
                </Button>
              </div>
            </div>

            {activeNodelet.description &&
          <p className="text-sm text-slate-300 mb-3">{activeNodelet.description}</p>
          }

            <div className="flex flex-wrap gap-2 mb-3">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleExploreNodelet(activeNodelet)}>
                Explore Location
              </Button>
              {activeNodelet.actions?.filter((a) => !['Harvest', 'Plant', 'Deliver Berries', 'Replant'].includes(a)).map((actionLabel) => {
              const currentProgress = zoneProgress?.discoveryProgress || 0;
              const unlockAt = activeNodelet.unlockDiscoveryProgress || 0;
              const isLocked = currentProgress < unlockAt;
              return (
                <Button
                  key={`nodelet-${actionLabel}`}
                  size="sm"
                  variant="outline"
                  disabled={isLocked}
                  className={`border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleNodeletAction(activeNodelet, actionLabel)}>

                                {isLocked ? `${actionLabel} 🔒` : actionLabel}
                              </Button>);

            })}
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-200" onClick={() => handleNodeletInspect(activeNodelet)}>
                Details
              </Button>
            </div>

            {explorationEvents[0] &&
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 mb-3">
                <p className="text-xs font-semibold text-indigo-200">Latest Activity</p>
                <p className="text-sm text-indigo-100">{explorationEvents[0].title}</p>
                <p className="text-xs text-indigo-200/90">{explorationEvents[0].description}</p>
              </div>
          }

            {Array.isArray(activeNodelet.npcs) && activeNodelet.npcs.length > 0 &&
          <div className="rounded-lg border border-slate-700/80 bg-slate-900/40 p-3 mb-3">
                <h4 className="text-xs font-semibold text-slate-200 mb-2">NPCs Here</h4>
                <div className="flex flex-wrap gap-2">
                  {activeNodelet.npcs.map((npc) =>
              <Button
                key={npc}
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-200"
                onClick={() => handleNodeletNpcInteract(activeNodelet, npc)}>

                      {npc}
                    </Button>
              )}
                </div>
              </div>
          }

            {getUnclaimedObjectiveRewards(activeNodelet).length > 0 &&
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white mb-3"
            onClick={() => handleClaimNodeletRewards(activeNodelet)}>

                Claim Rewards ({getUnclaimedObjectiveRewards(activeNodelet).length})
              </Button>
          }

            {activeNodelet.id === 'vh-brambleberry-thicket' && (() => {
            const contractState = getBrambleberryContractState(activeNodelet);
            return (
              <div className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-3 mb-3">
                  <h4 className="text-xs font-semibold text-fuchsia-200 mb-2">Brambleberry Contract Board</h4>
                  <div className="space-y-1 text-xs text-fuchsia-100/90">
                    <p>Tier I (Merra Contract): {contractState.tier1Completed ? `Complete (${contractState.tier1Runs} run${contractState.tier1Runs > 1 ? 's' : ''})` : 'Not yet complete'}</p>
                    <p>Tier II (Streak Contract): {contractState.tier2Completed ? `Complete (${contractState.tier2Runs} run${contractState.tier2Runs > 1 ? 's' : ''})` : 'Not yet complete'}</p>
                  </div>
                </div>);

          })()}

            {activeNodelet.id === 'vh-brambleberry-thicket' &&
          <BerryFarmPanel
            player={player}
            playerEmail={user?.email}
            zone={zone}
            gameTime={gameTime}
            seeds={items.filter((item) => item.name?.includes('Berry Seed'))}
            onPlant={() => {
              setExplorationEvents((prev) => [{
                title: '🌱 Seed Planted',
                description: 'Your berry plot is growing. Check back later to harvest!',
                type: 'special',
                rarity: 'common'
              }, ...prev].slice(0, 10));
            }}
            onBuyPlot={() => {
              setExplorationEvents((prev) => [{
                title: '🏗️ Plot Purchased',
                description: 'Expanded your berry farm with a new plot!',
                type: 'special',
                rarity: 'uncommon'
              }, ...prev].slice(0, 10));
            }}
            onHarvest={async (plot) => {
              const BERRY_YIELDS = {
                'Oran Berry Seed': [2, 4], 'Pecha Berry Seed': [2, 5],
                'Cheri Berry Seed': [3, 6], 'Sitrus Berry Seed': [1, 3], 'Lum Berry Seed': [1, 2]
              };
              const nowGameTs = getCurrentGameTimestamp();

              // Single-plot poacher check
              const poacherTriggered = await maybeTriggerEnemyNPCEncounter(
                resolveNodeletConfig(activeNodelet), 0.22
              );
              if (poacherTriggered) return;

              const [min, max] = BERRY_YIELDS[plot.berryType] || [1, 3];
              const quantity = Math.floor(Math.random() * (max - min + 1)) + min;
              const berryName = plot.berryType.replace(' Seed', '');
              await upsertItem(berryName, quantity, { type: 'Consumable', description: 'A medicinal berry from Brambleberry Thicket' });
              await base44.entities.BerryPlot.update(plot.id, { isHarvested: true });
              queryClient.invalidateQueries({ queryKey: ['berryPlots'] });
              queryClient.invalidateQueries({ queryKey: ['items'] });

              // Single-plot wild encounter check
              const harvestEncounterChance = 0.25;
              if (Math.random() < harvestEncounterChance) {
                const nodelet = resolveNodeletConfig(activeNodelet);
                const encounter = getNodeletEncounter(nodelet, 'Harvest');
                if (encounter?.species) {
                  await startNodeletWildEncounter({
                    species: encounter.species,
                    level: encounter.level || 7,
                    nodelet,
                    battleType: 'berry'
                  });
                  return;
                }
              }

              setExplorationEvents((prev) => [{
                title: '🫐 Berry Harvested',
                description: `Harvested ${quantity}× ${berryName}!`,
                type: 'material',
                rarity: 'common'
              }, ...prev].slice(0, 10));
            }} />

          }

            {activeNodelet.gameplayFeatures?.length > 0 &&
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
                {activeNodelet.gameplayFeatures.map((feature) => null

            )}
              </ul>
          }
          </div>
        </div>
      }

      {/* Details dialog — streamlined, no verbose info dump */}
      <Dialog
        open={Boolean(selectedNodelet)}
        onOpenChange={(open) => {
          if (!open) setSelectedNodelet(null);
        }}>

        <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
          {selectedNodelet &&
          <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-emerald-400" /> {selectedNodelet.name}
                </DialogTitle>
                <DialogDescription className="text-slate-300">
                  {selectedNodelet.description || 'A location within Verdant Hollow.'}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  setActiveNodelet(resolveNodeletConfig(selectedNodelet));
                  setActiveSection('nodelet');
                  setSelectedNodelet(null);
                }}>

                  Enter Location
                </Button>

                {selectedNodelet.id === 'vh-brambleberry-thicket' &&
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/20"
                onClick={() => {
                  setActiveNodelet(resolveNodeletConfig(selectedNodelet));
                  setActiveSection('nodelet');
                  setSelectedNodelet(null);
                  setShowPlantingModal(true);
                }}>

                    🌱 Plant Seeds
                  </Button>
              }

                <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-200"
                onClick={() => setSelectedNodelet(null)}>

                  Close
                </Button>
              </div>
            </>
          }
        </DialogContent>
      </Dialog>

      {activeSection === 'camp' &&
      <div className="glass rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Camp</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-semibold text-white mb-1">Rest</h4>
              <p className="text-xs text-slate-400 mb-3">Recovers 10% HP for non-fainted Pokémon. Advances time by 1 hour. Does not restore PP.</p>
              <Button onClick={handleCampRest} className="w-full bg-indigo-500 hover:bg-indigo-600">
                Rest (+1 hour)
              </Button>
            </div>
            <div className="flex-1 bg-slate-800/50 rounded-lg p-4 border border-emerald-700/40">
              <h4 className="text-sm font-semibold text-emerald-300 mb-1">Sleep</h4>
              <p className="text-xs text-slate-400 mb-3">Fully restores HP <span className="text-emerald-300 font-medium">and PP</span> for all Pokémon. Advances time by 8 hours. Fainted Pokémon are not revived.</p>
              <Button onClick={handleCampSleep} className="w-full bg-emerald-500 hover:bg-emerald-600">
                Sleep (+8 hours)
              </Button>
            </div>
          </div>
        </div>
      }

      {activeSection === 'items' &&
      <ZoneInventoryPanel items={items} />
      }

      {activeSection === 'pokemon' &&
      <ZonePartyPanel player={player} allPokemon={allPokemon} />
      }

      {activeSection === 'bestiary' &&
      <ZoneBestiary
        zone={zone}
        discoveredPokemon={zoneProgress?.discoveredPokemon || []} />

      }

      {activeSection === 'logbook' &&
      <ZoneLogbook
        zone={zone}
        zoneProgress={zoneProgress} />

      }

      {activeSection === 'quests' &&
      <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Active Quests</h3>
          {activeQuests.length > 0 ?
        <div className="space-y-3">
              {activeQuests.map((quest) => {
            const questProgress = quest.type === 'research' && quest.questId ?
            getSubmissionCount(quest.questId) :
            quest.progress ?? 0;
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
                  {quest.type === 'research' &&
                <div className="mt-2 text-xs text-slate-400">
                      Fulfilling Pokémon: {matchingPokemon.length ?
                  matchingPokemon.map((pokemon) => pokemon.species).join(', ') :
                  'None in your roster'}
                    </div>
                }
                  {quest.type === 'research' &&
                <p className="mt-1 text-[11px] text-slate-500">Submit research quests only at Professor Maple.</p>
                }
                </div>);

          })}
            </div> :

        <p className="text-slate-400">No active quests. Accept quests from NPCs to track them here.</p>
        }
        </div>
      }

      <PlantingPlotModal
        isOpen={showPlantingModal}
        onClose={() => setShowPlantingModal(false)}
        seeds={items.filter((item) => item.name?.includes('Berry Seed'))}
        player={player}
        playerEmail={user?.email}
        zone={zone}
        gameTime={gameTime}
        onPlant={() => {
          setExplorationEvents((prev) => [{
            title: '🌱 Seed Planted',
            description: 'Your berry plot is growing. Check back later to harvest!',
            type: 'special',
            rarity: 'common'
          }, ...prev].slice(0, 10));
        }}
        onBuyPlot={() => {
          setExplorationEvents((prev) => [{
            title: '🏗️ Plot Purchased',
            description: 'Expanded your berry farm with a new plot!',
            type: 'special',
            rarity: 'uncommon'
          }, ...prev].slice(0, 10));
        }} />


      <IrisShopModal
        isOpen={showIrisShop}
        onClose={() => setShowIrisShop(false)}
        player={player}
        onPurchase={(itemName) => {
          setExplorationEvents((prev) => [{
            title: '🛒 Purchase Complete',
            description: `Bought ${itemName} from Iris.`,
            type: 'special',
            rarity: 'common'
          }, ...prev].slice(0, 10));
        }} />


      <MerraQuestsModal
        isOpen={showMerraQuests}
        onClose={() => setShowMerraQuests(false)}
        player={player}
        berryPlots={berryPlots}
        items={items}
        gameTime={gameTime}
        onQuestComplete={(questName) => {
          setExplorationEvents((prev) => [{
            title: '🏆 Quest Complete',
            description: `Completed Merra's quest: ${questName}`,
            type: 'special',
            rarity: 'rare'
          }, ...prev].slice(0, 10));
        }} />

    </div>);

}

function InfoPills({ title, values = [] }) {
  if (!values.length) return null;

  return (
    <div>
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {values.map((value) =>
        <Badge key={`${title}-${value}`} className="bg-slate-800/80 text-slate-200 border-slate-600">
            {value}
          </Badge>
        )}
      </div>
    </div>);

}