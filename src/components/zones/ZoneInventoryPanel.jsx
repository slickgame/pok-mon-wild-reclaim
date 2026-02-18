import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Backpack, Package, Beaker, Target, Sparkles, Key, Swords, Sprout, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import ItemCard from '@/components/inventory/ItemCard';

const itemTypes = [
  { value: 'all', label: 'All', icon: Package },
  { value: 'Potion', label: 'Potions', icon: Beaker },
  { value: 'Capture Gear', label: 'Pokéballs', icon: Target },
  { value: 'Battle Item', label: 'Battle', icon: Swords },
  { value: 'Held Item', label: 'Held', icon: Sparkles },
  { value: 'berry', label: 'Berries', icon: Sprout },
  { value: 'Material', label: 'Materials', icon: Package },
  { value: 'Key Item', label: 'Key Items', icon: Key },
];

export default function ZoneInventoryPanel({ items = [] }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const stackedItems = {};
  items.forEach(item => {
    const key = item.name;
    if (!stackedItems[key]) {
      stackedItems[key] = { ...item, quantity: item.quantity || 1, _ids: [item.id] };
    } else {
      stackedItems[key].quantity += (item.quantity || 1);
      stackedItems[key]._ids.push(item.id);
    }
  });

  const isBerry = (item) =>
    (item.name?.includes('Berry') && !item.name?.includes('Seed')) || item.type === 'Consumable';
  const isSeed = (item) => item.name?.includes('Berry Seed');

  const filteredItems = Object.values(stackedItems).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'berry') return (isBerry(item) || isSeed(item)) && matchesSearch;
    if (filter === 'all') return matchesSearch;
    return item.type === filter && !isBerry(item) && !isSeed(item) && matchesSearch;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    const group = isBerry(item) ? 'Berries' : isSeed(item) ? 'Seeds' : item.type;
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Backpack className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white">Inventory</h3>
          <Badge className="bg-slate-700 text-slate-300">{Object.values(stackedItems).length}</Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <Input
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 bg-slate-800/50 border-slate-700 w-36 h-8 text-sm"
          />
        </div>
      </div>

      <div className="mb-4 overflow-x-auto pb-1">
        <div className="flex gap-1.5 min-w-max">
          {itemTypes.map((type) => (
            <Button
              key={type.value}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(type.value)}
              className={`rounded-full h-7 px-3 text-xs ${
                filter === type.value
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <type.icon className="w-3 h-3 mr-1" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {filteredItems.length > 0 ? (
        filter === 'all' ? (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([group, groupItems]) => (
              <div key={group}>
                <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                  {group}
                  <Badge className="bg-slate-700/50 text-slate-400 text-[10px]">{groupItems.length}</Badge>
                </h4>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {groupItems.map(item => (
                    <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} selected={selectedItem?.id === item.id} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {filteredItems.map((item, idx) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.02 }}>
                <ItemCard item={item} onClick={() => setSelectedItem(item)} selected={selectedItem?.id === item.id} />
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-8 text-slate-400 text-sm">
          No items found.
        </div>
      )}

      <Sheet open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-md">
          {selectedItem && (
            <div className="pt-6">
              <Button variant="ghost" size="icon" onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-slate-400">
                <X className="w-5 h-5" />
              </Button>
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white">{selectedItem.name}</h2>
                <div className="flex justify-center gap-2 mt-2">
                  <Badge className="bg-slate-700/50 text-slate-300">{selectedItem.type}</Badge>
                  <Badge className="bg-slate-700/50 text-slate-300">×{selectedItem.quantity}</Badge>
                </div>
              </div>
              {selectedItem.description && (
                <p className="text-slate-300 text-sm bg-slate-800/50 rounded-lg p-3">{selectedItem.description}</p>
              )}
              {selectedItem.effects && (
                <p className="text-emerald-400 text-sm mt-3 bg-slate-800/50 rounded-lg p-3">{selectedItem.effects}</p>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}