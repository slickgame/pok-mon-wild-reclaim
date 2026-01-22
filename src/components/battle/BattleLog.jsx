import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Flame, Droplet, Skull } from 'lucide-react';

export default function BattleLog({ logs }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);
  
  const getLogIcon = (log) => {
    if (log.synergyTriggered) return <Zap className="w-3 h-3 text-cyan-400 flex-shrink-0" />;
    if (log.action.includes('Burn')) return <Flame className="w-3 h-3 text-orange-400 flex-shrink-0" />;
    if (log.action.includes('Poison')) return <Skull className="w-3 h-3 text-purple-400 flex-shrink-0" />;
    if (log.action.includes('super effective')) return <Sparkles className="w-3 h-3 text-yellow-400 flex-shrink-0" />;
    return null;
  };
  
  const getLogStyle = (log) => {
    if (log.synergyTriggered) return 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300';
    if (log.result?.includes('super effective')) return 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300';
    if (log.action.includes('fainted')) return 'bg-red-500/10 border border-red-500/30 text-red-300';
    if (log.actor === 'Victory' || log.actor === 'System') return 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300';
    return 'bg-slate-800/50 text-slate-300';
  };

  return (
    <div className="glass rounded-xl p-4 h-64 overflow-y-auto">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        Battle Log
      </h3>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {logs.map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`text-sm p-2 rounded ${getLogStyle(log)}`}
            >
              <div className="flex items-center gap-2">
                {getLogIcon(log)}
                <span>
                  <span className="font-semibold">{log.actor}</span> {log.action}
                  {log.result && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={log.result.includes('damage') ? 'text-red-400 font-bold' : 'text-slate-400'}
                    >
                      {' '}- {log.result}
                    </motion.span>
                  )}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={logEndRef} />
      </div>
    </div>
  );
}