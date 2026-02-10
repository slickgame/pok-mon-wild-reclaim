import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TagRegistry } from '@/components/data/TagRegistry';
import { getTagDescription, resolveTagKey } from '@/components/utils/tooltipUtils';

const resolveRegistryEntry = (tag) => TagRegistry[resolveTagKey(tag)];

const normalizeTagLabel = (tag) => {
  if (!tag) return '';
  const registryEntry = resolveRegistryEntry(tag);
  return registryEntry?.name || tag;
};

const getTagStyle = (tag) => {
  const registryEntry = resolveRegistryEntry(tag);
  if (!registryEntry?.color) {
    if (tag) {
      console.warn('Missing tag in registry:', tag);
    }
    return {};
  }
  return {
    backgroundColor: `${registryEntry.color}33`,
    borderColor: `${registryEntry.color}80`,
    color: registryEntry.color,
  };
};

const getTagClassName = (tag) => {
  const registryEntry = resolveRegistryEntry(tag);
  if (!registryEntry?.color) {
    return 'bg-slate-700/50 text-slate-200 border-slate-500/30';
  }
  return '';
};

const normalizeTagClass = (tag) => {
  if (!tag) return '';
  return `tag-${resolveTagKey(tag).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
};

export default function MoveTagBadges({ tags = [], className = '' }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      <TooltipProvider delayDuration={200}>
        {tags.map((tag) => (
          <Tooltip key={tag}>
            <TooltipTrigger asChild>
              <span
                className={`move-tag tag-tooltip ${normalizeTagClass(tag)} ${getTagClassName(tag)} text-[0.65rem] px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                  resolveRegistryEntry(tag) ? '' : 'unknown-tag'
                }`}
                style={getTagStyle(tag)}
              >
                {normalizeTagLabel(tag)}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs border border-white/10 bg-slate-900/95 p-2 text-xs text-slate-100 shadow-lg">
              {getTagDescription(tag)}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}