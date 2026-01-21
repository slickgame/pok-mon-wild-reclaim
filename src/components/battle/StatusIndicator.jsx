import React from 'react';
import { Flame, Zap, Droplet, Moon, Snowflake, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  Burn: { icon: Flame, color: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
  Paralysis: { icon: Zap, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
  Poison: { icon: Droplet, color: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
  Sleep: { icon: Moon, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' },
  Freeze: { icon: Snowflake, color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' },
  Confusion: { icon: HelpCircle, color: 'bg-pink-500/20 text-pink-300 border-pink-500/50' },
};

export default function StatusIndicator({ statuses }) {
  if (!statuses || statuses.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {statuses.map((status, idx) => {
        const config = statusConfig[status] || statusConfig.Confusion;
        const Icon = config.icon;

        return (
          <Badge key={idx} className={`${config.color} text-xs flex items-center gap-1`}>
            <Icon className="w-3 h-3" />
            {status}
          </Badge>
        );
      })}
    </div>
  );
}