import axios from 'axios';
import { config } from '../config.js';
import logger from '../lib/logger.js';
import type { WeatherForecast, DayWeather } from '../schemas/weather.js';
import { cacheGet, cacheSet } from './cacheService.js';

const CACHE_TTL = 3 * 60 * 60; // 3 hours
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5/forecast';

export async function getForecast(params: {
  lat: number;
  lng: number;
  days: number;
}): Promise<WeatherForecast | null> {
  const cacheKey = `weather:${params.lat.toFixed(1)}:${params.lng.toFixed(1)}`;

  const cached = await cacheGet<WeatherForecast>(cacheKey);
  if (cached) {
    // Return only the requested number of days
    return {
      ...cached,
      days: cached.days.slice(0, params.days),
    };
  }

  try {
    const { data } = await axios.get(OPENWEATHER_URL, {
      params: {
        lat: params.lat,
        lon: params.lng,
        appid: config.OPENWEATHERMAP_API_KEY,
        units: 'metric',
        cnt: 40,
      },
      timeout: 10_000,
    });

    // Group 3-hourly intervals by date
    const dailyData = new Map<string, any[]>();
    for (const item of data.list) {
      // item.dt_txt format is "YYYY-MM-DD HH:MM:SS"
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, []);
      }
      dailyData.get(date)?.push(item);
    }

    const days: DayWeather[] = [];

    for (const [date, intervals] of dailyData.entries()) {
      if (days.length >= 7) break; // Max we care about is 7 days

      let tempMin = Infinity;
      let tempMax = -Infinity;
      let maxPop = 0;
      let sumHumidity = 0;
      let sumWindSpeed = 0;

      // Find the interval closest to midday (12:00:00) for description/icon
      let middayInterval = intervals[0];
      for (const interval of intervals) {
        if (interval.dt_txt.includes('12:00:00')) {
          middayInterval = interval;
        }
        
        const temp = interval.main.temp;
        if (temp < tempMin) tempMin = temp;
        if (temp > tempMax) tempMax = temp;

        if (interval.pop > maxPop) maxPop = interval.pop;
        sumHumidity += interval.main.humidity;
        sumWindSpeed += interval.wind.speed;
      }

      const description = middayInterval.weather?.[0]?.description ?? 'unknown';
      const icon = middayInterval.weather?.[0]?.icon ?? '01d';
      const rainProbability = maxPop;
      const humidity = Math.round(sumHumidity / intervals.length);
      const windSpeed = Math.round((sumWindSpeed / intervals.length) * 3.6); // m/s to km/h
      const isGoodForOutdoor = rainProbability < 0.3 && tempMax > 15;

      days.push({
        date,
        tempMin: Math.round(tempMin),
        tempMax: Math.round(tempMax),
        description,
        icon,
        rainProbability,
        humidity,
        windSpeed,
        isGoodForOutdoor,
      });
    }

    const forecast: WeatherForecast = {
      location: data.city?.name ?? 'Unknown',
      days,
    };

    await cacheSet(cacheKey, forecast, CACHE_TTL);

    return {
      ...forecast,
      days: forecast.days.slice(0, params.days),
    };
  } catch (err) {
    logger.error({ service: 'weatherService', err }, 'weather_forecast_failed');
    return null;
  }
}
