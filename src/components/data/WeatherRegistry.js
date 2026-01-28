export const WeatherRegistry = {
  sunny: {
    name: 'Sunny',
    duration: 5,
    onTurnStart: (ctx) => {
      ctx.log('The sunlight is strong!');
    },
    modifyMove: (move) => {
      if (move.type === 'Fire') return { powerBoost: 1.5 };
      if (move.type === 'Water') return { powerDrop: 0.5 };
      return null;
    }
  },
  rain: {
    name: 'Rain',
    duration: 5,
    onTurnStart: (ctx) => {
      ctx.log("It's raining!");
    },
    modifyMove: (move) => {
      if (move.type === 'Water') return { powerBoost: 1.5 };
      if (move.type === 'Fire') return { powerDrop: 0.5 };
      return null;
    }
  }
};
