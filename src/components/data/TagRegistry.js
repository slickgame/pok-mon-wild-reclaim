export const TagRegistry = {
  Spore: {
    name: 'Spore',
    description: 'Refers to powder-based status moves like Sleep Powder or Stun Spore.',
    color: '#88C070'
  },
  Healing: {
    name: 'Healing',
    description: 'Moves that restore HP to the user or allies.',
    color: '#FF92A7'
  },
  Drain: {
    name: 'Drain',
    description: 'Moves that absorb HP from the target.',
    color: '#FFB347'
  },
  Debuff: {
    name: 'Debuff',
    description: "Moves that lower the target's stats.",
    color: '#FF6F61'
  },
  Buff: {
    name: '🌀 Buff',
    description: "Moves that increase the user's stats.",
    color: '#6AC3FA'
  },
  Status: {
    name: 'Status',
    description: "Moves that don't deal direct damage but apply effects.",
    color: '#D3D3D3'
  },
  Passive: {
    name: 'Passive',
    description: 'Moves that apply ongoing effects for multiple turns.',
    color: '#B99EF9'
  },
  Trap: {
    name: 'Trap',
    description: 'Moves that prevent switching and deal passive damage.',
    color: '#9E91D7'
  },
  Consume: {
    name: 'Consume',
    description: "Moves that interact with the target's held item.",
    color: '#E09D1F'
  },
  Berry: {
    name: 'Berry',
    description: 'Specifically interacts with Berries.',
    color: '#DB7093'
  },
  'Multi-Hit': {
    name: 'Multi-Hit',
    description: 'Moves that strike the target 2–5 times in one turn.',
    color: '#F2A65A'
  },
  Special: {
    name: 'Special',
    description: "Deals damage using the user's Special Attack.",
    color: '#84D2F6'
  },
  Physical: {
    name: 'Physical',
    description: "Deals damage using the user's Attack.",
    color: '#F4A460'
  },
  Crit: {
    name: 'High Crit',
    description: 'Moves with increased critical hit ratio.',
    color: '#FFC300'
  },
  NeverMiss: {
    name: 'Never Miss',
    description: 'Moves that cannot miss their target.',
    color: '#AED581'
  },
  Charge: {
    name: 'Charge',
    description: 'Moves that take one turn to charge before striking.',
    color: '#FFA07A'
  },
  Field: {
    name: 'Field Effect',
    description: 'Moves that affect the battle environment.',
    color: '#D1A7FF'
  },
  Terrain: {
    name: 'Terrain',
    description: 'Alters the terrain for bonus effects.',
    color: '#AAF683'
  },
  Weather: {
    name: 'Weather',
    description: 'Changes weather and affects battlefield conditions.',
    color: '#87CEEB'
  },
  Paralyze: {
    name: '🎯 Paralyze',
    description: 'May cause paralysis status effect.',
    color: '#A890F0'
  },
  Burn: {
    name: 'Burn',
    description: 'May cause burn status.',
    color: '#FF5733'
  },
  Poison: {
    name: 'Poison',
    description: 'May poison the target.',
    color: '#AD69E5'
  },
  Freeze: {
    name: 'Freeze',
    description: 'May freeze the target.',
    color: '#99D9EA'
  },
  Sleep: {
    name: 'Sleep',
    description: 'May put the target to sleep.',
    color: '#B2A4FF'
  },
  Priority: {
    name: '⚔️ Priority',
    description: 'Moves that strike before standard turn order.',
    color: '#D04030'
  },
  FixedDamage: {
    name: 'Fixed Damage',
    description: 'Deals fixed damage regardless of stats.',
    color: '#F08080'
  },
  Swap: {
    name: 'Force Swap',
    description: 'Forces the opponent to switch Pokémon.',
    color: '#BDB76B'
  },
  Escape: {
    name: 'Escape',
    description: 'Allows user to flee from wild battles.',
    color: '#C0C0C0'
  },
  StatusCure: {
    name: 'Status Cure',
    description: 'Cures status conditions.',
    color: '#9EE493'
  },
  Delayed: {
    name: 'Delayed',
    description: 'Applies effects after a short delay.',
    color: '#FFD1DC'
  },
  Lock: {
    name: 'Lock',
    description: 'Locks the target into repeating or disabling moves.',
    color: '#D35400'
  },
  Shield: {
    name: 'Shield',
    description: 'Creates a decoy or defensive buffer.',
    color: '#A1CAF1'
  },
  SleepCondition: {
    name: 'Sleep Conditional',
    description: 'Only works while the user is asleep.',
    color: '#D9D9F3'
  },
  Bonus: {
    name: 'Bonus',
    description: 'Has enhanced effect under special conditions.',
    color: '#FFDD00'
  },
  Punch: {
    name: '🥊 Punch',
    description: 'Punch-based moves.',
    color: '#F6AD55'
  },
  SpeedBased: {
    name: '🏎️ Speed-Based',
    description: 'Power scales with Speed or turn order.',
    color: '#63B3ED'
  },
  Area: {
    name: '🧨 Area',
    description: 'Hits multiple targets or an area.',
    color: '#FEB2B2'
  },
  Recoil: {
    name: '💥 Recoil',
    description: 'Damages the user after hitting.',
    color: '#FC8181'
  },
  Signature: {
    name: '⭐ Signature',
    description: 'Signature or unique moves.',
    color: '#FBD38D'
  },
  Bypass: {
    name: '🚫 Bypass',
    description: 'Bypasses shields or protective effects.',
    color: '#A0AEC0'
  },
  Electric: {
    name: '⚡ Electric',
    description: 'Electric-aligned effects or bonuses.',
    color: '#F8D030'
  },
  CritBoost: {
    name: '🎯 Crit Boost',
    description: 'Improves critical hit chances.',
    color: '#F6E05E'
  },
  Setup: {
    name: '🧩 Setup',
    description: 'Provides early battle setup bonuses.',
    color: '#9F7AEA'
  },
  AOE: {
    name: '🧨 AOE',
    description: 'Affects multiple targets or an area.',
    color: '#FEB2B2'
  },
  Support: {
    name: '🤝 Support',
    description: 'Provides ally-focused utility.',
    color: '#68D391'
  },
  Burst: {
    name: '💥 Burst',
    description: 'Effects that trigger a sudden power spike.',
    color: '#FF8C42'
  },
  Speed: {
    name: '💨 Speed',
    description: 'Improves Speed or turn order.',
    color: '#7FDBFF'
  },
  Defense: {
    name: '🛡️ Defense',
    description: 'Defensive mitigation or protection.',
    color: '#A3BFFA'
  },
  Attack: {
    name: '⚔️ Attack',
    description: 'Boosts or impacts Attack stats.',
    color: '#F56565'
  },
  DamageBoost: {
    name: '📈 Damage Boost',
    description: 'Increases move damage.',
    color: '#F6AD55'
  },
  Redirect: {
    name: '🧲 Redirect',
    description: 'Redirects or draws in attacks.',
    color: '#68D391'
  },
  Synergy: {
    name: '🔗 Synergy',
    description: 'Triggers when paired with other effects.',
    color: '#9F7AEA'
  },
  Immunity: {
    name: '🧿 Immunity',
    description: 'Negates specific effects or move types.',
    color: '#A0AEC0'
  },
  Recovery: {
    name: '✨ Recovery',
    description: 'Restores resources like HP or PP.',
    color: '#68D391'
  },
  Utility: {
    name: '🧰 Utility',
    description: 'Provides utility benefits or upkeep.',
    color: '#4FD1C5'
  }
};
