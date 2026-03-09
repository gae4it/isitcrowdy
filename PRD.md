
# IS IT CROWDY? — Product Requirements & Build Guide

## Overview

Is It Crowdy? is a mobile-first Progressive Web App that shows approximate crowd levels near the user or in any city worldwide. The app is built with Next.js (App Router), TypeScript, Tailwind CSS, tRPC, React Leaflet, OpenStreetMap, and next-pwa.

---

## 1. Product Goal

Build a lightweight, installable app that helps users decide where to go based on estimated crowd levels. Users can search by their device location or any city globally.

---

## 2. Target Users

- People deciding where to go (gym, cafes, markets)
- Travelers searching crowd density in unfamiliar cities
- Anyone needing quick low/medium/high crowd signals

---

## 3. Features & Flows

### Location Input
- Geolocation permission (browser API)
- Manual city search (OpenStreetMap Nominatim geocoding)
- Latest action (city or geolocation) sets the search area

### Map & List Views
- Map centered on selected location
- Markers for real places (cafes, gyms, shops, etc.)
- Marker color: green (low), orange (medium), red (high)
- Popup: place name, crowd level percentage
- List: place name, distance, crowd level, color indicator

### Crowd Data
- Real places fetched from OpenStreetMap Overpass API
- Crowd level is an estimated score (0–100) based on place type, time, and deterministic jitter
- Fallback to mock data if Overpass fails

### UI & PWA
- Mobile-first, minimal UI (Tailwind CSS)
- Simple header: "Is It Crowdy?"
- Toggle between Map/List
- Installable PWA (manifest.json, service worker)

---

## 4. Tech Stack

- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- tRPC (API layer)
- React Query (via tRPC hooks)
- React Leaflet (maps)
- OpenStreetMap tiles
- next-pwa
- Prisma (optional, for future persistence)

---

## 5. Architecture & File Structure

- `src/app/_components/is-it-crowdy.tsx`: main UI and state management
- `src/app/_components/crowd-map.tsx`: Leaflet map rendering
- `src/server/api/routers/places.ts`: tRPC endpoint for real places + crowd estimation
- `src/server/api/root.ts`: tRPC root router
- `public/manifest.json`: PWA manifest
- `public/icon-192.svg`, `public/icon-512.svg`: app icons
- `README.md`: setup, usage, architecture, API
- `PRD.md`: requirements, roadmap, acceptance criteria

---

## 6. Data Model

```ts
type NearbyPlace = {
  name: string;
  lat: number;
  lng: number;
  crowdLevel: number; // 0..100
};
```

---

## 7. API Contract

### tRPC: `places.nearby`
- input: `{ lat: number; lng: number } | undefined`
- output: `NearbyPlace[]`
- behavior: returns real places from OpenStreetMap Overpass, with estimated crowd level

---

## 8. Build Steps

1. Scaffold the project with `npm create t3-app@latest` (App Router, tRPC, Tailwind)
2. Install dependencies: `react-leaflet`, `leaflet`, `next-pwa`, `@types/leaflet`
3. Configure Tailwind and global styles
4. Implement geolocation and city search in main UI component
5. Integrate OpenStreetMap Nominatim for city geocoding
6. Implement tRPC `places.nearby` endpoint:
   - fetch real places from Overpass API
   - estimate crowd level per place
   - fallback to mock if Overpass fails
7. Build map and list views with React Leaflet
8. Configure PWA (manifest.json, icons, next-pwa)
9. Add error/loading/empty states for all flows
10. Test on mobile and desktop

---

## 9. Functional Requirements

- User can search by geolocation or city
- Map/list toggle
- Real places shown with crowd score
- Responsive, installable UI
- Robust error handling and fallback

---

## 10. Non-Functional Requirements

- Mobile-first responsive UI
- Lightweight first load
- API calls cached with React Query
- Graceful degradation for geolocation/geocoding failures

---

## 11. Roadmap & Milestones

### M1: MVP Stabilization
- Remove demo leftovers
- Improve error/empty/loading states
- Update README and PRD

### M2: Real Crowd Data Integration
- Integrate external crowd data provider (optional)
- Normalize crowd score
- Robust fallback

### M3: Search UX Upgrade
- Add city autocomplete
- Keyboard navigation
- Recent searches

### M4: Reliability & Quality
- Add unit/integration/e2e tests
- CI workflow for lint/typecheck/test

### M5: PWA Offline Experience
- Persist last successful results
- Show offline badge and fallback

---

## 12. Acceptance Criteria

- Implementation is complete and type-safe
- Lint/typecheck/build pass
- UX states: loading, success, failure
- README and PRD updated

---

## 13. Risks & Mitigations

- External crowd data providers may be costly/unreliable
  - Mitigation: provider abstraction + fallback + caching
- Geocoding rate limits
  - Mitigation: debounce, local caching, optional proxy
- Noisy crowd scores
  - Mitigation: normalization and confidence labels

---

## 14. How to Contribute

- Fork the repo, clone, and run `npm install`
- Use `npm run dev` for local development
- Run `npm run check` before PRs
- Update PRD.md and README.md for new features

