import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scroll, CheckCircle, Coins, Sprout } from 'lucide-react';
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

export default function MerraQuestsModal({ isOpen, onClose, player, berryPlots, items, onQuestComplete }) {
  const [claiming, setClaiming] = useState(false);
  const queryClient = useQueryClient();

  const completedQuests = player?.completedBerryQuests || [];

  const getQuestProgress = (quest) => {
    if (quest.requirement.type === 'harvests') {
      return berryPlots.filter(p => p.isHarvested).length;
    }
    if (quest.requirement.type === 'variety') {
      const uniqueBerries = new Set(berryPlots.filter(p => p.isHarvested).map(p => p.berryType));
      return uniqueBerries.size;
    }
    if (quest.requirement.type === 'total') {
      const berryNames = ['Oran Berry', 'Pecha Berry', 'Cheri Berry', 'Sitrus Berry', 'Lum Berry'];
      return items
        .filter(item => berryNames.includes(item.name))
        .reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    return 0;
  };

  const handleClaimReward = async (quest) => {
    if (!player?.id) return;

    setClaiming(true);
    try {
      let newGold = (player.gold || 0) + (quest.reward.gold || 0);
      const newCompleted = [...completedQuests, quest.id];

      await base44.entities.Player.update(player.id, {
        gold: newGold,
        completedBerryQuests: newCompleted
      });

      for (const rewardItem of quest.reward.items || []) {
        const existing = await base44.entities.Item.filter({ name: rewardItem.name });
        if (existing.length > 0) {
          await base44.entities.Item.update(existing[0].id, {
            quantity: (existing[0].quantity || 0) + rewardItem.quantity
          });
        } else {
          await base44.entities.Item.create({
            name: rewardItem.name,
            type: 'Material',
            tier: 1,
            rarity: 'Common',
            description: 'Berry seed from Merra',
            quantity: rewardItem.quantity,
            stackable: true
          });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Scroll className="w-5 h-5 text-amber-400" />
            Merra's Berry Quests
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            "I'm always looking for skilled berry farmers. Complete these tasks for rewards!"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {MERRA_QUESTS.map((quest) => {
            const progress = getQuestProgress(quest);
            const isComplete = progress >= quest.requirement.count;
            const isClaimed = completedQuests.includes(quest.id);

            return (
              <div
                key={quest.id}
                className={`rounded-lg p-4 border ${
                  isClaimed
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : isComplete
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{quest.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{quest.description}</p>
                  </div>
                  {isClaimed && (
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                </div>

                <div className="text-xs text-slate-300 mb-2">
                  Progress: {progress}/{quest.requirement.count}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-amber-300">
                    Reward: {quest.reward.gold}g
                    {quest.reward.items?.map(item => (
                      <span key={item.name}> + {item.quantity}× {item.name}</span>
                    ))}
                  </div>
                  {isComplete && !isClaimed && (
                    <Button
                      size="sm"
                      onClick={() => handleClaimReward(quest)}
                      disabled={claiming}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Claim
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          <Button variant="outline" onClick={onClose} className="w-full border-slate-700 mt-4">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}