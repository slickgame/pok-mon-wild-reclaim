import React from 'react';
import { CloudSun, Leaf, Shield, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WeatherRegistry } from '@/components/data/WeatherRegistry';
import { TerrainRegistry } from '@/components/data/TerrainRegistry';
import { HazardRegistry } from '@/components/data/HazardRegistry';
import { ScreenRegistry } from '@/components/data/ScreenRegistry';

const getDefaultBattlefield = () => ({
  terrain: null,
  terrainDuration: 0,
  weather: null,
  weatherDuration: 0,
  hazards: {
    playerSide: [],
    enemySide: []
  },
  screens: {
    playerSide: [],
    enemySide: []
  }
});

const formatTurns = (turns) => (turns > 0 ? `${turns} turns` : '—');

const renderBadges = (items, emptyLabel) => {
  if (!items.length) {
    return <span className="text-xs text-slate-400">{emptyLabel}</span>;
  }
  return items;
};

export default function BattlefieldStatus({ battlefield }) {
  const field = battlefield || getDefaultBattlefield();
  const weatherDef = field.weather ? WeatherRegistry[field.weather] : null;
  const terrainDef = field.terrain ? TerrainRegistry[field.terrain] : null;

  const renderHazards = (hazards) =>
    hazards.map((hazardId) => (
      <Badge key={hazardId} className="bg-amber-500/20 text-amber-200 border-amber-500/40 text-xs">
        {HazardRegistry[hazardId]?.name || hazardId}
      </Badge>
    ));

  const renderScreens = (screens) =>
    screens.map((screen) => {
      const screenId = typeof screen === 'string' ? screen : screen.id;
      const duration = typeof screen === 'string' ? 0 : screen.duration;
      return (
        <Badge key={screenId} className="bg-sky-500/20 text-sky-200 border-sky-500/40 text-xs">
          {ScreenRegistry[screenId]?.name || screenId} {duration ? `(${duration})` : ''}
        </Badge>
      );
    });

  return (
    <div className="glass rounded-xl p-4 border border-slate-700/50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-200">
          <CloudSun className="w-4 h-4 text-yellow-300" />
          <span className="font-semibold">Weather:</span>
          {weatherDef ? (
            <span>
              {weatherDef.name} ({formatTurns(field.weatherDuration)})
            </span>
          ) : (
            <span className="text-slate-400">Clear</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-200">
          <Leaf className="w-4 h-4 text-emerald-300" />
          <span className="font-semibold">Terrain:</span>
          {terrainDef ? (
            <span>
              {terrainDef.name} ({formatTurns(field.terrainDuration)})
            </span>
          ) : (
            <span className="text-slate-400">None</span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-700/50 p-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            <AlertTriangle className="h-3 w-3" />
            Enemy Side
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {renderBadges(renderHazards(field.hazards?.enemySide || []), 'No hazards')}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {renderBadges(renderScreens(field.screens?.enemySide || []), 'No screens')}
          </div>
        </div>
        <div className="rounded-lg border border-slate-700/50 p-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            <Shield className="h-3 w-3" />
            Player Side
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {renderBadges(renderHazards(field.hazards?.playerSide || []), 'No hazards')}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {renderBadges(renderScreens(field.screens?.playerSide || []), 'No screens')}
          </div>
        </div>
      </div>
    </div>
  );
}
