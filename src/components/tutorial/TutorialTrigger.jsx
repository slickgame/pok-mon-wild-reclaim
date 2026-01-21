import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to trigger tutorials based on game events
 */
export function useTutorialTrigger() {
  const queryClient = useQueryClient();

  const triggerTutorial = async (triggerName) => {
    try {
      const tutorials = await base44.entities.Tutorial.filter({ 
        trigger: triggerName,
        isCompleted: false,
        isSkipped: false
      });

      if (tutorials.length > 0) {
        // Invalidate tutorial query to show the tutorial
        queryClient.invalidateQueries({ queryKey: ['tutorials'] });
      }
    } catch (error) {
      console.error('Failed to trigger tutorial:', error);
    }
  };

  return { triggerTutorial };
}

export default function TutorialTrigger() {
  return null;
}