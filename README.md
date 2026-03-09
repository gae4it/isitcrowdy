# Is It Crowdy?

Is It Crowdy? is a mobile-first Progressive Web App that shows approximate crowd levels around:
- your current location
- any city you search worldwide

The app is built on the T3 stack with Next.js App Router, tRPC, TypeScript, Tailwind CSS, and React Leaflet.

## Features

- geolocation-based search
- city search via OpenStreetMap Nominatim geocoding
- real nearby places fetched from OpenStreetMap Overpass
- map and list toggle
- estimated crowd score (0-100) with low/medium/high color coding
- installable PWA with `next-pwa`

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- tRPC + React Query
- React Leaflet + OpenStreetMap tiles
- next-pwa

## Requirements

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm run check
```

This runs lint + TypeScript checks.

## Production Build

```bash
npm run build
npm run start
```

In production build, `next-pwa` generates service worker assets in `public/`.

## Project Structure

- `src/app/_components/crowd-near-me.tsx`: main UI and state management
- `src/app/_components/crowd-map.tsx`: Leaflet map rendering
- `src/server/api/routers/places.ts`: tRPC places endpoint (live OSM places + crowd estimation)
- `src/server/api/root.ts`: tRPC root router
- `public/manifest.json`: PWA manifest
- `PRD.md`: roadmap and milestones

## API Notes

Current API:
- `places.nearby`
	- input: `{ lat: number; lng: number } | undefined`
	- output: `NearbyPlace[]`
	- behavior: live nearby places from OpenStreetMap Overpass, crowd level estimated server-side

## Known Limitations

- crowd level is estimated and not an official occupancy feed
- no autocomplete for city search yet
- no offline persisted last-results UX yet

## Next Steps

See `PRD.md` milestones:
- M1: stabilize MVP
- M2: real worldwide crowd provider integration
- M3: autocomplete UX
- M4: tests and CI
- M5: offline experience
