import { useQuery } from '@tanstack/react-query';
import { searchProperties } from '@/lib/api';

export function useProperties(params: {
  destination: string;
  destId?: string;
  checkin: string;
  checkout: string;
  guests: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['properties', params.destination, params.checkin, params.checkout, params.guests, params.destId],
    queryFn: () => searchProperties(params),
    enabled: params.enabled ?? true,
    staleTime: 15 * 60 * 1000,
  });
}
