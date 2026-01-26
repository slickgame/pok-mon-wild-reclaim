// Caterpie's custom move definitions
export const caterpieMoves = {
  'String Shot': {
    name: 'String Shot',
    type: 'Bug',
    category: 'Status',
    power: 0,
    accuracy: 95,
    pp: 40,
    priority: 0,
    description: 'Lowers target\'s Speed by shooting sticky string.',
    effect: {
      targetStatChange: { Speed: -1 }
    }
  },
  
  'Bug Bite': {
    name: 'Bug Bite',
    type: 'Bug',
    category: 'Physical',
    power: 60,
    accuracy: 100,
    pp: 20,
    priority: 0,
    description: 'Bites the target. If the target is holding a Berry, the user eats it and gains its effect.'
  },
  
  'Sticky Thread': {
    name: 'Sticky Thread',
    type: 'Bug',
    category: 'Status',
    power: 0,
    accuracy: 95,
    pp: 20,
    priority: 0,
    description: 'Reduces the target\'s Speed by entangling them in sticky silk.',
    effect: {
      targetStatChange: { Speed: -1 }
    },
    signature: true,
    signatureFor: ['Status Inflictor']
  },
  
  'Infestation': {
    name: 'Infestation',
    type: 'Bug',
    category: 'Special',
    power: 20,
    accuracy: 100,
    pp: 20,
    priority: 0,
    description: 'Traps and damages the target for 4-5 turns.',
    effect: {
      trap: true,
      duration: 5
    }
  },
  
  'Camouflage': {
    name: 'Camouflage',
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 20,
    priority: 0,
    description: 'Changes user\'s type based on terrain.',
    neverMiss: true
  },
  
  'Skitter Smack': {
    name: 'Skitter Smack',
    type: 'Bug',
    category: 'Physical',
    power: 70,
    accuracy: 90,
    pp: 10,
    priority: 0,
    description: 'Attacks and lowers the target\'s Special Attack.',
    effect: {
      targetStatChange: { SpAttack: -1 }
    }
  },
  
  'Safeguard': {
    name: 'Safeguard',
    type: 'Normal',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 25,
    priority: 0,
    description: 'Protects the party from status conditions for 5 turns.',
    neverMiss: true
  },
  
  'Silk Bomb': {
    name: 'Silk Bomb',
    type: 'Bug',
    category: 'Special',
    power: 65,
    accuracy: 100,
    pp: 15,
    priority: 0,
    description: 'Explodes sticky silk on impact. May lower Speed.',
    effect: {
      targetStatChange: { Speed: -1 }
    },
    effectChance: 30
  },
  
  'Echo Thread': {
    name: 'Echo Thread',
    type: 'Bug',
    category: 'Status',
    power: 0,
    accuracy: 100,
    pp: 10,
    priority: 0,
    description: 'Copies the last stat change inflicted on the opponent.',
    effect: {
      copyLastStatChanges: true
    }
  },
  
  'Cocoon Shield': {
    name: 'Cocoon Shield',
    type: 'Bug',
    category: 'Status',
    power: 0,
    accuracy: null,
    pp: 10,
    priority: 0,
    description: 'Raises Defense and Special Defense by 1 stage.',
    neverMiss: true,
    effect: {
      selfStatChange: {
        Defense: 1,
        SpDefense: 1
      }
    }
  }
};