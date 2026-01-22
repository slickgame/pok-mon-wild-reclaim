import { getPokemonStats } from '../pokemon/usePokemonStats';
import { getMoveData } from '@/components/pokemon/moveData';

// Battle Engine - Core logic for turn-based combat
// INTEGRATION: Uses centralized MOVE_DATA for all move metadata
export class BattleEngine {
  constructor(playerPokemon, enemyPokemon) {
    // Ensure stats are calculated dynamically from base stats
    this.playerPokemon = getPokemonStats(playerPokemon);
    this.enemyPokemon = getPokemonStats(enemyPokemon);
  }

  // Calculate turn order based on Speed stat and priority
  determineTurnOrder(playerMove, enemyMove) {
    // Get move data from central registry
    const playerMoveData = typeof playerMove === 'string' ? getMoveData(playerMove) : (getMoveData(playerMove?.name) || playerMove);
    const enemyMoveData = typeof enemyMove === 'string' ? getMoveData(enemyMove) : (getMoveData(enemyMove?.name) || enemyMove);
    
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
    const playerSpeed = this.playerPokemon.stats.spd;
    const enemySpeed = this.enemyPokemon.stats.spd;

    return playerSpeed >= enemySpeed ? 'player' : 'enemy';
  }

  // Check for synergy effects
  checkSynergies(attacker, move, defender) {
    const synergies = [];
    
    // Get move data from central registry
    const moveData = typeof move === 'string' ? getMoveData(move) : (getMoveData(move?.name) || move);

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

  // Calculate damage
  calculateDamage(attacker, defender, move, synergies = []) {
    // Get move data from central registry
    const moveData = typeof move === 'string' ? getMoveData(move) : (getMoveData(move?.name) || move);
    
    if (!moveData) {
      console.warn('Move data not found:', move);
      return 0;
    }
    
    if (moveData.category === 'Status') return 0;

    const basePower = moveData.power || 50;
    const attackStat = moveData.category === 'Physical' ? attacker.stats.atk : attacker.stats.spAtk;
    const defenseStat = moveData.category === 'Physical' ? defender.stats.def : defender.stats.spDef;
    
    // Base damage calculation
    let damage = Math.floor(
      ((2 * attacker.level / 5 + 2) * basePower * (attackStat / defenseStat)) / 50 + 2
    );

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

    // Random factor (85-100%)
    const randomFactor = (Math.random() * 0.15 + 0.85);
    damage = Math.floor(damage * randomFactor);

    // Check for Talent defensive effects
    const defenderTalents = defender.talents || [];
    defenderTalents.forEach(talent => {
      if (talent.name === 'Sticky Shield') {
        damage = Math.floor(damage * 0.8);
      }
    });

    return Math.max(1, damage);
  }

  // Apply status effects
  applyStatusEffect(target, effect, battleState) {
    const statusEffects = {
      burn: { name: 'Burn', damagePerTurn: 0.0625, reducesAttack: true },
      paralysis: { name: 'Paralysis', speedReduction: 0.5, chanceOfFullParalysis: 0.25 },
      poison: { name: 'Poison', damagePerTurn: 0.0625 },
      sleep: { name: 'Sleep', turnDuration: Math.floor(Math.random() * 3) + 1 },
      freeze: { name: 'Freeze', chanceOfThaw: 0.2 },
      confusion: { name: 'Confusion', turnDuration: Math.floor(Math.random() * 4) + 1 }
    };

    const statusEffect = statusEffects[effect];
    if (statusEffect) {
      // Check if target is already affected by a primary status
      const targetState = target === this.playerPokemon ? battleState.playerStatus : battleState.enemyStatus;
      
      if (!targetState.conditions.includes(statusEffect.name)) {
        targetState.conditions.push(statusEffect.name);
        return { success: true, status: statusEffect.name };
      }
    }

    return { success: false };
  }

  // Apply buffs/debuffs
  applyStatChange(target, stat, stages, battleState) {
    const targetState = target === this.playerPokemon ? battleState.playerStatus : battleState.enemyStatus;
    
    const existingBuff = targetState.buffs.find(b => b.stat === stat);
    if (existingBuff) {
      existingBuff.value = Math.max(-6, Math.min(6, existingBuff.value + stages));
    } else {
      targetState.buffs.push({ name: `${stat} ${stages > 0 ? '+' : ''}${stages}`, stat, value: stages });
    }

    return { stat, stages };
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

  // Execute a full turn
  executeTurn(playerMove, enemyMove, battleState) {
    const turnLog = [];
    const turnOrder = this.determineTurnOrder(playerMove, enemyMove);

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

    return turnLog;
  }

  // Execute a single move
  executeMove(attacker, defender, battleState) {
    const logs = [];
    
    // Get move data from central registry
    const move = typeof attacker.move === 'string' ? getMoveData(attacker.move) : (getMoveData(attacker.move?.name) || attacker.move);
    
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
      const accuracyRoll = Math.random() * 100;
      if (accuracyRoll > move.accuracy) {
        logs.push({
          turn: battleState.turnNumber,
          actor: attacker.pokemon.nickname || attacker.pokemon.species,
          action: `used ${move.name}`,
          result: 'but it missed!',
          synergyTriggered: false
        });
        return { logs };
      }
    }

    // Check for synergies
    const synergies = this.checkSynergies(attacker.pokemon, move, defender.pokemon);
    const hasSynergy = synergies.length > 0;

    // Calculate damage
    const damage = this.calculateDamage(attacker.pokemon, defender.pokemon, move, synergies);
    
    if (damage > 0) {
      if (defender.key === 'player') {
        battleState.playerHP = Math.max(0, battleState.playerHP - damage);
      } else {
        battleState.enemyHP = Math.max(0, battleState.enemyHP - damage);
      }

      logs.push({
        turn: battleState.turnNumber,
        actor: attacker.pokemon.nickname || attacker.pokemon.species,
        action: `used ${move.name}`,
        result: `${damage} damage!`,
        synergyTriggered: hasSynergy
      });
    } else {
      logs.push({
        turn: battleState.turnNumber,
        actor: attacker.pokemon.nickname || attacker.pokemon.species,
        action: `used ${move.name}`,
        result: '',
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

    // Apply stat changes
    if (move.effect && move.effect.includes('lower') || move.effect && move.effect.includes('raise')) {
      const target = defender.pokemon;
      const stages = move.stages || 1;
      const isRaise = move.effect.includes('raise');
      const statMap = {
        'lowerAttack': 'atk',
        'raiseAttack': 'atk',
        'lowerDefense': 'def',
        'raiseDefense': 'def',
        'lowerSpeed': 'spd',
        'raiseSpeed': 'spd',
        'lowerSpDef': 'spDef',
        'raiseSpDef': 'spDef'
      };
      
      const stat = statMap[move.effect];
      if (stat) {
        this.applyStatChange(target, stat, isRaise ? stages : -stages, battleState);
        logs.push({
          turn: battleState.turnNumber,
          actor: target.nickname || target.species,
          action: isRaise ? 'gained' : 'lost',
          result: `${stat} ${isRaise ? '+' : ''}${isRaise ? stages : -stages}`,
          synergyTriggered: false
        });
      }
    }

    return { logs };
  }
}