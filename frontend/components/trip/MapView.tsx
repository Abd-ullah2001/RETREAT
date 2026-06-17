'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Activity, Property, Restaurant } from '@/types';

const propertyIcon = L.divIcon({
  className: 'property-pin',
  html: '<div style="width:28px;height:28px;border-radius:10px;background:#D4622A;border:3px solid white;display:grid;place-items:center;color:white;font-size:14px">H</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const activityIcon = L.divIcon({
  className: 'activity-pin',
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#1A7FA8;border:3px solid white;display:grid;place-items:center;color:white;font-size:13px">A</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const restaurantIcon = L.divIcon({
  className: 'restaurant-pin',
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#10b981;border:3px solid white;display:grid;place-items:center;color:white;font-size:13px">R</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface MapViewProps {
  center: [number, number];
  properties: Property[];
  activities: Activity[];
  restaurants?: Restaurant[];
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 13 });
  }, [map, points]);
  return null;
}

export default function MapView({ center, properties, activities, restaurants = [] }: MapViewProps) {
  const points: [number, number][] = [
    ...properties.filter((p) => p.lat && p.lng).map((p) => [p.lat, p.lng] as [number, number]),
    ...activities.filter((a) => a.lat && a.lng).map((a) => [a.lat, a.lng] as [number, number]),
    ...restaurants.filter((r) => r.lat && r.lng).map((r) => [r.lat, r.lng] as [number, number]),
  ];

  return (
    <MapContainer center={center} zoom={12} zoomControl={false} attributionControl={false} className="h-full min-h-[420px] w-full rounded-[20px]">
      <TileLayer
        attribution="© OpenStreetMap contributors © CARTO"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <FitBounds points={points.length ? points : [center]} />
      {properties.map((p) =>
        p.lat && p.lng ? (
          <Marker key={`p-${p.id}`} position={[p.lat, p.lng]} icon={propertyIcon}>
            <Popup>
              <div className="min-w-36">
                <strong>{p.name}</strong>
                <p>{p.currency} {p.pricePerNight}/night</p>
                {p.rating != null && <p>Rating {p.rating}</p>}
              </div>
            </Popup>
          </Marker>
        ) : null,
      )}
      {activities.map((a) =>
        a.lat && a.lng ? (
          <Marker key={`a-${a.id}`} position={[a.lat, a.lng]} icon={activityIcon}>
            <Popup>
              <div className="min-w-36">
                <strong>{a.name}</strong>
                <p>{a.category}</p>
                {a.rating != null && <p>Rating {a.rating}</p>}
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
      {restaurants.map((r) =>
        r.lat && r.lng ? (
          <Marker key={`r-${r.id}`} position={[r.lat, r.lng]} icon={restaurantIcon}>
            <Popup>
              <div className="min-w-36">
                <strong>{r.name}</strong>
                <p>{r.cuisine}</p>
                {r.rating != null && <p>Rating {r.rating}</p>}
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}
