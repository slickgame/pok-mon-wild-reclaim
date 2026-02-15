import React from 'react';
import { Shield, Heart, Eye, Swords, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const roleData = {
  Juggernaut: {
    icon: Shield,
    color: 'bg-slate-700/30 text-slate-200 border-slate-600',
    description: 'High defense, draws aggro'
  },
  Medic: {
    icon: Heart,
    color: 'bg-emerald-600/30 text-emerald-200 border-emerald-500',
    description: 'Healing and support abilities'
  },
  Scout: {
    icon: Eye,
    color: 'bg-cyan-600/30 text-cyan-200 border-cyan-500',
    description: 'Priority moves, high speed'
  },
  Tank: {
    icon: Shield,
    color: 'bg-blue-700/30 text-blue-200 border-blue-600',
    description: 'High HP and defense'
  },
  Striker: {
    icon: Swords,
    color: 'bg-red-600/30 text-red-200 border-red-500',
    description: 'High offensive power'
  },
  Support: {
    icon: Users,
    color: 'bg-purple-600/30 text-purple-200 border-purple-500',
    description: 'Buffs and team synergy'
  },
};

export default function RoleIndicator({ role, showDescription = false, size = 'md' }) {
  const roleInfo = roleData[role] || roleData.Support;
  const Icon = roleInfo.icon;

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${roleInfo.color} ${sizes[size]} flex items-center gap-1`}>
        <Icon className={iconSizes[size]} />
        {role}
      </Badge>
      {showDescription && (
        <span className="text-xs text-slate-300">{roleInfo.description}</span>
      )}
    </div>
  );
}