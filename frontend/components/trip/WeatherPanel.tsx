'use client';

import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudFog } from 'lucide-react';
import type { DayWeather } from '@/types';
import { fadeUp } from '@/lib/animations';

interface WeatherPanelProps {
  weather: DayWeather | null;
}

export function WeatherPanel({ weather }: WeatherPanelProps) {
  if (!weather) return null;

  const getIcon = () => {
    switch (true) {
      case weather.icon.startsWith('01'):
        return <Sun className="w-5 h-5 text-gold-400" />;
      case weather.icon.startsWith('02') || weather.icon.startsWith('03') || weather.icon.startsWith('04'):
        return <Cloud className="w-5 h-5 text-slate-400" />;
      case weather.icon.startsWith('09') || weather.icon.startsWith('10'):
        return <CloudRain className="w-5 h-5 text-ocean-500" />;
      case weather.icon.startsWith('11'):
        return <CloudLightning className="w-5 h-5 text-ember-500" />;
      case weather.icon.startsWith('13'):
        return <CloudSnow className="w-5 h-5 text-slate-300" />;
      case weather.icon.startsWith('50'):
        return <CloudFog className="w-5 h-5 text-slate-400" />;
      default:
        return <Sun className="w-5 h-5 text-gold-400" />;
    }
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex items-center gap-3 bg-ivory-100 rounded-lg p-3 border border-ivory-300 w-full mb-4"
    >
      <div className="flex items-center justify-center p-2 bg-white rounded-md shadow-sm">
        {getIcon()}
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-navy-800 capitalize">
            {weather.description}
          </span>
          <span className="font-mono text-sm text-navy-900 font-semibold">
            {weather.tempMin}° – {weather.tempMax}°C
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          {weather.rainProbability > 0.1 ? (
            <span className="font-mono text-xs text-ocean-600">
              {Math.round(weather.rainProbability * 100)}% rain
            </span>
          ) : (
            <span /> // Spacer
          )}
          
          {!weather.isGoodForOutdoor && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
              Consider indoor alternatives
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
