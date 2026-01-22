import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Lock, Trees, Mountain, Waves, Compass, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import StatBar from '@/components/ui/StatBar';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const biomeIcons = {
  Forest: Trees,
  Mountain: Mountain,
  Lake: Waves,
  Cave: Compass,
  Plains: Sparkles,
  Ruins: Compass,
  Swamp: Waves,
};

const biomeColors = {
  Forest: 'from-emerald-600 to-green-700',
  Mountain: 'from-stone-500 to-slate-700',
  Lake: 'from-blue-500 to-cyan-600',
  Cave: 'from-slate-700 to-slate-900',
  Plains: 'from-amber-500 to-yellow-600',
  Ruins: 'from-purple-600 to-indigo-800',
  Swamp: 'from-teal-600 to-emerald-800',
};

export default function ZoneCard({ zone, isDiscovered, onClick }) {
  const { data: zoneProgress } = useQuery({
    queryKey: ['zoneProgress', zone.id],
    queryFn: async () => {
      const progs = await base44.entities.ZoneProgress.filter({ zoneId: zone.id });
      return progs[0] || null;
    },
    enabled: isDiscovered
  });

  const progress = zoneProgress?.discoveryProgress || 0;
  const progressPercent = Math.round(progress);

  const getTier = (progress) => {
    if (progress >= 100) return 'Mastered';
    if (progress >= 61) return 'Known';
    if (progress >= 26) return 'Familiar';
    return 'Unfamiliar';
  };

  const Icon = biomeIcons[zone.biomeType] || MapPin;
  const gradient = biomeColors[zone.biomeType] || 'from-indigo-500 to-purple-600';
  
  return (
    <motion.div
      whileHover={{ scale: isDiscovered ? 1.02 : 1, y: isDiscovered ? -4 : 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={isDiscovered ? onClick : undefined}
      className={`glass rounded-2xl overflow-hidden ${isDiscovered ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
    >
      <div className={`h-36 bg-gradient-to-br ${gradient} relative`}>
        {zone.imageUrl ? (
          <img src={zone.imageUrl} alt={zone.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-16 h-16 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {!isDiscovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <span className="text-sm text-slate-300">Lv. {zone.requiredLevel} Required</span>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 right-3">
          <Badge className="bg-black/40 text-white border-white/20 backdrop-blur-sm">
            {zone.biomeType}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-white text-lg mb-1">{zone.name}</h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{zone.description}</p>
        
        {isDiscovered && (
          <>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Exploration: {progressPercent}%</span>
                <span className="text-slate-500">{getTier(progress)}</span>
              </div>
              <StatBar
                value={progress}
                maxValue={100}
                color="bg-gradient-to-r from-indigo-500 to-cyan-500"
                showValue={false}
                size="sm"
              />
            </div>
            
            {zone.availableWildPokemon && zone.availableWildPokemon.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-slate-500">Wild:</span>
                {zone.availableWildPokemon.slice(0, 3).map((p, idx) => (
                  <Badge key={idx} className="text-[10px] bg-slate-700/50 text-slate-300">
                    {p.species}
                  </Badge>
                ))}
                {zone.availableWildPokemon.length > 3 && (
                  <Badge className="text-[10px] bg-slate-700/50 text-slate-400">
                    +{zone.availableWildPokemon.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}