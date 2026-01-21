import React from 'react';
import { Clock, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const getTimePhase = (hour) => {
  if (hour >= 5 && hour < 7) return { phase: 'Dawn', icon: Sunrise, color: 'text-orange-400' };
  if (hour >= 7 && hour < 18) return { phase: 'Day', icon: Sun, color: 'text-yellow-400' };
  if (hour >= 18 && hour < 20) return { phase: 'Dusk', icon: Sunset, color: 'text-purple-400' };
  return { phase: 'Night', icon: Moon, color: 'text-blue-400' };
};

const getDayName = (day) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[day % 7] || 'Mon';
};

export default function TimeWidget({ gameTime, compact = false }) {
  const hour = gameTime?.currentHour || 8;
  const day = gameTime?.currentDay || 1;
  const week = gameTime?.currentWeek || 1;
  const season = gameTime?.currentSeason || 'Spring';
  
  const { phase, icon: PhaseIcon, color } = getTimePhase(hour);
  const dayName = getDayName(day);

  if (compact) {
    return (
      <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
        <PhaseIcon className={`w-4 h-4 ${color}`} />
        <span className="text-white text-sm font-medium">
          {String(hour).padStart(2, '0')}:00
        </span>
        <Badge className="text-xs bg-slate-700/50 text-slate-300">
          {dayName}
        </Badge>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 border border-indigo-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h4 className="text-white font-semibold">In-Game Time</h4>
        </div>
        <Badge className={`${color.replace('text', 'bg').replace('400', '500/20')} ${color} border-${color.replace('text-', '')}/50`}>
          {phase}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Time</span>
          <div className="flex items-center gap-2">
            <PhaseIcon className={`w-4 h-4 ${color}`} />
            <span className="text-white font-mono text-lg">
              {String(hour).padStart(2, '0')}:00
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Day</span>
          <span className="text-white">{dayName}, Week {week}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Season</span>
          <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
            {season}
          </Badge>
        </div>
      </div>
    </div>
  );
}