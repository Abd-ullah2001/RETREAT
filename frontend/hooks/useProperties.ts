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
    queryKey: ['properties', params],
    queryFn: () => searchProperties(params),
    enabled: params.enabled ?? true,
  });
}
