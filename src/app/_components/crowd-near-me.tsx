"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { api } from "~/trpc/react";
import type { NearbyPlace, UserLocation } from "~/types/place";

const CrowdMap = dynamic(() => import("~/app/_components/crowd-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[55vh] w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
      Loading map...
    </div>
  ),
});

type ViewMode = "map" | "list";

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

function getCrowdLabel(level: number) {
  if (level <= 30) {
    return { label: "Low", dotClass: "bg-green-500" };
  }
  if (level <= 70) {
    return { label: "Medium", dotClass: "bg-orange-500" };
  }
  return { label: "High", dotClass: "bg-red-600" };
}

function getDistanceKm(from: UserLocation, to: NearbyPlace) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function CrowdNearMe() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cityQuery, setCityQuery] = useState("");
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [searchAreaLabel, setSearchAreaLabel] = useState<string>("Current location");
  const [viewMode, setViewMode] = useState<ViewMode>("map");

  const placesQuery = api.places.nearby.useQuery(userLocation ?? undefined, {
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
  });

  const placesWithDistance = useMemo(() => {
    if (!placesQuery.data) return [];
    return placesQuery.data
      .map((place) => ({
        ...place,
        distanceKm: userLocation ? getDistanceKm(userLocation, place) : null,
      }))
      .sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
  }, [placesQuery.data, userLocation]);

  const requestLocation = () => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSearchAreaLabel("Current location");
      },
      (error) => {
        setLocationError(error.message || "Unable to get your location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 1000 * 60,
      },
    );
  };

  const searchByCity = async () => {
    const normalized = cityQuery.trim();
    if (!normalized) {
      setLocationError("Please enter a city name.");
      return;
    }

    setLocationError(null);
    setIsSearchingCity(true);

    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", normalized);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("limit", "1");

      const response = await fetch(url.toString(), {
        headers: {
          "Accept-Language": "en",
        },
      });

      if (!response.ok) {
        throw new Error("Could not resolve this city right now.");
      }

      const results = (await response.json()) as GeocodingResult[];
      const bestMatch = results[0];

      if (!bestMatch) {
        setLocationError("City not found. Try a more specific name, for example 'Paris, France'.");
        return;
      }

      const lat = Number.parseFloat(bestMatch.lat);
      const lng = Number.parseFloat(bestMatch.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setLocationError("Invalid location data returned for this city.");
        return;
      }

      setUserLocation({ lat, lng });
      setSearchAreaLabel(bestMatch.display_name || normalized);
      setViewMode("map");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not search this city.";
      setLocationError(message);
    } finally {
      setIsSearchingCity(false);
    }
  };

  const onCitySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await searchByCity();
  };

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-8 pt-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Crowd Near Me</h1>
        <p className="mt-1 text-sm text-slate-600">
          Check approximate crowd levels around your current location or search any city in the world.
        </p>
        <form onSubmit={onCitySubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={cityQuery}
            onChange={(event) => setCityQuery(event.target.value)}
            placeholder="Type a city, e.g. Tokyo"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isSearchingCity}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSearchingCity ? "Searching..." : "Search city"}
          </button>
        </form>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={requestLocation}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Use my location
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              viewMode === "map"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Map View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              viewMode === "list"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            List View
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600">Search area: {searchAreaLabel}</p>
        {locationError ? (
          <p className="mt-3 text-sm text-red-600">Location error: {locationError}</p>
        ) : null}
      </header>

      {placesQuery.isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
          Loading nearby places...
        </div>
      ) : null}

      {placesQuery.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load places. Please refresh the page.
        </div>
      ) : null}

      {!placesQuery.isLoading && !placesQuery.error ? (
        viewMode === "map" ? (
          <CrowdMap userLocation={userLocation} places={placesQuery.data ?? []} />
        ) : (
          <ul className="flex flex-col gap-3">
            {placesWithDistance.map((place) => {
              const crowd = getCrowdLabel(place.crowdLevel);
              return (
                <li
                  key={place.name}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-slate-900">{place.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Distance: {place.distanceKm === null ? "Enable location" : `${place.distanceKm.toFixed(2)} km`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm">
                      <span className={`h-2.5 w-2.5 rounded-full ${crowd.dotClass}`} />
                      <span className="text-slate-700">{crowd.label}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-800">Crowd level: {place.crowdLevel}%</p>
                </li>
              );
            })}
          </ul>
        )
      ) : null}
    </section>
  );
}
