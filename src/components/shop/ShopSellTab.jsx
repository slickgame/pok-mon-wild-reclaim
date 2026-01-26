import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, Zap, Plus, Minus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ShopSellTab({ player, inventory }) {
  const [quantities, setQuantities] = useState({});
  const queryClient = useQueryClient();

  const sellMutation = useMutation({
    mutationFn: async ({ item, quantity }) => {
      const sellValue = item.sellValue || Math.floor((item.price || 0) * 0.5) || 10;
      const totalSale = sellValue * quantity;

      // Update player gold
      await base44.entities.Player.update(player.id, {
        gold: (player.gold || 0) + totalSale
      });

      // Handle stacked items - remove from multiple item instances if needed
      let remaining = quantity;
      for (const id of item._ids) {
        if (remaining <= 0) break;
        
        const itemInstance = inventory.find(i => i.id === id);
        if (!itemInstance) continue;
        
        const itemQty = itemInstance.quantity || 1;
        
        if (itemQty <= remaining) {
          await base44.entities.Item.delete(id);
          remaining -= itemQty;
        } else {
          await base44.entities.Item.update(id, {
            quantity: itemQty - remaining
          });
          remaining = 0;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['player'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setQuantities(prev => ({ ...prev, [variables.item.name]: 1 }));
    }
  });

  const getQuantity = (itemName) => quantities[itemName] || 1;

  const adjustQuantity = (itemName, maxQty, delta) => {
    const current = getQuantity(itemName);
    const newQty = Math.max(1, Math.min(maxQty, current + delta));
    setQuantities(prev => ({ ...prev, [itemName]: newQty }));
  };

  // Group items by name to combine duplicates
  const stackedItems = {};
  inventory.forEach(item => {
    const key = item.name;
    if (!stackedItems[key]) {
      stackedItems[key] = {
        ...item,
        quantity: item.quantity || 1,
        _ids: [item.id]
      };
    } else {
      stackedItems[key].quantity += (item.quantity || 1);
      stackedItems[key]._ids.push(item.id);
    }
  });

  const sellableItems = Object.values(stackedItems).filter(item => 
    item.sellValue > 0 || item.type === 'Material' || item.type === 'Potion' || item.type === 'Bait' || item.type === 'Capture Gear'
  );

  if (sellableItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto mb-4 text-slate-600" />
        <h3 className="text-lg font-semibold text-white mb-2">No Items to Sell</h3>
        <p className="text-slate-400 text-sm">Buy items from the shop or gather materials to sell them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Player Gold */}
      <div className="glass rounded-lg p-4 flex items-center justify-between">
        <span className="text-slate-400">Your Gold:</span>
        <span className="text-yellow-400 font-bold flex items-center gap-2">
          <Zap className="w-5 h-5" />
          {player.gold || 0}
        </span>
      </div>

      {/* Sellable Items */}
      <div className="space-y-3">
        {sellableItems.map((item, idx) => {
          const quantity = getQuantity(item.name);
          const maxQty = item.quantity;
          const sellValue = item.sellValue || Math.floor((item.price || 0) * 0.5) || 10;
          const totalSale = sellValue * quantity;

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-semibold">{item.name}</h4>
                    <Badge className="text-xs bg-slate-700">×{maxQty}</Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="text-xs bg-slate-700">{item.type}</Badge>
                    {item.rarity && (
                      <Badge className="text-xs bg-indigo-700">{item.rarity}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    {sellValue} ea
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
                  <button
                    onClick={() => adjustQuantity(item.name, maxQty, -1)}
                    className="w-8 h-8 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-white font-semibold">{quantity}</span>
                  <button
                    onClick={() => adjustQuantity(item.name, maxQty, 1)}
                    className="w-8 h-8 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  onClick={() => sellMutation.mutate({ item, quantity })}
                  disabled={sellMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Sell for {totalSale}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}