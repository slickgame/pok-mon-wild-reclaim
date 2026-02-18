import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scroll, CheckCircle, Coins, Sprout, Leaf } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const MERRA_QUESTS = [
  {
    id: 'merra-starter',
    name: 'Berry Basics',
    description: 'Harvest berries from 3 plots',
    requirement: { type: 'harvests', count: 3 },
    reward: { gold: 150, items: [{ name: 'Pecha Berry Seed', quantity: 2 }] }
  },
  {
    id: 'merra-variety',
    name: 'Berry Variety',
    description: 'Grow 3 different types of berries',
    requirement: { type: 'variety', count: 3 },
    reward: { gold: 300, items: [{ name: 'Sitrus Berry Seed', quantity: 1 }] }
  },
  {
    id: 'merra-bulk',
    name: 'Bulk Harvest',
    description: 'Harvest 20 berries total',
    requirement: { type: 'total', count: 20 },
    reward: { gold: 500, items: [{ name: 'Lum Berry Seed', quantity: 1 }] }
  }
];

// Season affects berry prices
const SEASON_MULTIPLIERS = {
  Spring: { 'Oran Berry': 1.2, 'Pecha Berry': 1.0, 'Cheri Berry': 0.9, 'Sitrus Berry': 1.1, 'Lum Berry': 1.0 },
  Summer: { 'Oran Berry': 0.9, 'Pecha Berry': 1.3, 'Cheri Berry': 1.2, 'Sitrus Berry': 0.9, 'Lum Berry': 1.1 },
  Autumn: { 'Oran Berry': 1.0, 'Pecha Berry': 0.9, 'Cheri Berry': 1.0, 'Sitrus Berry': 1.4, 'Lum Berry': 1.2 },
  Winter: { 'Oran Berry': 1.3, 'Pecha Berry': 1.1, 'Cheri Berry': 1.3, 'Sitrus Berry': 1.2, 'Lum Berry': 1.5 }
};

const BASE_BERRY_PRICES = {
  'Oran Berry': 40,
  'Pecha Berry': 45,
  'Cheri Berry': 35,
  'Sitrus Berry': 70,
  'Lum Berry': 100
};

const BERRY_NAMES = ['Oran Berry', 'Pecha Berry', 'Cheri Berry', 'Sitrus Berry', 'Lum Berry'];

export default function MerraQuestsModal({ isOpen, onClose, player, berryPlots, items, gameTime, onQuestComplete }) {
  const [claiming, setClaiming] = useState(false);
  const [selling, setSelling] = useState(false);
  const [sellQuantities, setSellQuantities] = useState({});
  const queryClient = useQueryClient();

  const season = gameTime?.currentSeason || 'Spring';
  const seasonMultipliers = SEASON_MULTIPLIERS[season] || SEASON_MULTIPLIERS.Spring;

  const getBerryPrice = (berryName) => {
    const base = BASE_BERRY_PRICES[berryName] || 30;
    const mult = seasonMultipliers[berryName] || 1.0;
    return Math.round(base * mult);
  };

  const completedQuests = player?.completedBerryQuests || [];

  const berryInventory = items.filter(item => BERRY_NAMES.includes(item.name) && (item.quantity == null || item.quantity > 0));

  const getQuestProgress = (quest) => {
    if (quest.requirement.type === 'harvests') return berryPlots.filter(p => p.isHarvested).length;
    if (quest.requirement.type === 'variety') {
      return new Set(berryPlots.filter(p => p.isHarvested).map(p => p.berryType)).size;
    }
    if (quest.requirement.type === 'total') {
      return items.filter(item => BERRY_NAMES.includes(item.name)).reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    return 0;
  };

  const handleClaimReward = async (quest) => {
    if (!player?.id) return;
    setClaiming(true);
    try {
      await base44.entities.Player.update(player.id, {
        gold: (player.gold || 0) + (quest.reward.gold || 0),
        completedBerryQuests: [...completedQuests, quest.id]
      });
      for (const rewardItem of quest.reward.items || []) {
        const existing = await base44.entities.Item.filter({ name: rewardItem.name });
        if (existing.length > 0) {
          await base44.entities.Item.update(existing[0].id, { quantity: (existing[0].quantity || 0) + rewardItem.quantity });
        } else {
          await base44.entities.Item.create({ name: rewardItem.name, type: 'Material', tier: 1, rarity: 'Common', description: 'Berry seed from Merra', quantity: rewardItem.quantity, stackable: true });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['player'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      if (onQuestComplete) onQuestComplete(quest.name);
    } catch (error) {
      console.error('Failed to claim quest reward:', error);
    } finally {
      setClaiming(false);
    }
  };

  const handleSell = async () => {
    if (!player?.id) return;
    setSelling(true);
    try {
      let totalGold = 0;
      for (const berryName of Object.keys(sellQuantities)) {
        const qty = sellQuantities[berryName] || 0;
        if (qty <= 0) continue;
        const berryItem = items.find(item => item.name === berryName && (item.quantity || 0) > 0);
        if (!berryItem) continue;
        totalGold += getBerryPrice(berryName) * qty;
        const newQty = (berryItem.quantity || 0) - qty;
        if (newQty > 0) {
          await base44.entities.Item.update(berryItem.id, { quantity: newQty });
        } else {
          await base44.entities.Item.delete(berryItem.id);
        }
      }
      if (totalGold > 0) {
        await base44.entities.Player.update(player.id, { gold: (player.gold || 0) + totalGold });
      }
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
      setSellQuantities({});
    } catch (error) {
      console.error('Failed to sell berries:', error);
    } finally {
      setSelling(false);
    }
  };

  const totalSellValue = Object.entries(sellQuantities).reduce((sum, [name, qty]) => {
    return sum + getBerryPrice(name) * (qty || 0);
  }, 0);

  const seasonColors = { Spring: 'text-pink-300', Summer: 'text-yellow-300', Autumn: 'text-orange-300', Winter: 'text-blue-300' };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Scroll className="w-5 h-5 text-amber-400" />
            Merra's Berry Shop
          </DialogTitle>
          <DialogDescription className="text-slate-300 flex items-center gap-2">
            "I'm always looking for skilled berry farmers!"
            <span className={`text-xs font-semibold ${seasonColors[season] || 'text-slate-300'}`}>
              🌿 {season} Season
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Sell Berries Section */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-amber-200 flex items-center gap-2">
            <Coins className="w-4 h-4" /> Sell Berries
          </h3>
          <p className="text-xs text-slate-400">Prices vary by season. Current season: <span className={`font-medium ${seasonColors[season]}`}>{season}</span></p>

          {berryInventory.length > 0 ? (
            <div className="space-y-2">
              {berryInventory.map(berryItem => {
                const price = getBerryPrice(berryItem.name);
                const qty = sellQuantities[berryItem.name] || 0;
                const maxQty = berryItem.quantity || 0;
                return (
                  <div key={berryItem.id} className="flex items-center justify-between gap-3 bg-slate-800/50 rounded-lg p-2">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{berryItem.name}</p>
                      <p className="text-xs text-slate-400">
                        {price}g each · Have ×{maxQty}
                        {seasonMultipliers[berryItem.name] > 1 && (
                          <span className="text-emerald-400 ml-1">▲ In demand</span>
                        )}
                        {seasonMultipliers[berryItem.name] < 1 && (
                          <span className="text-red-400 ml-1">▼ Low demand</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 border-slate-600 text-slate-300"
                        onClick={() => setSellQuantities(prev => ({ ...prev, [berryItem.name]: Math.max(0, (prev[berryItem.name] || 0) - 1) }))}
                        disabled={qty === 0}
                      >-</Button>
                      <span className="text-white text-sm w-6 text-center">{qty}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 border-slate-600 text-slate-300"
                        onClick={() => setSellQuantities(prev => ({ ...prev, [berryItem.name]: Math.min(maxQty, (prev[berryItem.name] || 0) + 1) }))}
                        disabled={qty >= maxQty}
                      >+</Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs text-slate-400"
                        onClick={() => setSellQuantities(prev => ({ ...prev, [berryItem.name]: maxQty }))}
                      >All</Button>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <span className="text-sm text-white font-semibold">Total: <span className="text-amber-300">{totalSellValue}g</span></span>
                <Button
                  size="sm"
                  onClick={handleSell}
                  disabled={totalSellValue === 0 || selling}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {selling ? 'Selling…' : 'Sell Berries'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">You have no berries to sell. Harvest some first!</p>
          )}
        </div>

        {/* Quests Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" /> Berry Quests
          </h3>
          {MERRA_QUESTS.map((quest) => {
            const progress = getQuestProgress(quest);
            const isComplete = progress >= quest.requirement.count;
            const isClaimed = completedQuests.includes(quest.id);
            return (
              <div
                key={quest.id}
                className={`rounded-lg p-4 border ${
                  isClaimed ? 'bg-emerald-500/10 border-emerald-500/30' :
                  isComplete ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-slate-800/50 border-slate-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{quest.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{quest.description}</p>
                  </div>
                  {isClaimed && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                </div>
                <div className="text-xs text-slate-300 mb-2">Progress: {progress}/{quest.requirement.count}</div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-amber-300">
                    Reward: {quest.reward.gold}g
                    {quest.reward.items?.map(item => (
                      <span key={item.name}> + {item.quantity}× {item.name}</span>
                    ))}
                  </div>
                  {isComplete && !isClaimed && (
                    <Button size="sm" onClick={() => handleClaimReward(quest)} disabled={claiming} className="bg-amber-600 hover:bg-amber-700">
                      Claim
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Button variant="outline" onClick={onClose} className="w-full border-slate-700 mt-2">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}