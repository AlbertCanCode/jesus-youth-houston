// Continental US bounding box — keeps panning/zooming from wandering off into the ocean or other countries.
const US_BOUNDS = L.latLngBounds([24.396308, -125.0], [49.384358, -66.93457]);

const map = L.map('map', {
  scrollWheelZoom: true,
  minZoom: 4,
  maxBounds: US_BOUNDS.pad(0.1),
  maxBoundsViscosity: 1.0
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

fetch('data/houses.json')
  .then(res => res.json())
  .then(houses => {
    const bounds = [];

    houses.forEach(house => {
      const marker = L.marker([house.lat, house.lng]).addTo(map);
      bounds.push([house.lat, house.lng]);

      const popupHtml = `
        <div class="popup-card">
          <h3>${house.name}</h3>
          <p>${house.neighborhood} &middot; visited ${house.dateVisited}</p>
          <a class="hub-link" href="house.html?id=${house.id}">View house hub &rarr;</a>
        </div>
      `;
      marker.bindPopup(popupHtml);
    });

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
  const neighborhoodsEl = document.getElementById('stat-neighborhoods');
  if (!totalEl) return;

  const sorted = [...houses].sort((a, b) => a.dateVisited.localeCompare(b.dateVisited));
  const neighborhoods = new Set(houses.map(h => h.neighborhood));

  totalEl.textContent = houses.length;
  firstEl.textContent = formatDate(sorted[0].dateVisited);
  latestEl.textContent = formatDate(sorted[sorted.length - 1].dateVisited);
  neighborhoodsEl.textContent = neighborhoods.size;
}
