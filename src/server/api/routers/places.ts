import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { NearbyPlace } from "~/types/place";

const clampCrowd = (value: number) => Math.min(100, Math.max(0, value));

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function getCoordinates(element: OverpassElement) {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return { lat: element.lat, lng: element.lon };
  }

  if (element.center) {
    return { lat: element.center.lat, lng: element.center.lon };
  }

  return null;
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function estimateCrowdLevel(tags: Record<string, string> | undefined, seed: string) {
  const amenity = tags?.amenity ?? "";
  const shop = tags?.shop ?? "";
  const tourism = tags?.tourism ?? "";
  const leisure = tags?.leisure ?? "";
  const highway = tags?.highway ?? "";

  let base = 45;

  if (["bus_station", "train_station", "hospital", "university"].includes(amenity)) base += 25;
  if (["restaurant", "cafe", "bar", "fast_food", "cinema"].includes(amenity)) base += 18;
  if (["supermarket", "mall", "department_store"].includes(shop)) base += 20;
  if (["museum", "attraction", "hotel"].includes(tourism)) base += 12;
  if (["stadium", "sports_centre", "fitness_centre", "park"].includes(leisure)) base += 10;
  if (["bus_stop", "platform"].includes(highway)) base += 8;

  const hour = new Date().getHours();
  if (hour >= 7 && hour <= 9) base += 10;
  if (hour >= 12 && hour <= 14) base += 8;
  if (hour >= 17 && hour <= 20) base += 12;
  if (hour >= 1 && hour <= 5) base -= 18;

  // Deterministic jitter so nearby places are not identical while staying stable by name.
  const jitter = (hashString(seed) % 17) - 8;
  return clampCrowd(base + jitter);
}

function getPlaceName(element: OverpassElement) {
  const name = element.tags?.name?.trim();
  if (name) return name;

  const category =
    element.tags?.amenity ??
    element.tags?.shop ??
    element.tags?.tourism ??
    element.tags?.leisure ??
    element.tags?.highway;

  if (!category) return null;
  return category
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

async function fetchRealNearbyPlaces(lat: number, lng: number): Promise<NearbyPlace[]> {
  const radiusMeters = 2200;
  const query = `
    [out:json][timeout:20];
    (
      nwr(around:${radiusMeters},${lat},${lng})["amenity"];
      nwr(around:${radiusMeters},${lat},${lng})["shop"];
      nwr(around:${radiusMeters},${lat},${lng})["tourism"];
      nwr(around:${radiusMeters},${lat},${lng})["leisure"];
    );
    out center tags 80;
  `;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body: query,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Overpass request failed: ${response.status}`);
    }

    const data = (await response.json()) as OverpassResponse;

    const places = data.elements
      .map((element) => {
        const coords = getCoordinates(element);
        const name = getPlaceName(element);
        if (!coords || !name) return null;

        const crowdLevel = estimateCrowdLevel(element.tags, `${name}-${element.id}`);
        return {
          name,
          lat: coords.lat,
          lng: coords.lng,
          crowdLevel,
        } satisfies NearbyPlace;
      })
      .filter((place): place is NearbyPlace => Boolean(place))
      .slice(0, 30);

    return places;
  } finally {
    clearTimeout(timeout);
  }
}

function createFallbackPlaces(lat: number, lng: number): NearbyPlace[] {
  return [
    {
      name: "Fallback Cafe",
      lat: lat + 0.0012,
      lng: lng + 0.001,
      crowdLevel: 38,
    },
    {
      name: "Fallback Gym",
      lat: lat - 0.0014,
      lng: lng + 0.0017,
      crowdLevel: 64,
    },
    {
      name: "Fallback Market",
      lat: lat + 0.0018,
      lng: lng - 0.0009,
      crowdLevel: 74,
    },
  ];
}

export const placesRouter = createTRPCRouter({
  nearby: publicProcedure
    .input(
      z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .nullish(),
    )
    .query(async ({ input }) => {
      const baseLat = input?.lat ?? 50.1109;
      const baseLng = input?.lng ?? 8.6821;

      try {
        const realPlaces = await fetchRealNearbyPlaces(baseLat, baseLng);
        if (realPlaces.length > 0) {
          return realPlaces;
        }
      } catch (error) {
        console.error("Failed to fetch real nearby places", error);
      }

      return createFallbackPlaces(baseLat, baseLng);
    }),
});
