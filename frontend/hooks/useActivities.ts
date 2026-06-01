import { useQuery } from '@tanstack/react-query';
import { searchActivities } from '@/lib/api';

export function useActivities(params: { lat: number; lng: number; radius?: number; enabled?: boolean }) {
  return useQuery({
    queryKey: ['activities', params.lat, params.lng, params.radius],
    queryFn: () => searchActivities(params),
    enabled: params.enabled ?? true,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
