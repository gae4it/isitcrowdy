
# Is It Crowdy? — README

## App Overview

Is It Crowdy? is a mobile-first Progressive Web App that helps users find places with low, medium, or high crowd levels near their location or in any city worldwide. The app is built with Next.js, TypeScript, Tailwind CSS, tRPC, React Leaflet, OpenStreetMap, and next-pwa.

---

## Features

- **Location Input:** Use device geolocation or search any city globally
- **Map & List Views:** See real places (cafes, gyms, shops) with color-coded crowd markers
- **Crowd Level Estimation:** Scores (0–100) based on place type, time, and deterministic jitter
- **PWA:** Installable, offline-capable, mobile-first UI
- **Robust Error Handling:** Fallback to mock data if real provider fails

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- tRPC (API layer)
- React Query
- React Leaflet
- OpenStreetMap tiles
- next-pwa
- Prisma (optional)

---

## Architecture

- `src/app/_components/is-it-crowdy.tsx`: Main UI, state management
- `src/app/_components/crowd-map.tsx`: Map rendering
- `src/server/api/routers/places.ts`: tRPC endpoint for real places + crowd estimation
- `public/manifest.json`: PWA manifest
- `public/icon-192.svg`, `public/icon-512.svg`: App icons

---

## Setup & Usage

1. **Clone the repo:**
	```bash
	git clone <repo-url>
	cd isitcrowdy
	npm install
	```

2. **Run locally:**
	```bash
	npm run dev
	```
	Open http://localhost:3000 in your browser.

3. **Build for production:**
	```bash
	npm run build
	npm start
	```

4. **Install as PWA:**
	- On mobile/desktop browsers, tap "Add to Home Screen" or install prompt.

---

## How It Works

- **Geolocation:** App requests device location; user can deny or allow.
- **City Search:** User enters city name; app geocodes via OpenStreetMap Nominatim.
- **Places API:** tRPC endpoint fetches real places from Overpass API, estimates crowd level, falls back to mock if needed.
- **Map/List:** Toggle between map and list views; markers colored by crowd score.
- **PWA:** Manifest and service worker enable install and offline support.

---

## API Contract

- `places.nearby`: `{ lat, lng }` → `NearbyPlace[]`
  - `NearbyPlace`: `{ name, lat, lng, crowdLevel }`

---

## Limitations & Roadmap

- Crowd score is estimated, not live
- No autocomplete for city search yet
- Offline cache is basic (last results only)
- No user accounts or analytics
- See PRD.md for full roadmap and milestones

---

## Contributing

- Fork, clone, and run `npm install`
- Use `npm run dev` for development
- Run `npm run check` before PRs
- Update PRD.md and README.md for new features

---

## License

MIT
