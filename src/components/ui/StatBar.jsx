import React from 'react';
import { motion } from 'framer-motion';

export default function StatBar({ 
  value, 
  maxValue, 
  color = 'bg-indigo-500', 
  label, 
  showValue = true,
  size = 'md',
  animated = true 
}) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showValue && (
            <span className="text-xs font-medium text-slate-300">
              {value}/{maxValue}
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-slate-700/50 rounded-full overflow-hidden`}>
        {animated ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full ${color} rounded-full`}
          />
        ) : (
          <div 
            className={`h-full ${color} rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
}