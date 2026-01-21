import React from 'react';
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TimePhaseIndicator({ hour, showLabel = true }) {
  let phase, Icon, bgColor, textColor;

  if (hour >= 5 && hour < 7) {
    phase = 'Dawn';
    Icon = Sunrise;
    bgColor = 'bg-orange-500/20';
    textColor = 'text-orange-400';
  } else if (hour >= 7 && hour < 18) {
    phase = 'Day';
    Icon = Sun;
    bgColor = 'bg-yellow-500/20';
    textColor = 'text-yellow-400';
  } else if (hour >= 18 && hour < 20) {
    phase = 'Dusk';
    Icon = Sunset;
    bgColor = 'bg-purple-500/20';
    textColor = 'text-purple-400';
  } else {
    phase = 'Night';
    Icon = Moon;
    bgColor = 'bg-blue-500/20';
    textColor = 'text-blue-400';
  }

  return (
    <Badge className={`${bgColor} ${textColor} border-${textColor.split('-')[1]}/50`}>
      <Icon className="w-3 h-3 mr-1" />
      {showLabel && phase}
    </Badge>
  );
}