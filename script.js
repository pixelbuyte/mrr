const routes = [
  {
    id: "at-1",
    provider: "AllTrails",
    name: "Canyon Ridge Loop",
    distance: 5.6,
    durationMinutes: 118,
    safetyRating: 4.2,
    terrain: "Trail",
    notes: "Moderate incline with strong daylight visibility and regular foot traffic.",
  },
  {
    id: "at-2",
    provider: "AllTrails",
    name: "Lakeview Forest Circuit",
    distance: 7.4,
    durationMinutes: 155,
    safetyRating: 3.8,
    terrain: "Trail",
    notes: "Long route with shaded sections; recommend daylight and hydration stops.",
  },
  {
    id: "at-3",
    provider: "AllTrails",
    name: "Pine Hollow Out-and-Back",
    distance: 3.1,
    durationMinutes: 64,
    safetyRating: 4.5,
    terrain: "Mixed",
    notes: "Well-marked trailheads and frequent ranger patrol zones.",
  },
  {
    id: "gm-1",
    provider: "Google Maps",
    name: "Downtown Riverfront Path",
    distance: 2.8,
    durationMinutes: 52,
    safetyRating: 4.1,
    terrain: "Urban",
    notes: "Street-lit sidewalks and multiple transit exits along the route.",
  },
  {
    id: "gm-2",
    provider: "Google Maps",
    name: "Midtown Greenway Connector",
    distance: 4.9,
    durationMinutes: 96,
    safetyRating: 3.6,
    terrain: "Urban",
    notes: "Frequent crossings; best during low-traffic windows.",
  },
  {
    id: "gm-3",
    provider: "Google Maps",
    name: "Campus to Harbor Walk",
    distance: 6.2,
    durationMinutes: 124,
    safetyRating: 3.9,
    terrain: "Mixed",
    notes: "Blend of neighborhood streets and waterfront promenade segments.",
  },
  {
    id: "mb-1",
    provider: "Mapbox",
    name: "Waterfront Skyline Route",
    distance: 4.2,
    durationMinutes: 84,
    safetyRating: 4.4,
    terrain: "Urban",
    notes: "Excellent wayfinding and broad paths with emergency call boxes nearby.",
  },
  {
    id: "mb-2",
    provider: "Mapbox",
    name: "Historic District Loop",
    distance: 3.7,
    durationMinutes: 76,
    safetyRating: 4.0,
    terrain: "Mixed",
    notes: "Consistent pedestrian lighting and wide sidewalks.",
  },
  {
    id: "mb-3",
    provider: "Mapbox",
    name: "North Ridge Traverse",
    distance: 8.5,
    durationMinutes: 172,
    safetyRating: 3.5,
    terrain: "Trail",
    notes: "Steeper ascent sections; better for experienced walkers.",
  },
  {
    id: "ga-1",
    provider: "Geoapify",
    name: "Canal Walkway Sprint",
    distance: 1.9,
    durationMinutes: 37,
    safetyRating: 4.3,
    terrain: "Urban",
    notes: "Short high-visibility loop with frequent public spaces.",
  },
  {
    id: "ga-2",
    provider: "Geoapify",
    name: "Greenbelt Community Track",
    distance: 5.1,
    durationMinutes: 102,
    safetyRating: 3.7,
    terrain: "Mixed",
    notes: "Shared-use path with moderate bike traffic near dusk.",
  },
  {
    id: "ga-3",
    provider: "Geoapify",
    name: "South Hills Panorama",
    distance: 9.3,
    durationMinutes: 188,
    safetyRating: 3.4,
    terrain: "Trail",
    notes: "Low-cell-coverage pockets; keep an offline map handy.",
  },
];

const state = {
  selectedProviders: new Set(["AllTrails", "Google Maps", "Mapbox", "Geoapify"]),
  minDistance: 0.5,
  maxDistance: 8,
  safetyThreshold: 3,
  terrain: "all",
  sortBy: "safety",
  plannerRoutes: [],
  completedMiles: 0,
  goalMiles: 20,
};

const providerStatsEl = document.getElementById("provider-stats");
const routeResultsEl = document.getElementById("route-results");
const routeCountLabelEl = document.getElementById("route-count-label");
const plannerListEl = document.getElementById("planner-list");

const minDistanceInput = document.getElementById("min-distance");
const maxDistanceInput = document.getElementById("max-distance");
const safetyThresholdInput = document.getElementById("safety-threshold");
const terrainSelect = document.getElementById("terrain");
const sortBySelect = document.getElementById("sort-by");
const mileGoalInput = document.getElementById("mile-goal");

const minDistanceValue = document.getElementById("min-distance-value");
const maxDistanceValue = document.getElementById("max-distance-value");
const safetyThresholdValue = document.getElementById("safety-threshold-value");
const plannedMilesEl = document.getElementById("planned-miles");
const completedMilesEl = document.getElementById("completed-miles");
const goalProgressLabelEl = document.getElementById("goal-progress-label");
const goalProgressBarEl = document.getElementById("goal-progress-bar");

function formatMiles(value) {
  return `${value.toFixed(1)} mi`;
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  return `${hours}h ${mins}m`;
}

function buildFilteredRoutes() {
  return routes
    .filter((route) => state.selectedProviders.has(route.provider))
    .filter((route) => route.distance >= state.minDistance && route.distance <= state.maxDistance)
    .filter((route) => route.safetyRating >= state.safetyThreshold)
    .filter((route) => state.terrain === "all" || route.terrain === state.terrain)
    .sort((a, b) => {
      if (state.sortBy === "distance") return a.distance - b.distance;
      if (state.sortBy === "time") return a.durationMinutes - b.durationMinutes;
      return b.safetyRating - a.safetyRating;
    });
}

function renderProviderStats(filteredRoutes) {
  const providers = ["AllTrails", "Google Maps", "Mapbox", "Geoapify"];
  providerStatsEl.innerHTML = "";

  providers.forEach((provider) => {
    const providerRoutes = filteredRoutes.filter((route) => route.provider === provider);
    const avgSafety = providerRoutes.length
      ? providerRoutes.reduce((sum, route) => sum + route.safetyRating, 0) / providerRoutes.length
      : 0;
    const avgDistance = providerRoutes.length
      ? providerRoutes.reduce((sum, route) => sum + route.distance, 0) / providerRoutes.length
      : 0;

    const card = document.createElement("article");
    card.className = "provider-stat-card";
    card.innerHTML = `
      <h3>${provider}</h3>
      <p><strong>${providerRoutes.length}</strong> routes match filters</p>
      <p>Avg safety: <strong>${avgSafety.toFixed(1)}</strong> / 5</p>
      <p>Avg distance: <strong>${avgDistance.toFixed(1)}</strong> mi</p>
    `;
    providerStatsEl.appendChild(card);
  });
}

function isAlreadyPlanned(routeId) {
  return state.plannerRoutes.some((route) => route.id === routeId);
}

function renderRoutes(filteredRoutes) {
  routeResultsEl.innerHTML = "";
  routeCountLabelEl.textContent = `${filteredRoutes.length} route${filteredRoutes.length === 1 ? "" : "s"} found`;

  if (filteredRoutes.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No routes match the selected filters. Try relaxing your distance or safety thresholds.";
    routeResultsEl.appendChild(emptyState);
    return;
  }

  const template = document.getElementById("route-card-template");

  filteredRoutes.forEach((route) => {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector(".route-card");
    const addButton = fragment.querySelector(".add-route-button");

    fragment.querySelector(".route-name").textContent = route.name;
    fragment.querySelector(".route-provider").textContent = route.provider;
    fragment.querySelector(".metric-distance").textContent = formatMiles(route.distance);
    fragment.querySelector(".metric-duration").textContent = formatDuration(route.durationMinutes);
    fragment.querySelector(".metric-safety").textContent = `${route.safetyRating.toFixed(1)} / 5`;
    fragment.querySelector(".metric-terrain").textContent = route.terrain;
    fragment.querySelector(".route-notes").textContent = route.notes;

    if (isAlreadyPlanned(route.id)) {
      addButton.textContent = "Added to Planner";
      addButton.disabled = true;
      card.classList.add("in-planner");
    } else {
      addButton.addEventListener("click", () => {
        state.plannerRoutes.push({ ...route });
        syncUi();
      });
    }

    routeResultsEl.appendChild(fragment);
  });
}

function calculatePlannedMiles() {
  return state.plannerRoutes.reduce((sum, route) => sum + route.distance, 0);
}

function updateProgress() {
  const plannedMiles = calculatePlannedMiles();
  const totalMiles = plannedMiles + state.completedMiles;
  const progress = Math.min((totalMiles / state.goalMiles) * 100, 100);

  plannedMilesEl.textContent = plannedMiles.toFixed(1);
  completedMilesEl.textContent = state.completedMiles.toFixed(1);
  goalProgressLabelEl.textContent = `${progress.toFixed(0)}%`;
  goalProgressBarEl.style.width = `${progress}%`;
}

function renderPlannerList() {
  plannerListEl.innerHTML = "";
  const template = document.getElementById("planner-item-template");

  if (state.plannerRoutes.length === 0) {
    const item = document.createElement("li");
    item.className = "empty-state";
    item.textContent = "No planned routes yet. Add routes from the comparison list.";
    plannerListEl.appendChild(item);
    return;
  }

  state.plannerRoutes.forEach((route) => {
    const fragment = template.content.cloneNode(true);
    fragment.querySelector(".planner-route-name").textContent = route.name;
    fragment.querySelector(
      ".planner-route-meta",
    ).textContent = `${route.provider} • ${formatMiles(route.distance)} • Safety ${route.safetyRating.toFixed(1)}`;

    fragment.querySelector(".remove-route").addEventListener("click", () => {
      state.plannerRoutes = state.plannerRoutes.filter((plannedRoute) => plannedRoute.id !== route.id);
      syncUi();
    });

    fragment.querySelector(".complete-route").addEventListener("click", () => {
      state.completedMiles += route.distance;
      state.plannerRoutes = state.plannerRoutes.filter((plannedRoute) => plannedRoute.id !== route.id);
      syncUi();
    });

    plannerListEl.appendChild(fragment);
  });
}

function syncUi() {
  const filteredRoutes = buildFilteredRoutes();
  renderProviderStats(filteredRoutes);
  renderRoutes(filteredRoutes);
  renderPlannerList();
  updateProgress();
}

document.querySelectorAll('input[name="provider"]').forEach((checkbox) => {
  checkbox.addEventListener("change", (event) => {
    const provider = event.target.value;
    if (event.target.checked) {
      state.selectedProviders.add(provider);
    } else {
      state.selectedProviders.delete(provider);
    }
    syncUi();
  });
});

minDistanceInput.addEventListener("input", (event) => {
  const newMin = Number(event.target.value);
  state.minDistance = newMin;
  if (state.maxDistance < newMin) {
    state.maxDistance = newMin;
    maxDistanceInput.value = String(newMin);
  }
  minDistanceValue.textContent = state.minDistance.toFixed(1);
  maxDistanceValue.textContent = state.maxDistance.toFixed(1);
  syncUi();
});

maxDistanceInput.addEventListener("input", (event) => {
  const newMax = Number(event.target.value);
  state.maxDistance = newMax;
  if (state.minDistance > newMax) {
    state.minDistance = newMax;
    minDistanceInput.value = String(newMax);
  }
  minDistanceValue.textContent = state.minDistance.toFixed(1);
  maxDistanceValue.textContent = state.maxDistance.toFixed(1);
  syncUi();
});

safetyThresholdInput.addEventListener("input", (event) => {
  state.safetyThreshold = Number(event.target.value);
  safetyThresholdValue.textContent = state.safetyThreshold.toFixed(1);
  syncUi();
});

terrainSelect.addEventListener("change", (event) => {
  state.terrain = event.target.value;
  syncUi();
});

sortBySelect.addEventListener("change", (event) => {
  state.sortBy = event.target.value;
  syncUi();
});

mileGoalInput.addEventListener("change", (event) => {
  const parsedGoal = Number(event.target.value);
  state.goalMiles = parsedGoal > 0 ? parsedGoal : 1;
  mileGoalInput.value = String(state.goalMiles);
  updateProgress();
});

document.getElementById("reset-tracker").addEventListener("click", () => {
  state.plannerRoutes = [];
  state.completedMiles = 0;
  syncUi();
});

minDistanceValue.textContent = state.minDistance.toFixed(1);
maxDistanceValue.textContent = state.maxDistance.toFixed(1);
safetyThresholdValue.textContent = state.safetyThreshold.toFixed(1);
syncUi();
