'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Property, Activity } from '@/types';

const propertyIcon = L.divIcon({
  className: 'property-pin',
  html: '<div style="width:12px;height:12px;border-radius:50%;background:#5B4EE8;border:2px solid white"></div>',
  iconSize: [12, 12],
});

const activityIcon = L.divIcon({
  className: 'activity-pin',
  html: '<div style="width:12px;height:12px;border-radius:50%;background:#FF6B6B;border:2px solid white"></div>',
  iconSize: [12, 12],
});

interface MapViewProps {
  center: [number, number];
  properties: Property[];
  activities: Activity[];
}

export default function MapView({ center, properties, activities }: MapViewProps) {
  return (
    <MapContainer center={center} zoom={12} className="h-[400px] w-full rounded-2xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map((p) =>
        p.lat && p.lng ? (
          <Marker key={`p-${p.id}`} position={[p.lat, p.lng]} icon={propertyIcon}>
            <Popup>
              <strong>{p.name}</strong>
              {p.rating != null && <p>★ {p.rating}</p>}
            </Popup>
          </Marker>
        ) : null,
      )}
      {activities.map((a) => (
        <Marker key={`a-${a.id}`} position={[a.lat, a.lng]} icon={activityIcon}>
          <Popup>
            <strong>{a.name}</strong>
            {a.rating != null && <p>★ {a.rating}</p>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
