import { getPokemonStats } from '../pokemon/usePokemonStats';
import { getMoveData } from '@/components/utils/getMoveData';
import { TalentRegistry } from '@/components/data/TalentRegistry';
import { normalizeTalentGrade } from '@/components/utils/talentUtils';

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
    const playerSpeed = this.playerPokemon.stats.spd;
    const enemySpeed = this.enemyPokemon.stats.spd;

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

  // Calculate damage
  calculateDamage(attacker, defender, move, synergies = []) {
    // Get move data from central registry
    const moveData = typeof move === 'string' 
      ? getMoveData(move, attacker) 
      : (move?.name ? getMoveData(move.name, attacker) : move);
    
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

  // Apply talent effects based on trigger
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

  // Execute a full turn
  executeTurn(playerMove, enemyMove, battleState) {
    const turnLog = [];
    const turnOrder = this.determineTurnOrder(playerMove, enemyMove);
    
    // Track stat changes for Echo Thread support
    if (!battleState.lastTurnStatChanges) {
      battleState.lastTurnStatChanges = { player: [], enemy: [] };
    }

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

    // Apply onContact talents
    if (move.category === 'Physical') {
      const contactTalents = this.applyTalentEffects(attacker.pokemon, 'onContact', { 
        attacker: attacker.pokemon, 
        defender: defender.pokemon,
        move 
      });
      
      contactTalents.forEach(({ talent, gradeData }) => {
        logs.push({
          turn: battleState.turnNumber,
          actor: attacker.pokemon.nickname || attacker.pokemon.species,
          action: `${talent.name} activated`,
          result: talent.description,
          synergyTriggered: true
        });
      });
    }

    // Calculate damage
    const damageResult = this.calculateDamage(attacker.pokemon, defender.pokemon, move, synergies);
    const damage = damageResult.damage || damageResult;
    const isCritical = damageResult.isCritical || false;
    const typeEffectiveness = damageResult.typeEffectiveness !== undefined ? damageResult.typeEffectiveness : 1;
    
    if (damage > 0) {
      if (defender.key === 'player') {
        battleState.playerHP = Math.max(0, battleState.playerHP - damage);
      } else {
        battleState.enemyHP = Math.max(0, battleState.enemyHP - damage);
      }

      // Apply onHit talents for defender
      const hitTalents = this.applyTalentEffects(defender.pokemon, 'onHit', {
        attacker: attacker.pokemon,
        defender: defender.pokemon,
        damage
      });

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

      // Log onHit talent activations
      hitTalents.forEach(({ talent }) => {
        logs.push({
          turn: battleState.turnNumber,
          actor: defender.pokemon.nickname || defender.pokemon.species,
          action: `${talent.name} activated`,
          result: talent.description,
          synergyTriggered: true
        });
      });
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

    // Handle special move effects
    if (move.effect) {
      // Echo Thread - copy last turn's stat changes
      if (move.effect.copyLastStatChanges) {
        const targetKey = defender.key;
        const lastChanges = battleState.lastTurnStatChanges?.[targetKey] || [];
        
        if (lastChanges.length > 0) {
          lastChanges.forEach(change => {
            this.applyStatChange(defender.pokemon, change.stat, change.stages, battleState);
            logs.push({
              turn: battleState.turnNumber,
              actor: attacker.pokemon.nickname || attacker.pokemon.species,
              action: `Echo Thread mimicked`,
              result: `${change.stat} ${change.stages > 0 ? '+' : ''}${change.stages}`,
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
          const statKey = stat === 'Speed' ? 'spd' : stat.toLowerCase();
          this.applyStatChange(defender.pokemon, statKey, stages, battleState);
          
          // Track for Echo Thread
          if (!battleState.lastTurnStatChanges) battleState.lastTurnStatChanges = { player: [], enemy: [] };
          battleState.lastTurnStatChanges[defender.key] = battleState.lastTurnStatChanges[defender.key] || [];
          battleState.lastTurnStatChanges[defender.key].push({ stat: statKey, stages });
          
          logs.push({
            turn: battleState.turnNumber,
            actor: defender.pokemon.nickname || defender.pokemon.species,
            action: stages > 0 ? 'gained' : 'lost',
            result: `${stat} ${stages > 0 ? '+' : ''}${stages}`,
            synergyTriggered: false
          });
        });
      }
      else if (move.effect.selfStatChange) {
        const statChanges = move.effect.selfStatChange;
        Object.entries(statChanges).forEach(([stat, stages]) => {
          const statKey = stat === 'Defense' ? 'def' : stat === 'SpDefense' ? 'spDef' : stat.toLowerCase();
          this.applyStatChange(attacker.pokemon, statKey, stages, battleState);
          
          logs.push({
            turn: battleState.turnNumber,
            actor: attacker.pokemon.nickname || attacker.pokemon.species,
            action: 'boosted',
            result: `${stat} +${stages}`,
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
    }

    return { logs };
  }
}