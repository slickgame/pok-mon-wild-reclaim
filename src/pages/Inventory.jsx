import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Backpack, Search, Filter, Package, Beaker, Target, Sparkles, Key, Swords, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import PageHeader from '@/components/common/PageHeader';
import ItemCard from '@/components/inventory/ItemCard';
import TMUsageModal from '@/components/items/TMUsageModal';

const itemTypes = [
  { value: 'all', label: 'All', icon: Package },
  { value: 'Potion', label: 'Potions', icon: Beaker },
  { value: 'Battle Item', label: 'Battle', icon: Swords },
  { value: 'Held Item', label: 'Held', icon: Sparkles },
  { value: 'Material', label: 'Materials', icon: Package },
  { value: 'Key Item', label: 'Key Items', icon: Key },
];

export default function InventoryPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tmModalItem, setTmModalItem] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list()
  });

  const filteredItems = items.filter(item => {
    const matchesType = filter === 'all' || item.type === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div>
      <PageHeader 
        title="Inventory" 
        subtitle={`${totalItems} items total`}
        icon={Backpack}
        action={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-800/50 border-slate-700 w-48"
            />
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {itemTypes.map((type) => (
            <Button
              key={type.value}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(type.value)}
              className={`rounded-full ${
                filter === type.value 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <type.icon className="w-4 h-4 mr-2" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {[...Array(16)].map((_, i) => (
            <Skeleton key={i} className="aspect-square bg-slate-800" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        filter === 'all' ? (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([type, typeItems]) => (
              <motion.div 
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                  {type}
                  <Badge className="bg-slate-700/50 text-slate-300">{typeItems.length}</Badge>
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {typeItems.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onClick={() => setSelectedItem(item)}
                      selected={selectedItem?.id === item.id}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
              >
                <ItemCard 
                  item={item} 
                  onClick={() => setSelectedItem(item)}
                  selected={selectedItem?.id === item.id}
                />
              </motion.div>
            ))}
          </motion.div>
        )
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <Backpack className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold text-white mb-2">Inventory Empty</h3>
          <p className="text-slate-400">Explore zones and craft items to fill your bag!</p>
        </div>
      )}

      {/* Item Detail Sheet */}
      <Sheet open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-md">
          {selectedItem && (
            <ItemDetailView 
              item={selectedItem} 
              onClose={() => setSelectedItem(null)}
              onUseTM={(item) => {
                setTmModalItem(item);
                setSelectedItem(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* TM Usage Modal */}
      {tmModalItem && (
        <TMUsageModal
          tmItem={tmModalItem}
          onUse={async (item) => {
            // Consume TM
            if (item.quantity > 1) {
              await base44.entities.Item.update(item.id, { quantity: item.quantity - 1 });
            } else {
              await base44.entities.Item.delete(item.id);
            }
          }}
          onClose={() => setTmModalItem(null)}
        />
      )}
    </div>
  );
}

function ItemDetailView({ item, onClose, onUseTM }) {
  const typeIcons = {
    'Potion': Beaker,
    'Bait': Target,
    'Held Item': Sparkles,
    'Material': Package,
    'Key Item': Key,
    'Battle Item': Swords,
  };

  const rarityColors = {
    'Common': 'from-slate-500 to-slate-600',
    'Uncommon': 'from-green-500 to-emerald-600',
    'Rare': 'from-blue-500 to-cyan-600',
    'Epic': 'from-purple-500 to-violet-600',
    'Legendary': 'from-yellow-500 to-amber-600',
  };

  const Icon = typeIcons[item.type] || Package;
  const gradient = rarityColors[item.rarity] || 'from-slate-500 to-slate-600';

  return (
    <div className="pt-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-white"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} p-1`}>
          <div className="w-full h-full rounded-xl bg-slate-900/80 flex items-center justify-center">
            {item.iconUrl ? (
              <img src={item.iconUrl} alt={item.name} className="w-16 h-16 object-contain" />
            ) : (
              <Icon className="w-10 h-10 text-white/70" />
            )}
          </div>
        </div>
      </div>

      {/* Name & Badges */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">{item.name}</h2>
        <div className="flex justify-center gap-2">
          <Badge className="bg-slate-700/50 text-slate-300">{item.type}</Badge>
          <Badge className={`bg-gradient-to-r ${gradient} text-white border-0`}>
            {item.rarity}
          </Badge>
          <Badge className="bg-slate-700/50 text-slate-300">Tier {item.tier}</Badge>
        </div>
      </div>

      {/* Quantity */}
      {item.quantity > 1 && (
        <div className="glass rounded-xl p-4 mb-4 text-center">
          <p className="text-slate-400 text-sm">Quantity</p>
          <p className="text-2xl font-bold text-white">{item.quantity}</p>
        </div>
      )}

      {/* Description */}
      {item.description && (
        <div className="glass rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
          <p className="text-slate-300 text-sm">{item.description}</p>
        </div>
      )}

      {/* Effects */}
      {item.effects && (
        <div className="glass rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-2">Effects</h3>
          <p className="text-emerald-400 text-sm">{item.effects}</p>
        </div>
      )}

      {/* Value */}
      {item.sellValue > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Sell Value</span>
            <span className="text-amber-400 font-semibold">💰 {item.sellValue}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" className="flex-1 border-slate-700 text-slate-300">
          Drop
        </Button>
        <Button 
          className="flex-1 bg-gradient-to-r from-indigo-500 to-cyan-500"
          onClick={() => {
            // Check if it's a TM item
            if (item.name.match(/TM\d+/i)) {
              onUseTM(item);
            } else {
              // Other item usage logic
              alert('Item usage coming soon!');
            }
          }}
        >
          Use
        </Button>
      </div>
    </div>
  );
}