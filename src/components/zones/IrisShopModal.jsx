import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sprout, Coins } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const SEED_SHOP_ITEMS = [
  { name: 'Oran Berry Seed', price: 30, description: 'Grows into healing Oran Berries' },
  { name: 'Pecha Berry Seed', price: 35, description: 'Grows into Pecha Berries' },
  { name: 'Cheri Berry Seed', price: 25, description: 'Grows into Cheri Berries' },
  { name: 'Sitrus Berry Seed', price: 80, description: 'Rare seed for premium berries' },
  { name: 'Lum Berry Seed', price: 120, description: 'Very rare seed for miracle berries' }
];

export default function IrisShopModal({ isOpen, onClose, player, onPurchase }) {
  const [buying, setBuying] = useState(false);
  const queryClient = useQueryClient();

  const handleBuy = async (item) => {
    if ((player?.gold || 0) < item.price) {
      alert('Not enough gold!');
      return;
    }

    setBuying(true);
    try {
      await base44.entities.Player.update(player.id, {
        gold: (player.gold || 0) - item.price
      });

      const existingItems = await base44.entities.Item.filter({ name: item.name });
      if (existingItems.length > 0) {
        await base44.entities.Item.update(existingItems[0].id, {
          quantity: (existingItems[0].quantity || 0) + 1
        });
      } else {
        await base44.entities.Item.create({
          name: item.name,
          type: 'Material',
          tier: 1,
          rarity: 'Common',
          description: item.description,
          quantity: 1,
          stackable: true,
          sellValue: Math.floor(item.price * 0.3)
        });
      }

      queryClient.invalidateQueries({ queryKey: ['player'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      
      if (onPurchase) onPurchase(item.name);
    } catch (error) {
      console.error('Failed to purchase seed:', error);
    } finally {
      setBuying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            Iris's Seed Shop
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            "Welcome, traveler! Looking to start your own berry farm?"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm bg-slate-800/50 rounded-lg p-3">
            <span className="text-slate-300">Your Gold:</span>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
              <Coins className="w-3 h-3 mr-1" />
              {player?.gold || 0}g
            </Badge>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {SEED_SHOP_ITEMS.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
              >
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleBuy(item)}
                  disabled={buying || (player?.gold || 0) < item.price}
                  className="ml-3 bg-emerald-600 hover:bg-emerald-700"
                >
                  {item.price}g
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" onClick={onClose} className="w-full border-slate-700">
            Close Shop
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}