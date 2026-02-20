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
import ActionQueuePanel from '@/components/battle/multi/ActionQueuePanel';
import {
  createBattleState,
  syncLegacyFields,
  isSideDefeated,
  removeFainted,
  sendNextFromBench,
  sortActionQueue,
  switchIn,
} from '@/components/battle/battleStateModel';
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
import CatchStreakBadge from '@/components/battle/CatchStreakBadge';
import TrainerIntroModal from '@/components/battle/TrainerIntroModal';
import { rollTrainerRewards } from '@/components/data/TrainerRegistry';

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
  const [encounterPokemonIds, setEncounterPokemonIds] = useState([]);
  const [trainerRoster, setTrainerRoster] = useState([]);
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
  const [locationHazardEscapePenalty, setLocationHazardEscapePenalty] = useState(0);
  const [trainerData, setTrainerData] = useState(null);
  const [trainerIntro, setTrainerIntro] = useState(null); // { trainer, roster }
  const [battleReady, setBattleReady] = useState(false); // gated until intro dismissed
  const [introDismissed, setIntroDismissed] = useState(false); // prevent re-show
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerTutorial } = useTutorialTrigger();

  // Get battle state from React Router location
  useEffect(() => {
    const state = location.state;

    if (state?.wildPokemonId) {
      setWildPokemonId(state.wildPokemonId);
      setEncounterPokemonIds(state.encounterPokemonIds || [state.wildPokemonId]);
      const roster = Array.isArray(state.trainerRoster) ? state.trainerRoster : [];
      setTrainerRoster(roster);
      setFaintedIds([]);
      setReturnTo(state.returnTo || 'Zones');
      setLocationHazardEscapePenalty(state.locationHazardEscapePenalty || 0);
      triggerTutorial('first_battle');

      // Reset battle ref so a new encounter can start
      battleStartedRef.current = false;
      setIntroDismissed(false);

      // Track trainer data for reward payout
      if (state?.trainerData) {
        setTrainerData(state.trainerData);
      } else {
        setTrainerData(null);
      }

      // Show trainer intro modal for NPC trainer battles
      if (state.trainerData && roster.length > 0) {
        setTrainerIntro({ trainer: state.trainerData, roster });
        setBattleReady(false);
      } else {
        setBattleReady(true);
      }
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

  // Auto-start battle — wait for battleReady (trainer intro dismissed) and roster loaded
  const battleStartedRef = React.useRef(false);
  // Keep refs to the latest trainerRoster/trainerData so startWildBattle always sees them
  const trainerRosterRef = React.useRef([]);
  const trainerDataRef = React.useRef(null);
  useEffect(() => { trainerRosterRef.current = trainerRoster; }, [trainerRoster]);
  useEffect(() => { trainerDataRef.current = trainerData; }, [trainerData]);

  useEffect(() => {
    if (wildPokemon && playerPokemon.length > 0 && !battleState && !battleStartedRef.current && battleReady) {
      battleStartedRef.current = true;
      startWildBattle(wildPokemon);
    }
  }, [wildPokemon?.id, playerPokemon.length, battleReady]);

  // Start wild encounter battle
  const startWildBattle = (wildMon) => {
    if (playerPokemon.length === 0) return;

    // Always use first Pokémon in party as lead
    const playerMon = playerPokemon[0];
    const playerStatsResult = getPokemonStats(playerMon);
    const wildStatsResult = getPokemonStats(wildMon);
    
    const playerStats = playerStatsResult?.stats || playerMon?.stats || { hp: 100, maxHp: 100, atk: 50, def: 50, spAtk: 50, spDef: 50, spd: 50 };
    const wildStats = wildStatsResult?.stats || wildMon?.stats || { hp: 100, maxHp: 100, atk: 50, def: 50, spAtk: 50, spDef: 50, spd: 50 };
    
    const enemyParty = trainerRosterRef.current.length > 0 ? trainerRosterRef.current : [wildMon];
    const initialEnemyTeam = enemyParty;

    // 3v3 trainer battle path
          if (trainerRosterRef.current.length > 0 && trainerDataRef.current) {
          const multiState = createBattleState({
            playerParty: playerPokemon,
            enemyParty,
            activeSlots: 3,
            isWildBattle: false,
            openingLog: `${trainerDataRef.current?.name || 'Trainer'} challenges you to a 3v3 battle!`
          });

      // Keep legacy pointers pointing to first active slot objects
      const pMap = {};
      const all = [...playerPokemon, ...enemyParty];
      for (const mon of all) {
        if (!mon?.id) continue;
        const ws = getPokemonStats(mon);
        pMap[mon.id] = {
          ...ws,
          abilities: ws.abilities || mon.abilities || ['Tackle'],
          movePP: ws.movePP || mon.movePP || {},
          statStages: ws.statStages || createDefaultStatStages(),
        };
      }
      multiState.playerPokemon = pMap[multiState.playerActive[0]] || playerPokemon[0];
      multiState.enemyPokemon  = pMap[multiState.enemyActive[0]]  || enemyParty[0];
      multiState.enemyTeam = enemyParty;
      multiState.isTrainerBattle = true;
      syncLegacyFields(multiState);

      setBattleState(multiState);
      setActionMenu('main');
      return;
    }

    // Use persisted HP if available, otherwise use max HP
    const startingPlayerHP = (playerMon.currentHp !== undefined && playerMon.currentHp !== null && playerMon.currentHp > 0)
      ? playerMon.currentHp
      : playerStats.maxHp;

    setBattleState({
      playerPokemon: { ...playerMon, movePP: playerMon.movePP || {} },
      enemyPokemon: wildMon,
      enemyTeam: initialEnemyTeam,
      playerHP: startingPlayerHP,
      enemyHP: wildStats.maxHp,
      turnNumber: 1,
      currentTurn: 'player',
      battleLog: [
        { turn: 1, actor: 'System', action: wildMon.isTrainerNPC ? `${wildMon.trainerName || 'Trainer'} challenged you with ${wildMon.species}!` : `A wild ${wildMon.species} appeared!`, result: '', synergyTriggered: false }
      ],
      playerStatus: { conditions: [], buffs: [] },
      enemyStatus: { conditions: [], buffs: [] },
      battlefield: createDefaultBattlefield(),
      synergyChains: 0,
      isWildBattle: !wildMon.isTrainerNPC,
      movePP: playerMon.movePP || {}
    });
  };

  const getNextTrainerPokemon = (state) => {
    if (!state?.enemyPokemon?.isTrainerNPC) return null;
    const team = Array.isArray(state.enemyTeam) && state.enemyTeam.length > 0
      ? state.enemyTeam
      : trainerRoster;

    if (!Array.isArray(team) || team.length === 0) return null;

    const faintedEnemyIds = new Set(state.faintedEnemyIds || []);
    const activeEnemyId = state.enemyPokemon?.id;
    if (activeEnemyId) {
      faintedEnemyIds.add(activeEnemyId);
    }

    return team.find((pokemon) => !faintedEnemyIds.has(pokemon.id)) || null;
  };

  const upsertRewardItem = async (name, qty = 1, meta = {}) => {
    if (!name || qty <= 0) return;
    const existing = await base44.entities.Item.filter({ name });
    if (existing?.length) {
      const it = existing[0];
      await base44.entities.Item.update(it.id, { quantity: (it.quantity || 1) + qty });
    } else {
      await base44.entities.Item.create({
        name,
        quantity: qty,
        stackable: true,
        type: meta.type || 'Material',
        rarity: meta.rarity || 'Common',
        description: meta.description || 'Reward item.',
        sellValue: meta.sellValue || 10
      });
    }
  };

  const cleanupEncounterPokemon = async (excludeIds = []) => {
    const idsToDelete = (encounterPokemonIds || []).filter((id) => id && !excludeIds.includes(id));
    if (idsToDelete.length === 0) return;

    await Promise.all(idsToDelete.map(async (id) => {
      try {
        await base44.entities.Pokemon.delete(id);
      } catch (err) {
        console.error('Failed to delete encounter Pokémon:', err);
      }
    }));

    queryClient.invalidateQueries({ queryKey: ['wildPokemon'] });
    queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
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
      setActionMenu('main'); // Reset action menu
      
      // Check if party has room
      const addedToParty = playerPokemon.length < 6;
      
      setCaptureModalState({
        pokemon: battleState.enemyPokemon,
        addedToParty
      });
    } else {
      // Capture failed, enemy gets free turn
      const engine = new BattleEngine(battleState.playerPokemon, battleState.enemyPokemon);
      const fallbackEnemyMoves = getEnemyBattleMoves(battleState.enemyPokemon);
      const enemyMove = engine.chooseEnemyMove(fallbackEnemyMoves, battleState.playerPokemon, battleState) || fallbackEnemyMoves[0] || getMoveData('Tackle', battleState.enemyPokemon);

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
      setActionMenu('main'); // Reset action menu on failed capture
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
      setActionMenu('main'); // Reset action menu on error
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

    // Deduct PP for the used move
    const moveName = move?.name;
    const currentPP = battleState.playerPokemon.movePP || {};
    const maxPP = move?.pp || 10;
    const currentMovePP = currentPP[moveName] !== undefined ? currentPP[moveName] : maxPP;
    if (currentMovePP <= 0) return; // No PP left
    const newPP = { ...currentPP, [moveName]: Math.max(0, currentMovePP - 1) };
    const updatedPlayerPokemon = { ...battleState.playerPokemon, movePP: newPP };
    setBattleState(prev => ({ ...prev, playerPokemon: updatedPlayerPokemon }));

    // Initialize battle engine
    const engine = new BattleEngine(updatedPlayerPokemon, battleState.enemyPokemon);

    // Enemy uses smart AI to choose best move from its own learned moves
    const enemyAvailableMoves = getEnemyBattleMoves(battleState.enemyPokemon);
    const enemyMove = engine.chooseEnemyMove(enemyAvailableMoves, battleState.playerPokemon, battleState) || enemyAvailableMoves[0];

    // Create a copy of battle state for engine to modify (use updated PP pokemon)
    const stateCopy = { ...battleState, playerPokemon: updatedPlayerPokemon };

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
      const defeatedEnemy = newBattleState.enemyPokemon;
      const updatedFaintedEnemyIds = Array.from(new Set([...(newBattleState.faintedEnemyIds || []), defeatedEnemy.id]));
      newBattleState.faintedEnemyIds = updatedFaintedEnemyIds;

      const nextTrainerPokemon = getNextTrainerPokemon({
        ...newBattleState,
        faintedEnemyIds: updatedFaintedEnemyIds
      });

      if (nextTrainerPokemon) {
        const nextStatsResult = getPokemonStats(nextTrainerPokemon);
        const nextStats = nextStatsResult?.stats || nextTrainerPokemon.stats || { maxHp: 100 };
        const nextMaxHp = nextStats.maxHp || 100;

        newBattleState.enemyPokemon = nextTrainerPokemon;
        newBattleState.enemyHP = nextTrainerPokemon.currentHp ?? nextMaxHp;
        newBattleState.currentTurn = 'player';
        newBattleState.battleLog.push({
          turn: newBattleState.turnNumber,
          actor: 'System',
          action: defeatedEnemy.trainerName || 'Trainer',
          result: `${nextTrainerPokemon.nickname || nextTrainerPokemon.species} was sent out!`,
          synergyTriggered: false
        });

        setBattleState(newBattleState);
        return;
      }

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
        ? calculateWildXP(speciesData, newBattleState.enemyPokemon.level, Boolean(newBattleState.enemyPokemon.isTrainerNPC))
        : Math.floor(newBattleState.enemyPokemon.level * (newBattleState.enemyPokemon.isTrainerNPC ? 36 : 25));
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
          newLevel: newLevel,
          level: newLevel,
          expAfter: totalXP
        });
      }

      // Save post-battle HP for active pokemon
      const postBattleHP = newBattleState.playerHP;

      // Clean movePP: remove undefined values and ensure it's serializable
      const rawMovePP = newBattleState.playerPokemon.movePP || {};
      const cleanMovePP = Object.fromEntries(
        Object.entries(rawMovePP).filter(([, v]) => v !== undefined && v !== null)
      );

      // Update all Pokemon with XP and persist HP/PP for active pokemon
      if (pokemonToUpdate.length > 0) {
        await Promise.all(pokemonToUpdate.filter(p => p.id).map(p => {
          const isActive = p.id === newBattleState.playerPokemon?.id;
          return base44.entities.Pokemon.update(p.id, {
            experience: p.experience,
            level: p.level,
            ...(isActive ? {
              currentHp: postBattleHP,
              movePP: cleanMovePP
            } : {})
          });
        }));
      } else {
        // No XP updates, but still persist HP/PP for active pokemon if it has a valid id
        const activeId = newBattleState.playerPokemon?.id;
        if (activeId) {
          await base44.entities.Pokemon.update(activeId, {
            currentHp: postBattleHP,
            movePP: cleanMovePP
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['playerPokemon'] });

      // Handle active Pokemon's level up mechanics (moves, evolution, EVs)
      let movesLearned = [];
      const activePokemonUpdate = pokemonToUpdate.find(p => p.id === newBattleState.playerPokemon.id);
      if (activePokemonUpdate && activePokemonUpdate.level > newBattleState.playerPokemon.level) {
        const levelsGained = [];
        for (let lvl = newBattleState.playerPokemon.level + 1; lvl <= activePokemonUpdate.level; lvl++) {
          levelsGained.push(lvl);
        }

        const existingMoves = newBattleState.playerPokemon.abilities || [];
        levelsGained.forEach(level => {
          const newAtLevel = getMovesLearnedAtLevel(newBattleState.playerPokemon.species, level, [...existingMoves, ...movesLearned]);
          if (newAtLevel.length > 0) {
            movesLearned.push(...newAtLevel);
          }
        });
      }

      // Apply EV gains (only to active Pokemon)
      const currentEVs = newBattleState.playerPokemon.evs || { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 };
      const evResult = applyEVGains(currentEVs, newBattleState.enemyPokemon.species);
      
      // Generate material drops for wild battles (species-specific)
      const materialsDropped = [];
      let goldGained = 0;
      let trainerItems = [];

      if (newBattleState.isWildBattle) {
        // Wild Pokémon drop items using species data
        const speciesData = wildPokemonData[newBattleState.enemyPokemon.species];
        if (speciesData) {
          const droppedItems = rollItemDrops(speciesData);
          materialsDropped.push(...droppedItems);
        }
        if (materialsDropped.length === 0) {
          if (Math.random() < 0.5) materialsDropped.push('Monster Essence');
        }
        goldGained = Math.floor(newBattleState.enemyPokemon.level * 15);

      } else if (newBattleState.enemyPokemon?.isTrainerNPC) {
        // NPC trainer rewards — roll once, reuse for summary
        const payout = rollTrainerRewards(trainerData);
        goldGained = payout.gold || 0;
        trainerItems = payout.items || [];

        if (player?.id) {
          await base44.entities.Player.update(player.id, {
            gold: (player.gold || 0) + goldGained
          });
          queryClient.invalidateQueries({ queryKey: ['player'] });
        }

        for (const itemName of trainerItems) {
          await upsertRewardItem(itemName, 1, {
            type: 'Material',
            rarity: trainerData?.isBoss ? 'Rare' : trainerData?.isNamed ? 'Uncommon' : 'Common',
            description: `Taken from ${trainerData?.name || 'a trainer'}`
          });
        }
        if (trainerItems.length > 0) {
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
          queryClient.invalidateQueries({ queryKey: ['items'] });
        }

      } else {
        // Practice battle fallback
        goldGained = Math.floor(newBattleState.enemyPokemon.level * 22);
        if (player?.id) {
          await base44.entities.Player.update(player.id, {
            gold: (player.gold || 0) + goldGained
          });
          queryClient.invalidateQueries({ queryKey: ['player'] });
        }
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
          materialsDropped: materialsDropped,
          goldGained,
          trainerItems
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
      // Mark active Pokemon as fainted and persist HP=0 and PP
      const faintedId = newBattleState.playerPokemon?.id;
      if (faintedId) {
        setFaintedIds(prev => [...prev, faintedId]);
        const rawFaintPP = newBattleState.playerPokemon.movePP || {};
        const cleanFaintPP = Object.fromEntries(
          Object.entries(rawFaintPP).filter(([, v]) => v !== undefined && v !== null)
        );
        base44.entities.Pokemon.update(faintedId, {
          currentHp: 0,
          movePP: cleanFaintPP
        }).catch(err => console.error('Failed to persist faint state:', err));
      }
    } else {
      newBattleState.currentTurn = 'player';
    }

    setBattleState(newBattleState);
  };

  // Flee from battle
  const fleeBattle = async () => {
    if (!battleState || !battleState.isWildBattle) return;

    await cleanupEncounterPokemon();

    // Navigate back to zone using React Router (wild flee always succeeds)
    if (returnTo) {
      navigate(`/${returnTo}`);
    } else {
      setBattleState(null);
      setWildPokemonId(null);
      setEncounterPokemonIds([]);
      setTrainerRoster([]);
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
      enemyTeam: battleState.enemyTeam || [battleState.enemyPokemon],
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

  const getAlive = (ids, hpMap) => (ids || []).filter(id => (hpMap[id] ?? 0) > 0);

  const pickBestEnemyBenchCounter = (state, enemyBenchAlive, playerAlive) => {
    if (!enemyBenchAlive.length) return null;
    const hpMap = state.hpMap || {};
    const engine = new BattleEngine(
      pokemonMap[state.playerActive?.[0]] || state.playerPokemon,
      pokemonMap[state.enemyActive?.[0]] || state.enemyPokemon,
      pokemonMap
    );

    const scoreCandidate = (candId) => {
      const cand = pokemonMap[candId];
      if (!cand) return -Infinity;
      const candTypes = cand.types || [cand.type1, cand.type2].filter(Boolean);
      const candMoves = (cand.abilities || []).map(name => getMoveData(name, cand)).filter(Boolean);

      let off = 0;
      for (const mv of candMoves) {
        if (!(mv.power > 0)) continue;
        const isSTAB = candTypes.includes(mv.type || 'Normal');
        if (!isSTAB) continue;
        for (const pid of playerAlive) {
          const p = pokemonMap[pid];
          const pTypes = p?.types || [p?.type1, p?.type2].filter(Boolean);
          const eff = engine.getTypeEffectiveness ? engine.getTypeEffectiveness(mv.type || 'Normal', pTypes) : 1;
          off = Math.max(off, eff);
        }
      }

      let incoming = 0;
      for (const pid of playerAlive) {
        const p = pokemonMap[pid];
        if (!p) continue;
        const pTypes = p.types || [p.type1, p.type2].filter(Boolean);
        let bestIn = 1.0;
        for (const t of pTypes) {
          const eff = engine.getTypeEffectiveness ? engine.getTypeEffectiveness(t, candTypes) : 1;
          bestIn = Math.max(bestIn, eff);
        }
        incoming += bestIn;
      }
      incoming = incoming / Math.max(1, playerAlive.length);
      return (off * 2.0) - (incoming * 1.25);
    };

    let bestId = enemyBenchAlive[0];
    let bestScore = -Infinity;
    for (const candId of enemyBenchAlive) {
      const s = scoreCandidate(candId);
      if (s > bestScore) { bestScore = s; bestId = candId; }
    }
    return bestId;
  };

  const buildEnemyActionsSmart = (state, overrideEnemyActive = null) => {
    const enemyActs = [];
    const hpMap = state.hpMap || {};
    const enemyActive = overrideEnemyActive || state.enemyActive || [];
    const playerActive = state.playerActive || [];

    const alivePlayers = playerActive.filter(id => (hpMap[id] ?? 0) > 0);
    if (alivePlayers.length === 0) return enemyActs;

    const engine = new BattleEngine(
      pokemonMap[state.playerActive?.[0]] || state.playerPokemon,
      pokemonMap[state.enemyActive?.[0]] || state.enemyPokemon,
      pokemonMap
    );

    const scoreMoveVsTarget = (attMon, moveData, targetMonId) => {
      const tgt = pokemonMap[targetMonId];
      if (!tgt) return -Infinity;
      const moveType = moveData?.type || 'Normal';
      const defenderTypes = tgt.types || (tgt.type1 ? [tgt.type1, tgt.type2].filter(Boolean) : []);
      const eff = engine.getTypeEffectiveness ? engine.getTypeEffectiveness(moveType, defenderTypes) : 1;
      const power = typeof moveData?.power === 'number' ? moveData.power : 0;
      const base = power > 0 ? power : 10;
      const stab = (attMon.types || [tgt.type1, tgt.type2].filter(Boolean)).includes(moveType) ? 1.2 : 1.0;
      return base * eff * stab;
    };

    for (const enemyId of enemyActive) {
      const mon = pokemonMap[enemyId];
      if (!mon) continue;
      if ((hpMap[enemyId] ?? 0) <= 0) continue;

      const moves = (mon.abilities || []).map(name => {
        const md = getMoveData(name, mon);
        if (!md) return null;
        const maxPP = md.pp || 10;
        const curPP = mon.movePP?.[name] !== undefined ? mon.movePP[name] : maxPP;
        if (curPP <= 0) return null;
        return { name, data: md };
      }).filter(Boolean);

      if (moves.length === 0) {
        const fallback = getMoveData('Tackle', mon) || { name: 'Tackle', type: 'Normal', power: 40, target: 'single-opponent' };
        enemyActs.push({ type: 'move', pokemonId: enemyId, side: 'enemy', payload: fallback, defenderIds: [alivePlayers[0]] });
        continue;
      }

      let best = null;
      for (const mv of moves) {
        const md = mv.data;
        const targetClass = md?.target || 'single-opponent';

        if (targetClass === 'all-opponents') {
          const scores = alivePlayers.map(pid => scoreMoveVsTarget(mon, md, pid));
          const avgScore = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length);
          if (!best || avgScore > best.score) {
            best = { moveData: md, defenderIds: [...alivePlayers], score: avgScore };
          }
        } else if (targetClass === 'self') {
          const selfScore = 15;
          if (!best || selfScore > best.score) {
            best = { moveData: md, defenderIds: [enemyId], score: selfScore };
          }
        } else {
          let bestTarget = alivePlayers[0];
          let bestScore = -Infinity;
          for (const pid of alivePlayers) {
            const s = scoreMoveVsTarget(mon, md, pid);
            if (s > bestScore || (s === bestScore && (hpMap[pid] ?? 0) < (hpMap[bestTarget] ?? 0))) {
              bestScore = s;
              bestTarget = pid;
            }
          }
          if (!best || bestScore > best.score || (bestScore === best.score && (hpMap[bestTarget] ?? 0) < (hpMap[best.defenderIds?.[0]] ?? 0))) {
            best = { moveData: md, defenderIds: [bestTarget], score: bestScore };
          }
        }
      }

      enemyActs.push({
        type: 'move',
        pokemonId: enemyId,
        side: 'enemy',
        payload: best?.moveData || moves[0].data,
        defenderIds: best?.defenderIds?.length ? best.defenderIds : [alivePlayers[0]]
      });
    }
    return enemyActs;
  };

  const buildEnemyActionsSmartWithSwitch = (state) => {
    const hpMap = state.hpMap || {};
    const enemyActive = state.enemyActive || [];
    const playerAlive = getAlive(state.playerActive, hpMap);
    const enemyBenchAlive = getAlive(state.enemyBench, hpMap);

    if (playerAlive.length === 0) return [];

    const engine = new BattleEngine(
      pokemonMap[state.playerActive?.[0]] || state.playerPokemon,
      pokemonMap[state.enemyActive?.[0]] || state.enemyPokemon,
      pokemonMap
    );

    const switchedOut = new Set(); // track which bench slots are already claimed this turn
    const acts = [];

    for (const enemyId of enemyActive) {
      const mon = pokemonMap[enemyId];
      if (!mon) continue;
      if ((hpMap[enemyId] ?? 0) <= 0) continue;

      const moves = (mon.abilities || []).map(name => {
        const md = getMoveData(name, mon);
        if (!md) return null;
        const maxPP = md.pp || 10;
        const curPP = mon.movePP?.[name] !== undefined ? mon.movePP[name] : maxPP;
        if (curPP <= 0) return null;
        return { name, data: md };
      }).filter(Boolean);

      if (moves.length === 0) {
        acts.push({ type: 'move', pokemonId: enemyId, side: 'enemy',
          payload: getMoveData('Tackle', mon) || { name: 'Tackle', type: 'Normal', power: 40 },
          defenderIds: [playerAlive[0]] });
        continue;
      }

      // Check if walled (max effectiveness of any damaging move < 1.0)
      let maxEff = 0;
      for (const mv of moves) {
        if (!(mv.data.power > 0)) continue;
        for (const pid of playerAlive) {
          const tgt = pokemonMap[pid];
          const tgtTypes = tgt?.types || [tgt?.type1, tgt?.type2].filter(Boolean);
          const eff = engine.getTypeEffectiveness ? engine.getTypeEffectiveness(mv.data.type || 'Normal', tgtTypes) : 1;
          maxEff = Math.max(maxEff, eff);
        }
      }

      const availableBench = enemyBenchAlive.filter(id => !switchedOut.has(id));
      if (maxEff > 0 && maxEff < 1.0 && availableBench.length > 0) {
        const bestBench = pickBestEnemyBenchCounter(state, availableBench, playerAlive);
        if (bestBench) {
          switchedOut.add(bestBench);
          acts.push({ type: 'switch', pokemonId: enemyId, side: 'enemy', payload: { outId: enemyId, inId: bestBench } });
          continue;
        }
      }

      // Fall back to smart move selection for this single slot
      const slotActs = buildEnemyActionsSmart(state, [enemyId]);
      const my = slotActs.find(a => a.pokemonId === enemyId);
      if (my) acts.push(my);
      else acts.push({ type: 'move', pokemonId: enemyId, side: 'enemy', payload: moves[0].data, defenderIds: [playerAlive[0]] });
    }

    return acts;
  };

  const handleMultiFaintsAndRefill = (state, turnLog) => {
    const hpMap = state.hpMap || {};
    const log = (msg) => turnLog.push({
      turn: state.turnNumber, actor: 'System', action: msg, result: '', synergyTriggered: false
    });

    for (const id of [...(state.playerActive || [])]) {
      if ((hpMap[id] ?? 0) <= 0) {
        removeFainted(state, id, 'player');
        log(`${pokemonMap[id]?.nickname || pokemonMap[id]?.species || 'A Pokémon'} fainted!`);
      }
    }
    for (const id of [...(state.enemyActive || [])]) {
      if ((hpMap[id] ?? 0) <= 0) {
        removeFainted(state, id, 'enemy');
        log(`${pokemonMap[id]?.nickname || pokemonMap[id]?.species || 'An enemy Pokémon'} fainted!`);
      }
    }

    while ((state.playerActive || []).length < (state.activeSlots || 1)) {
      const nextId = (state.playerBench || []).find(pid => (hpMap[pid] ?? 0) > 0);
      if (!nextId) break;
      const sent = sendNextFromBench(state, 'player');
      if (!sent) break;
      if ((hpMap[sent] ?? 0) <= 0) continue;
      log(`${pokemonMap[sent]?.nickname || pokemonMap[sent]?.species || 'A Pokémon'} enters the fight!`);
    }

    while ((state.enemyActive || []).length < (state.activeSlots || 1)) {
      const nextId = (state.enemyBench || []).find(pid => (hpMap[pid] ?? 0) > 0);
      if (!nextId) break;
      const sent = sendNextFromBench(state, 'enemy');
      if (!sent) break;
      if ((hpMap[sent] ?? 0) <= 0) continue;
      log(`${pokemonMap[sent]?.nickname || pokemonMap[sent]?.species || 'Enemy'} enters the fight!`);
    }

    return state;
  };

  const runMultiTurn = (playerActions) => {
    setBattleState((prev) => {
      if (!prev) return prev;

      const enemyActions = buildEnemyActionsSmartWithSwitch(prev);
      const combined = [
        ...playerActions.map(a => ({ ...a, side: 'player' })),
        ...enemyActions
      ];
      const sorted = sortActionQueue(combined, pokemonMap, `turn:${prev.turnNumber || 1}`);

      const turnLog = [];

      // 1) Resolve switch actions first
      const remaining = [];
      for (const action of sorted) {
        if (action.type !== 'switch') { remaining.push(action); continue; }
        const { outId, inId } = action.payload || {};
        if (!outId || !inId) continue;
        switchIn(prev, action.side, outId, inId);
        const inMon = pokemonMap[inId];
        turnLog.push({
          turn: prev.turnNumber, actor: 'System', action: 'Switch',
          result: `${inMon?.nickname || inMon?.species || 'A Pokémon'} switched in!`,
          synergyTriggered: false
        });
      }

      // 2) Retarget / skip fainted actors before executing
      const hpMap = prev.hpMap || {};
      const isAlive = (id) => (hpMap[id] ?? 0) > 0;

      const retargetIfNeeded = (action) => {
        if (action.type !== 'move') return action;
        if (!isAlive(action.pokemonId)) return null; // attacker fainted

        const moveTarget = action.payload?.target || 'single-opponent';
        if (moveTarget === 'all-opponents') {
          const pool = action.side === 'player' ? prev.enemyActive : prev.playerActive;
          const alive = (pool || []).filter(isAlive);
          return alive.length ? { ...action, defenderIds: alive } : null;
        }

        const stillAlive = (action.defenderIds || []).filter(isAlive);
        if (stillAlive.length) return { ...action, defenderIds: stillAlive };

        const pool = action.side === 'player' ? prev.enemyActive : prev.playerActive;
        const fallback = (pool || []).find(isAlive);
        return fallback ? { ...action, defenderIds: [fallback] } : null;
      };

      const cleaned = remaining.map(retargetIfNeeded).filter(Boolean)
        .filter(a => a.type !== 'move' || (a.defenderIds?.length ?? 0) > 0);

      // 3) Execute remaining actions (moves/items)
      const engine = new BattleEngine(
        pokemonMap[prev.playerActive?.[0]] || prev.playerPokemon,
        pokemonMap[prev.enemyActive?.[0]]  || prev.enemyPokemon,
        pokemonMap
      );
      const engineLog = engine.executeTurnQueue(cleaned, prev, pokemonMap);

      // 3) Post-turn faint/refill + win/loss
      const after = handleMultiFaintsAndRefill(prev, engineLog);

      if (isSideDefeated(after, 'enemy')) after.status = 'won';
      if (isSideDefeated(after, 'player')) after.status = 'lost';

      after.turnNumber = (after.turnNumber || 1) + 1;
      after.battleLog = [...(after.battleLog || []), ...turnLog, ...engineLog];

      after.playerPokemon = pokemonMap[after.playerActive?.[0]] || after.playerPokemon;
      after.enemyPokemon  = pokemonMap[after.enemyActive?.[0]]  || after.enemyPokemon;
      syncLegacyFields(after);

      return { ...after };
    });
  };

  // isTrainer3v3: true only when trainerData + a real roster exist
  const isTrainer3v3 = useMemo(() => {
    const st = location.state;
    return Boolean(st?.trainerData) && Array.isArray(trainerRoster) && trainerRoster.length > 0;
  }, [location.state, trainerRoster]);

  // pokemonMap: all party + enemy roster mons with computed stats
  const pokemonMap = useMemo(() => {
    const map = {};
    const all = [...(playerPokemon || []), ...(trainerRoster || [])];
    for (const mon of all) {
      if (!mon?.id) continue;
      const withStats = getPokemonStats(mon);
      map[mon.id] = {
        ...withStats,
        abilities: withStats.abilities || mon.abilities || ['Tackle'],
        movePP: withStats.movePP || mon.movePP || {},
        statStages: withStats.statStages || createDefaultStatStages(),
      };
    }
    return map;
  }, [playerPokemon, trainerRoster]);

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

  // While waiting for a trainer encounter to load/start, show the intro modal only
  if (!battleState && wildPokemonId) {
    return (
      <div>
        {trainerIntro && !introDismissed && (
          <TrainerIntroModal
            trainer={trainerIntro.trainer}
            roster={trainerIntro.roster}
            onBegin={() => {
              setIntroDismissed(true);
              setTrainerIntro(null);
              setBattleReady(true);
            }}
          />
        )}
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

  const isPlayerTurn = battleState?.currentTurn === 'player';
  const isBattleEnded = battleState?.status === 'won' || battleState?.status === 'lost';
  const isMulti = Boolean(battleState?.activeSlots && battleState.activeSlots > 1);

  return (
    <div>
      {/* Trainer intro modal — shown before battle begins */}
      {trainerIntro && !introDismissed && (
        <TrainerIntroModal
          trainer={trainerIntro.trainer}
          roster={trainerIntro.roster}
          onBegin={() => {
            setIntroDismissed(true);
            setTrainerIntro(null);
            setBattleReady(true);
          }}
        />
      )}

      <PageHeader 
        title="Battle Arena" 
        subtitle={
          battleState.enemyPokemon?.isTrainerNPC
            ? `${battleState.enemyPokemon.trainerName || 'Trainer'} — Turn ${battleState.turnNumber} | ${isPlayerTurn ? 'Your Turn' : 'Enemy Turn'}`
            : `Turn ${battleState.turnNumber} - ${isPlayerTurn ? 'Your Turn' : 'Enemy Turn'}`
        }
        icon={Swords}
        action={
          isBattleEnded && !battleState?.isTrainerBattle && !battleState?.enemyPokemon?.isTrainerNPC && (
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

          {/* HUDs — 3v3 or 1v1 */}
          {isMulti ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Enemy side */}
              <div className="space-y-2">
                {(battleState.enemyActive || []).map((id) => {
                  const mon = pokemonMap[id];
                  if (!mon) return null;
                  const hp = battleState.hpMap?.[id] ?? mon.currentHp ?? 0;
                  const maxHp = battleState.maxHpMap?.[id] ?? mon.stats?.maxHp ?? 100;
                  const status = battleState.statusMap?.[id];
                  return (
                    <BattleHUD key={id} pokemon={mon} hp={hp} maxHp={maxHp} status={status} isPlayer={false} roles={mon.roles || []} />
                  );
                })}
              </div>
              {/* Player side */}
              <div className="space-y-2">
                {(battleState.playerActive || []).map((id) => {
                  const mon = pokemonMap[id];
                  if (!mon) return null;
                  const hp = battleState.hpMap?.[id] ?? mon.currentHp ?? 0;
                  const maxHp = battleState.maxHpMap?.[id] ?? mon.stats?.maxHp ?? 100;
                  const status = battleState.statusMap?.[id];
                  return (
                    <BattleHUD key={id} pokemon={mon} hp={hp} maxHp={maxHp} status={status} isPlayer={true} roles={mon.roles || []} />
                  );
                })}
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}

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
                    isWild: false,
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
                // Clean up all spawned encounter Pokémon unless captured
                if (battleState?.status !== 'captured') {
                  await cleanupEncounterPokemon();
                }

                setBattleSummary(null);
                if (returnTo) {
                  const separator = returnTo.includes('?') ? '&' : '?';
                  navigate(`/${returnTo}${separator}battleOutcome=victory`);
                  return;
                }
                setBattleState(null);
                setWildPokemonId(null);
                setEncounterPokemonIds([]);
                setTrainerRoster([]);
                setReturnTo(null);
                setItemsUsed([]);
              }}
            />
          )}

          {/* Catch Streak display during wild battle */}
          {battleState?.isWildBattle && !isBattleEnded && battleState?.enemyPokemon?.species && (
            <div className="mt-2">
              <CatchStreakBadge species={battleState.enemyPokemon.species} />
            </div>
          )}

          {/* Battle Results Modal — only for defeat (victory uses BattleSummaryModal) */}
          {isBattleEnded && battleState?.status === 'lost' && !moveLearnState && !evolutionState && !captureModalState && !battleSummary && (
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
                 // Clean up all spawned encounter Pokémon unless captured
                   if (battleState?.status !== 'captured') {
                     await cleanupEncounterPokemon();
                   }

                 if (returnTo) {
                   const separator = returnTo.includes('?') ? '&' : '?';
                   const battleOutcome = battleState.status === 'won' || battleState.status === 'captured'
                     ? 'victory'
                     : 'defeat';
                   navigate(`/${returnTo}${separator}battleOutcome=${battleOutcome}`);
                 } else {
                   setBattleState(null);
                   setWildPokemonId(null);
                   setEncounterPokemonIds([]);
                   setTrainerRoster([]);
                   setReturnTo(null);
                 }
              }}
            />
          )}

          {/* Action Menu — 3v3 uses ActionQueuePanel, 1v1 uses classic menus */}
          {!isBattleEnded && isMulti ? (
            <ActionQueuePanel
              playerActive={battleState.playerActive || []}
              pokemonMap={pokemonMap}
              battleState={battleState}
              inventory={inventory}
              isWildBattle={false}
              pokeballCount={totalPokeballCount}
              onQueueReady={(playerActions) => runMultiTurn(playerActions)}
            />
          ) : null}

          {/* Action Menu */}
          {!isBattleEnded && !isMulti && (
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
                       const maxPP = moveData?.pp || 10;
                       const currentPP = battleState.playerPokemon.movePP?.[moveName] !== undefined
                         ? battleState.playerPokemon.movePP[moveName]
                         : maxPP;
                       return (
                         <MoveCard
                           key={idx}
                           move={moveData}
                           pokemon={battleState.playerPokemon}
                           onUse={(m) => {
                             useMove(m);
                             setActionMenu('main');
                           }}
                           disabled={!isPlayerTurn || currentPP <= 0}
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