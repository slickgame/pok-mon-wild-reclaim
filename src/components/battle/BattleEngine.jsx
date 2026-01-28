import { getPokemonStats } from '../pokemon/usePokemonStats';
import { getMoveData } from '@/components/utils/getMoveData';
import { TalentRegistry } from '@/data/TalentRegistry';
import { normalizeTalentGrade } from '@/components/utils/talentUtils';
import { applyMoveEffect } from '@/components/data/MoveEffectRegistry';
import { TalentEffectHandlers } from '@/engine/TalentEffectHandlers';
import { StatusRegistry, processStatusEffects, checkStatusPreventsAction, inflictStatus } from '@/components/data/StatusRegistry';
import { WeatherRegistry } from '@/components/data/WeatherRegistry';
import { TerrainRegistry } from '@/components/data/TerrainRegistry';
import { ScreenRegistry } from '@/components/data/ScreenRegistry';
import {
  createDefaultStatStages,
  formatStatStageChange,
  formatStatStageLimit,
  getStatModifier,
  getStatStageValue,
  normalizeStatStageKey,
  normalizeStatStages
} from './statStageUtils';

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

const ensureBattlefield = (battleState) => {
  if (!battleState.battlefield) {
    battleState.battlefield = createDefaultBattlefield();
  }

  battleState.battlefield.hazards = battleState.battlefield.hazards || { playerSide: [], enemySide: [] };
  battleState.battlefield.screens = battleState.battlefield.screens || { playerSide: [], enemySide: [] };
  battleState.battlefield.hazards.playerSide = battleState.battlefield.hazards.playerSide || [];
  battleState.battlefield.hazards.enemySide = battleState.battlefield.hazards.enemySide || [];
  battleState.battlefield.screens.playerSide = battleState.battlefield.screens.playerSide || [];
  battleState.battlefield.screens.enemySide = battleState.battlefield.screens.enemySide || [];

  return battleState.battlefield;
};

export const triggerTalent = (event, ctx) => {
  const allCombatants = [...(ctx.playerTeam || []), ...(ctx.enemyTeam || [])];

  for (const mon of allCombatants) {
    const talents = mon.talents || [];

    for (const { id, grade } of talents) {
      const talent = TalentRegistry[id];
      if (!talent || talent.trigger !== event) continue;

      const normalizedGrade = normalizeTalentGrade(grade);
      const effectFn = TalentEffectHandlers[id]?.[normalizedGrade];
      if (effectFn) {
        const effectContext = {
          user: mon,
          ...ctx,
          addBattleLog: ctx.addBattleLog ? (message) => ctx.addBattleLog(message, mon, talent) : undefined,
          modifyStat: ctx.modifyStat ? (target, stat, stages) => ctx.modifyStat(target, stat, stages) : undefined
        };
        effectFn(effectContext);
      }
    }
  }
};

// Battle Engine - Core logic for turn-based combat
// INTEGRATION: Uses centralized MOVE_DATA for all move metadata
export class BattleEngine {
  constructor(playerPokemon, enemyPokemon) {
    // Ensure stats are calculated dynamically from base stats
    this.playerPokemon = getPokemonStats(playerPokemon);
    this.enemyPokemon = getPokemonStats(enemyPokemon);
    
    // Initialize passive effects storage
    this.playerPokemon.passiveEffects = this.playerPokemon.passiveEffects || [];
    this.enemyPokemon.passiveEffects = this.enemyPokemon.passiveEffects || [];
    
    // Initialize status and stat stages
    this.playerPokemon.status = this.playerPokemon.status || null;
    this.enemyPokemon.status = this.enemyPokemon.status || null;
    this.playerPokemon.statStages = normalizeStatStages(this.playerPokemon.statStages);
    this.enemyPokemon.statStages = normalizeStatStages(this.enemyPokemon.statStages);

    this.attachModifyStat(this.playerPokemon);
    this.attachModifyStat(this.enemyPokemon);
  }

  attachModifyStat(pokemon) {
    pokemon.modifyStat = (stat, delta, battleState) => {
      const result = this.modifyStatStage(pokemon, stat, delta, battleState);
      const message = result.actualChange === 0
        ? formatStatStageLimit(stat, delta)
        : formatStatStageChange(stat, result.actualChange);
      if (typeof pokemon.log === 'function') {
        pokemon.log(message);
      }
      return { ...result, message };
    };
  }

  formatStatStageLogMessage(stat, intendedChange, actualChange) {
    if (actualChange === 0) {
      return formatStatStageLimit(stat, intendedChange);
    }
    return formatStatStageChange(stat, actualChange);
  }

  getPossessiveName(pokemon) {
    const name = pokemon.nickname || pokemon.species;
    return `${name}'s`;
  }

  // Calculate turn order based on Speed stat and priority
  determineTurnOrder(playerMove, enemyMove) {
    // Get move data from central registry
    const playerMoveData = typeof playerMove === 'string' 
      ? getMoveData(playerMove, this.playerPokemon) 
      : (playerMove?.name ? getMoveData(playerMove.name, this.playerPokemon) : playerMove);
    const enemyMoveData = typeof enemyMove === 'string' 
      ? getMoveData(enemyMove, this.enemyPokemon) 
      : (enemyMove?.name ? getMoveData(enemyMove.name, this.enemyPokemon) : enemyMove);
    
    const playerPriority = playerMoveData?.priority || 0;
    const enemyPriority = enemyMoveData?.priority || 0;

    // Check for Scout role (priority boost)
    const playerHasScout = this.playerPokemon.roles?.includes('Scout');
    const enemyHasScout = this.enemyPokemon.roles?.includes('Scout');

    const finalPlayerPriority = playerPriority + (playerHasScout ? 1 : 0);
    const finalEnemyPriority = enemyPriority + (enemyHasScout ? 1 : 0);

    if (finalPlayerPriority !== finalEnemyPriority) {
      return finalPlayerPriority > finalEnemyPriority ? 'player' : 'enemy';
    }

    // If priority is equal, use Speed stat
    const playerSpeedStage = getStatStageValue(this.playerPokemon.statStages, 'Speed');
    const enemySpeedStage = getStatStageValue(this.enemyPokemon.statStages, 'Speed');
    const playerSpeed = this.playerPokemon.stats.spd * getStatModifier(playerSpeedStage);
    const enemySpeed = this.enemyPokemon.stats.spd * getStatModifier(enemySpeedStage);

    return playerSpeed >= enemySpeed ? 'player' : 'enemy';
  }

  // Check for synergy effects
  checkSynergies(attacker, move, defender) {
    const synergies = [];
    
    // Get move data from central registry
    const moveData = typeof move === 'string' 
      ? getMoveData(move, attacker) 
      : (move?.name ? getMoveData(move.name, attacker) : move);

    if (!moveData?.synergyConditions) return synergies;

    moveData.synergyConditions.forEach(condition => {
      let triggered = false;
      let bonus = condition.bonus;

      switch (condition.type) {
        case 'role':
          triggered = attacker.roles?.includes(condition.requirement);
          break;
        case 'talent':
          triggered = attacker.talents?.some(t => t.name === condition.requirement);
          break;
        case 'item':
          triggered = attacker.heldItems?.includes(condition.requirement);
          break;
        case 'weather':
        case 'status':
          // These would require additional battle state
          break;
      }

      if (triggered) {
        synergies.push({ type: condition.type, bonus, requirement: condition.requirement });
      }
    });

    return synergies;
  }

  // Calculate type effectiveness multiplier
  getTypeEffectiveness(moveType, defenderTypes) {
    const typeChart = {
      Fire: { superEffective: ['Grass', 'Ice', 'Bug', 'Steel'], notVeryEffective: ['Fire', 'Water', 'Rock', 'Dragon'] },
      Water: { superEffective: ['Fire', 'Ground', 'Rock'], notVeryEffective: ['Water', 'Grass', 'Dragon'] },
      Grass: { superEffective: ['Water', 'Ground', 'Rock'], notVeryEffective: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'] },
      Electric: { superEffective: ['Water', 'Flying'], notVeryEffective: ['Electric', 'Grass', 'Dragon'], noEffect: ['Ground'] },
      Ice: { superEffective: ['Grass', 'Ground', 'Flying', 'Dragon'], notVeryEffective: ['Fire', 'Water', 'Ice', 'Steel'] },
      Fighting: { superEffective: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'], notVeryEffective: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'], noEffect: ['Ghost'] },
      Poison: { superEffective: ['Grass', 'Fairy'], notVeryEffective: ['Poison', 'Ground', 'Rock', 'Ghost'], noEffect: ['Steel'] },
      Ground: { superEffective: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'], notVeryEffective: ['Grass', 'Bug'], noEffect: ['Flying'] },
      Flying: { superEffective: ['Grass', 'Fighting', 'Bug'], notVeryEffective: ['Electric', 'Rock', 'Steel'] },
      Psychic: { superEffective: ['Fighting', 'Poison'], notVeryEffective: ['Psychic', 'Steel'], noEffect: ['Dark'] },
      Bug: { superEffective: ['Grass', 'Psychic', 'Dark'], notVeryEffective: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'] },
      Rock: { superEffective: ['Fire', 'Ice', 'Flying', 'Bug'], notVeryEffective: ['Fighting', 'Ground', 'Steel'] },
      Ghost: { superEffective: ['Psychic', 'Ghost'], notVeryEffective: ['Dark'], noEffect: ['Normal'] },
      Dragon: { superEffective: ['Dragon'], notVeryEffective: ['Steel'], noEffect: ['Fairy'] },
      Dark: { superEffective: ['Psychic', 'Ghost'], notVeryEffective: ['Fighting', 'Dark', 'Fairy'] },
      Steel: { superEffective: ['Ice', 'Rock', 'Fairy'], notVeryEffective: ['Fire', 'Water', 'Electric', 'Steel'] },
      Fairy: { superEffective: ['Fighting', 'Dragon', 'Dark'], notVeryEffective: ['Fire', 'Poison', 'Steel'] },
      Normal: { notVeryEffective: ['Rock', 'Steel'], noEffect: ['Ghost'] }
    };
    
    let multiplier = 1;
    const chart = typeChart[moveType];
    
    if (!chart) return multiplier;
    
    defenderTypes.forEach(defType => {
      if (chart.noEffect?.includes(defType)) {
        multiplier = 0;
      } else if (chart.superEffective?.includes(defType)) {
        multiplier *= 2;
      } else if (chart.notVeryEffective?.includes(defType)) {
        multiplier *= 0.5;
      }
    });
    
    return multiplier;
  }

  getScreenDamageMultiplier(defenderKey, move, battlefield) {
    const sideKey = defenderKey === 'player' ? 'playerSide' : 'enemySide';
    const screens = battlefield.screens?.[sideKey] || [];
    let multiplier = 1;

    screens.forEach((screen) => {
      const screenId = typeof screen === 'string' ? screen : screen.id;
      const screenDef = ScreenRegistry[screenId];
      if (!screenDef?.reduceDamage) return;
      const reduction = screenDef.reduceDamage(move, { weather: battlefield.weather });
      if (reduction) multiplier *= reduction;
    });

    return multiplier;
  }

  // Calculate damage
  calculateDamage(attacker, defender, move, synergies = [], battleState, defenderKey) {
    // Get move data from central registry
    const moveData = typeof move === 'string' 
      ? getMoveData(move, attacker) 
      : (move?.name ? getMoveData(move.name, attacker) : move);
    
    if (!moveData) {
      console.warn('Move data not found:', move);
      return 0;
    }
    
    if (moveData.category === 'Status') return 0;

    const battlefield = battleState ? ensureBattlefield(battleState) : createDefaultBattlefield();
    let basePower = moveData.power || 50;
    const weatherEffect = battlefield.weather ? WeatherRegistry[battlefield.weather] : null;
    const terrainEffect = battlefield.terrain ? TerrainRegistry[battlefield.terrain] : null;
    const weatherMod = weatherEffect?.modifyMove?.(moveData);
    const terrainMod = terrainEffect?.modifyMove?.(moveData);

    if (weatherMod?.powerBoost) {
      basePower = Math.floor(basePower * weatherMod.powerBoost);
    }
    if (weatherMod?.powerDrop) {
      basePower = Math.floor(basePower * weatherMod.powerDrop);
    }
    if (terrainMod?.powerBoost) {
      basePower = Math.floor(basePower * terrainMod.powerBoost);
    }

    const attackStageKey = moveData.category === 'Physical' ? 'Attack' : 'Sp. Atk';
    const defenseStageKey = moveData.category === 'Physical' ? 'Defense' : 'Sp. Def';
    const attackStage = getStatStageValue(attacker.statStages, attackStageKey);
    const defenseStage = getStatStageValue(defender.statStages, defenseStageKey);
    const attackStat = (moveData.category === 'Physical' ? attacker.stats.atk : attacker.stats.spAtk)
      * getStatModifier(attackStage);
    const defenseStat = (moveData.category === 'Physical' ? defender.stats.def : defender.stats.spDef)
      * getStatModifier(defenseStage);
    
    // Base damage calculation
    let damage = Math.floor(
      ((2 * attacker.level / 5 + 2) * basePower * (attackStat / defenseStat)) / 50 + 2
    );

    // STAB (Same Type Attack Bonus) - 1.5x if move type matches attacker's type
    const attackerTypes = [attacker.type1, attacker.type2].filter(Boolean);
    if (attackerTypes.includes(moveData.type)) {
      damage = Math.floor(damage * 1.5);
    }

    // Type Effectiveness
    const defenderTypes = [defender.type1, defender.type2].filter(Boolean);
    const typeEffectiveness = this.getTypeEffectiveness(moveData.type, defenderTypes);
    damage = Math.floor(damage * typeEffectiveness);

    // Critical Hit (6.25% chance, 2x damage)
    const isCritical = Math.random() < 0.0625;
    if (isCritical) {
      damage = Math.floor(damage * 2);
    }

    // Apply synergy bonuses from move data
    if (moveData.synergy && moveData.synergy.rolebonus) {
      if (attacker.roles?.includes(moveData.synergy.rolebonus)) {
        const multiplier = moveData.synergy.roleDamageMultiplier || moveData.synergy.damageMultiplier || 1.3;
        damage = Math.floor(damage * multiplier);
      }
    }

    // Apply synergy bonuses
    synergies.forEach(synergy => {
      if (synergy.bonus.includes('damage')) {
        damage = Math.floor(damage * 1.5);
      }
    });

    if (defenderKey && battlefield) {
      const screenMultiplier = this.getScreenDamageMultiplier(defenderKey, moveData, battlefield);
      damage = Math.floor(damage * screenMultiplier);
    }

    // Random damage variance (±15%)
    const randomFactor = (Math.random() * 0.3 + 0.85);
    damage = Math.floor(damage * randomFactor);

    // Check for Talent defensive effects
    const defenderTalents = defender.talents || [];
    defenderTalents.forEach(talent => {
      if (talent.name === 'Sticky Shield') {
        damage = Math.floor(damage * 0.8);
      }
    });

    return { damage: Math.max(1, damage), isCritical, typeEffectiveness };
  }

  // Apply talent effects based on trigger (legacy support)
  applyTalentEffects(pokemon, trigger, context) {
    const talents = pokemon.talents || [];
    const results = [];

    talents.forEach(talent => {
      const talentId = talent.id || talent.name;
      const handler = TalentRegistry[talentId];
      
      if (handler && handler.trigger === trigger) {
        const grade = normalizeTalentGrade(talent.grade);
        const gradeData = handler.grades[grade];
        
        if (gradeData) {
          results.push({
            talent: handler,
            grade,
            gradeData,
            applied: true
          });
        }
      }
    });

    return results;
  }

  // Apply status effects
  applyStatusEffect(target, effect, battleState, addBattleLog) {
    const statusId = effect === 'paralysis' ? 'paralyze' : effect;
    const success = inflictStatus(target, statusId, battleState, addBattleLog);
    const statusName = StatusRegistry[statusId]?.name || statusId;

    return { success, status: statusName };
  }

  // Modify stat stages (clamped -6 to +6)
  modifyStatStage(pokemon, stat, change, battleState) {
    if (!pokemon.statStages) {
      pokemon.statStages = createDefaultStatStages();
    }
    
    const statKey = normalizeStatStageKey(stat);
    if (!statKey) {
      return {
        stat,
        stages: change,
        actualChange: 0,
        newTotal: 0,
        previousTotal: 0
      };
    }
    const current = pokemon.statStages[statKey] || 0;
    const newValue = Math.max(-6, Math.min(6, current + change));
    pokemon.statStages[statKey] = newValue;
    
    return {
      stat: statKey,
      stages: change,
      actualChange: newValue - current,
      newTotal: newValue,
      previousTotal: current
    };
  }

  // Apply buffs/debuffs (legacy)
  applyStatChange(target, stat, stages, battleState) {
    const result = this.modifyStatStage(target, stat, stages, battleState);
    
    const targetState = target === this.playerPokemon ? battleState.playerStatus : battleState.enemyStatus;
    const normalizedStat = normalizeStatStageKey(stat);
    const existingBuff = targetState.buffs.find(b => b.stat === normalizedStat);
    if (existingBuff) {
      existingBuff.value = result.newTotal;
    } else if (result.actualChange !== 0) {
      targetState.buffs.push({
        name: `${normalizedStat} ${result.actualChange > 0 ? '+' : ''}${result.actualChange}`,
        stat: normalizedStat,
        value: result.newTotal
      });
    }

    return { stat, stages, actualChange: result.actualChange, newTotal: result.newTotal };
  }

  // Process turn-end effects (burn, poison, etc.)
  processTurnEndEffects(battleState) {
    const effects = [];

    // Player status effects
    if (battleState.playerStatus.conditions.includes('Burn')) {
      const damage = Math.floor(battleState.playerPokemon.stats.maxHp * 0.0625);
      battleState.playerHP = Math.max(0, battleState.playerHP - damage);
      effects.push({ target: 'player', effect: 'Burn', damage });
    }

    if (battleState.playerStatus.conditions.includes('Poison')) {
      const damage = Math.floor(battleState.playerPokemon.stats.maxHp * 0.0625);
      battleState.playerHP = Math.max(0, battleState.playerHP - damage);
      effects.push({ target: 'player', effect: 'Poison', damage });
    }

    // Enemy status effects
    if (battleState.enemyStatus.conditions.includes('Burn')) {
      const damage = Math.floor(battleState.enemyPokemon.stats.maxHp * 0.0625);
      battleState.enemyHP = Math.max(0, battleState.enemyHP - damage);
      effects.push({ target: 'enemy', effect: 'Burn', damage });
    }

    if (battleState.enemyStatus.conditions.includes('Poison')) {
      const damage = Math.floor(battleState.enemyPokemon.stats.maxHp * 0.0625);
      battleState.enemyHP = Math.max(0, battleState.enemyHP - damage);
      effects.push({ target: 'enemy', effect: 'Poison', damage });
    }

    return effects;
  }

  // Smart AI: Choose best move based on strategy
  chooseEnemyMove(availableMoves, playerPokemon) {
    if (!availableMoves || availableMoves.length === 0) {
      return availableMoves[0];
    }
    
    // Get move data for all available moves
    const movesWithData = availableMoves.map(move => {
      const moveData = move?.name ? getMoveData(move.name, this.enemyPokemon) : move;
      return { ...move, ...moveData };
    });
    
    // Calculate HP percentage
    const enemyHPPercent = (this.enemyPokemon.currentHp / this.enemyPokemon.stats.maxHp) * 100;
    
    // Priority 1: If low HP (<30%), consider healing/status moves
    if (enemyHPPercent < 30) {
      const healingMoves = movesWithData.filter(m => 
        m.category === 'Status' && m.effect && m.effect.includes('heal')
      );
      if (healingMoves.length > 0 && Math.random() < 0.6) {
        return healingMoves[0];
      }
    }
    
    // Priority 2: Check for super-effective moves (type advantage)
    const superEffectiveMoves = movesWithData.filter(move => {
      // Simplified type effectiveness check
      const playerTypes = [playerPokemon.type1, playerPokemon.type2].filter(Boolean);
      return this.isSuperEffective(move.type, playerTypes);
    });
    
    if (superEffectiveMoves.length > 0) {
      // Choose highest power super-effective move
      return superEffectiveMoves.reduce((best, current) => 
        (current.power || 0) > (best.power || 0) ? current : best
      );
    }
    
    // Priority 3: Choose highest damage move
    const damageMoves = movesWithData.filter(m => m.category !== 'Status' && m.power > 0);
    if (damageMoves.length > 0) {
      return damageMoves.reduce((best, current) => 
        (current.power || 0) > (best.power || 0) ? current : best
      );
    }
    
    // Priority 4: Random status move for variety (20% chance)
    if (Math.random() < 0.2) {
      const statusMoves = movesWithData.filter(m => m.category === 'Status');
      if (statusMoves.length > 0) {
        return statusMoves[Math.floor(Math.random() * statusMoves.length)];
      }
    }
    
    // Fallback: random move
    return movesWithData[Math.floor(Math.random() * movesWithData.length)];
  }
  
  // Simplified type effectiveness check
  isSuperEffective(moveType, defenderTypes) {
    const typeChart = {
      Fire: ['Grass', 'Ice', 'Bug', 'Steel'],
      Water: ['Fire', 'Ground', 'Rock'],
      Grass: ['Water', 'Ground', 'Rock'],
      Electric: ['Water', 'Flying'],
      Ice: ['Grass', 'Ground', 'Flying', 'Dragon'],
      Fighting: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'],
      Poison: ['Grass', 'Fairy'],
      Ground: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'],
      Flying: ['Grass', 'Fighting', 'Bug'],
      Psychic: ['Fighting', 'Poison'],
      Bug: ['Grass', 'Psychic', 'Dark'],
      Rock: ['Fire', 'Ice', 'Flying', 'Bug'],
      Ghost: ['Psychic', 'Ghost'],
      Dragon: ['Dragon'],
      Dark: ['Psychic', 'Ghost'],
      Steel: ['Ice', 'Rock', 'Fairy'],
      Fairy: ['Fighting', 'Dragon', 'Dark']
    };
    
    const superEffectiveAgainst = typeChart[moveType] || [];
    return defenderTypes.some(type => superEffectiveAgainst.includes(type));
  }

  // Process passive effects at turn start
  processPassiveEffects(pokemon, pokemonKey, battleState) {
    const logs = [];
    if (!pokemon.passiveEffects || pokemon.passiveEffects.length === 0) return logs;

    const remaining = [];
    
    for (const effect of pokemon.passiveEffects) {
      if (effect.onTurnStart) {
        const ctx = {
          target: {
            ...pokemon,
            lastStatChanges: battleState.lastTurnStatChanges?.[pokemonKey] || []
          },
          battle: battleState,
          applyDamage: (amount) => {
            if (pokemonKey === 'player') {
              battleState.playerHP = Math.max(0, battleState.playerHP - amount);
              pokemon.currentHp = battleState.playerHP;
            } else {
              battleState.enemyHP = Math.max(0, battleState.enemyHP - amount);
              pokemon.currentHp = battleState.enemyHP;
            }
          },
          addBattleLog: (message) => {
            logs.push({
              turn: battleState.turnNumber,
              actor: pokemon.nickname || pokemon.species,
              action: effect.id,
              result: message,
              synergyTriggered: false
            });
          },
          modifyStat: (stat, stages) => {
            const changeResult = this.applyStatChange(pokemon, stat, stages, battleState);
            const message = this.formatStatStageLogMessage(stat, stages, changeResult.actualChange);
            logs.push({
              turn: battleState.turnNumber,
              actor: pokemon.nickname || pokemon.species,
              action: `${effect.id} activated`,
              result: message,
              synergyTriggered: false
            });
          }
        };
        
        try {
          effect.onTurnStart(ctx);
        } catch (error) {
          console.error(`Error processing passive effect ${effect.id}:`, error);
        }
      }

      effect.duration--;
      if (effect.duration > 0) {
        remaining.push(effect);
      } else {
        logs.push({
          turn: battleState.turnNumber,
          actor: pokemon.nickname || pokemon.species,
          action: `${effect.id} wore off`,
          result: '',
          synergyTriggered: false
        });
      }
    }

    pokemon.passiveEffects = remaining;
    return logs;
  }

  createTalentContext(battleState, logs, extra = {}) {
    const battlefield = ensureBattlefield(battleState);
    const mappedWeather = battlefield.weather === 'sunny' ? 'sun' : battlefield.weather;
    const mappedTerrain = battlefield.terrain === 'grassy' ? 'grass' : battlefield.terrain;
    return {
      playerTeam: [this.playerPokemon],
      enemyTeam: [this.enemyPokemon],
      battleState,
      turnCount: battleState.turnNumber,
      weather: mappedWeather ?? battleState.weather,
      terrain: mappedTerrain ?? battleState.terrain,
      isFirstTurn: battleState.turnNumber === 1,
      addBattleLog: (message, user, talentDef) => {
        logs.push({
          turn: battleState.turnNumber,
          actor: user?.nickname || user?.species,
          action: talentDef?.name || 'Talent',
          result: message,
          synergyTriggered: true
        });
      },
      modifyStat: (targetPokemon, stat, stages) => {
        this.applyStatChange(targetPokemon, stat, stages, battleState);
      },
      ...extra
    };
  }

  processBattlefieldTurnStart(battleState, logs) {
    const battlefield = ensureBattlefield(battleState);
    const log = (message) => {
      logs.push({
        turn: battleState.turnNumber,
        actor: 'Battlefield',
        action: message,
        result: '',
        synergyTriggered: false
      });
    };

    if (battlefield.weather) {
      const weatherDef = WeatherRegistry[battlefield.weather];
      weatherDef?.onTurnStart?.({
        log,
        allPokemon: [this.playerPokemon, this.enemyPokemon],
        battlefield
      });
      if (battlefield.weatherDuration > 0) {
        battlefield.weatherDuration -= 1;
        if (battlefield.weatherDuration === 0) {
          log(`${weatherDef?.name || 'The weather'} faded.`);
          battlefield.weather = null;
        }
      }
    }

    if (battlefield.terrain) {
      const terrainDef = TerrainRegistry[battlefield.terrain];
      terrainDef?.onTurnStart?.({
        log,
        allPokemon: [this.playerPokemon, this.enemyPokemon],
        battlefield
      });
      if (battlefield.terrainDuration > 0) {
        battlefield.terrainDuration -= 1;
        if (battlefield.terrainDuration === 0) {
          log(`${terrainDef?.name || 'The terrain'} faded.`);
          battlefield.terrain = null;
        }
      }
    }

    ['playerSide', 'enemySide'].forEach((sideKey) => {
      const updatedScreens = [];
      battlefield.screens[sideKey].forEach((screen) => {
        const screenObj = typeof screen === 'string'
          ? { id: screen, duration: ScreenRegistry[screen]?.duration ?? 0 }
          : screen;
        const nextDuration = screenObj.duration - 1;
        if (nextDuration > 0) {
          updatedScreens.push({ ...screenObj, duration: nextDuration });
        } else {
          const screenName = ScreenRegistry[screenObj.id]?.name || screenObj.id;
          const owner = sideKey === 'playerSide' ? 'Your' : 'Enemy';
          log(`${owner} ${screenName} wore off.`);
        }
      });
      battlefield.screens[sideKey] = updatedScreens;
    });

    if (this.playerPokemon.currentHp !== undefined) {
      battleState.playerHP = Math.min(
        battleState.playerPokemon?.stats?.maxHp ?? this.playerPokemon.stats?.maxHp ?? battleState.playerHP,
        this.playerPokemon.currentHp
      );
    }
    if (this.enemyPokemon.currentHp !== undefined) {
      battleState.enemyHP = Math.min(
        battleState.enemyPokemon?.stats?.maxHp ?? this.enemyPokemon.stats?.maxHp ?? battleState.enemyHP,
        this.enemyPokemon.currentHp
      );
    }
  }

  // Execute a full turn
  executeTurn(playerMove, enemyMove, battleState) {
    const turnLog = [];
    const turnOrder = this.determineTurnOrder(playerMove, enemyMove);
    ensureBattlefield(battleState);
    
    // Track stat changes for Echo Thread support
    if (!battleState.lastTurnStatChanges) {
      battleState.lastTurnStatChanges = { player: [], enemy: [] };
    }
    battleState.currentTurnStatChanges = { player: [], enemy: [] };

    this.playerPokemon.currentHp = battleState.playerHP;
    this.enemyPokemon.currentHp = battleState.enemyHP;
    this.processBattlefieldTurnStart(battleState, turnLog);

    // Process status effects at turn start
    const addLog = (message) => turnLog.push({
      turn: battleState.turnNumber,
      actor: 'Status',
      action: message,
      result: '',
      synergyTriggered: false
    });
    
    processStatusEffects(this.playerPokemon, battleState, addLog);
    processStatusEffects(this.enemyPokemon, battleState, addLog);
    battleState.playerHP = this.playerPokemon.currentHp;
    battleState.enemyHP = this.enemyPokemon.currentHp;

    // Process passive effects at turn start
    const playerPassiveLogs = this.processPassiveEffects(this.playerPokemon, 'player', battleState);
    const enemyPassiveLogs = this.processPassiveEffects(this.enemyPokemon, 'enemy', battleState);
    turnLog.push(...playerPassiveLogs, ...enemyPassiveLogs);

    // Trigger onTurnStart talents
    triggerTalent('onTurnStart', this.createTalentContext(battleState, turnLog));

    const firstAttacker = turnOrder === 'player' ? 
      { pokemon: this.playerPokemon, move: playerMove, key: 'player' } :
      { pokemon: this.enemyPokemon, move: enemyMove, key: 'enemy' };
    
    const secondAttacker = turnOrder === 'player' ?
      { pokemon: this.enemyPokemon, move: enemyMove, key: 'enemy' } :
      { pokemon: this.playerPokemon, move: playerMove, key: 'player' };

    // First attack
    const firstResult = this.executeMove(firstAttacker, secondAttacker, battleState);
    turnLog.push(...firstResult.logs);

    // Check if second attacker is still alive
    const secondHP = secondAttacker.key === 'player' ? battleState.playerHP : battleState.enemyHP;
    if (secondHP > 0) {
      const secondResult = this.executeMove(secondAttacker, firstAttacker, battleState);
      turnLog.push(...secondResult.logs);
    }

    // Process turn-end effects
    const endEffects = this.processTurnEndEffects(battleState);
    endEffects.forEach(effect => {
      turnLog.push({
        turn: battleState.turnNumber,
        actor: effect.target === 'player' ? this.playerPokemon.species : this.enemyPokemon.species,
        action: `is hurt by ${effect.effect}`,
        result: `${effect.damage} damage`,
        synergyTriggered: false
      });
    });

    battleState.lastTurnStatChanges = battleState.currentTurnStatChanges;
    battleState.playerPokemon = this.playerPokemon;
    battleState.enemyPokemon = this.enemyPokemon;

    return turnLog;
  }

  // Execute a single move
  executeMove(attacker, defender, battleState) {
    const logs = [];
    
    // Check if status prevents action
    const addLog = (message) => logs.push({
      turn: battleState.turnNumber,
      actor: attacker.pokemon.nickname || attacker.pokemon.species,
      action: 'Status',
      result: message,
      synergyTriggered: false
    });
    
    if (checkStatusPreventsAction(attacker.pokemon, addLog)) {
      return { logs };
    }
    
    // Get move data from central registry
    const move = typeof attacker.move === 'string' 
      ? getMoveData(attacker.move, attacker.pokemon) 
      : (attacker.move?.name ? getMoveData(attacker.move.name, attacker.pokemon) : attacker.move);
    
    if (!move) {
      logs.push({
        turn: battleState.turnNumber,
        actor: attacker.pokemon.nickname || attacker.pokemon.species,
        action: 'Error',
        result: 'Move data not found',
        synergyTriggered: false
      });
      return { logs };
    }
    
    // Check accuracy (never-miss moves skip this)
    if (!move.neverMiss && move.accuracy) {
      const accuracyStage = getStatStageValue(attacker.pokemon.statStages, 'Accuracy');
      const evasionStage = getStatStageValue(defender.pokemon.statStages, 'Evasion');
      const accuracyModifier = getStatModifier(accuracyStage);
      const evasionModifier = getStatModifier(evasionStage);
      const adjustedAccuracy = Math.min(100, Math.max(1, move.accuracy * (accuracyModifier / evasionModifier)));
      const accuracyRoll = Math.random() * 100;
      if (accuracyRoll > adjustedAccuracy) {
        logs.push({
          turn: battleState.turnNumber,
          actor: attacker.pokemon.nickname || attacker.pokemon.species,
          action: `used ${move.name}`,
          result: 'but it missed!',
          synergyTriggered: false
        });
        triggerTalent('onMoveUse', this.createTalentContext(battleState, logs, {
          attacker: attacker.pokemon,
          target: defender.pokemon,
          move
        }));
        return { logs };
      }
    }

    // Check for synergies
    const synergies = this.checkSynergies(attacker.pokemon, move, defender.pokemon);
    const hasSynergy = synergies.length > 0;

    // Apply onContactReceived talents for physical moves
    // Calculate damage
    const damageResult = this.calculateDamage(attacker.pokemon, defender.pokemon, move, synergies, battleState, defender.key);
    const damage = damageResult.damage || damageResult;
    const isCritical = damageResult.isCritical || false;
    const typeEffectiveness = damageResult?.typeEffectiveness !== undefined ? damageResult.typeEffectiveness : 1;
    
    if (damage > 0) {
      if (defender.key === 'player') {
        battleState.playerHP = Math.max(0, battleState.playerHP - damage);
        defender.pokemon.currentHp = battleState.playerHP;
      } else {
        battleState.enemyHP = Math.max(0, battleState.enemyHP - damage);
        defender.pokemon.currentHp = battleState.enemyHP;
      }

      let resultText = `${damage} damage!`;
      if (isCritical) resultText += ' Critical hit!';
      if (typeEffectiveness > 1) resultText += ' Super effective!';
      if (typeEffectiveness < 1 && typeEffectiveness > 0) resultText += ' Not very effective...';
      if (typeEffectiveness === 0) resultText = "It doesn't affect " + (defender.pokemon.nickname || defender.pokemon.species) + "...";

      logs.push({
        turn: battleState.turnNumber,
        actor: attacker.pokemon.nickname || attacker.pokemon.species,
        action: `used ${move.name}`,
        result: resultText,
        synergyTriggered: hasSynergy
      });

      // Apply onContactReceived talents for physical moves
      if (move.category === 'Physical') {
        triggerTalent('onContactReceived', this.createTalentContext(battleState, logs, {
          attacker: attacker.pokemon,
          target: defender.pokemon,
          move
        }));
      }

      // Trigger onElementHit talents for super effective moves
      if (typeEffectiveness > 1) {
        triggerTalent('onElementHit', this.createTalentContext(battleState, logs, {
          attacker: attacker.pokemon,
          target: defender.pokemon,
          typeEffectiveness
        }));
      }

      // Trigger onHit talents
      triggerTalent('onHit', this.createTalentContext(battleState, logs, {
        attacker: attacker.pokemon,
        target: defender.pokemon,
        damage
      }));
      
      // Check for faint and trigger onFaintCheck
      if (defender.key === 'player' && battleState.playerHP <= 0) {
        triggerTalent('onFaintCheck', this.createTalentContext(battleState, logs, {
          user: defender.pokemon
        }));
        
        // Check if survived
        if (defender.pokemon.currentHp > 0) {
          if (defender.key === 'player') battleState.playerHP = 1;
          else battleState.enemyHP = 1;
        } else {
          // Trigger onKill for attacker
          triggerTalent('onKill', this.createTalentContext(battleState, logs, {
            attacker: attacker.pokemon,
            target: defender.pokemon
          }));
        }
      } else if (defender.key === 'enemy' && battleState.enemyHP <= 0) {
        triggerTalent('onFaintCheck', this.createTalentContext(battleState, logs, {
          user: defender.pokemon
        }));
        
        if (defender.pokemon.currentHp > 0) {
          if (defender.key === 'player') battleState.playerHP = 1;
          else battleState.enemyHP = 1;
        } else {
          triggerTalent('onKill', this.createTalentContext(battleState, logs, {
            attacker: attacker.pokemon,
            target: defender.pokemon
          }));
        }
      }
    } else {
      logs.push({
        turn: battleState.turnNumber,
        actor: attacker.pokemon.nickname || attacker.pokemon.species,
        action: `used ${move.name}`,
        result: typeEffectiveness === 0 ? "It doesn't affect " + (defender.pokemon.nickname || defender.pokemon.species) + "..." : '',
        synergyTriggered: hasSynergy
      });
    }

    // Log synergy activations
    if (hasSynergy) {
      synergies.forEach(synergy => {
        logs.push({
          turn: battleState.turnNumber,
          actor: 'Synergy',
          action: `${synergy.requirement} synergy activated`,
          result: synergy.bonus,
          synergyTriggered: true
        });
      });
      battleState.synergyChains = (battleState.synergyChains || 0) + 1;
    }

    // Apply move effects from central move data
    if (move.effect && move.effectChance) {
      if (Math.random() * 100 < move.effectChance) {
        if (move.effect === 'burn' || move.effect === 'poison' || move.effect === 'paralysis') {
          const statusResult = this.applyStatusEffect(defender.pokemon, move.effect, battleState);
          if (statusResult.success) {
            logs.push({
              turn: battleState.turnNumber,
              actor: defender.pokemon.nickname || defender.pokemon.species,
              action: `is now ${statusResult.status}`,
              result: '',
              synergyTriggered: false
            });
          }
        }
      }
    }

    // Apply centralized move effects from MoveEffectRegistry
    const moveEffectContext = {
      user: attacker.pokemon,
      target: defender.pokemon,
      move,
      battle: battleState,
      userTeam: { addAura: () => {} }, // Placeholder for team effects
      targetTeam: { addAura: () => {} },
      addBattleLog: (message) => {
        logs.push({
          turn: battleState.turnNumber,
          actor: attacker.pokemon.nickname || attacker.pokemon.species,
          action: 'effect',
          result: message,
          synergyTriggered: false
        });
      },
      target: {
        ...defender.pokemon,
        modifyStat: (stat, stages) => {
          const changeResult = this.applyStatChange(defender.pokemon, stat, stages, battleState);
          if (changeResult.actualChange !== 0) {
            battleState.currentTurnStatChanges[defender.key] = battleState.currentTurnStatChanges[defender.key] || [];
            battleState.currentTurnStatChanges[defender.key].push({
              stat: normalizeStatStageKey(stat),
              stages: changeResult.actualChange
            });
          }
          const message = this.formatStatStageLogMessage(stat, stages, changeResult.actualChange);
          logs.push({
            turn: battleState.turnNumber,
            actor: this.getPossessiveName(defender.pokemon),
            action: message,
            result: '',
            synergyTriggered: false
          });
        },
        inflictEffect: (effectName, params) => {
          logs.push({
            turn: battleState.turnNumber,
            actor: defender.pokemon.nickname || defender.pokemon.species,
            action: `is ${effectName}`,
            result: `Duration: ${params.turns} turns`,
            synergyTriggered: false
          });
        },
        inflictDOT: (dotName, params) => {
          logs.push({
            turn: battleState.turnNumber,
            actor: defender.pokemon.nickname || defender.pokemon.species,
            action: `is afflicted with ${dotName}`,
            result: `${params.damage} damage per turn`,
            synergyTriggered: false
          });
        },
        inflictStatus: (status) => {
          const statusResult = this.applyStatusEffect(defender.pokemon, status, battleState);
          if (statusResult.success) {
            logs.push({
              turn: battleState.turnNumber,
              actor: defender.pokemon.nickname || defender.pokemon.species,
              action: `is now ${statusResult.status}`,
              result: '',
              synergyTriggered: false
            });
          }
        },
        heldItem: defender.pokemon.heldItems?.[0] || null,
        lastStatChanges: battleState.lastTurnStatChanges?.[defender.key] || []
      },
      user: {
        ...attacker.pokemon,
        modifyStat: (stat, stages) => {
          const changeResult = this.applyStatChange(attacker.pokemon, stat, stages, battleState);
          if (changeResult.actualChange !== 0) {
            battleState.currentTurnStatChanges[attacker.key] = battleState.currentTurnStatChanges[attacker.key] || [];
            battleState.currentTurnStatChanges[attacker.key].push({
              stat: normalizeStatStageKey(stat),
              stages: changeResult.actualChange
            });
          }
          const message = this.formatStatStageLogMessage(stat, stages, changeResult.actualChange);
          logs.push({
            turn: battleState.turnNumber,
            actor: this.getPossessiveName(attacker.pokemon),
            action: message,
            result: '',
            synergyTriggered: false
          });
        },
        consumeItemEffect: (item) => {
          logs.push({
            turn: battleState.turnNumber,
            actor: attacker.pokemon.nickname || attacker.pokemon.species,
            action: 'consumed',
            result: `${item.name}'s effect`,
            synergyTriggered: false
          });
        },
        changeType: (newType) => {
          attacker.pokemon.type1 = newType;
          logs.push({
            turn: battleState.turnNumber,
            actor: attacker.pokemon.nickname || attacker.pokemon.species,
            action: 'changed type to',
            result: newType,
            synergyTriggered: false
          });
        }
      },
      battle: {
        getTerrainType: () => battleState.battlefield?.terrain || battleState.terrain || "normal"
      }
    };
    
    applyMoveEffect(move.name, moveEffectContext);

    // Handle special move effects (legacy support)
    if (move.effect) {
      if (move.effect === 'setTerrain' && move.terrain) {
        const battlefield = ensureBattlefield(battleState);
        const terrainDef = TerrainRegistry[move.terrain];
        battlefield.terrain = move.terrain;
        battlefield.terrainDuration = move.duration || terrainDef?.duration || 5;
        logs.push({
          turn: battleState.turnNumber,
          actor: attacker.pokemon.nickname || attacker.pokemon.species,
          action: 'Terrain',
          result: `${terrainDef?.name || move.terrain} took hold!`,
          synergyTriggered: false
        });
      } else if (move.effect === 'weather' && move.weather) {
        const battlefield = ensureBattlefield(battleState);
        const weatherId = move.weather === 'sun' ? 'sunny' : move.weather;
        const weatherDef = WeatherRegistry[weatherId];
        battlefield.weather = weatherId;
        battlefield.weatherDuration = move.duration || weatherDef?.duration || 5;
        logs.push({
          turn: battleState.turnNumber,
          actor: attacker.pokemon.nickname || attacker.pokemon.species,
          action: 'Weather',
          result: `${weatherDef?.name || weatherId} began!`,
          synergyTriggered: false
        });
      } else if (move.effect === 'setScreen' && move.screen) {
        const battlefield = ensureBattlefield(battleState);
        const sideKey = attacker.key === 'player' ? 'playerSide' : 'enemySide';
        const screenDef = ScreenRegistry[move.screen];
        const existingIndex = battlefield.screens[sideKey].findIndex((screen) => {
          const screenId = typeof screen === 'string' ? screen : screen.id;
          return screenId === move.screen;
        });
        const duration = move.duration || screenDef?.duration || 5;
        if (existingIndex >= 0) {
          battlefield.screens[sideKey][existingIndex] = { id: move.screen, duration };
        } else {
          battlefield.screens[sideKey].push({ id: move.screen, duration });
        }
        logs.push({
          turn: battleState.turnNumber,
          actor: attacker.pokemon.nickname || attacker.pokemon.species,
          action: 'Screen',
          result: `${screenDef?.name || move.screen} protected the ${sideKey === 'playerSide' ? 'team' : 'foes'}!`,
          synergyTriggered: false
        });
      } else if (move.effect === 'breakScreens') {
        const battlefield = ensureBattlefield(battleState);
        const targetSide = attacker.key === 'player' ? 'enemySide' : 'playerSide';
        battlefield.screens[targetSide] = [];
        logs.push({
          turn: battleState.turnNumber,
          actor: attacker.pokemon.nickname || attacker.pokemon.species,
          action: 'Screens',
          result: 'Barrier effects were shattered!',
          synergyTriggered: false
        });
      } else if (move.effect === 'removeHazards') {
        const battlefield = ensureBattlefield(battleState);
        const sideKey = attacker.key === 'player' ? 'playerSide' : 'enemySide';
        battlefield.hazards[sideKey] = [];
        logs.push({
          turn: battleState.turnNumber,
          actor: attacker.pokemon.nickname || attacker.pokemon.species,
          action: 'Hazards',
          result: 'Entry hazards were cleared!',
          synergyTriggered: false
        });
      }

      // Echo Thread - copy last turn's stat changes
      if (move.effect.copyLastStatChanges) {
        const targetKey = defender.key;
        const lastChanges = battleState.lastTurnStatChanges?.[targetKey] || [];
        
        if (lastChanges.length > 0) {
          lastChanges.forEach(change => {
            const changeResult = this.applyStatChange(defender.pokemon, change.stat, change.stages, battleState);
            const message = this.formatStatStageLogMessage(change.stat, change.stages, changeResult.actualChange);
            logs.push({
              turn: battleState.turnNumber,
              actor: attacker.pokemon.nickname || attacker.pokemon.species,
              action: `Echo Thread mimicked`,
              result: message,
              synergyTriggered: false
            });
          });
        } else {
          logs.push({
            turn: battleState.turnNumber,
            actor: attacker.pokemon.nickname || attacker.pokemon.species,
            action: `used ${move.name}`,
            result: 'but it failed!',
            synergyTriggered: false
          });
        }
      }
      // Trap effects (Infestation)
      else if (move.effect.trap) {
        logs.push({
          turn: battleState.turnNumber,
          actor: defender.pokemon.nickname || defender.pokemon.species,
          action: 'is trapped',
          result: `Cannot switch out for ${move.effect.duration} turns`,
          synergyTriggered: false
        });
      }
      // Stat changes from move data
      else if (move.effect.targetStatChange) {
        const statChanges = move.effect.targetStatChange;
        Object.entries(statChanges).forEach(([stat, stages]) => {
          const stagesValue = typeof stages === 'number' ? stages : 0;
          const normalizedStat = normalizeStatStageKey(stat);
          const changeResult = this.applyStatChange(defender.pokemon, normalizedStat, stagesValue, battleState);
          
          // Track for Echo Thread
          if (changeResult.actualChange !== 0) {
            battleState.currentTurnStatChanges[defender.key] = battleState.currentTurnStatChanges[defender.key] || [];
            battleState.currentTurnStatChanges[defender.key].push({
              stat: normalizedStat,
              stages: changeResult.actualChange
            });
          }
          
          const message = this.formatStatStageLogMessage(stat, stagesValue, changeResult.actualChange);
          logs.push({
            turn: battleState.turnNumber,
            actor: this.getPossessiveName(defender.pokemon),
            action: message,
            result: '',
            synergyTriggered: false
          });
        });
      }
      else if (move.effect.selfStatChange) {
        const statChanges = move.effect.selfStatChange;
        Object.entries(statChanges).forEach(([stat, stages]) => {
          const normalizedStat = normalizeStatStageKey(stat);
          const changeResult = this.applyStatChange(attacker.pokemon, normalizedStat, stages, battleState);
          if (changeResult.actualChange !== 0) {
            battleState.currentTurnStatChanges[attacker.key] = battleState.currentTurnStatChanges[attacker.key] || [];
            battleState.currentTurnStatChanges[attacker.key].push({
              stat: normalizedStat,
              stages: changeResult.actualChange
            });
          }
          const message = this.formatStatStageLogMessage(stat, stages, changeResult.actualChange);
          
          logs.push({
            turn: battleState.turnNumber,
            actor: this.getPossessiveName(attacker.pokemon),
            action: message,
            result: '',
            synergyTriggered: false
          });
        });
      }
      // Legacy stat change format
      else if (move.effect.includes && (move.effect.includes('lower') || move.effect.includes('raise'))) {
        const target = defender.pokemon;
        const stages = move.stages || 1;
        const isRaise = move.effect.includes('raise');
        const statMap = {
          'lowerAttack': 'Attack',
          'raiseAttack': 'Attack',
          'lowerDefense': 'Defense',
          'raiseDefense': 'Defense',
          'lowerSpeed': 'Speed',
          'raiseSpeed': 'Speed',
          'lowerSpDef': 'Sp. Def',
          'raiseSpDef': 'Sp. Def'
        };
        
        const stat = statMap[move.effect];
        if (stat) {
          const stageValue = isRaise ? stages : -stages;
          const changeResult = this.applyStatChange(target, stat, stageValue, battleState);
          if (changeResult.actualChange !== 0) {
            battleState.currentTurnStatChanges[defender.key] = battleState.currentTurnStatChanges[defender.key] || [];
            battleState.currentTurnStatChanges[defender.key].push({ stat, stages: changeResult.actualChange });
          }
          const message = this.formatStatStageLogMessage(stat, stageValue, changeResult.actualChange);
          logs.push({
            turn: battleState.turnNumber,
            actor: this.getPossessiveName(target),
            action: message,
            result: '',
            synergyTriggered: false
          });
        }
      }
    }

    // Trigger onMoveUse talents after move execution
    triggerTalent('onMoveUse', this.createTalentContext(battleState, logs, {
      attacker: attacker.pokemon,
      target: defender.pokemon,
      move
    }));

    return { logs };
  }
}
