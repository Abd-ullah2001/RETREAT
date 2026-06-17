import { useQuery } from '@tanstack/react-query';
import { getWeatherForecast } from '../lib/api';

export function useWeather(params: { lat: number; lng: number; days: number }) {
  return useQuery({
    queryKey: ['weather', params.lat, params.lng, params.days],
    queryFn: () => getWeatherForecast(params),
    staleTime: 3 * 60 * 60 * 1000, // 3 hours
    enabled: !!params.lat && !!params.lng && !!params.days,
  });
}
