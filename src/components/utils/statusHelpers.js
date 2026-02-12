const STATUS_MAP = {
  Poison: { label: 'PSN', class: 'status-poison' },
  Sleep: { label: 'SLP', class: 'status-sleep' },
  Burn: { label: 'BRN', class: 'status-burn' },
  Paralyze: { label: 'PAR', class: 'status-paralyze' },
  Freeze: { label: 'FRZ', class: 'status-freeze' },
  Confuse: { label: 'CNF', class: 'status-confuse' }
};

export function getStatusIcon(status) {
  const info = STATUS_MAP[status];
  if (!info) return null;

  const el = document.createElement('span');
  el.className = `status-icon ${info.class}`;
  el.innerText = info.label;
  return el;
}

export function getStatStageChangeText(stat, change) {
  if (change === 0) return '';

  const arrow = change > 0 ? '↑' : '↓';
  const colorClass = change > 0 ? 'stat-stage-up' : 'stat-stage-down';
  return `<span class="${colorClass}">${stat} ${arrow}${Math.abs(change)}</span>`;
}
