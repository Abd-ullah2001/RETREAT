import { useQuery } from '@tanstack/react-query';
import { searchRestaurants } from '../lib/api';

export function useRestaurants(params: { lat: number; lng: number; radius?: number; cuisine?: string }) {
  return useQuery({
    queryKey: ['restaurants', params.lat, params.lng, params.radius, params.cuisine],
    queryFn: () => searchRestaurants(params),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!params.lat && !!params.lng,
  });
}
