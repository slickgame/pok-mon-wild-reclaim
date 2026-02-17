import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sprout, Clock, Gem, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const BERRY_GROW_TIMES = {
  'Oran Berry Seed': 30,
  'Pecha Berry Seed': 25,
  'Cheri Berry Seed': 20,
  'Sitrus Berry Seed': 45,
  'Lum Berry Seed': 60
};

export default function PlantingPlotModal({ 
  isOpen, 
  onClose, 
  plots = [], 
  seeds = [], 
  player, 
  zone, 
  gameTime,
  onPlant,
  onBuyPlot 
}) {
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const queryClient = useQueryClient();

  const totalPlots = 3 + (player?.purchasedBerryPlots || 0);
  const nextPlotCost = Math.pow(5, (player?.purchasedBerryPlots || 0)) * 1000;

  const handlePlantSeed = async () => {
    if (!selectedSeed || selectedPlot === null) return;

    const growTimeMinutes = BERRY_GROW_TIMES[selectedSeed.name] || 30;
    const nowGameTs = getCurrentGameTimestamp(gameTime);
    const readyAt = nowGameTs + (growTimeMinutes * 60 * 1000);

    try {
      // Create plot record
      await base44.entities.BerryPlot.create({
        playerEmail: player.email || 'unknown',
        zoneId: zone.id,
        plotNumber: selectedPlot,
        berryType: selectedSeed.name,
        plantedAt: nowGameTs,
        readyAt: readyAt,
        isHarvested: false
      });

      // Consume seed
      if (selectedSeed.quantity > 1) {
        await base44.entities.Item.update(selectedSeed.id, {
          quantity: selectedSeed.quantity - 1
        });
      } else {
        await base44.entities.Item.delete(selectedSeed.id);
      }

      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['berryPlots'] });

      if (onPlant) onPlant();
      setSelectedSeed(null);
      setSelectedPlot(null);
    } catch (error) {
      console.error('Failed to plant seed:', error);
    }
  };

  const handleBuyPlot = async () => {
    if ((player?.gold || 0) < nextPlotCost) {
      alert('Not enough gold!');
      return;
    }

    try {
      await base44.entities.Player.update(player.id, {
        gold: (player.gold || 0) - nextPlotCost,
        purchasedBerryPlots: (player.purchasedBerryPlots || 0) + 1
      });

      queryClient.invalidateQueries({ queryKey: ['player'] });
      if (onBuyPlot) onBuyPlot();
    } catch (error) {
      console.error('Failed to buy plot:', error);
    }
  };

  const getCurrentGameTimestamp = (time) => {
    const year = time?.year || 0;
    const month = time?.month || 0;
    const day = time?.day || time?.currentDay || 1;
    const hour = time?.currentHour || 0;
    const minute = time?.currentMinute || 0;
    return new Date(Date.UTC(year, month, day, hour, minute, 0)).getTime();
  };

  const getPlotStatus = (plotNumber) => {
    const plot = plots.find(p => p.plotNumber === plotNumber && !p.isHarvested);
    if (!plot) return { status: 'empty', plot: null, timeLeft: null };

    const nowGameTs = getCurrentGameTimestamp(gameTime);
    const timeLeft = Math.max(0, plot.readyAt - nowGameTs);
    
    if (nowGameTs >= plot.readyAt) {
      return { status: 'ready', plot, timeLeft: 0 };
    }
    return { status: 'growing', plot, timeLeft };
  };

  const formatTimeLeft = (milliseconds) => {
    const totalMinutes = Math.floor(milliseconds / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            Berry Farm
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Plant berry seeds and wait for them to grow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plots */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Your Plots</h3>
            <div className="grid grid-cols-3 gap-3">
              {[...Array(totalPlots)].map((_, idx) => {
                const plotStatus = getPlotStatus(idx);
                return (
                  <motion.button
                    key={idx}
                    onClick={() => {
                      if (plotStatus.status === 'empty' && selectedSeed) {
                        setSelectedPlot(idx);
                      }
                    }}
                    className={`relative h-32 rounded-lg border-2 transition-all ${
                      plotStatus.status === 'empty'
                        ? selectedPlot === idx
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        : plotStatus.status === 'growing'
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : 'border-emerald-500/50 bg-emerald-500/10'
                    }`}
                    disabled={plotStatus.status !== 'empty'}
                  >
                    {plotStatus.status === 'empty' && (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Plus className="w-8 h-8 mb-1" />
                        <span className="text-xs">Empty</span>
                      </div>
                    )}
                    {plotStatus.status === 'growing' && plotStatus.plot && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Sprout className="w-8 h-8 text-amber-400 mb-2" />
                        <p className="text-xs text-white font-medium">
                          {plotStatus.plot.berryType.replace(' Seed', '')}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span className="text-xs text-amber-300">
                            {formatTimeLeft(plotStatus.timeLeft)}
                          </span>
                        </div>
                      </div>
                    )}
                    {plotStatus.status === 'ready' && plotStatus.plot && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Gem className="w-8 h-8 text-emerald-400 mb-2" />
                        <p className="text-xs text-white font-medium">
                          {plotStatus.plot.berryType.replace(' Seed', '')}
                        </p>
                        <Badge className="bg-emerald-500/20 text-emerald-300 text-xs mt-1">
                          Ready!
                        </Badge>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <Button
              onClick={handleBuyPlot}
              disabled={(player?.gold || 0) < nextPlotCost}
              variant="outline"
              size="sm"
              className="w-full mt-3 border-slate-700 text-slate-200"
            >
              Buy Next Plot ({nextPlotCost}g)
            </Button>
          </div>

          {/* Seeds */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Select Seed</h3>
            {seeds.length > 0 ? (
              <div className="space-y-2">
                {seeds.map((seed) => (
                  <button
                    key={seed.id}
                    onClick={() => setSelectedSeed(seed)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      selectedSeed?.id === seed.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sprout className="w-5 h-5 text-emerald-400" />
                      <div className="text-left">
                        <p className="text-white text-sm font-medium">{seed.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400">
                            {BERRY_GROW_TIMES[seed.name] || 30}m
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-slate-700">×{seed.quantity || 1}</Badge>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-4">
                No seeds in inventory. Talk to Iris to buy seeds!
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handlePlantSeed}
              disabled={!selectedSeed || selectedPlot === null}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Sprout className="w-4 h-4 mr-2" />
              Plant Seed
            </Button>
            <Button variant="outline" onClick={onClose} className="border-slate-700">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}