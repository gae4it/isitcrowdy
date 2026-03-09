
# IS-IT-CROWDY?

Create a simple Progressive Web App using Next.js and the T3 stack (https://create.t3.gg/).

**Goal:**  
Build a lightweight, mobile-friendly app that shows approximate crowd levels near the user.

**Tech Stack:**  
- Next.js (App Router)  
- TypeScript  
- Tailwind CSS  
- React Leaflet for maps  
- OpenStreetMap tiles (no API key required)  
- next-pwa for PWA support  
- SWR or tRPC hooks for data fetching and caching  
- tRPC for API routes  
- Prisma (optional, for future real data)

**Main Features:**  
- Geolocation:  
	- Request user location permission  
	- Use the browser Geolocation API to get latitude and longitude  
- Map:  
	- Show a map centered on the user’s location  
	- Use React Leaflet and OpenStreetMap tiles  
- Nearby Places API:  
	- Create a tRPC endpoint (e.g., /api/places)  
	- Return mock nearby places, e.g.:  
		```json
		[
			{ "name": "Cafe Central", "lat": 50.1109, "lng": 8.6821, "crowdLevel": 30 },
			{ "name": "City Gym", "lat": 50.1115, "lng": 8.6810, "crowdLevel": 70 }
		]
		```
	- `crowdLevel` is a number from 0–100  
- Map Markers:  
	- Display each place as a marker  
	- Marker colors:  
		- Green: 0–30 (Low crowd)  
		- Orange: 31–70 (Medium crowd)  
		- Red: 71–100 (High crowd)  
	- Clicking a marker shows a popup with:  
		- Place name  
		- Crowd level percentage  
- List View:  
	- Toggle between Map View and List View  
	- List shows:  
		- Place name  
		- Distance from user  
		- Crowd level percentage  
		- Colored indicator (green/orange/red)  
- UI:  
	- Mobile-first design  
	- Clean, minimal UI  
	- Use Tailwind CSS  
	- Simple header title: "Crowd Near Me"  
- PWA:  
	- Configure next-pwa for installable PWA  
	- Include manifest.json and service worker  
- Performance:  
	- Keep the app lightweight  
	- Avoid unnecessary dependencies  
	- Use SWR or tRPC hooks to cache API results  

**Code Output:**  
- Full project structure  
- All important files  
- Setup instructions  
- Commands to run the project  
- Clean, beginner-friendly code, easy to extend later with real APIs for crowd data

