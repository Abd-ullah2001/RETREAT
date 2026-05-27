import { useQuery } from '@tanstack/react-query';
import { getTrip } from '@/lib/api';

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTrip(tripId),
    enabled: !!tripId,
  });
}
