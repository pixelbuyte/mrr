# Walking Route Planner Comparator

Interactive route-planning web app comparing **AllTrails**, **Google Maps**, **Mapbox**, and **Geoapify** with:

- distance filtering (min/max miles)
- minimum safety rating threshold
- terrain filtering (urban, mixed, trail)
- provider comparison snapshot cards
- mile accumulation tracker for planned and completed miles

## Run locally

This is a static app (no build tooling required).

1. From the repo root, start a simple web server:
   - Python 3: `python3 -m http.server 8080`
2. Open `http://localhost:8080` in your browser.

## How to use

1. Adjust filters (distance, safety, terrain, providers) to narrow routes.
2. Sort the filtered list by safety, distance, or time.
3. Click **Add to Planner** to build your weekly walk plan.
4. Use **Log Walked** to move planned miles into completed miles.
5. Update your weekly goal and track progress via the progress bar.
6. Use **Reset Tracker** to clear planner + completed miles.
