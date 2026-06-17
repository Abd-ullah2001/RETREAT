import { z } from 'zod';

export const DayWeatherSchema = z.object({
  date: z.string(),               // YYYY-MM-DD
  tempMin: z.number(),            // Celsius
  tempMax: z.number(),            // Celsius
  description: z.string(),        // "partly cloudy", "light rain", etc.
  icon: z.string(),               // OpenWeatherMap icon code e.g. "02d"
  rainProbability: z.number(),    // 0.0 to 1.0
  humidity: z.number(),           // percentage
  windSpeed: z.number(),          // km/h
  isGoodForOutdoor: z.boolean(),  // derived: rain < 0.3 AND tempMax > 15
});

export type DayWeather = z.infer<typeof DayWeatherSchema>;

export const WeatherForecastSchema = z.object({
  location: z.string(),
  days: z.array(DayWeatherSchema),
});

export type WeatherForecast = z.infer<typeof WeatherForecastSchema>;
