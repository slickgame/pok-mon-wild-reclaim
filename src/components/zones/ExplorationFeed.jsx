import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const eventIcons = {
  pokemon: '🔵',
  material: '🟢',
  poi: '🟡',
  special: '🔴',
};

export default function ExplorationFeed({ events }) {
  return (
    <div className="glass rounded-xl p-4 max-h-96 overflow-y-auto">
      <h4 className="text-sm font-semibold text-white mb-3">Exploration Log</h4>
      <AnimatePresence mode="popLayout">
        {events.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">
            Start exploring to discover what's hidden...
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event, idx) => (
              <motion.div
                key={`${event.id}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`glass rounded-lg p-3 border-l-2 ${
                  event.rarity === 'rare' ? 'border-purple-500' :
                  event.rarity === 'uncommon' ? 'border-blue-500' :
                  'border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">
                    {eventIcons[event.type]}
                  </span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{event.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{event.description}</p>
                    {event.firstDiscovery && (
                      <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        First discovery!
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}