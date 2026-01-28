export const TerrainRegistry = {
  grassy: {
    name: 'Grassy Terrain',
    duration: 5,
    onTurnStart: (ctx) => {
      ctx.allPokemon.forEach((mon) => {
        const maxHp = mon.stats?.maxHp ?? mon.maxHP ?? 0;
        if (!maxHp) return;
        const heal = Math.floor(maxHp / 16);
        mon.currentHp = Math.min(maxHp, (mon.currentHp ?? maxHp) + heal);
        ctx.log(`${mon.nickname || mon.species} was healed by the grassy terrain!`);
      });
    },
    modifyMove: (move) => {
      if (move.type === 'Grass') return { powerBoost: 1.3 };
      return null;
    }
  }
};
