import { StatusEffectRegistry } from '@/components/data/StatusEffectRegistry';
import { TagRegistry } from '@/components/data/TagRegistry';
import { TalentRegistry } from '@/data/TalentRegistry';
import { formatTalentName } from '@/components/utils/talentUtils';

export function renderStatusTooltip(statusKey) {
  if (!statusKey) return 'No status effect.';
  const key = `${statusKey}`;
  const normalized = key.charAt(0).toUpperCase() + key.slice(1);
  const status = StatusEffectRegistry[key]
    || StatusEffectRegistry[normalized]
    || StatusEffectRegistry[key.toLowerCase()];
  if (!status) return 'No status effect.';
  return `${status.icon} ${status.name}: ${status.description || 'No description.'}`;
}

export function renderTalentTooltip(talentKey, grade) {
  if (!talentKey) return 'Unknown talent.';
  const talent = TalentRegistry[talentKey]
    || Object.values(TalentRegistry).find((entry) => entry.name === talentKey);
  if (!talent) return 'Unknown talent.';
  const name = talent.name || formatTalentName(talentKey);
  const label = grade ? capitalize(grade) : 'Basic';
  return `${name} (${label}): ${talent.description || 'No description yet.'}`;
}

export function getTagDescription(tag) {
  if (!tag) return 'Unknown tag.';
  const key = resolveTagKey(tag);
  return TagRegistry[key]?.description || 'Unknown tag.';
}

export function resolveTagKey(tag) {
  if (!tag) return '';
  const normalized = `${tag}`.trim();
  const direct = Object.keys(TagRegistry).find(
    (registryKey) => registryKey.toLowerCase() === normalized.toLowerCase()
  );
  if (direct) return direct;
  return normalized;
}

function capitalize(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
