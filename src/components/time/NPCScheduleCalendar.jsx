import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Briefcase, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22];

export default function NPCScheduleCalendar({ schedule, currentHour, currentDay }) {
  const isDiscovered = schedule?.isDiscovered || schedule?.interactionCount >= 2;

  if (!isDiscovered) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <Lock className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <h4 className="text-white font-semibold mb-2">Schedule Unknown</h4>
        <p className="text-slate-400 text-sm">
          Interact with {schedule?.npcName} more to learn their schedule
        </p>
        <p className="text-xs text-slate-500 mt-2">
          ({schedule?.interactionCount || 0}/2 interactions)
        </p>
      </div>
    );
  }

  const getDaySchedule = (day) => {
    if (!schedule?.weeklyAvailability?.includes(day)) {
      return [];
    }
    return schedule?.dailySchedule || [];
  };

  const isNPCAvailable = (day, hour) => {
    const daySchedule = getDaySchedule(day);
    return daySchedule.some(slot => 
      hour >= slot.startHour && hour < slot.endHour
    );
  };

  const getSlotInfo = (day, hour) => {
    const daySchedule = getDaySchedule(day);
    return daySchedule.find(slot => 
      hour >= slot.startHour && hour < slot.endHour
    );
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-semibold">{schedule?.npcName}'s Schedule</h4>
        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
          <Clock className="w-3 h-3 mr-1" />
          Known
        </Badge>
      </div>

      {/* Weekly Grid */}
      <div className="overflow-x-auto">
        <div className="inline-grid grid-cols-[auto,repeat(7,minmax(60px,1fr))] gap-1 min-w-full">
          {/* Header */}
          <div className="text-xs text-slate-400 p-2"></div>
          {DAYS.map((day, idx) => (
            <div 
              key={day} 
              className={`text-xs font-semibold text-center p-2 ${
                currentDay === idx + 1 ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              {day}
            </div>
          ))}

          {/* Time slots */}
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              <div className="text-xs text-slate-400 p-2 text-right">
                {String(hour).padStart(2, '0')}:00
              </div>
              {DAYS.map((_, dayIdx) => {
                const day = dayIdx + 1;
                const available = isNPCAvailable(day, hour);
                const slotInfo = getSlotInfo(day, hour);
                const isCurrent = currentDay === day && currentHour === hour;

                return (
                  <motion.div
                    key={`${day}-${hour}`}
                    whileHover={available ? { scale: 1.05 } : {}}
                    className={`
                      rounded p-1 min-h-[40px] flex items-center justify-center relative
                      ${available ? 'bg-emerald-500/20 cursor-pointer' : 'bg-slate-800/30'}
                      ${isCurrent ? 'ring-2 ring-cyan-500' : ''}
                    `}
                    title={slotInfo ? `${slotInfo.location} - ${slotInfo.activity}` : ''}
                  >
                    {available && (
                      <div className="text-center">
                        {slotInfo?.servicesAvailable?.[0] && (
                          <Briefcase className="w-3 h-3 text-emerald-400 mx-auto" />
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-700">
        {schedule?.dailySchedule?.map((slot, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/20"></div>
            <div className="text-xs">
              <span className="text-white font-medium">{slot.startHour}:00-{slot.endHour}:00</span>
              <span className="text-slate-400 ml-2">{slot.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}