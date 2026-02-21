import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sprout, Clock, Gem, Plus } from 'lucide-react';

const BERRY_GROW_TIMES = {
  'Oran Berry Seed': 30,
  'Pecha Berry Seed': 25,
  'Cheri Berry Seed': 20,
  'Sitrus Berry Seed': 45,
  'Lum Berry Seed': 60
};

export default function BerryFarmPanel({ player, playerEmail, zone, gameTime, seeds = [], onPlant, onBuyPlot, onHarvest }) {
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [harvesting, setHarvesting] = useState(false);
  const queryClient = useQueryClient();

  const { data: livePlots = [] } = useQuery({
    queryKey: ['berryPlots', zone?.id, playerEmail],
    queryFn: async () => {
      if (!playerEmail || !zone?.id) return [];
      return await base44.entities.BerryPlot.filter({ playerEmail, zoneId: zone.id });
    },
    enabled: !!playerEmail && !!zone?.id,
    refetchInterval: 3000
  });

  const totalPlots = 3 + (player?.purchasedBerryPlots || 0);
  const nextPlotCost = Math.pow(5, (player?.purchasedBerryPlots || 0)) * 1000;

  const getPlotStatus = (idx) => {
    const plot = livePlots.find(p => p.plotNumber === idx && !p.isHarvested);
    if (!plot) return { status: 'empty', plot: null };
    const now = Date.now();
    if (now >= plot.readyAt) return { status: 'ready', plot, timeLeft: 0 };
    return { status: 'growing', plot, timeLeft: Math.max(0, plot.readyAt - now) };
  };

  const formatTimeLeft = (ms) => {
    const mins = Math.floor(ms / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handlePlotClick = async (idx, plotStatus) => {
    if (plotStatus.status === 'ready' && !harvesting) {
      // Harvest this single plot
      setHarvesting(true);
      try {
        await onHarvest({ plot: plotStatus.plot, plotNumber: idx });
        await queryClient.refetchQueries({ queryKey: ['berryPlots', zone?.id, playerEmail] });
      } finally {
        setHarvesting(false);
      }
    } else if (plotStatus.status === 'empty' && selectedSeed) {
      // Plant
      const growTime = BERRY_GROW_TIMES[selectedSeed.name] || 30;
      const now = getGameTs();
      try {
        await base44.entities.BerryPlot.create({
          playerEmail, zoneId: zone.id, plotNumber: idx,
          berryType: selectedSeed.name, plantedAt: now, readyAt: now + growTime * 60000, isHarvested: false
        });
        if (selectedSeed.quantity > 1) {
          await base44.entities.Item.update(selectedSeed.id, { quantity: selectedSeed.quantity - 1 });
        } else {
          await base44.entities.Item.delete(selectedSeed.id);
        }
        queryClient.invalidateQueries({ queryKey: ['berryPlots', zone?.id, playerEmail] });
        queryClient.invalidateQueries({ queryKey: ['items'] });
        setSelectedSeed(null);
        if (onPlant) onPlant({ plotNumber: idx, seedName: selectedSeed.name });
      } catch (e) {
        console.error('Failed to plant seed:', e);
      }
    }
  };

  const handleBuyPlot = async () => {
    if ((player?.gold || 0) < nextPlotCost) return;
    try {
      await base44.entities.Player.update(player.id, {
        gold: (player.gold || 0) - nextPlotCost,
        purchasedBerryPlots: (player.purchasedBerryPlots || 0) + 1
      });
      queryClient.invalidateQueries({ queryKey: ['player'] });
      if (onBuyPlot) onBuyPlot();
    } catch (e) {
      console.error('Failed to buy plot:', e);
    }
  };

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-4">
      <h4 className="text-sm font-semibold text-emerald-200 flex items-center gap-2">
        <Sprout className="w-4 h-4" /> Berry Farm
      </h4>

      <div className="grid grid-cols-3 gap-2">
        {[...Array(totalPlots)].map((_, idx) => {
          const ps = getPlotStatus(idx);
          const isClickable =
            (ps.status === 'empty' && !!selectedSeed) ||
            (ps.status === 'ready' && !harvesting);

          return (
            <button
              key={idx}
              onClick={() => handlePlotClick(idx, ps)}
              disabled={!isClickable}
              title={
                ps.status === 'ready'
                  ? 'Click to harvest!'
                  : ps.status === 'empty' && selectedSeed
                  ? 'Click to plant'
                  : ps.status === 'growing'
                  ? 'Growing…'
                  : 'Select a seed first'
              }
              className={`h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all text-center ${
                ps.status === 'empty'
                  ? isClickable
                    ? 'border-emerald-700/60 bg-slate-800/50 hover:border-emerald-400 cursor-pointer'
                    : 'border-slate-700 bg-slate-800/50 cursor-default'
                  : ps.status === 'growing'
                  ? 'border-amber-500/40 bg-amber-500/10 cursor-default'
                  : 'border-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 cursor-pointer animate-pulse'
              }`}
            >
              {ps.status === 'empty' && (
                <>
                  <Plus className="w-5 h-5 text-slate-500 mb-1" />
                  <span className="text-xs text-slate-500">{isClickable ? 'Plant here' : 'Empty'}</span>
                </>
              )}
              {ps.status === 'growing' && ps.plot && (
                <>
                  <Sprout className="w-6 h-6 text-amber-400 mb-1" />
                  <p className="text-xs text-white font-medium leading-tight">
                    {ps.plot.berryType.replace(' Seed', '')}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-300">{formatTimeLeft(ps.timeLeft)}</span>
                  </div>
                </>
              )}
              {ps.status === 'ready' && ps.plot && (
                <>
                  <Gem className="w-6 h-6 text-emerald-400 mb-1" />
                  <p className="text-xs text-white font-medium leading-tight">
                    {ps.plot.berryType.replace(' Seed', '')}
                  </p>
                  <Badge className="bg-emerald-500/30 text-emerald-300 text-xs mt-1 py-0">
                    {harvesting ? '…' : 'Harvest!'}
                  </Badge>
                </>
              )}
            </button>
          );
        })}
      </div>

      <Button
        onClick={handleBuyPlot}
        disabled={(player?.gold || 0) < nextPlotCost}
        variant="outline"
        size="sm"
        className="w-full border-emerald-700/40 text-emerald-200 text-xs"
      >
        Buy Plot ({nextPlotCost}g)
      </Button>

      {seeds.length > 0 ? (
        <div>
          <p className="text-xs text-slate-400 mb-2">
            {selectedSeed ? `Selected: ${selectedSeed.name} — click an empty plot to plant` : 'Select a seed to plant:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {seeds.map(seed => (
              <button
                key={seed.id}
                onClick={() => setSelectedSeed(selectedSeed?.id === seed.id ? null : seed)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs transition-all ${
                  selectedSeed?.id === seed.id
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                    : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                }`}
              >
                <Sprout className="w-3 h-3 text-emerald-400" />
                {seed.name.replace(' Seed', '')}
                <span className="text-slate-400">×{seed.quantity || 1}</span>
                <span className="text-slate-500">({BERRY_GROW_TIMES[seed.name] || 30}m)</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">No seeds in inventory. Talk to Iris to buy seeds.</p>
      )}
    </div>
  );
}