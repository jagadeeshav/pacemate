# PaceMate

Group-run hosting for casual runners. Find or host a run matched by location, time, distance and pace.

**Stack:** Next.js 14 (App Router, TypeScript) · SQLite (better-sqlite3) · Leaflet + OpenStreetMap. Zero paid services, no API keys.

## Run it
```bash
npm install
npm run dev     # http://localhost:3000
```
The database (`pacemate.db`) is created and seeded with Bengaluru runs on first start. Delete the file to reset.
Demo sign-in: `hema@demo.dev` (host of several runs), `jay@demo.dev`, or any new name and email.

## Features
- Host a run: map pin, time, distance, target pace, participant cap, public or private (invite link)
- Discover runs on a map and list; filter by radius, distance, pace level and date
- Join flow: request, host approves or declines, cap enforced server-side, leave or cancel
- Pace levels L1 Jogger to L5 Elite derived from pace
- Privacy: start location is approximate (~1 km) until the host approves you
- Private runs are hidden from discovery and need the invite code

## Design decisions
- Haversine radius filtering in application code (fine for one city; PostGIS is the planned upgrade)
- Authorization checks live in the API routes (only hosts approve; private runs need the invite code)
- Demo auth is a plain cookie; replace with Auth.js + Google for production

## Roadmap (see the scope doc)
Google sign-in · Postgres + PostGIS · community-verified pace via post-run confirmations · ratings and no-show tracking · run chat · notifications · GPX routes · report/block
