export const STAT_STAGE_ORDER = [
  'Attack',
  'Defense',
  'Sp. Atk',
  'Sp. Def',
  'Speed',
  'Accuracy',
  'Evasion'
];

export const DEFAULT_STAT_STAGES = Object.freeze({
  Attack: 0,
  Defense: 0,
  'Sp. Atk': 0,
  'Sp. Def': 0,
  Speed: 0,
  Accuracy: 0,
  Evasion: 0
});

const STAT_STAGE_ALIASES = {
  attack: 'Attack',
  atk: 'Attack',
  defense: 'Defense',
  def: 'Defense',
  'sp. atk': 'Sp. Atk',
  'sp atk': 'Sp. Atk',
  spatk: 'Sp. Atk',
  spattack: 'Sp. Atk',
  sp_atk: 'Sp. Atk',
  'sp. def': 'Sp. Def',
  'sp def': 'Sp. Def',
  spdef: 'Sp. Def',
  spdefense: 'Sp. Def',
  sp_def: 'Sp. Def',
  speed: 'Speed',
  spd: 'Speed',
  accuracy: 'Accuracy',
  evasion: 'Evasion'
};

export const createDefaultStatStages = () => ({ ...DEFAULT_STAT_STAGES });

export const normalizeStatStageKey = (stat) => {
  if (!stat) return undefined;
  if (DEFAULT_STAT_STAGES[stat] !== undefined) return stat;
  const normalized = String(stat).trim().toLowerCase().replace(/_/g, ' ');
  return STAT_STAGE_ALIASES[normalized] || stat;
};

export const normalizeStatStages = (statStages = {}) => {
  const normalizedStages = createDefaultStatStages();
  Object.entries(statStages || {}).forEach(([stat, value]) => {
    const key = normalizeStatStageKey(stat);
    if (key) {
      normalizedStages[key] = Number.isFinite(value) ? value : 0;
    }
  });
  return normalizedStages;
};

export const getStatStageValue = (statStages, stat) => {
  if (!statStages) return 0;
  const key = normalizeStatStageKey(stat);
  return statStages[key] ?? 0;
};

export const getStatModifier = (stage) => {
  if (stage > 0) return (2 + stage) / 2;
  if (stage < 0) return 2 / (2 - stage);
  return 1;
};

export const formatStatStageChange = (stat, delta) => {
  const normalized = normalizeStatStageKey(stat);
  const stageCount = Math.abs(delta);
  const stageLabel = stageCount === 1 ? 'stage' : 'stages';
  const changeVerb = delta > 0 ? 'rose' : 'fell';
  return `${normalized} ${changeVerb} by ${stageCount} ${stageLabel}!`;
};
