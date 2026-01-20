import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Wrench, BookOpen, Heart, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import StatBar from '@/components/ui/StatBar';

const roleIcons = {
  'Crafting Mentor': Wrench,
  'Professor': BookOpen,
  'Nurse': Heart,
  'Merchant': ShoppingBag,
};

const roleColors = {
  'Crafting Mentor': 'from-amber-500 to-orange-600',
  'Professor': 'from-emerald-500 to-green-600',
  'Nurse': 'from-pink-500 to-rose-600',
  'Merchant': 'from-purple-500 to-violet-600',
};

export default function NPCCard({ npc, trustLevel = 0, onClick }) {
  const Icon = roleIcons[npc.role] || BookOpen;
  const gradient = roleColors[npc.role] || 'from-indigo-500 to-purple-600';
  
  const getTrustTier = (trust) => {
    if (trust >= 80) return { label: 'Best Friend', color: 'text-yellow-400' };
    if (trust >= 50) return { label: 'Trusted', color: 'text-emerald-400' };
    if (trust >= 20) return { label: 'Friendly', color: 'text-blue-400' };
    return { label: 'Acquaintance', color: 'text-slate-400' };
  };
  
  const trustTier = getTrustTier(trustLevel);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass rounded-2xl overflow-hidden cursor-pointer group"
    >
      <div className={`h-24 bg-gradient-to-br ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/30" />
        {npc.avatarUrl ? (
          <img 
            src={npc.avatarUrl} 
            alt={npc.name} 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-20 object-contain"
          />
        ) : (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <Icon className="w-8 h-8 text-white/50" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-white">{npc.name}</h3>
            <p className="text-xs text-slate-400">{npc.role}</p>
          </div>
          <Badge className={`text-xs bg-transparent border-0 ${trustTier.color}`}>
            {trustTier.label}
          </Badge>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Trust</span>
            <span className="text-slate-300">{trustLevel}/{npc.maxTrust || 100}</span>
          </div>
          <StatBar
            value={trustLevel}
            maxValue={npc.maxTrust || 100}
            color={`bg-gradient-to-r ${gradient}`}
            showValue={false}
            size="sm"
          />
        </div>
        
        {npc.servicesAvailable && npc.servicesAvailable.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {npc.servicesAvailable.slice(0, 3).map((service, idx) => (
              <Badge key={idx} className="text-[10px] bg-slate-700/50 text-slate-300 border-slate-600/50">
                {service}
              </Badge>
            ))}
          </div>
        )}
        
        {npc.location && (
          <p className="text-[10px] text-slate-500 mt-2">📍 {npc.location}</p>
        )}
      </div>
    </motion.div>
  );
}