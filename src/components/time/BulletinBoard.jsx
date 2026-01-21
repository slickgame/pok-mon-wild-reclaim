import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Trophy, Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const eventIcons = {
  Contest: Trophy,
  Tournament: TrendingUp,
  Market: Sparkles,
  Festival: Sparkles,
  Bonus: TrendingUp,
  'Legendary Spawn': Sparkles,
};

export default function BulletinBoard({ events = [], npcUpdates = [] }) {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-yellow-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Town Bulletin Board</h3>
      </div>

      {/* Active Events */}
      {events.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-400 mb-3">📢 Active Events</h4>
          <div className="space-y-2">
            {events.map((event, idx) => {
              const Icon = eventIcons[event.eventType];
              return (
                <motion.div
                  key={event.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass rounded-lg p-3"
                >
                  <div className="flex items-start gap-3">
                    {Icon && <Icon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-white font-semibold text-sm">{event.name}</h5>
                        <Badge className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                          {event.eventType}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">{event.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* NPC Updates */}
      {npcUpdates.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-400 mb-3">👥 NPC Sightings</h4>
          <div className="space-y-2">
            {npcUpdates.map((update, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-white text-sm font-medium">{update.npcName}</span>
                  </div>
                  <span className="text-xs text-slate-400">{update.location}</span>
                </div>
                {update.hint && (
                  <p className="text-xs text-slate-400 mt-1 italic">"{update.hint}"</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && npcUpdates.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No announcements today</p>
        </div>
      )}
    </div>
  );
}