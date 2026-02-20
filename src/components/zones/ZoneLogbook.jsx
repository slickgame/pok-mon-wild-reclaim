import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { BookOpen, MapPin, Gem, CheckCircle, Lock } from 'lucide-react';

export default function ZoneLogbook({ zone, zoneProgress }) {
  const discoveredMaterials = zoneProgress?.discoveredMaterials || [];
  const discoveredPOIs = zoneProgress?.discoveredPOIs || [];
  const nodelets = zone?.nodelets || [];

  // Define possible materials in the zone (you can expand this)
  const zoneMaterials = [
    'Silk Fragment',
    'Glowworm',
    'Moonleaf',
    'River Stone',
    'Ancient Shard',
    'Bog Reed',
    'Wild Honey',
    'Wax Comb',
    'Royal Jelly'
  ];

  const discoveredMaterialCount = zoneMaterials.filter((material) =>
    discoveredMaterials.includes(material)
  ).length;

  const discoveredPOICount = nodelets.filter((nodelet) =>
    discoveredPOIs.includes(nodelet.id)
  ).length;

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          Zone Logbook
        </h3>
      </div>

      {/* Materials Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Gem className="w-4 h-4 text-cyan-400" />
            Materials
          </h4>
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
            {discoveredMaterialCount}/{zoneMaterials.length}
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {zoneMaterials.map((material, idx) => {
            const isDiscovered = discoveredMaterials.includes(material);
            return (
              <motion.div
                key={material}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className={`rounded-lg p-3 border text-sm flex items-center gap-2 ${
                  isDiscovered
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                    : 'bg-slate-900/30 border-slate-700/30 text-slate-600'
                }`}
              >
                {isDiscovered ? (
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
                )}
                <span className="truncate text-xs">
                  {isDiscovered ? material : '???'}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Points of Interest Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Points of Interest
          </h4>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
            {discoveredPOICount}/{nodelets.length}
          </Badge>
        </div>
        {nodelets.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-4">
            No locations recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {nodelets.map((nodelet, idx) => {
              const isDiscovered = discoveredPOIs.includes(nodelet.id);
              return (
                <motion.div
                  key={nodelet.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`rounded-lg p-3 border flex items-center justify-between ${
                    isDiscovered
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-900/30 border-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isDiscovered ? (
                      <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-700 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${
                        isDiscovered ? 'text-white' : 'text-slate-600'
                      }`}>
                        {isDiscovered ? nodelet.name : '??? Location'}
                      </p>
                      {isDiscovered && (
                        <p className="text-xs text-slate-400">{nodelet.type}</p>
                      )}
                    </div>
                  </div>
                  {isDiscovered && nodelet.isCompleted && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                      Complete
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completion Message */}
      {discoveredMaterialCount === zoneMaterials.length &&
        discoveredPOICount === nodelets.length &&
        nodelets.length > 0 && (
        <div className="mt-6 p-3 bg-gradient-to-r from-amber-500/10 to-cyan-500/10 border border-amber-500/30 rounded-lg text-center">
          <p className="text-amber-200 text-sm font-semibold">
            📖 Logbook Complete! All materials and locations discovered.
          </p>
        </div>
      )}
    </div>
  );
}