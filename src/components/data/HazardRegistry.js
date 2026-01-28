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

const getTypeEffectiveness = (moveType, defenderTypes) => {
  let multiplier = 1;
  const chart = typeChart[moveType];
  if (!chart) return multiplier;

  defenderTypes.forEach((defType) => {
    if (chart.noEffect?.includes(defType)) {
      multiplier = 0;
    } else if (chart.superEffective?.includes(defType)) {
      multiplier *= 2;
    } else if (chart.notVeryEffective?.includes(defType)) {
      multiplier *= 0.5;
    }
  });

  return multiplier;
};

const getMaxHp = (mon) => mon.stats?.maxHp ?? mon.maxHP ?? mon.maxHp ?? 0;

export const HazardRegistry = {
  spikes: {
    name: 'Spikes',
    apply: ({ side }) => {
      if (!side.hazards.includes('spikes')) side.hazards.push('spikes');
    },
    onSwitchIn: ({ mon, applyDamage, addBattleLog }) => {
      const maxHp = getMaxHp(mon);
      const damage = Math.floor(maxHp / 8);
      applyDamage(damage);
      addBattleLog(`${mon.nickname || mon.species} was hit by Spikes!`);
    }
  },
  toxicSpikes: {
    name: 'Toxic Spikes',
    apply: ({ side }) => {
      if (!side.hazards.includes('toxicSpikes')) side.hazards.push('toxicSpikes');
    },
    onSwitchIn: ({ mon, inflictStatus, addBattleLog }) => {
      const success = inflictStatus('poison');
      if (success) {
        addBattleLog(`${mon.nickname || mon.species} was poisoned by Toxic Spikes!`);
      }
    }
  },
  stealthRock: {
    name: 'Stealth Rock',
    apply: ({ side }) => {
      if (!side.hazards.includes('stealthRock')) side.hazards.push('stealthRock');
    },
    onSwitchIn: ({ mon, applyDamage, addBattleLog }) => {
      const maxHp = getMaxHp(mon);
      const types = [mon.type1, mon.type2].filter(Boolean);
      const effectiveness = getTypeEffectiveness('Rock', types);
      const damage = Math.floor((maxHp / 8) * effectiveness);
      applyDamage(damage);
      addBattleLog(`${mon.nickname || mon.species} was hurt by Stealth Rock!`);
    }
  },
  stickyWeb: {
    name: 'Sticky Web',
    apply: ({ side }) => {
      if (!side.hazards.includes('stickyWeb')) side.hazards.push('stickyWeb');
    },
    onSwitchIn: ({ mon, applyStatChange, addBattleLog }) => {
      const result = applyStatChange('Speed', -1);
      if (result?.actualChange !== 0) {
        addBattleLog(`${mon.nickname || mon.species}'s Speed fell due to Sticky Web!`);
      }
    }
  }
};
