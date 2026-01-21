import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/common/PageHeader';
import BattleHUD from '@/components/battle/BattleHUD';
import MoveCard from '@/components/battle/MoveCard';
import BattleLog from '@/components/battle/BattleLog';
import TalentDisplay from '@/components/battle/TalentDisplay';

export default function BattlePage() {
  const [battleState, setBattleState] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);
  const queryClient = useQueryClient();

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

  // Start a new battle
  const startBattle = () => {
    if (playerPokemon.length === 0) return;

    // Select first Pokemon in team
    const playerMon = playerPokemon[0];
    
    // Mock enemy Pokemon
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
      synergyChains: 0
    });
  };

  // Use a move
  const useMove = (move) => {
    if (!battleState || battleState.currentTurn !== 'player') return;

    const damage = Math.floor(Math.random() * 30) + move.power / 2;
    const newEnemyHP = Math.max(0, battleState.enemyHP - damage);
    
    // Check for synergy
    const hasSynergy = move.synergyConditions?.some(s => 
      s.type === 'role' && battleState.playerPokemon.roles?.includes(s.requirement)
    );

    const newLog = {
      turn: battleState.turnNumber,
      actor: battleState.playerPokemon.nickname || battleState.playerPokemon.species,
      action: `used ${move.name}`,
      result: `${damage} damage!`,
      synergyTriggered: hasSynergy
    };

    // Check if battle is won
    if (newEnemyHP <= 0) {
      setBattleState({
        ...battleState,
        enemyHP: 0,
        battleLog: [...battleState.battleLog, newLog, {
          turn: battleState.turnNumber,
          actor: 'System',
          action: 'Victory!',
          result: 'You won the battle!',
          synergyTriggered: false
        }],
        currentTurn: 'ended',
        status: 'won'
      });
      return;
    }

    // Enemy turn
    setTimeout(() => {
      const enemyDamage = Math.floor(Math.random() * 25) + 10;
      const newPlayerHP = Math.max(0, battleState.playerHP - enemyDamage);

      const enemyLog = {
        turn: battleState.turnNumber,
        actor: battleState.enemyPokemon.species,
        action: 'attacked',
        result: `${enemyDamage} damage!`,
        synergyTriggered: false
      };

      if (newPlayerHP <= 0) {
        setBattleState({
          ...battleState,
          playerHP: 0,
          enemyHP: newEnemyHP,
          battleLog: [...battleState.battleLog, newLog, enemyLog, {
            turn: battleState.turnNumber,
            actor: 'System',
            action: 'Defeat!',
            result: 'You lost the battle.',
            synergyTriggered: false
          }],
          currentTurn: 'ended',
          status: 'lost'
        });
      } else {
        setBattleState({
          ...battleState,
          playerHP: newPlayerHP,
          enemyHP: newEnemyHP,
          battleLog: [...battleState.battleLog, newLog, enemyLog],
          turnNumber: battleState.turnNumber + 1,
          currentTurn: 'player',
          synergyChains: hasSynergy ? battleState.synergyChains + 1 : battleState.synergyChains
        });
      }
    }, 1500);

    setBattleState({
      ...battleState,
      enemyHP: newEnemyHP,
      battleLog: [...battleState.battleLog, newLog],
      currentTurn: 'enemy'
    });
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

          {/* Battle Results */}
          {isBattleEnded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`glass rounded-xl p-8 text-center ${
                battleState.status === 'won' 
                  ? 'border-2 border-emerald-500' 
                  : 'border-2 border-red-500'
              }`}
            >
              {battleState.status === 'won' ? (
                <>
                  <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
                  <h2 className="text-3xl font-bold text-white mb-2">Victory!</h2>
                  <p className="text-slate-300 mb-4">
                    You defeated {battleState.enemyPokemon.species}!
                  </p>
                  {battleState.synergyChains > 0 && (
                    <div className="flex items-center justify-center gap-2 text-cyan-400">
                      <Sparkles className="w-5 h-5" />
                      <span>{battleState.synergyChains} Synergy Chain(s)!</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <AlertCircle className="w-20 h-20 mx-auto mb-4 text-red-400" />
                  <h2 className="text-3xl font-bold text-white mb-2">Defeat</h2>
                  <p className="text-slate-300">
                    Your Pokémon fainted. Train harder and try again!
                  </p>
                </>
              )}
            </motion.div>
          )}

          {/* Move Selection */}
          {!isBattleEnded && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Select a Move
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {moves.slice(0, 4).map((move) => (
                  <MoveCard
                    key={move.id}
                    move={move}
                    onUse={useMove}
                    disabled={!isPlayerTurn}
                  />
                ))}
              </div>
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