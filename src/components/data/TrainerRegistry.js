export const rollTrainerRewards = (trainerData) => {
  const tier = trainerData?.difficultyTier || trainerData?.tier || 1;
  const table = {
    1: { gold: 140, items: ['Soft Mulch'] },
    2: { gold: 220, items: ['Soft Mulch', 'Forager Token'] },
    3: { gold: 340, items: ['Forager Token', "Forager's Gloves"] },
    4: { gold: 520, items: ['Forager Token', 'Royal Jelly'] }
  };
  return table[tier] || table[1];
};
