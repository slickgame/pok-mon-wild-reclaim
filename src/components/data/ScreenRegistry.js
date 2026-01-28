export const ScreenRegistry = {
  lightScreen: {
    name: 'Light Screen',
    duration: 5,
    reduceDamage: (move) => {
      if (move.category === 'Special') return 0.5;
      return null;
    }
  },
  reflect: {
    name: 'Reflect',
    duration: 5,
    reduceDamage: (move) => {
      if (move.category === 'Physical') return 0.5;
      return null;
    }
  },
  auroraVeil: {
    name: 'Aurora Veil',
    duration: 5,
    reduceDamage: (move, ctx) => {
      if (!ctx.weather) return null;
      if (move.category === 'Physical' || move.category === 'Special') return 0.5;
      return null;
    }
  }
};
