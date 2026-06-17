import { useState, useCallback } from 'react';
import { requireSupabase } from '../lib/supabase';
import type { Trip } from '../types';

export function useItineraryStream(tripId: string) {
  const [progress, setProgress] = useState<{
    step: number;
    message: string;
    percent: number;
  } | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStream = useCallback(
    async (onComplete: (trip: Trip) => void, feedback?: string) => {
      setIsStreaming(true);
      setError(null);

      const supabase = requireSupabase();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/trips/${tripId}/itinerary/stream?token=${token}`;
      if (feedback) {
        url += `&feedback=${encodeURIComponent(feedback)}`;
      }

      const es = new EventSource(url);

      es.addEventListener('progress', (e) => {
        setProgress(JSON.parse(e.data));
      });

      es.addEventListener('complete', (e) => {
        const { trip } = JSON.parse(e.data);
        setIsStreaming(false);
        setProgress(null);
        onComplete(trip);
        es.close();
      });

      es.addEventListener('error', (e) => {
        setIsStreaming(false);
        setError('Planning failed. Please try again.');
        es.close();
      });
    },
    [tripId]
  );

  return { progress, isStreaming, error, startStream };
}
