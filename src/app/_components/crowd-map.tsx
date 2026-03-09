"use client";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";

import type { NearbyPlace, UserLocation } from "~/types/place";

const FALLBACK_CENTER: [number, number] = [50.1109, 8.6821];

function getCrowdColor(level: number) {
  if (level <= 30) return "#16a34a";
  if (level <= 70) return "#f97316";
  return "#dc2626";
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

interface CrowdMapProps {
  userLocation: UserLocation | null;
  places: NearbyPlace[];
}

export default function CrowdMap({ userLocation, places }: CrowdMapProps) {
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : places.length > 0
      ? [places[0]!.lat, places[0]!.lng]
      : FALLBACK_CENTER;

  return (
    <div className="h-[55vh] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <MapContainer center={center} zoom={15} className="h-full w-full">
        <RecenterMap center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation ? (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            pathOptions={{ color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 0.9 }}
            radius={9}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
        ) : null}

        {places.map((place) => {
          const color = getCrowdColor(place.crowdLevel);
          return (
            <CircleMarker
              key={place.name}
              center={[place.lat, place.lng]}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.88 }}
              radius={10}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{place.name}</p>
                  <p className="text-sm text-slate-700">Crowd level: {place.crowdLevel}%</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
