import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingBag, Zap, Plus, Minus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShopInventory } from '@/data/ShopInventory';
import { ItemRegistry } from '@/data/ItemRegistry';

const BASE_SHOP_ITEMS = [
  { name: 'Pokéball', price: 200, type: 'Capture Gear', description: 'A standard ball for catching Pokémon', rarity: 'Common' },
  { name: 'Great Ball', price: 600, type: 'Capture Gear', description: 'Better catch rate than a Pokéball', rarity: 'Uncommon' },
  { name: 'Potion', price: 300, type: 'Potion', description: 'Restores 50 HP', rarity: 'Common' },
  { name: 'Super Potion', price: 700, type: 'Potion', description: 'Restores 100 HP', rarity: 'Uncommon' },
  { name: 'Basic Bait', price: 150, type: 'Bait', description: 'Attracts common Pokémon while fishing', rarity: 'Common' },
  { name: 'Quality Bait', price: 400, type: 'Bait', description: 'Attracts uncommon Pokémon while fishing', rarity: 'Uncommon' },
];

export default function ShopBuyTab({ player, inventory }) {
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const buyMutation = useMutation({
    mutationFn: async ({ item, quantity }) => {
      const totalCost = item.price * quantity;
      
      if (player.gold < totalCost) {
        throw new Error('Not enough gold!');
      }

      // Update player gold
      await base44.entities.Player.update(player.id, {
        gold: player.gold - totalCost
      });

      // Check if item already exists in inventory
      const existingItem = inventory.find(i => i.name === item.name && i.type === item.type);
      
      if (existingItem) {
        // Update quantity
        await base44.entities.Item.update(existingItem.id, {
          quantity: (existingItem.quantity || 1) + quantity
        });
      } else {
        // Create new item
        await base44.entities.Item.create({
          name: item.name,
          type: item.type,
          description: item.description,
          rarity: item.rarity,
          quantity: quantity,
          stackable: true,
          sellValue: Math.floor(item.price * 0.5)
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['player'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setQuantities(prev => ({ ...prev, [variables.item.name]: 1 }));
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  });

  const getQuantity = (itemName) => quantities[itemName] || 1;

  const adjustQuantity = (itemName, delta) => {
    const current = getQuantity(itemName);
    const newQty = Math.max(1, Math.min(99, current + delta));
    setQuantities(prev => ({ ...prev, [itemName]: newQty }));
  };

  const registryItems = (ShopInventory?.Meera || []).map((entry) => {
    const item = ItemRegistry?.[entry.id];
    if (!item) return null;
    return {
      name: item.name,
      price: entry.price,
      type: item.type || 'Item',
      description: item.description || 'A useful item.',
      rarity: item.rarity || 'Common'
    };
  }).filter(Boolean);

  const shopItems = [...BASE_SHOP_ITEMS, ...registryItems];

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

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </motion.div>
      )}

      {/* Shop Items */}
      <div className="space-y-3">
        {shopItems.map((item, idx) => {
          const quantity = getQuantity(item.name);
          const totalCost = item.price * quantity;
          const canAfford = player.gold >= totalCost;

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
                  <h4 className="text-white font-semibold">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="text-xs bg-slate-700">{item.type}</Badge>
                    <Badge className="text-xs bg-indigo-700">{item.rarity}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    {item.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
                  <button
                    onClick={() => adjustQuantity(item.name, -1)}
                    className="w-8 h-8 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-white font-semibold">{quantity}</span>
                  <button
                    onClick={() => adjustQuantity(item.name, 1)}
                    className="w-8 h-8 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  onClick={() => buyMutation.mutate({ item, quantity })}
                  disabled={!canAfford || buyMutation.isPending}
                  className={`flex-1 ${canAfford ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600' : 'bg-slate-700 cursor-not-allowed'}`}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Buy for {totalCost}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
