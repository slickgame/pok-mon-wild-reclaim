import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTutorialTrigger } from '../components/tutorial/TutorialTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Sparkles, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/common/PageHeader';
import BattleHUD from '@/components/battle/BattleHUD';
import MoveCard from '@/components/battle/MoveCard';
import BattleLog from '@/components/battle/BattleLog';
import TalentDisplay from '@/components/battle/TalentDisplay';
import BattleOutcomeModal from '@/components/battle/BattleOutcomeModal';
import CaptureSuccessModal from '@/components/battle/CaptureSuccessModal';
import { BattleEngine } from '@/components/battle/BattleEngine';
import { applyEVGains } from '@/components/pokemon/evManager';
import { getPokemonStats } from '@/components/pokemon/usePokemonStats';
import { getMovesLearnedAtLevel } from '@/components/pokemon/levelUpLearnsets';
import MoveLearnModal from '@/components/battle/MoveLearnModal';
import { checkEvolution, getEvolvedStats, getEvolvedRoles } from '@/components/pokemon/evolutionData';
import EvolutionModal from '@/components/pokemon/EvolutionModal';
import { calculateAllStats } from '@/components/pokemon/statCalculations';
import { getBaseStats } from '@/components/pokemon/baseStats';

export default function BattlePage() {
  const [battleState, setBattleState] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);
  const [wildPokemonId, setWildPokemonId] = useState(null);
  const [returnTo, setReturnTo] = useState(null);
  const [capturingPokemon, setCapturingPokemon] = useState(false);
  const [actionMenu, setActionMenu] = useState('main'); // 'main', 'fight', 'items', 'switch'
  const [moveLearnState, setMoveLearnState] = useState(null); // { pokemon, newMoves, currentMoves, pendingUpdate }
  const [evolutionState, setEvolutionState] = useState(null); // { pokemon, evolvesInto, pendingUpdate }
  const [captureModalState, setCaptureModalState] = useState(null); // { pokemon, addedToParty }
  const queryClient = useQueryClient();
  const { triggerTutorial } = useTutorialTrigger();

  // Parse URL parameters for wild encounters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wildId = params.get('wildPokemonId');
    const returnPage = params.get('returnTo');
    
    if (wildId) {
      setWildPokemonId(wildId);
      setReturnTo(returnPage || 'Zones');
      // Trigger first_battle tutorial
      triggerTutorial('first_battle');
    }
  }, [triggerTutorial]);

  // Fetch player inventory for Pokéballs and battle items
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const items = await base44.entities.Item.list();
      return items;
    }
  });

  const pokeballCount = inventory.filter(item => item.name === 'Pokéball').reduce((acc, item) => acc + (item.quantity || 1), 0);
  const battleItems = inventory.filter(item => ['Potion', 'Battle Item'].includes(item.type));

  // Fetch player's team
  const { data: playerPokemon = [], isLoading: loadingPokemon } = useQuery({
    queryKey: ['playerPokemon'],
    queryFn: async () => {
      const pokemon = await base44.entities.Pokemon.filter({ isInTeam: true });
      // Ensure each Pokémon has moves loaded
      return pokemon.map(p => ({
        ...p,
        abilities: p.abilities || []
      }));
    }
  });

  // Fetch available moves
  const { data: moves = [] } = useQuery({
    queryKey: ['moves'],
    queryFn: () => base44.entities.Move.list()
  });

  // Fetch wild Pokémon if encountering one
  const { data: wildPokemon } = useQuery({
    queryKey: ['wildPokemon', wildPokemonId],
    queryFn: async () => {
      if (!wildPokemonId) return null;
      const pokemon = await base44.entities.Pokemon.filter({ id: wildPokemonId });
      const fetchedPokemon = pokemon[0] || null;
      
      // Ensure moves are loaded
      if (fetchedPokemon && (!fetchedPokemon.abilities || fetchedPokemon.abilities.length === 0)) {
        console.warn('Wild Pokémon has no moves, assigning default moves');
        fetchedPokemon.abilities = ['Tackle', 'Growl'];
      }
      
      return fetchedPokemon;
    },
    enabled: !!wildPokemonId
  });

  // Auto-start battle with wild Pokémon
  useEffect(() => {
    if (wildPokemon && playerPokemon.length > 0 && !battleState) {
      startWildBattle(wildPokemon);
    }
  }, [wildPokemon, playerPokemon]);

  // Start wild encounter battle
  const startWildBattle = (wildMon) => {
    if (playerPokemon.length === 0) return;

    // Always use first Pokémon in party as lead
    const sortedParty = [...playerPokemon].sort((a, b) => (a.partyOrder || 0) - (b.partyOrder || 0));
    const playerMon = sortedParty[0];
    const playerStats = getPokemonStats(playerMon).stats;
    const wildStats = getPokemonStats(wildMon).stats;
    
    setBattleState({
      playerPokemon: playerMon,
      enemyPokemon: wildMon,
      playerHP: playerStats.maxHp,
      enemyHP: wildStats.maxHp,
      turnNumber: 1,
      currentTurn: 'player',
      battleLog: [
        { turn: 1, actor: 'System', action: `A wild ${wildMon.species} appeared!`, result: '', synergyTriggered: false }
      ],
      playerStatus: { conditions: [], buffs: [] },
      enemyStatus: { conditions: [], buffs: [] },
      synergyChains: 0,
      isWildBattle: true
    });
  };

  // Start a new battle (practice mode)
  const startBattle = () => {
    if (playerPokemon.length === 0) return;

    // Always use first Pokémon in party as lead
    const sortedParty = [...playerPokemon].sort((a, b) => (a.partyOrder || 0) - (b.partyOrder || 0));
    const playerMon = sortedParty[0];
    const playerStats = getPokemonStats(playerMon).stats;
    
    const enemyMon = {
      id: 'enemy-1',
      species: 'Wild Luxray',
      level: 15,
      stats: {
        hp: 120,
        maxHp: 120,
        atk: 85,
        def: 60,
        spAtk: 75,
        spDef: 60,
        spd: 90
      },
      type1: 'Electric',
      roles: ['Striker'],
      isRevenant: false,
      spriteUrl: null
    };

    setBattleState({
      playerPokemon: playerMon,
      enemyPokemon: enemyMon,
      playerHP: playerStats.maxHp,
      enemyHP: enemyMon.stats.maxHp,
      turnNumber: 1,
      currentTurn: 'player',
      battleLog: [
        { turn: 1, actor: 'System', action: 'Battle started!', result: '', synergyTriggered: false }
      ],
      playerStatus: { conditions: [], buffs: [] },
      enemyStatus: { conditions: [], buffs: [] },
      synergyChains: 0,
      isWildBattle: false
    });
  };

  // Attempt capture
  const attemptCapture = async () => {
    if (!battleState || !battleState.isWildBattle || capturingPokemon) return;
    if (pokeballCount <= 0) {
      setBattleState({
        ...battleState,
        battleLog: [...battleState.battleLog, {
          turn: battleState.turnNumber,
          actor: 'System',
          action: 'No Pokéballs!',
          result: 'You don\'t have any Pokéballs.',
          synergyTriggered: false
        }]
      });
      return;
    }

    setCapturingPokemon(true);

    // Calculate catch rate
    const enemyStats = getPokemonStats(battleState.enemyPokemon).stats;
    const hpPercent = (battleState.enemyHP / enemyStats.maxHp) * 100;
    const rarityModifier = {
      'common': 50,
      'uncommon': 35,
      'rare': 20,
      'legendary': 5
    }[battleState.enemyPokemon.rarity?.toLowerCase() || 'common'];

    const baseChance = rarityModifier;
    const hpBonus = Math.max(0, 50 - hpPercent);
    const catchChance = Math.min(95, baseChance + hpBonus);

    const roll = Math.random() * 100;
    const success = roll < catchChance;

    // Use a Pokéball
    const pokeball = inventory.find(item => item.name === 'Pokéball' && (item.quantity || 1) > 0);
    if (pokeball) {
      if (pokeball.quantity > 1) {
        await base44.entities.Item.update(pokeball.id, { quantity: pokeball.quantity - 1 });
      } else {
        await base44.entities.Item.delete(pokeball.id);
      }
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }

    if (success) {
      // Capture successful
      const newBattleState = {
        ...battleState,
        status: 'captured',
        currentTurn: 'ended',
        battleLog: [...battleState.battleLog, {
          turn: battleState.turnNumber,
          actor: 'System',
          action: 'Gotcha!',
          result: `${battleState.enemyPokemon.species} was caught!`,
          synergyTriggered: false
        }]
      };
      setBattleState(newBattleState);
      
      // Check if party has room
      const addedToParty = partyPokemon.length < 6;
      
      setCaptureModalState({
        pokemon: battleState.enemyPokemon,
        addedToParty
      });
    } else {
      // Capture failed, enemy gets free turn
      const enemyAvailableMoves = moves.filter(m => m.category !== 'Status').slice(0, 3);
      const enemyMove = enemyAvailableMoves[Math.floor(Math.random() * enemyAvailableMoves.length)] || moves[0];
      
      const engine = new BattleEngine(battleState.playerPokemon, battleState.enemyPokemon);
      const stateCopy = { ...battleState };
      
      // Enemy attacks
      const damage = Math.floor(Math.random() * 30) + 10;
      stateCopy.playerHP = Math.max(0, stateCopy.playerHP - damage);

      const newBattleState = {
        ...stateCopy,
        battleLog: [...battleState.battleLog, 
          {
            turn: battleState.turnNumber,
            actor: 'System',
            action: 'Capture Failed!',
            result: `${battleState.enemyPokemon.species} broke free!`,
            synergyTriggered: false
          },
          {
            turn: battleState.turnNumber,
            actor: battleState.enemyPokemon.species,
            action: enemyMove.name,
            result: `Dealt ${damage} damage to ${battleState.playerPokemon.species}`,
            synergyTriggered: false
          }
        ],
        turnNumber: battleState.turnNumber + 1,
        currentTurn: stateCopy.playerHP > 0 ? 'player' : 'ended'
      };

      if (stateCopy.playerHP <= 0) {
        newBattleState.status = 'lost';
        newBattleState.battleLog.push({
          turn: newBattleState.turnNumber,
          actor: 'System',
          action: 'Defeat!',
          result: 'You lost the battle.',
          synergyTriggered: false
        });
      }

      setBattleState(newBattleState);
    }

    setCapturingPokemon(false);
  };

  // Use a move
  const useMove = (move) => {
    if (!battleState || battleState.currentTurn !== 'player') return;

    // Initialize battle engine
    const engine = new BattleEngine(battleState.playerPokemon, battleState.enemyPokemon);

    // Enemy uses smart AI to choose best move
    const enemyAvailableMoves = moves.slice(0, 4);
    const enemyMove = engine.chooseEnemyMove(enemyAvailableMoves, battleState.playerPokemon);

    // Create a copy of battle state for engine to modify
    const stateCopy = { ...battleState };

    // Execute turn
    const turnLogs = engine.executeTurn(move, enemyMove, stateCopy);

    // Update battle state with results
    const newBattleState = {
      ...stateCopy,
      battleLog: [...battleState.battleLog, ...turnLogs],
      turnNumber: battleState.turnNumber + 1,
    };

    // Check for victory/defeat
    if (newBattleState.enemyHP <= 0) {
      newBattleState.status = 'won';
      newBattleState.currentTurn = 'ended';
      newBattleState.battleLog.push({
        turn: newBattleState.turnNumber,
        actor: 'System',
        action: 'Victory!',
        result: 'You won the battle!',
        synergyTriggered: false
      });

      // Award XP and calculate rewards
      const xpGained = Math.floor(newBattleState.enemyPokemon.level * 25);
      const currentXP = newBattleState.playerPokemon.experience || 0;
      const newXP = currentXP + xpGained;
      
      // Calculate level ups and new level
      const currentLevel = newBattleState.playerPokemon.level;
      const xpForNextLevel = currentLevel * 100;
      let newLevel = currentLevel;
      let remainingXP = newXP;
      const levelsGained = [];
      
      // Check for level ups
      while (remainingXP >= (newLevel * 100)) {
        remainingXP -= (newLevel * 100);
        newLevel++;
        levelsGained.push(newLevel);
      }
      
      // Check for moves learned from level ups
      const movesLearned = [];
      levelsGained.forEach(level => {
        const moves = getMovesLearnedAtLevel(newBattleState.playerPokemon.species, level);
        if (moves.length > 0) {
          movesLearned.push(...moves);
        }
      });
      
      // Apply EV gains
      const currentEVs = newBattleState.playerPokemon.evs || { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 };
      const evResult = applyEVGains(currentEVs, newBattleState.enemyPokemon.species);
      
      // Generate material drops for wild battles (species-specific)
      const materialsDropped = [];
      let goldGained = 0;
      
      if (newBattleState.isWildBattle) {
        // Wild Pokémon drop items, not gold
        const speciesDropTables = {
          'Pidgey': [
            { item: 'Feather', chance: 0.6 },
            { item: 'Gust Essence', chance: 0.25 },
            { item: 'Sky Shard', chance: 0.15 }
          ],
          'Rattata': [
            { item: 'Fang Fragment', chance: 0.5 },
            { item: 'Fiber Tail', chance: 0.4 },
            { item: 'Quick Dust', chance: 0.2 }
          ],
          'Caterpie': [
            { item: 'Silk Fragment', chance: 0.7 },
            { item: 'Bug Dust', chance: 0.4 },
            { item: 'String Fiber', chance: 0.3 }
          ],
          'default': [
            { item: 'Monster Essence', chance: 0.5 },
            { item: 'Wild Shard', chance: 0.3 },
            { item: 'Berries', chance: 0.4 }
          ]
        };
        
        const dropTable = speciesDropTables[newBattleState.enemyPokemon.species] || speciesDropTables['default'];
        
        dropTable.forEach(drop => {
          if (Math.random() < drop.chance) {
            materialsDropped.push(drop.item);
          }
        });
        
        // Ensure at least one drop
        if (materialsDropped.length === 0) {
          materialsDropped.push(dropTable[0].item);
        }
      } else {
        // Practice battles still give gold
        goldGained = Math.floor(newBattleState.enemyPokemon.level * 15);
      }

      newBattleState.rewards = {
        xpGained,
        goldGained,
        materialsDropped,
        evsGained: evResult.evsGained,
        totalEVsGained: evResult.totalGained,
        levelsGained: levelsGained.length,
        newLevel: newLevel
      };
      
      // Trigger first_victory tutorial
      triggerTutorial('first_victory');
      
      // Check for evolution first
      const evolutionData = checkEvolution(newBattleState.playerPokemon, newLevel);
      
      if (evolutionData) {
        // Store evolution state
        setEvolutionState({
          pokemon: newBattleState.playerPokemon,
          evolvesInto: evolutionData.evolvesInto,
          pendingUpdate: {
            id: newBattleState.playerPokemon.id,
            experience: newXP,
            level: newLevel,
            evs: evResult.newEVs,
            movesLearned: movesLearned
          }
        });
      } else if (movesLearned.length > 0) {
        // No evolution, but has moves to learn
        const currentMoves = newBattleState.playerPokemon.abilities || [];
        
        setMoveLearnState({
          pokemon: newBattleState.playerPokemon,
          newMoves: movesLearned,
          currentMoves: currentMoves,
          pendingUpdate: {
            id: newBattleState.playerPokemon.id,
            experience: newXP,
            level: newLevel,
            evs: evResult.newEVs
          }
        });
      } else {
        // No evolution or moves, just update stats
        base44.entities.Pokemon.update(newBattleState.playerPokemon.id, {
          experience: newXP,
          level: newLevel,
          evs: evResult.newEVs
        }).catch(err => console.error('Failed to update Pokémon:', err));
      }

      // Add materials to inventory
      if (materialsDropped.length > 0) {
        // Add materials asynchronously
        materialsDropped.forEach(material => {
          base44.entities.Item.filter({ name: material }).then(existingItems => {
            if (existingItems.length > 0) {
              // Stack with existing
              const existingItem = existingItems[0];
              base44.entities.Item.update(existingItem.id, {
                quantity: (existingItem.quantity || 1) + 1
              });
            } else {
              // Create new item
              base44.entities.Item.create({
                name: material,
                type: 'Material',
                tier: 1,
                rarity: 'Common',
                description: 'A crafting material dropped from wild Pokémon',
                quantity: 1,
                stackable: true,
                sellValue: 10
              });
            }
          }).catch(err => console.error('Failed to add material:', err));
        });
        
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        triggerTutorial('first_material');
      }

    } else if (newBattleState.playerHP <= 0) {
      newBattleState.status = 'lost';
      newBattleState.currentTurn = 'ended';
      newBattleState.battleLog.push({
        turn: newBattleState.turnNumber,
        actor: 'System',
        action: 'Defeat!',
        result: 'You lost the battle.',
        synergyTriggered: false
      });
    } else {
      newBattleState.currentTurn = 'player';
    }

    setBattleState(newBattleState);
  };

  // Flee from battle
  const fleeBattle = () => {
    if (!battleState || !battleState.isWildBattle) return;
    
    // Return to zone
    if (returnTo) {
      window.location.href = `/${returnTo}`;
    } else {
      setBattleState(null);
      setWildPokemonId(null);
      setReturnTo(null);
    }
  };

  // Switch Pokémon
  const switchPokemon = async (newPokemon) => {
    if (!battleState || !newPokemon) return;

    const newStats = getPokemonStats(newPokemon).stats;

    const newBattleState = {
      ...battleState,
      playerPokemon: newPokemon,
      playerHP: newStats.maxHp,
      battleLog: [...battleState.battleLog, {
        turn: battleState.turnNumber,
        actor: 'System',
        action: 'Switch',
        result: `${newPokemon.nickname || newPokemon.species} switched in!`,
        synergyTriggered: false
      }],
      turnNumber: battleState.turnNumber + 1
    };

    setBattleState(newBattleState);
    setActionMenu('main');
  };

  // Use battle item
  const useItem = async (item) => {
    if (!battleState) return;

    let healAmount = 0;
    if (item.name === 'Potion') healAmount = 50;
    if (item.name === 'Super Potion') healAmount = 100;

    const playerStats = getPokemonStats(battleState.playerPokemon).stats;
    const newHP = Math.min(battleState.playerHP + healAmount, playerStats.maxHp);

    const newBattleState = {
      ...battleState,
      playerHP: newHP,
      battleLog: [...battleState.battleLog, {
        turn: battleState.turnNumber,
        actor: 'Player',
        action: `Used ${item.name}`,
        result: `Restored ${newHP - battleState.playerHP} HP`,
        synergyTriggered: false
      }],
      turnNumber: battleState.turnNumber + 1,
      currentTurn: 'player'
    };

    setBattleState(newBattleState);
    setActionMenu('main');

    // Consume item
    if (item.quantity > 1) {
      await base44.entities.Item.update(item.id, { quantity: item.quantity - 1 });
    } else {
      await base44.entities.Item.delete(item.id);
    }
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
  };

  // Handle move learning
  const handleLearnMove = async (newMove, replaceMove) => {
    if (!moveLearnState) return;

    let updatedMoves = [...moveLearnState.currentMoves];
    
    if (replaceMove) {
      // Replace existing move
      const replaceIndex = updatedMoves.indexOf(replaceMove);
      if (replaceIndex !== -1) {
        updatedMoves[replaceIndex] = newMove;
      }
    } else {
      // Add new move
      updatedMoves.push(newMove);
    }

    // Remove the learned move from the pending list
    const remainingNewMoves = moveLearnState.newMoves.filter(m => m !== newMove);

    if (remainingNewMoves.length > 0) {
      // More moves to learn
      setMoveLearnState({
        ...moveLearnState,
        newMoves: remainingNewMoves,
        currentMoves: updatedMoves
      });
    } else {
      // All moves processed, update Pokemon
      try {
        await base44.entities.Pokemon.update(moveLearnState.pendingUpdate.id, {
          ...moveLearnState.pendingUpdate,
          abilities: updatedMoves
        });
        queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
      } catch (err) {
        console.error('Failed to update Pokémon moves:', err);
      }
      setMoveLearnState(null);
    }
  };

  const handleCancelMoveLearn = async () => {
    if (!moveLearnState) return;

    // Update Pokemon without learning new moves
    try {
      await base44.entities.Pokemon.update(moveLearnState.pendingUpdate.id, {
        ...moveLearnState.pendingUpdate,
        abilities: moveLearnState.currentMoves
      });
      queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
    } catch (err) {
      console.error('Failed to update Pokémon:', err);
    }
    setMoveLearnState(null);
  };

  // Handle evolution
  const handleEvolution = async () => {
    if (!evolutionState) return;

    try {
      const { pokemon, evolvesInto, pendingUpdate } = evolutionState;
      
      // Calculate new stats based on evolved form
      const evolvedStats = getEvolvedStats(evolvesInto, pokemon.stats);
      
      // Get new roles
      const evolvedRoles = getEvolvedRoles(evolvesInto, pokemon.roles || []);
      
      // Recalculate stats properly with new base stats
      const baseStats = getBaseStats(evolvesInto);
      const calculatedStats = calculateAllStats(
        { level: pendingUpdate.level, nature: pokemon.nature, ivs: pokemon.ivs, evs: pendingUpdate.evs },
        baseStats
      );
      
      // Update Pokemon with evolution
      await base44.entities.Pokemon.update(pendingUpdate.id, {
        species: evolvesInto,
        experience: pendingUpdate.experience,
        level: pendingUpdate.level,
        evs: pendingUpdate.evs,
        stats: calculatedStats,
        currentHp: calculatedStats.hp,
        roles: evolvedRoles
      });
      
      queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
      
      // Check if there are moves to learn after evolution
      if (pendingUpdate.movesLearned && pendingUpdate.movesLearned.length > 0) {
        const currentMoves = pokemon.abilities || [];
        setMoveLearnState({
          pokemon: { ...pokemon, species: evolvesInto },
          newMoves: pendingUpdate.movesLearned,
          currentMoves: currentMoves,
          pendingUpdate: {
            id: pendingUpdate.id,
            experience: pendingUpdate.experience,
            level: pendingUpdate.level,
            evs: pendingUpdate.evs
          }
        });
      }
      
      setEvolutionState(null);
    } catch (err) {
      console.error('Failed to evolve Pokémon:', err);
      setEvolutionState(null);
    }
  };

  const handleCancelEvolution = async () => {
    if (!evolutionState) return;

    // Update Pokemon without evolving
    try {
      await base44.entities.Pokemon.update(evolutionState.pendingUpdate.id, {
        experience: evolutionState.pendingUpdate.experience,
        level: evolutionState.pendingUpdate.level,
        evs: evolutionState.pendingUpdate.evs
      });
      queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
      
      // Check for moves to learn
      if (evolutionState.pendingUpdate.movesLearned && evolutionState.pendingUpdate.movesLearned.length > 0) {
        const currentMoves = evolutionState.pokemon.abilities || [];
        setMoveLearnState({
          pokemon: evolutionState.pokemon,
          newMoves: evolutionState.pendingUpdate.movesLearned,
          currentMoves: currentMoves,
          pendingUpdate: evolutionState.pendingUpdate
        });
      }
    } catch (err) {
      console.error('Failed to update Pokémon:', err);
    }
    setEvolutionState(null);
  };

  if (loadingPokemon) {
    return (
      <div>
        <PageHeader title="Battle Arena" icon={Swords} />
        <div className="space-y-4">
          <Skeleton className="h-48 bg-slate-800" />
          <Skeleton className="h-48 bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!battleState) {
    return (
      <div>
        <PageHeader 
          title="Battle Arena" 
          subtitle="Test your Pokémon's strength in combat"
          icon={Swords} 
        />

        {playerPokemon.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold text-white mb-2">No Pokémon Available</h3>
            <p className="text-slate-400">You need at least one Pokémon in your team to battle</p>
          </div>
        ) : (
          <div className="glass rounded-xl p-8 text-center">
            <Swords className="w-20 h-20 mx-auto mb-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white mb-4">Ready for Battle?</h2>
            <p className="text-slate-400 mb-6">
              Your {playerPokemon[0].nickname || playerPokemon[0].species} (Lv. {playerPokemon[0].level}) is ready to fight!
            </p>
            <Button 
              size="lg"
              onClick={startBattle}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              <Swords className="w-5 h-5 mr-2" />
              Start Battle
            </Button>
          </div>
        )}
      </div>
    );
  }

  const isPlayerTurn = battleState.currentTurn === 'player';
  const isBattleEnded = battleState.status === 'won' || battleState.status === 'lost';

  return (
    <div>
      <PageHeader 
        title="Battle Arena" 
        subtitle={`Turn ${battleState.turnNumber} - ${isPlayerTurn ? 'Your Turn' : 'Enemy Turn'}`}
        icon={Swords}
        action={
          isBattleEnded && (
            <Button 
              onClick={() => setBattleState(null)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              New Battle
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Battle Field */}
        <div className="lg:col-span-2 space-y-4">
          {/* Enemy Pokemon */}
          <BattleHUD
            pokemon={battleState.enemyPokemon}
            hp={battleState.enemyHP}
            maxHp={getPokemonStats(battleState.enemyPokemon).stats.maxHp}
            status={battleState.enemyStatus}
            roles={battleState.enemyPokemon.roles || []}
          />

          {/* VS Indicator */}
          <div className="flex justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"
            >
              <Swords className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          {/* Player Pokemon */}
          <BattleHUD
            pokemon={battleState.playerPokemon}
            hp={battleState.playerHP}
            maxHp={getPokemonStats(battleState.playerPokemon).stats.maxHp}
            status={battleState.playerStatus}
            roles={battleState.playerPokemon.roles || []}
            isPlayer
          />

          {/* Evolution Modal */}
          {evolutionState && (
            <EvolutionModal
              pokemon={evolutionState.pokemon}
              evolvesInto={evolutionState.evolvesInto}
              newStats={(() => {
                const baseStats = getBaseStats(evolutionState.evolvesInto);
                return calculateAllStats(
                  { 
                    level: evolutionState.pendingUpdate.level, 
                    nature: evolutionState.pokemon.nature, 
                    ivs: evolutionState.pokemon.ivs, 
                    evs: evolutionState.pendingUpdate.evs 
                  },
                  baseStats
                );
              })()}
              oldStats={evolutionState.pokemon.stats}
              onComplete={handleEvolution}
              onCancel={handleCancelEvolution}
            />
          )}

          {/* Move Learning Modal */}
          {moveLearnState && !evolutionState && (
            <MoveLearnModal
              pokemon={moveLearnState.pokemon}
              newMoves={moveLearnState.newMoves}
              currentMoves={moveLearnState.currentMoves}
              onLearn={handleLearnMove}
              onCancel={handleCancelMoveLearn}
            />
          )}

          {/* Capture Success Modal */}
          {captureModalState && (
            <CaptureSuccessModal
              pokemon={captureModalState.pokemon}
              addedToParty={captureModalState.addedToParty}
              onComplete={async (nickname) => {
                try {
                  const species = captureModalState.pokemon.species;
                  const level = captureModalState.pokemon.level;
                  
                  // Update the captured Pokémon with correct placement and nickname
                  await base44.entities.Pokemon.update(wildPokemonId, {
                    isInTeam: captureModalState.addedToParty,
                    nickname: nickname || undefined
                  });
                  
                  // Check if this species is already in Pokédex
                  const existingEntry = await base44.entities.Pokedex.filter({ species });
                  
                  if (existingEntry.length === 0) {
                    // New Pokédex entry - first time catching this species
                    await base44.entities.Pokedex.create({
                      species,
                      status: 'Caught',
                      firstCaughtAt: new Date().toISOString(),
                      firstCaughtLocation: returnTo || 'Unknown Zone',
                      firstCaughtLevel: level,
                      captureMethod: 'Pokéball',
                      timesCaught: 1,
                      highestLevelSeen: level
                    });
                    
                    // Show success notification
                    alert(`🎉 New Pokédex Entry!\n\n${species} was registered to your Pokédex!`);
                  } else {
                    // Update existing entry
                    const entry = existingEntry[0];
                    await base44.entities.Pokedex.update(entry.id, {
                      status: 'Caught',
                      timesCaught: (entry.timesCaught || 1) + 1,
                      highestLevelSeen: Math.max(entry.highestLevelSeen || 0, level)
                    });
                  }
                  
                  queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });
                  queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
                  queryClient.invalidateQueries({ queryKey: ['pokedex'] });
                  
                  setCaptureModalState(null);
                  
                  // Trigger first_capture tutorial
                  triggerTutorial('first_capture');
                } catch (err) {
                  console.error('Failed to update captured Pokémon:', err);
                  setCaptureModalState(null);
                }
              }}
            />
          )}

          {/* Battle Results Modal */}
          {isBattleEnded && !moveLearnState && !evolutionState && !captureModalState && (
            <BattleOutcomeModal
              outcome={{
                result: battleState.status === 'captured' ? 'captured' : 
                        battleState.status === 'won' ? 'victory' : 'defeat',
                enemyName: battleState.enemyPokemon.species,
                xpGained: (battleState.status === 'won' || battleState.status === 'captured') ? (battleState.rewards?.xpGained || Math.floor(battleState.enemyPokemon.level * 25)) : 0,
                goldGained: (battleState.status === 'won' || battleState.status === 'captured') ? (battleState.rewards?.goldGained || Math.floor(battleState.enemyPokemon.level * 15)) : 0,
                synergyChains: battleState.synergyChains || 0,
                itemsReceived: battleState.rewards?.materialsDropped || [],
                canCapture: false,
                enemyHP: battleState.enemyHP,
                wasCaptured: battleState.status === 'captured'
              }}
              onClose={async () => {
                // Clean up wild Pokémon
                if (wildPokemonId) {
                  try {
                    if (battleState.status === 'captured') {
                      // Captured Pokémon already handled by CaptureSuccessModal
                    } else if (battleState.status === 'won') {
                      // Delete defeated wild Pokémon
                      await base44.entities.Pokemon.delete(wildPokemonId);
                    }
                  } catch (err) {
                    console.error('Failed to handle wild Pokémon:', err);
                  }
                }
                
                // Return to exploration if this was a wild battle
                if (returnTo && battleState.isWildBattle) {
                  window.location.href = `/${returnTo}`;
                } else {
                  setBattleState(null);
                  setWildPokemonId(null);
                  setReturnTo(null);
                }
              }}
            />
          )}

          {/* Action Menu */}
          {!isBattleEnded && (
            <div className="space-y-4">
              {/* Main Action Menu */}
              {actionMenu === 'main' && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setActionMenu('fight')}
                    disabled={!isPlayerTurn}
                    className="h-20 bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    <Swords className="w-6 h-6 mr-2" />
                    Fight
                  </Button>
                  
                  <Button
                    onClick={() => setActionMenu('items')}
                    disabled={!isPlayerTurn || battleItems.length === 0}
                    className="h-20 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <Package className="w-6 h-6 mr-2" />
                    Items
                  </Button>

                  {battleState.isWildBattle && (
                    <Button
                      onClick={attemptCapture}
                      disabled={!isPlayerTurn || pokeballCount <= 0 || capturingPokemon}
                      className="h-20 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    >
                      <Trophy className="w-6 h-6 mr-2" />
                      Capture
                      <Badge className="ml-2 bg-white/20">{pokeballCount}</Badge>
                    </Button>
                  )}

                  <Button
                    onClick={() => setActionMenu('switch')}
                    disabled={!isPlayerTurn || playerPokemon.length <= 1}
                    className="h-20 bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Sparkles className="w-6 h-6 mr-2" />
                    Switch
                  </Button>

                  {battleState.isWildBattle && (
                    <Button
                      onClick={fleeBattle}
                      disabled={!isPlayerTurn}
                      variant="outline"
                      className="h-20 border-slate-600 hover:bg-slate-800"
                    >
                      <AlertCircle className="w-6 h-6 mr-2" />
                      Flee
                    </Button>
                  )}
                </div>
              )}

              {/* Fight Menu - Move Selection */}
              {actionMenu === 'fight' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Select a Move
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActionMenu('main')}
                    >
                      Back
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {battleState.playerPokemon.abilities && battleState.playerPokemon.abilities.length > 0 ? (
                      battleState.playerPokemon.abilities.map((moveName, idx) => {
                        const moveData = moves.find(m => m.name === moveName) || {
                          id: idx,
                          name: moveName,
                          type: 'Normal',
                          category: 'Physical',
                          power: 40,
                          accuracy: 100,
                          description: 'A basic move'
                        };
                        return (
                          <MoveCard
                            key={idx}
                            move={moveData}
                            onUse={(m) => {
                              useMove(m);
                              setActionMenu('main');
                            }}
                            disabled={!isPlayerTurn}
                          />
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-center text-slate-400 py-4">
                        <p>No moves learned yet!</p>
                        <p className="text-xs mt-1">Level up to learn new moves</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items Menu */}
              {actionMenu === 'items' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Battle Items</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActionMenu('main')}
                    >
                      Back
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {battleItems.map((item) => (
                      <Button
                        key={item.id}
                        onClick={() => useItem(item)}
                        disabled={!isPlayerTurn}
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span>{item.name}</span>
                        <Badge className="bg-slate-700">x{item.quantity || 1}</Badge>
                      </Button>
                    ))}
                    {battleItems.length === 0 && (
                      <div className="text-center text-slate-400 py-4">
                        No battle items available
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Switch Menu */}
              {actionMenu === 'switch' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Switch Pokémon</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActionMenu('main')}
                    >
                      Back
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {playerPokemon
                      .filter(p => p.id !== battleState.playerPokemon.id)
                      .map((pokemon) => (
                        <Button
                          key={pokemon.id}
                          onClick={() => switchPokemon(pokemon)}
                          disabled={!isPlayerTurn || pokemon.stats.hp <= 0}
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <span>{pokemon.nickname || pokemon.species}</span>
                          <Badge className="bg-slate-700">Lv. {pokemon.level}</Badge>
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Battle Log */}
          <BattleLog logs={battleState.battleLog} />

          {/* Player Talents */}
          {battleState.playerPokemon.talents?.length > 0 && (
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Active Talents
              </h3>
              <TalentDisplay 
                talents={battleState.playerPokemon.talents} 
                showDescription
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}