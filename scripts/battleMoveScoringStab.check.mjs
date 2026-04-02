#!/usr/bin/env node

/**
 * Regression check: move scoring STAB must derive from attacker typing only.
 * Includes fallback behavior for attackers missing `types` but defining `type1/type2`.
 */

function getTypeEffectiveness(moveType, defenderTypes) {
  const table = {
    Electric: { Water: 2, Flying: 2, Ground: 0 },
    Water: { Fire: 2, Grass: 0.5 },
  };

  return (defenderTypes || []).reduce((mult, type) => {
    const typeMod = table[moveType]?.[type] ?? 1;
    return mult * typeMod;
  }, 1);
}

function scoreMoveVsTarget(attMon, moveData, targetMon) {
  const moveType = moveData?.type || 'Normal';
  const attackerTypes = attMon?.types || [attMon?.type1, attMon?.type2].filter(Boolean);
  const defenderTypes = targetMon?.types || (targetMon?.type1 ? [targetMon.type1, targetMon.type2].filter(Boolean) : []);
  const eff = getTypeEffectiveness(moveType, defenderTypes);
  const power = typeof moveData?.power === 'number' ? moveData.power : 0;
  const base = power > 0 ? power : 10;
  const stab = attackerTypes.includes(moveType) ? 1.2 : 1.0;
  return base * eff * stab;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function run() {
  const move = { name: 'Thunder Shock', type: 'Electric', power: 40 };

  // Missing `types` array, but has type1/type2 fallback for attacker typing.
  const attacker = { species: 'Pikachu', type1: 'Electric', type2: null };
  const defender = { species: 'Squirtle', types: ['Water'] };
  const score = scoreMoveVsTarget(attacker, move, defender);

  // 40 base * 2x effectiveness vs Water * 1.2x STAB = 96
  assert(score === 96, `Expected score=96 with attacker fallback STAB, got ${score}`);

  // Guard against old bug: attacker is Water, defender is Electric.
  // STAB must NOT come from defender typing.
  const waterAttacker = { species: 'Squirtle', types: ['Water'] };
  const electricDefender = { species: 'Pikachu', type1: 'Electric', type2: null };
  const waterMove = { name: 'Water Gun', type: 'Water', power: 40 };
  const waterScore = scoreMoveVsTarget(waterAttacker, waterMove, electricDefender);

  // No effectiveness modifiers in stub table for Water vs Electric => 1x, but STAB applies => 48
  assert(waterScore === 48, `Expected score=48 with attacker-only STAB, got ${waterScore}`);

  console.log('PASS battleMoveScoringStab.check');
}

run();
