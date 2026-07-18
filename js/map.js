// Greater Houston bounding box — keeps the map locked to this region for now.
// If houses outside the area get added later, widen (or drop) this box.
const HOUSTON_BOUNDS = L.latLngBounds([29.30, -96.05], [30.35, -94.95]);

const map = L.map('map', {
  scrollWheelZoom: true,
  minZoom: 8,
  maxBounds: HOUSTON_BOUNDS.pad(0.15),
  maxBoundsViscosity: 1.0,
  zoomSnap: 0.5,
  zoomDelta: 0.5
});

const TILE_URLS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
};

let tileLayer = L.tileLayer(currentTileUrl(), {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

function currentTileUrl() {
  const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  return TILE_URLS[theme];
}

// Swap the basemap to match light/dark mode (theme.js dispatches this on toggle).
window.addEventListener('themechange', () => {
  map.removeLayer(tileLayer);
  tileLayer = L.tileLayer(currentTileUrl(), {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);
});

// A fast drag can outrun the map's own cursor and start selecting the page
// text behind it — block text selection on the page for the duration of the drag.
map.on('dragstart', () => document.body.classList.add('leaflet-dragging'));
map.on('dragend', () => document.body.classList.remove('leaflet-dragging'));

const crossIconSvg = '<svg viewBox="0 0 24 24" width="13" height="13"><rect x="10" y="3" width="4" height="18" rx="1.5" fill="#fff"/><rect x="3" y="10" width="18" height="4" rx="1.5" fill="#fff"/></svg>';

function crossIcon(delay) {
  return L.divIcon({
    className: 'cross-marker-wrapper',
    html: `<span class="cross-marker" style="animation-delay:${delay}s">${crossIconSvg}</span>`,
    iconSize: [30, 38],
    iconAnchor: [15, 34],
    popupAnchor: [0, -30]
  });
}

const markers = L.markerClusterGroup({
  maxClusterRadius: 45,
  showCoverageOnHover: false,
  spiderfyOnMaxZoom: true,
  iconCreateFunction: (cluster) => L.divIcon({
    className: 'cluster-marker-wrapper',
    html: `<span class="cluster-marker">${cluster.getChildCount()}</span>`,
    iconSize: [38, 38]
  })
});

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

fetch('data/houses.json')
  .then(res => res.json())
  .then(houses => {
    const bounds = [];

    houses.forEach((house, i) => {
      const marker = L.marker([house.lat, house.lng], {
        icon: crossIcon(Math.min(i * 0.04, 0.6))
      });
      bounds.push([house.lat, house.lng]);

      const popupHtml = `
        <div class="popup-card">
          <h3>${house.name}</h3>
          <p>${house.neighborhood} &middot; visited ${house.dateVisited}</p>
          <a class="hub-link" href="house.html?id=${house.id}">View house hub &rarr;</a>
        </div>
      `;
      marker.bindPopup(popupHtml);
      markers.addLayer(marker);
    });

    map.addLayer(markers);

    // Jump straight to the fitted view — no animated zoom sweep through every
    // intermediate level (which would fetch a full tile set at each step).
    if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40], animate: false });
    } else {
      map.setView([29.86, -95.55], 9.5);
    }

    renderStats(houses);
  })
  .catch(err => {
    console.error('Failed to load houses.json', err);
    map.setView([29.86, -95.55], 9.5);
  });

function renderStats(houses) {
  const totalEl = document.getElementById('stat-total');
  const firstEl = document.getElementById('stat-first');
  const latestEl = document.getElementById('stat-latest');
  if (!totalEl) return;

  const sorted = [...houses].sort((a, b) => a.dateVisited.localeCompare(b.dateVisited));

  totalEl.textContent = houses.length;
  firstEl.textContent = formatDate(sorted[0].dateVisited);
  latestEl.textContent = formatDate(sorted[sorted.length - 1].dateVisited);
}
