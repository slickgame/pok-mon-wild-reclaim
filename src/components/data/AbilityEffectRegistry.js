const normalizeAbilityId = (abilityName) => (abilityName || '').toLowerCase().replace(/\s+/g, '');

const AbilityMetaRegistry = {
  chlorophyll: {
    name: 'Chlorophyll',
    shortDescription: 'Boosts Speed in sunny weather.',
    longDescription: 'At the start of each turn in sunny weather, Speed is increased by 1 stage. The bonus fades when sunlight ends.'
  },
  flowergift: {
    name: 'Flower Gift',
    shortDescription: 'Blossoms in sunlight to boost Attack and Sp. Def.',
    longDescription: 'At the start of each turn in sunny weather, Attack and Sp. Def are raised by 1 stage. These bonuses fade when sunlight ends.'
  },
  leafguard: {
    name: 'Leaf Guard',
    shortDescription: 'Prevents major status in harsh sunlight.',
    longDescription: 'In sunny weather, this Pokémon cannot be inflicted with major status conditions (burn, poison, paralysis, sleep, freeze).'
  },
  oblivious: {
    name: 'Oblivious',
    shortDescription: 'Blocks infatuation and taunt-like disruption.',
    longDescription: 'This Pokémon is immune to infatuation-style and taunt-like disruptive effects in official rulesets. (Applied where supported.)'
  },
  sweetveil: {
    name: 'Sweet Veil',
    shortDescription: 'Prevents allies from falling asleep.',
    longDescription: 'Protective aroma prevents the holder and allies from being put to sleep while active.'
  },
  queenlymajesty: {
    name: 'Queenly Majesty',
    shortDescription: 'Blocks opposing priority moves.',
    longDescription: 'Opponents cannot hit this Pokémon with increased-priority moves while Queenly Majesty is active.'
  }
};

const isSunnyWeather = (battlefield) => {
  const weather = battlefield?.weather;
  return weather === 'sunny' || weather === 'sun';
};

export const AbilityEffectRegistry = {
  chlorophyll: {
    onTurnStart: ({ pokemon, battlefield, state, applyStatStage, log }) => {
      const sunny = isSunnyWeather(battlefield);
      if (sunny && !state.chlorophyllSpeedBoostApplied) {
        const result = applyStatStage('speed', 1);
        if (result.actualChange !== 0) {
          state.chlorophyllSpeedBoostApplied = true;
          log(`${pokemon.nickname || pokemon.species}'s Chlorophyll boosted its Speed in the sunlight!`);
        }
      }

      if (!sunny && state.chlorophyllSpeedBoostApplied) {
        applyStatStage('speed', -1);
        state.chlorophyllSpeedBoostApplied = false;
        log(`${pokemon.nickname || pokemon.species}'s Chlorophyll boost faded.`);
      }
    }
  },

  flowergift: {
    onTurnStart: ({ pokemon, battlefield, state, applyStatStage, log }) => {
      const sunny = isSunnyWeather(battlefield);

      if (sunny && !state.flowerGiftApplied) {
        applyStatStage('atk', 1);
        applyStatStage('spDef', 1);
        state.flowerGiftApplied = true;
        log(`${pokemon.nickname || pokemon.species} blossomed under Flower Gift!`);
      }

      if (!sunny && state.flowerGiftApplied) {
        applyStatStage('atk', -1);
        applyStatStage('spDef', -1);
        state.flowerGiftApplied = false;
        log(`${pokemon.nickname || pokemon.species}'s Flower Gift faded.`);
      }
    }
  },

  leafguard: {
    onTurnStart: () => {}
  },

  oblivious: {
    onTurnStart: () => {}
  },

  sweetveil: {
    onTurnStart: () => {}
  },

  queenlymajesty: {
    onTurnStart: () => {}
  }
};

export function getAbilityEffect(abilityName) {
  return AbilityEffectRegistry[normalizeAbilityId(abilityName)] || null;
}

export function getAbilityMetadata(abilityName) {
  return AbilityMetaRegistry[normalizeAbilityId(abilityName)] || null;
}
