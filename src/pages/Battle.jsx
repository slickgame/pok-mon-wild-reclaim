import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
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
import BattleSummaryModal from '@/components/battle/BattleSummaryModal';
import { BattleEngine, triggerTalent } from '@/components/battle/BattleEngine';
import { createDefaultStatStages } from '@/components/battle/statStageUtils';
import BattlefieldStatus from '@/components/battle/BattlefieldStatus';
import { HazardRegistry } from '@/components/data/HazardRegistry';
import { inflictStatus } from '@/components/data/StatusRegistry';
import { applyEVGains } from '@/components/pokemon/evManager';
import { getPokemonStats } from '@/components/pokemon/usePokemonStats';
import { getAllMovesUpToLevel, getMovesLearnedAtLevel } from '@/components/pokemon/levelUpLearnsets';
import MoveLearnModal from '@/components/battle/MoveLearnModal';
import { checkEvolution, getEvolvedStats, getEvolvedRoles, evolvePokemon } from '@/components/pokemon/evolutionData';
import EvolutionModal from '@/components/pokemon/EvolutionModal';
import { calculateAllStats } from '@/components/pokemon/statCalculations';
import { getBaseStats } from '@/components/pokemon/baseStats';
import { wildPokemonData, rollItemDrops, calculateWildXP } from '@/components/zones/wildPokemonData';
import { getMoveData } from '@/components/utils/getMoveData';

const createDefaultBattlefield = () => ({
  terrain: null,
  terrainDuration: 0,
  weather: null,
  weatherDuration: 0,
  hazards: {
    playerSide: [],
    enemySide: []
  },
  screens: {
    playerSide: [],
    enemySide: []
  }
});

export default function BattlePage() {
  const [battleState, setBattleState] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);
  const [wildPokemonId, setWildPokemonId] = useState(null);
  const [returnTo, setReturnTo] = useState(null);
  const [capturingPokemon, setCapturingPokemon] = useState(false);
  const [actionMenu, setActionMenu] = useState('main'); // 'main', 'fight', 'items', 'switch', 'pokeballs'
  const [selectedPokeball, setSelectedPokeball] = useState(null);
  const [moveLearnState, setMoveLearnState] = useState(null); // { pokemon, newMoves, currentMoves, pendingUpdate }
  const [evolutionState, setEvolutionState] = useState(null); // { pokemon, evolvesInto, pendingUpdate }
  const [captureModalState, setCaptureModalState] = useState(null); // { pokemon, addedToParty }
  const [itemsUsed, setItemsUsed] = useState([]); // Track items used in battle
  const [battleSummary, setBattleSummary] = useState(null); // Battle summary data
  const [faintedIds, setFaintedIds] = useState([]); // Track which Pokemon fainted in battle
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerTutorial } = useTutorialTrigger();

  // Get battle state from React Router location
  useEffect(() => {
    const state = location.state;

    if (state?.wildPokemonId) {
    setWildPokemonId(state.wildPokemonId);
    setReturnTo(state.returnTo || 'Zones');
    triggerTutorial('first_battle');
    }

    // Clean up navigation state to prevent reuse
    window.history.replaceState({}, document.title);
  }, [location.state, triggerTutorial]);

  // Fetch player inventory for Pokéballs and battle items
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const items = await base44.entities.Item.list();
      return items;
    }
  });

  const pokeballs = inventory.filter(item => item.type === 'Capture Gear');
  const totalPokeballCount = pokeballs.reduce((sum, ball) => sum + (ball.quantity || 0), 0);
  const battleItems = inventory.filter(item => ['Potion', 'Battle Item'].includes(item.type));

  // Fetch player for party order
  const { data: player } = useQuery({
    queryKey: ['player'],
    queryFn: async () => {
      const players = await base44.entities.Player.list();
      return players[0] || null;
    }
  });

  // Fetch player's team
  const { data: playerPokemon = [], isLoading: loadingPokemon } = useQuery({
    queryKey: ['playerPokemon'],
    queryFn: async () => {
      const pokemon = await base44.entities.Pokemon.filter({ isInTeam: true });
      
      // Validate party
      if (pokemon.length === 0) {
        console.error('No Pokémon in party!');
        return [];
      }
      
      // Use player.partyOrder to sort party
      if (player?.partyOrder?.length) {
        const orderedParty = player.partyOrder
          .map(id => pokemon.find(p => p.id === id))
          .filter(Boolean)
          .map(p => ({
            ...p,
            abilities: p.abilities || ['Tackle', 'Growl']
          }));
        return orderedParty;
      }
      
      // Fallback to default sort
      const sortedParty = pokemon.map(p => ({
        ...p,
        abilities: p.abilities || ['Tackle', 'Growl']
      }));
      
      return sortedParty;
    },
    enabled: !!player
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
    const playerMon = playerPokemon[0];
    const playerStatsResult = getPokemonStats(playerMon);
    const wildStatsResult = getPokemonStats(wildMon);
    
    const playerStats = playerStatsResult?.stats || playerMon?.stats || { hp: 100, maxHp: 100, atk: 50, def: 50, spAtk: 50, spDef: 50, spd: 50 };
    const wildStats = wildStatsResult?.stats || wildMon?.stats || { hp: 100, maxHp: 100, atk: 50, def: 50, spAtk: 50, spDef: 50, spd: 50 };
    
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
      battlefield: createDefaultBattlefield(),
      synergyChains: 0,
      isWildBattle: true
    });
  };

  // Start a new battle (practice mode)
  const startBattle = () => {
    if (playerPokemon.length === 0) return;

    // Always use first Pokémon in party as lead
    const playerMon = playerPokemon[0];
    const playerStatsResult = getPokemonStats(playerMon);
    const playerStats = playerStatsResult?.stats || playerMon?.stats || { hp: 100, maxHp: 100, atk: 50, def: 50, spAtk: 50, spDef: 50, spd: 50 };
    
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
      battlefield: createDefaultBattlefield(),
      synergyChains: 0,
      isWildBattle: false
    });
  };

  const applyEntryHazards = ({ battleState: state, sideKey, pokemon, applyStatChange }) => {
    const battlefield = state.battlefield || createDefaultBattlefield();
    state.battlefield = battlefield;
    const hazards = battlefield.hazards?.[sideKey] || [];
    const hazardLogs = [];
    const actorName = pokemon.nickname || pokemon.species;

    const addBattleLog = (message, action = 'Hazard') => {
      hazardLogs.push({
        turn: state.turnNumber,
        actor: actorName,
        action,
        result: message,
        synergyTriggered: false
      });
    };

    const applyDamage = (amount) => {
      if (sideKey === 'playerSide') {
        state.playerHP = Math.max(0, state.playerHP - amount);
        pokemon.currentHp = state.playerHP;
      } else {
        state.enemyHP = Math.max(0, state.enemyHP - amount);
        pokemon.currentHp = state.enemyHP;
      }
    };

    const applyStatus = (statusId) => inflictStatus(pokemon, statusId, state, (message) => addBattleLog(message, 'Status'));

    hazards.forEach((hazardId) => {
      const hazard = HazardRegistry[hazardId];
      hazard?.onSwitchIn?.({
        mon: pokemon,
        battleState: state,
        applyDamage,
        addBattleLog,
        applyStatChange,
        inflictStatus: applyStatus
      });
    });

    return hazardLogs;
  };

  // Attempt capture with selected Pokéball
  const attemptCapture = async (ballType = null) => {
    if (!battleState || !battleState.isWildBattle || capturingPokemon) return;
    
    // If no ball specified, check for default or first available
    const ballToUse = ballType || pokeballs[0];
    
    if (!ballToUse || totalPokeballCount <= 0) {
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
    
    try {

    // Ball type modifiers (lower is better)
    const ballModifiers = {
      'Pokéball': 0,
      'Great Ball': -10,
      'Ultra Ball': -20,
      'Master Ball': -100, // Guaranteed catch
      'Dusk Ball': -15, // Could add time/location logic
      'Quick Ball': battleState.turnNumber === 1 ? -30 : 0,
      'Net Ball': ['Water', 'Bug'].includes(battleState.enemyPokemon.type1) ? -20 : 0,
      'Nest Ball': battleState.enemyPokemon.level <= 10 ? -25 : 0
    };

    // Calculate catch rate
    const enemyStatsResult = getPokemonStats(battleState.enemyPokemon);
    const enemyStats = enemyStatsResult?.stats || battleState.enemyPokemon.stats || { hp: 100, maxHp: 100, atk: 50, def: 50, spAtk: 50, spDef: 50, spd: 50 };
    const hpPercent = (battleState.enemyHP / (enemyStats.maxHp || 100)) * 100;
    
    const rarityModifier = {
      'common': 50,
      'uncommon': 35,
      'rare': 20,
      'legendary': 5
    }[battleState.enemyPokemon.rarity?.toLowerCase() || 'common'];

    const ballModifier = ballModifiers[ballToUse.name] || 0;
    const baseChance = rarityModifier;
    const hpBonus = Math.max(0, 50 - hpPercent);
    const catchChance = Math.min(95, baseChance + hpBonus + Math.abs(ballModifier));

    const roll = Math.random() * 100;
    const success = roll < catchChance;

      // Use the Pokéball
      await base44.entities.Item.update(ballToUse.id, { 
        quantity: ballToUse.quantity - 1 
      });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });

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
      const addedToParty = playerPokemon.length < 6;
      
      setCaptureModalState({
        pokemon: battleState.enemyPokemon,
        addedToParty
      });
    } else {
      // Capture failed, enemy gets free turn
      const enemyAvailableMoves = getEnemyBattleMoves(battleState.enemyPokemon).filter((moveOption) => moveOption.category !== 'Status');
      const fallbackEnemyMoves = getEnemyBattleMoves(battleState.enemyPokemon);
      const enemyMove = enemyAvailableMoves[Math.floor(Math.random() * enemyAvailableMoves.length)] || fallbackEnemyMoves[0] || getMoveData('Tackle', battleState.enemyPokemon);
      
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
            action: enemyMove?.name || 'Tackle',
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

    } catch (error) {
      console.error('Capture attempt failed:', error);
      setBattleState({
        ...battleState,
        battleLog: [...battleState.battleLog, {
          turn: battleState.turnNumber,
          actor: 'System',
          action: 'Error!',
          result: 'Capture failed due to an error.',
          synergyTriggered: false
        }]
      });
    } finally {
      setCapturingPokemon(false);
      // Track pokeball usage
      setItemsUsed(prev => [...prev, ballToUse.name]);
    }
  };

  const getEnemyBattleMoves = (enemyPokemon) => {
    const moveNames = enemyPokemon?.abilities || [];
    const resolvedMoves = moveNames
      .map((moveName) => getMoveData(moveName, enemyPokemon))
      .filter(Boolean);

    if (resolvedMoves.length > 0) {
      return resolvedMoves;
    }

    return moves.slice(0, 4).map((moveEntry) => {
      if (typeof moveEntry === 'string') {
        return getMoveData(moveEntry, enemyPokemon);
      }
      if (moveEntry?.name) {
        return getMoveData(moveEntry.name, enemyPokemon);
      }
      return moveEntry;
    }).filter(Boolean);
  };

  // Use a move
  const useMove = async (move) => {
    if (!battleState || battleState.currentTurn !== 'player') return;

    // Initialize battle engine
    const engine = new BattleEngine(battleState.playerPokemon, battleState.enemyPokemon);

    // Enemy uses smart AI to choose best move from its own learned moves
    const enemyAvailableMoves = getEnemyBattleMoves(battleState.enemyPokemon);
    const enemyMove = engine.chooseEnemyMove(enemyAvailableMoves, battleState.playerPokemon) || enemyAvailableMoves[0];

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

      // Award XP to all team members
      const speciesData = wildPokemonData[newBattleState.enemyPokemon.species];
      const baseXpGained = speciesData 
        ? calculateWildXP(speciesData, newBattleState.enemyPokemon.level, false)
        : Math.floor(newBattleState.enemyPokemon.level * 25);
      const xpResults = [];
      const pokemonToUpdate = [];

      // Process each team member
      for (const teamMember of playerPokemon) {
        const pokemonStats = getPokemonStats(teamMember);
        const maxHp = pokemonStats?.stats?.maxHp || teamMember.stats?.maxHp || 100;
        // Check if this Pokemon fainted during battle (use battle session tracking)
        const isFainted = faintedIds.includes(teamMember.id);

        if (isFainted) {
          // Fainted Pokemon don't gain XP
          xpResults.push({
            name: teamMember.nickname || teamMember.species,
            fainted: true,
            xpGained: 0,
            leveledUp: false
          });
          continue;
        }

        // Skip wild Pokemon instances (shouldn't be in party anyway)
        if (teamMember.isWildInstance) {
          continue;
        }

        // Award XP (active Pokemon gets full XP, others get 50%)
        const xpMultiplier = teamMember.id === newBattleState.playerPokemon.id ? 1.0 : 0.5;
        const xpGained = Math.floor(baseXpGained * xpMultiplier);
        const currentXP = teamMember.experience || 0;
        const newXP = currentXP + xpGained;

        // Calculate level ups
        const currentLevel = teamMember.level;
        let newLevel = currentLevel;
        let totalXP = newXP;
        const levelsGained = [];

        // Level up while we have enough XP for the next level
        while (totalXP >= (newLevel * 100)) {
          totalXP -= (newLevel * 100);
          newLevel++;
          levelsGained.push(newLevel);
        }

        // Track for update
        pokemonToUpdate.push({
          id: teamMember.id,
          experience: totalXP,
          level: newLevel,
          species: teamMember.species
        });

        xpResults.push({
          name: teamMember.nickname || teamMember.species,
          fainted: false,
          xpGained: xpGained,
          leveledUp: levelsGained.length > 0,
          newLevel: newLevel
        });
      }

      // Update all Pokemon with XP
      await Promise.all(pokemonToUpdate.map(p => 
        base44.entities.Pokemon.update(p.id, {
          experience: p.experience,
          level: p.level
        })
      ));

      queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });

      // Handle active Pokemon's level up mechanics (moves, evolution, EVs)
      let movesLearned = [];
      const activePokemonUpdate = pokemonToUpdate.find(p => p.id === newBattleState.playerPokemon.id);
      if (activePokemonUpdate && activePokemonUpdate.level > newBattleState.playerPokemon.level) {
        const levelsGained = [];
        for (let lvl = newBattleState.playerPokemon.level + 1; lvl <= activePokemonUpdate.level; lvl++) {
          levelsGained.push(lvl);
        }

        levelsGained.forEach(level => {
          const moves = getMovesLearnedAtLevel(newBattleState.playerPokemon.species, level);
          if (moves.length > 0) {
            movesLearned.push(...moves);
          }
        });
      }

      // Apply EV gains (only to active Pokemon)
      const currentEVs = newBattleState.playerPokemon.evs || { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 };
      const evResult = applyEVGains(currentEVs, newBattleState.enemyPokemon.species);
      
      // Generate material drops for wild battles (species-specific)
      const materialsDropped = [];
      let goldGained = 0;
      
      if (newBattleState.isWildBattle) {
        // Wild Pokémon drop items using species data
        const speciesData = wildPokemonData[newBattleState.enemyPokemon.species];
        
        if (speciesData) {
          const droppedItems = rollItemDrops(speciesData);
          materialsDropped.push(...droppedItems);
        }
        
        // Fallback to generic drops if no species data
        if (materialsDropped.length === 0) {
          if (Math.random() < 0.5) {
            materialsDropped.push('Monster Essence');
          }
        }
      } else {
        // Practice battles still give gold
        goldGained = Math.floor(newBattleState.enemyPokemon.level * 15);
      }

      newBattleState.rewards = {
        xpGained: baseXpGained,
        goldGained,
        materialsDropped,
        evsGained: evResult.evsGained,
        totalEVsGained: evResult.totalGained,
        xpResults
      };

      // Trigger first_victory tutorial
      triggerTutorial('first_victory');

      // Check for evolution first (only active Pokemon)
      const evolutionData = activePokemonUpdate
        ? checkEvolution(newBattleState.playerPokemon, activePokemonUpdate.level)
        : null;
      
      if (evolutionData?.canEvolve) {
        // Store evolution state
        setEvolutionState({
          pokemon: newBattleState.playerPokemon,
          evolvesInto: evolutionData.evolvesInto,
          pendingUpdate: {
            id: newBattleState.playerPokemon.id,
            experience: activePokemonUpdate.experience,
            level: activePokemonUpdate.level,
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
            experience: activePokemonUpdate.experience,
            level: activePokemonUpdate.level,
            evs: evResult.newEVs
          }
        });
        } else {
        // No evolution or moves, update EVs for active Pokemon
        base44.entities.Pokemon.update(newBattleState.playerPokemon.id, {
          evs: evResult.newEVs
        }).catch(err => console.error('Failed to update Pokémon:', err));

        // Show battle summary
        setBattleSummary({
          result: 'victory',
          enemyName: newBattleState.enemyPokemon.species,
          xpResults: xpResults,
          itemsUsed: itemsUsed,
          materialsDropped: materialsDropped
        });
        }

      // Add materials to inventory
      if (materialsDropped.length > 0) {
        const speciesData = wildPokemonData[newBattleState.enemyPokemon.species];
        
        // Add materials asynchronously
        materialsDropped.forEach(materialName => {
          base44.entities.Item.filter({ name: materialName }).then(existingItems => {
            if (existingItems.length > 0) {
              // Stack with existing
              const existingItem = existingItems[0];
              base44.entities.Item.update(existingItem.id, {
                quantity: (existingItem.quantity || 1) + 1
              });
            } else {
              // Get item data from species data if available
              const dropData = speciesData?.dropItems?.find(d => d.item === materialName);
              
              // Create new item
              base44.entities.Item.create({
                name: materialName,
                type: 'Material',
                tier: 1,
                rarity: dropData?.rarity || 'Common',
                description: dropData ? `A crafting material from ${speciesData.species}` : 'A crafting material dropped from wild Pokémon',
                quantity: 1,
                stackable: true,
                sellValue: dropData?.sellValue || 10
              });
            }
          }).catch(err => console.error('Failed to add material:', err));
        });
        
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        queryClient.invalidateQueries({ queryKey: ['items'] });
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
      // Mark active Pokemon as fainted
      setFaintedIds(prev => [...prev, newBattleState.playerPokemon.id]);
    } else {
      newBattleState.currentTurn = 'player';
    }

    setBattleState(newBattleState);
  };

  // Flee from battle
  const fleeBattle = async () => {
    if (!battleState || !battleState.isWildBattle) return;
    
    // Delete the wild Pokemon when fleeing
    if (wildPokemonId) {
      try {
        await base44.entities.Pokemon.delete(wildPokemonId);
        queryClient.invalidateQueries({ queryKey: ['wildPokemon'] });
      } catch (err) {
        console.error('Failed to delete wild Pokemon:', err);
      }
    }
    
    // Navigate back to zone using React Router
    if (returnTo) {
      navigate(`/${returnTo}`);
    } else {
      setBattleState(null);
      setWildPokemonId(null);
      setReturnTo(null);
    }
  };

  // Switch Pokémon
  const switchPokemon = async (newPokemon) => {
    if (!battleState || !newPokemon) return;

    const isTrapped = battleState.playerPokemon.passiveEffects?.some(effect => effect.trap);
    if (isTrapped) {
      setBattleState({
        ...battleState,
        battleLog: [...battleState.battleLog, {
          turn: battleState.turnNumber,
          actor: battleState.playerPokemon.nickname || battleState.playerPokemon.species,
          action: 'is trapped',
          result: 'Cannot switch out!',
          synergyTriggered: false
        }]
      });
      setActionMenu('main');
      return;
    }

    if (battleState.playerPokemon) {
      battleState.playerPokemon.statStages = createDefaultStatStages();
    }

    const newStatsResult = getPokemonStats(newPokemon);
    const newStats = newStatsResult?.stats || newPokemon.stats || { hp: 100, maxHp: 100, atk: 50, def: 50, spAtk: 50, spDef: 50, spd: 50 };
    const maxHp = newStats?.maxHp || 100;

    // Check if switched Pokemon is fainted
    const isFainted = faintedIds.includes(newPokemon.id);
    const actualHP = isFainted ? 0 : (newPokemon.currentHp !== undefined ? newPokemon.currentHp : maxHp);

    const newBattleState = {
      ...battleState,
      playerPokemon: newPokemon,
      playerHP: actualHP,
      battleLog: [...battleState.battleLog, {
        turn: battleState.turnNumber,
        actor: 'System',
        action: 'Switch',
        result: `${newPokemon.nickname || newPokemon.species} switched in!`,
        synergyTriggered: false
      }],
      turnNumber: battleState.turnNumber + 1
    };

    const switchTalentLogs = [];
    const switchEngine = new BattleEngine(newPokemon, battleState.enemyPokemon);
    const hazardLogs = applyEntryHazards({
      battleState: newBattleState,
      sideKey: 'playerSide',
      pokemon: newPokemon,
      applyStatChange: (stat, stages) => switchEngine.applyStatChange(newPokemon, stat, stages, newBattleState)
    });

    const mappedWeather = newBattleState.battlefield?.weather === 'sunny'
      ? 'sun'
      : newBattleState.battlefield?.weather;
    const mappedTerrain = newBattleState.battlefield?.terrain === 'grassy'
      ? 'grass'
      : newBattleState.battlefield?.terrain;

    triggerTalent('onSwitchIn', {
      playerTeam: [newPokemon],
      enemyTeam: [battleState.enemyPokemon],
      battleState: newBattleState,
      turnCount: newBattleState.turnNumber,
      weather: mappedWeather,
      terrain: mappedTerrain,
      isFirstTurn: newBattleState.turnNumber === 1,
      addBattleLog: (message, user, talentDef) => {
        switchTalentLogs.push({
          turn: newBattleState.turnNumber,
          actor: user?.nickname || user?.species,
          action: `Talent Triggered: ${talentDef?.name || 'Talent'}`,
          result: message,
          synergyTriggered: true,
          talentTriggered: true
        });
      },
      modifyStat: (targetPokemon, stat, stages) => {
        switchEngine.applyStatChange(targetPokemon, stat, stages, newBattleState);
      }
    });

    setBattleState({
      ...newBattleState,
      battleLog: [...newBattleState.battleLog, ...hazardLogs, ...switchTalentLogs]
    });
    setActionMenu('main');
  };

  // Use battle item
  const useItem = async (item) => {
    if (!battleState) return;

    let healAmount = 0;
    let itemEffect = '';
    const isEvolutionItem = item.type === 'evolution';
    
    // Evolution items
    if (isEvolutionItem) {
      const evolutionData = checkEvolution(battleState.playerPokemon, null, item.name);
      if (evolutionData?.canEvolve) {
        setEvolutionState({
          pokemon: battleState.playerPokemon,
          evolvesInto: evolutionData.evolvesInto,
          pendingUpdate: {
            id: battleState.playerPokemon.id,
            experience: battleState.playerPokemon.experience,
            level: battleState.playerPokemon.level,
            evs: battleState.playerPokemon.evs,
            movesLearned: []
          },
          itemUsed: item
        });
        return;
      }
      itemEffect = `${item.name} had no effect.`;
    }

    // Potions
    if (item.name === 'Potion') healAmount = 50;
    if (item.name === 'Super Potion') healAmount = 100;
    if (item.name === 'Hyper Potion') healAmount = 200;
    if (item.name === 'Max Potion') healAmount = 9999;
    
    const playerStatsResult = getPokemonStats(battleState.playerPokemon);
    const playerStats = playerStatsResult?.stats || battleState.playerPokemon.stats || { hp: 100, maxHp: 100, atk: 50, def: 50, spAtk: 50, spDef: 50, spd: 50 };
    const maxHp = playerStats.maxHp || 100;
    const healedAmount = Math.min(healAmount, maxHp - battleState.playerHP);
    const newHP = Math.min(battleState.playerHP + healAmount, maxHp);

    // Determine item type for log message
    if (item.type === 'Potion' || item.name.toLowerCase().includes('potion')) {
      itemEffect = `Restored ${healedAmount} HP`;
    } else if (!itemEffect) {
      itemEffect = item.effects || 'Used item';
    }

    const newBattleState = {
      ...battleState,
      playerHP: newHP,
      battleLog: [...battleState.battleLog, {
        turn: battleState.turnNumber,
        actor: 'Player',
        action: `Used ${item.name}`,
        result: itemEffect,
        synergyTriggered: false
      }],
      turnNumber: battleState.turnNumber + 1,
      currentTurn: 'player'
    };

    setBattleState(newBattleState);

    // Consume item (non-evolution items)
    try {
      if (isEvolutionItem) return;
      if (item.quantity > 1) {
        await base44.entities.Item.update(item.id, { quantity: item.quantity - 1 });
      } else {
        await base44.entities.Item.delete(item.id);
      }
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      // Track item usage
      setItemsUsed(prev => [...prev, item.name]);
    } catch (err) {
      console.error('Failed to consume item:', err);
    }
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
        
        // Show battle summary after move learning
        if (battleState.rewards) {
          setBattleSummary({
            result: 'victory',
            enemyName: battleState.enemyPokemon.species,
            xpResults: battleState.rewards.xpResults,
            itemsUsed: itemsUsed,
            materialsDropped: battleState.rewards.materialsDropped
          });
        }
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
      
      // Show battle summary after canceling move learning
      if (battleState.rewards) {
        setBattleSummary({
          result: 'victory',
          enemyName: battleState.enemyPokemon.species,
          xpResults: battleState.rewards.xpResults,
          itemsUsed: itemsUsed,
          materialsDropped: battleState.rewards.materialsDropped
        });
      }
    } catch (err) {
      console.error('Failed to update Pokémon:', err);
    }
    setMoveLearnState(null);
  };

  // Handle evolution
  const handleEvolution = async () => {
    if (!evolutionState) return;

    try {
      const { pokemon, evolvesInto, pendingUpdate, itemUsed } = evolutionState;
      
      // Use centralized evolution function
      const evolvedPokemon = evolvePokemon(pokemon, evolvesInto);
      
      // Recalculate stats properly with new base stats
      const baseStats = getBaseStats(evolvesInto);
      const calculatedStats = calculateAllStats(
        { level: pendingUpdate.level, nature: pokemon.nature, ivs: pokemon.ivs, evs: pendingUpdate.evs },
        baseStats
      );

      const currentMoves = pokemon.abilities || [];
      const unlockedTalents = pokemon.unlockedTalents || [];
      const isButterfreeEvolution = evolvesInto === 'Butterfree';
      const updatedMoves = isButterfreeEvolution && !currentMoves.includes('Gust')
        ? [...currentMoves, 'Gust']
        : currentMoves;
      const currentHp = pokemon.currentHp ?? pokemon.stats?.hp;
      
      // Update Pokemon with evolution (preserves talents + adds canLearnNewTalents flag)
      await base44.entities.Pokemon.update(pendingUpdate.id, {
        species: evolvesInto,
        experience: pendingUpdate.experience,
        level: pendingUpdate.level,
        evs: pendingUpdate.evs,
        stats: calculatedStats,
        currentHp: Math.min(currentHp ?? calculatedStats.hp, calculatedStats.hp),
        roles: evolvedPokemon.roles,
        talents: evolvedPokemon.talents, // Preserved from pre-evolution
        canLearnNewTalents: true, // Future NPC teaching system
        unlockedTalents,
        abilities: updatedMoves
      });
      
      queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });

      if (itemUsed) {
        if (itemUsed.quantity > 1) {
          await base44.entities.Item.update(itemUsed.id, { quantity: itemUsed.quantity - 1 });
        } else {
          await base44.entities.Item.delete(itemUsed.id);
        }
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        setItemsUsed(prev => [...prev, itemUsed.name]);
      }
      
      // Check for moves the evolved form learns at current level
      const movesUpToLevel = getAllMovesUpToLevel(evolvesInto, pendingUpdate.level);
      const learnableMoves = movesUpToLevel.filter(move => !updatedMoves.includes(move));
      
      // Combine with level-up moves if any
      const allNewMoves = [...new Set([...(pendingUpdate.movesLearned || []), ...learnableMoves])];
      
      if (allNewMoves.length > 0) {
        setMoveLearnState({
          pokemon: { ...pokemon, species: evolvesInto, abilities: updatedMoves },
          newMoves: allNewMoves,
          currentMoves: updatedMoves,
          pendingUpdate: {
            id: pendingUpdate.id,
            experience: pendingUpdate.experience,
            level: pendingUpdate.level,
            evs: pendingUpdate.evs
          }
        });
      } else {
        // No moves to learn, show battle summary
        if (battleState.rewards) {
          setBattleSummary({
            result: 'victory',
            enemyName: battleState.enemyPokemon.species,
            xpResults: battleState.rewards.xpResults,
            itemsUsed: itemsUsed,
            materialsDropped: battleState.rewards.materialsDropped
          });
        }
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
      } else {
        // No moves to learn, show battle summary
        if (battleState.rewards) {
          setBattleSummary({
            result: 'victory',
            enemyName: battleState.enemyPokemon.species,
            xpResults: battleState.rewards.xpResults,
            itemsUsed: itemsUsed,
            materialsDropped: battleState.rewards.materialsDropped
          });
        }
      }
    } catch (err) {
      console.error('Failed to update Pokémon:', err);
    }
    setEvolutionState(null);
  };

  // Compute latest talent triggers (must be called before any conditional returns)
  const latestTalentTriggers = useMemo(() => {
    if (!battleState?.battleLog?.length) {
      return { player: null, enemy: null };
    }

    const findLatestFor = (pokemon) => {
      if (!pokemon) return null;
      const displayNames = [pokemon.nickname, pokemon.species].filter(Boolean);

      for (let idx = battleState.battleLog.length - 1; idx >= 0; idx -= 1) {
        const entry = battleState.battleLog[idx];
        if (!entry?.talentTriggered) continue;
        if (!displayNames.includes(entry.actor)) continue;

        return {
          turn: entry.turn,
          action: entry.action,
          result: entry.result
        };
      }

      return null;
    };

    return {
      player: findLatestFor(battleState?.playerPokemon),
      enemy: findLatestFor(battleState?.enemyPokemon)
    };
  }, [battleState]);

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


  const latestTalentTriggers = useMemo(() => {
    if (!battleState?.battleLog?.length) {
      return { player: null, enemy: null };
    }

    const findLatestFor = (pokemon) => {
      if (!pokemon) return null;
      const displayNames = [pokemon.nickname, pokemon.species].filter(Boolean);

      for (let idx = battleState.battleLog.length - 1; idx >= 0; idx -= 1) {
        const entry = battleState.battleLog[idx];
        if (!entry?.talentTriggered) continue;
        if (!displayNames.includes(entry.actor)) continue;

        return {
          turn: entry.turn,
          action: entry.action,
          result: entry.result
        };
      }

      return null;
    };

    return {
      player: findLatestFor(battleState.playerPokemon),
      enemy: findLatestFor(battleState.enemyPokemon)
    };
  }, [battleState]);

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
          <BattlefieldStatus battlefield={battleState.battlefield} />
          {/* Enemy Pokemon */}
          <BattleHUD
            pokemon={battleState.enemyPokemon}
            hp={battleState.enemyHP}
            maxHp={(() => {
              const result = getPokemonStats(battleState.enemyPokemon);
              return result?.stats?.maxHp || battleState.enemyPokemon?.stats?.maxHp || 100;
            })()}
            status={battleState.enemyStatus}
            roles={battleState.enemyPokemon.roles || []}
            activeTalentIndicator={latestTalentTriggers.enemy}
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
            maxHp={(() => {
              const result = getPokemonStats(battleState.playerPokemon);
              return result?.stats?.maxHp || battleState.playerPokemon?.stats?.maxHp || 100;
            })()}
            status={battleState.playerStatus}
            roles={battleState.playerPokemon.roles || []}
            isPlayer
            activeTalentIndicator={latestTalentTriggers.player}
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

                  // Generate random nature and IVs
                  const NATURES = [
                    "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
                    "Bold", "Docile", "Relaxed", "Impish", "Lax",
                    "Timid", "Hasty", "Serious", "Jolly", "Naive",
                    "Modest", "Mild", "Quiet", "Bashful", "Rash",
                    "Calm", "Gentle", "Sassy", "Careful", "Quirky"
                  ];

                  const randomNature = NATURES[Math.floor(Math.random() * NATURES.length)];
                  const randomIVs = {
                    hp: Math.floor(Math.random() * 31) + 1,
                    atk: Math.floor(Math.random() * 31) + 1,
                    def: Math.floor(Math.random() * 31) + 1,
                    spAtk: Math.floor(Math.random() * 31) + 1,
                    spDef: Math.floor(Math.random() * 31) + 1,
                    spd: Math.floor(Math.random() * 31) + 1
                  };

                  // Update the captured Pokémon with correct placement, nickname, nature, and IVs
                  await base44.entities.Pokemon.update(wildPokemonId, {
                    isInTeam: captureModalState.addedToParty,
                    isWildInstance: false,
                    nickname: nickname || undefined,
                    nature: randomNature,
                    ivs: randomIVs
                  });

                  // If added to party, update player's partyOrder
                  if (captureModalState.addedToParty && player) {
                    const updatedPartyOrder = [...(player.partyOrder || []), wildPokemonId];
                    await base44.entities.Player.update(player.id, {
                      partyOrder: updatedPartyOrder
                    });
                    queryClient.invalidateQueries({ queryKey: ['player'] });
                  }

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

                  // Navigate back after successful capture
                  if (returnTo) {
                    navigate(`/${returnTo}`);
                  }
                } catch (err) {
                  console.error('Failed to update captured Pokémon:', err);
                  setCaptureModalState(null);
                }
              }}
            />
          )}

          {/* Battle Summary Modal */}
          {battleSummary && !moveLearnState && !evolutionState && !captureModalState && (
            <BattleSummaryModal
              summary={battleSummary}
              onClose={async () => {
                // Clean up wild Pokémon if defeated (not captured)
                if (wildPokemonId && battleState?.isWildBattle && battleState.status === 'won') {
                  try {
                    await base44.entities.Pokemon.delete(wildPokemonId);
                    queryClient.invalidateQueries({ queryKey: ['wildPokemon'] });
                    queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
                  } catch (err) {
                    console.error('Failed to delete defeated wild Pokémon:', err);
                  }
                }

                setBattleSummary(null);
                if (returnTo && battleState?.isWildBattle) {
                  navigate(`/${returnTo}`);
                } else {
                  setBattleState(null);
                  setWildPokemonId(null);
                  setReturnTo(null);
                  setItemsUsed([]);
                }
              }}
            />
          )}

          {/* Battle Results Modal */}
          {isBattleEnded && !moveLearnState && !evolutionState && !captureModalState && !battleSummary && (
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
                 // Clean up wild Pokémon only if NOT captured
                 if (wildPokemonId && battleState.isWildBattle && battleState.status !== 'captured') {
                   try {
                     await base44.entities.Pokemon.delete(wildPokemonId);
                     queryClient.invalidateQueries({ queryKey: ['wildPokemon'] });
                     queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
                   } catch (err) {
                     console.error('Failed to delete wild Pokémon:', err);
                   }
                 }

               // Return to exploration if this was a wild battle
               if (returnTo && battleState.isWildBattle) {
                 navigate(`/${returnTo}`);
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
                    disabled={!isPlayerTurn || (battleItems.length === 0 && pokeballs.length === 0) || isBattleEnded}
                    className="h-20 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <Package className="w-6 h-6 mr-2" />
                    Items
                  </Button>

                  {battleState.isWildBattle && (
                    <Button
                      onClick={() => setActionMenu('pokeballs')}
                      disabled={!isPlayerTurn || totalPokeballCount <= 0}
                      className="h-20 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    >
                      <Trophy className="w-6 h-6 mr-2" />
                      Capture
                      <Badge className="ml-2 bg-white/20">{totalPokeballCount}</Badge>
                    </Button>
                  )}

                  <Button
                    onClick={() => setActionMenu('switch')}
                    disabled={!isPlayerTurn || playerPokemon.length <= 1 || isBattleEnded}
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
                       const moveData = getMoveData(moveName, battleState.playerPokemon);
                       return (
                         <MoveCard
                           key={idx}
                           move={moveData}
                           pokemon={battleState.playerPokemon}
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
                    <h3 className="text-sm font-semibold text-white">Items</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActionMenu('main')}
                    >
                      Back
                    </Button>
                  </div>

                  {/* Item Categories */}
                  <div className="space-y-4">
                    {/* Pokéballs */}
                    {pokeballs.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-indigo-400 mb-2 flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Pokéballs
                        </h4>
                        <div className="space-y-2">
                          {pokeballs.map((ball) => (
                            <Button
                              key={ball.id}
                              onClick={async () => {
                                await attemptCapture(ball);
                                setActionMenu('main');
                              }}
                              disabled={!isPlayerTurn || capturingPokemon || !battleState.isWildBattle}
                              variant="outline"
                              className="w-full justify-between hover:bg-purple-500/10"
                            >
                              <span className="flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                {ball.name}
                              </span>
                              <Badge className="bg-purple-700">×{ball.quantity || 1}</Badge>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Potions & Battle Items */}
                    {battleItems.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Battle Items
                        </h4>
                        <div className="space-y-2">
                          {battleItems.map((item) => (
                            <Button
                              key={item.id}
                              onClick={() => {
                                useItem(item);
                                setActionMenu('main');
                              }}
                              disabled={!isPlayerTurn}
                              variant="outline"
                              className="w-full justify-between hover:bg-cyan-500/10"
                            >
                              <span>{item.name}</span>
                              <Badge className="bg-cyan-700">×{item.quantity || 1}</Badge>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {pokeballs.length === 0 && battleItems.length === 0 && (
                      <div className="text-center text-slate-400 py-4">
                        No items available
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
                      .map((pokemon) => {
                        const isFainted = faintedIds.includes(pokemon.id);

                        return (
                          <Button
                            key={pokemon.id}
                            onClick={() => switchPokemon(pokemon)}
                            disabled={!isPlayerTurn || isFainted}
                            variant="outline"
                            className="w-full justify-between"
                          >
                            <span className={isFainted ? 'text-slate-500' : ''}>
                              {pokemon.nickname || pokemon.species}
                              {isFainted && ' (Fainted)'}
                            </span>
                            <Badge className="bg-slate-700">Lv. {pokemon.level}</Badge>
                          </Button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Pokéball Selection Menu */}
              {actionMenu === 'pokeballs' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-purple-400" />
                      Select Pokéball
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActionMenu('main')}
                    >
                      Back
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {pokeballs.map((ball) => (
                      <Button
                        key={ball.id}
                        onClick={async () => {
                          await attemptCapture(ball);
                          setActionMenu('main');
                        }}
                        disabled={!isPlayerTurn || capturingPokemon}
                        variant="outline"
                        className="w-full justify-between hover:bg-purple-500/10"
                      >
                        <span className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          {ball.name}
                        </span>
                        <Badge className="bg-purple-700">×{ball.quantity || 1}</Badge>
                      </Button>
                    ))}
                    {pokeballs.length === 0 && (
                      <div className="text-center text-slate-400 py-4">
                        No Pokéballs available
                      </div>
                    )}
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