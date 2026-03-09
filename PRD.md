# IS-IT-CROWDY?

Create a simple Progressive Web App using Next.js and the T3 stack (https://create.t3.gg/).

## 1. Product Goal

Build a lightweight, mobile-first app that shows approximate crowd levels around a selected location.

The app should support two entry modes:
- device location (geolocation)
- manual city search (worldwide)

## 2. Target Users

- people deciding where to go now (gym, cafes, markets)
- travelers searching crowd density in unfamiliar cities
- users needing quick low/medium/high crowd signals without heavy onboarding

## 3. Scope (MVP)

### In Scope
- geolocation permission + fallback behavior
- city search via geocoding (global)
- map view with crowd markers and popup details
- list view with distance and crowd indicators
- mock crowd data generation around selected coordinates
- installable PWA baseline (manifest + service worker)

### Out of Scope (for now)
- user accounts/auth
- historical analytics dashboards
- payment/subscription
- admin CMS

## 4. Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- tRPC (API layer)
- React Leaflet (maps)
- OpenStreetMap tiles
- next-pwa
- React Query (via tRPC hooks)
- Prisma (optional, for future persistence)

## 5. Current Implementation Status

### Completed
- T3 project scaffolded and configured
- geolocation flow implemented
- manual city search implemented (Nominatim geocoding)
- map/list toggle implemented
- crowd marker colors and popup implemented
- tRPC places router with mock nearby data implemented
- PWA baseline configured (`manifest.json`, service worker generation)

### Partial / Needs Improvement
- crowd data is still mock (not sourced from real worldwide provider)
- no city autocomplete/suggestion UX yet
- no offline "last successful results" cache strategy yet
- no automated tests yet
- README still generic and not project-specific

## 6. Functional Requirements

### FR-1 Location Input
- user can grant geolocation permission to set map center
- user can enter a city name manually
- if both are available, latest explicit action wins

### FR-2 City Search (Worldwide)
- user types a city and submits search
- app resolves city to coordinates
- app updates selected search area label and map center
- app handles city-not-found and network errors gracefully

### FR-3 Crowd Visualization
- each place has `crowdLevel` in range 0..100
- marker color mapping:
  - 0..30 -> green
  - 31..70 -> orange
  - 71..100 -> red
- marker popup shows place name and crowd percentage

### FR-4 List View
- displays place name, crowd percentage, crowd level label, distance
- distance is computed from selected coordinates when available

### FR-5 PWA
- app is installable on supported mobile/desktop browsers
- service worker is generated in production builds
- manifest metadata is valid and includes icons

## 7. Non-Functional Requirements

- mobile-first responsive UI
- first load should remain lightweight
- API calls should be cached with React Query defaults
- graceful degradation when geolocation/geocoding fails

## 8. Data Model (Current)

```ts
type NearbyPlace = {
  name: string;
  lat: number;
  lng: number;
  crowdLevel: number; // 0..100
};
```

## 9. API Contract (Current)

### tRPC: `places.nearby`
- input: `{ lat: number; lng: number } | undefined`
- output: `NearbyPlace[]`
- behavior: returns mock places around provided coordinates

## 10. Roadmap and Next Steps

### Milestone M1 - Stabilize Current MVP
Goal: make the current implementation production-safe for demo use.

Tasks:
- remove T3 demo leftovers (`post` demo UI/router if unused)
- improve error/empty/loading states
- update `README.md` with real setup and usage instructions
- add environment and API usage notes

Acceptance criteria:
- no dead demo code in user-facing app path
- clear UI messages for loading/error/empty states
- a new contributor can run app in <5 minutes using README

### Milestone M2 - Real Worldwide Crowd Data Integration
Goal: replace mock crowd score with realistic global estimate.

Tasks:
- choose external data strategy (single provider or score fusion)
- create `crowdProvider` server adapter interface
- map provider outputs to normalized `crowdLevel` 0..100
- implement fallback to mock when provider unavailable
- add rate-limit and timeout handling

Acceptance criteria:
- city search returns provider-based crowd estimate
- normalized score is stable across at least 5 major cities
- failure path still returns usable response (fallback)

### Milestone M3 - Search UX Upgrade
Goal: improve speed and usability of global city search.

Tasks:
- add debounced city autocomplete suggestions
- keyboard navigation for suggestions
- show country/region disambiguation
- keep recent searches locally

Acceptance criteria:
- user can select city in <=3 interactions on average
- ambiguous city names are clearly disambiguated

### Milestone M4 - Reliability and Quality
Goal: introduce minimum engineering quality gates.

Tasks:
- add unit tests (distance math, crowd color mapping, normalization)
- add integration tests for tRPC `places.nearby`
- add e2e flow test (search city -> map/list update)
- add CI workflow for lint/typecheck/test

Acceptance criteria:
- CI fails on lint/type errors/tests
- core user flow covered by at least one e2e scenario

### Milestone M5 - PWA Offline Experience
Goal: useful behavior under poor connectivity.

Tasks:
- persist last successful city + places in local storage or IndexedDB
- show "last updated" timestamp
- show offline badge and fallback content

Acceptance criteria:
- user sees last known results when offline
- offline/online transitions are clearly communicated

## 11. Proposed Execution Plan (Next 2-3 Sessions)

### Session A
- M1 cleanup and documentation updates
- prepare `crowdProvider` interface skeleton (without real provider)

### Session B
- M2 first provider integration + normalization logic
- robust fallback and error taxonomy

### Session C
- M3 autocomplete UX
- initial automated tests from M4

## 12. Risks and Mitigations

- Risk: real worldwide crowd data providers may be costly or unreliable.
  - Mitigation: provider abstraction + fallback + caching.
- Risk: geocoding rate limits for public endpoints.
  - Mitigation: debounce, local caching, optional server proxy.
- Risk: noisy crowd scores reduce trust.
  - Mitigation: score normalization and confidence labels.

## 13. Definition of Done (Feature-Level)

A feature is considered done when:
- implementation is complete and type-safe
- lint/typecheck/build pass
- UX states include loading, success, and failure
- README or PRD is updated if behavior changed

