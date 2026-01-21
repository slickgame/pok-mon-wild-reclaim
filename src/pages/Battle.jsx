import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { BattleEngine } from '@/components/battle/BattleEngine';

export default function BattlePage() {
  const [battleState, setBattleState] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);
  const [wildPokemonId, setWildPokemonId] = useState(null);
  const [returnTo, setReturnTo] = useState(null);
  const [capturingPokemon, setCapturingPokemon] = useState(false);
  const [actionMenu, setActionMenu] = useState('main'); // 'main', 'fight', 'items', 'switch'
  const queryClient = useQueryClient();

  // Parse URL parameters for wild encounters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wildId = params.get('wildPokemonId');
    const returnPage = params.get('returnTo');
    
    if (wildId) {
      setWildPokemonId(wildId);
      setReturnTo(returnPage || 'Zones');
    }
  }, []);

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
      return pokemon;
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
      return pokemon[0] || null;
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

    const playerMon = playerPokemon[0];
    
    setBattleState({
      playerPokemon: playerMon,
      enemyPokemon: wildMon,
      playerHP: playerMon.stats.maxHp,
      enemyHP: wildMon.stats.maxHp,
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

    const playerMon = playerPokemon[0];
    
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
      playerHP: playerMon.stats.maxHp,
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
    const hpPercent = (battleState.enemyHP / battleState.enemyPokemon.stats.maxHp) * 100;
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

    // Enemy selects a random move (simple AI)
    const enemyAvailableMoves = moves.filter(m => m.category !== 'Status').slice(0, 3);
    const enemyMove = enemyAvailableMoves[Math.floor(Math.random() * enemyAvailableMoves.length)] || moves[0];

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
      const newXP = (newBattleState.playerPokemon.experience || 0) + xpGained;
      const goldGained = Math.floor(newBattleState.enemyPokemon.level * 15);
      
      // Generate material drops for wild battles
      const materialsDropped = [];
      if (newBattleState.isWildBattle) {
        const dropChance = Math.random() * 100;
        if (dropChance > 40) {
          const materials = ['Silk Fragment', 'Glowworm', 'Moonleaf', 'River Stone'];
          const dropped = materials[Math.floor(Math.random() * materials.length)];
          materialsDropped.push(dropped);
        }
      }

      newBattleState.rewards = {
        xpGained,
        goldGained,
        materialsDropped
      };
      
      // Update player's Pokémon
      base44.entities.Pokemon.update(newBattleState.playerPokemon.id, {
        experience: newXP
      }).catch(err => console.error('Failed to update XP:', err));

      // Add materials to inventory
      if (materialsDropped.length > 0) {
        materialsDropped.forEach(material => {
          base44.entities.Item.create({
            name: material,
            type: 'Material',
            tier: 1,
            rarity: 'Common',
            description: 'A crafting material',
            quantity: 1,
            stackable: true,
            sellValue: 10
          }).catch(err => console.error('Failed to add material:', err));
        });
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

    const newBattleState = {
      ...battleState,
      playerPokemon: newPokemon,
      playerHP: newPokemon.stats.maxHp,
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

    const newHP = Math.min(battleState.playerHP + healAmount, battleState.playerPokemon.stats.maxHp);

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
            maxHp={battleState.enemyPokemon.stats.maxHp}
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
            maxHp={battleState.playerPokemon.stats.maxHp}
            status={battleState.playerStatus}
            roles={battleState.playerPokemon.roles || []}
            isPlayer
          />

          {/* Battle Results Modal */}
          {isBattleEnded && (
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
                // Clean up or capture wild Pokémon
                if (wildPokemonId) {
                  try {
                    if (battleState.status === 'captured') {
                      // Add to collection
                      await base44.entities.Pokemon.update(wildPokemonId, {
                        isInTeam: false
                      });
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
                    {moves.slice(0, 4).map((move) => (
                      <MoveCard
                        key={move.id}
                        move={move}
                        onUse={(m) => {
                          useMove(m);
                          setActionMenu('main');
                        }}
                        disabled={!isPlayerTurn}
                      />
                    ))}
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