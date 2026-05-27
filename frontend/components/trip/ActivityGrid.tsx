'use client';

import { ActivityCard } from './ActivityCard';
import type { Activity } from '@/types';

export function ActivityGrid({ activities }: { activities: Activity[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
      {activities.slice(0, 8).map((a, i) => (
        <ActivityCard key={a.id} activity={a} index={i} />
      ))}
    </div>
  );
}
