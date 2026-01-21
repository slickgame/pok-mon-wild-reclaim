import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';

export default function BattleLog({ logs }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="glass rounded-xl p-4 h-48 overflow-y-auto">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        Battle Log
      </h3>
      <div className="space-y-2">
        <AnimatePresence>
          {logs.map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-sm p-2 rounded ${
                log.synergyTriggered 
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300' 
                  : 'bg-slate-800/50 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {log.synergyTriggered && (
                  <Zap className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                )}
                <span>
                  <span className="font-semibold">{log.actor}</span> {log.action}
                  {log.result && <span className="text-slate-400"> - {log.result}</span>}
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