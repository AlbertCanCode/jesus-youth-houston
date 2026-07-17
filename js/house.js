function getHouseId() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  return Number.isNaN(id) ? null : id;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function render(house) {
  const content = document.getElementById('hub-content');
  document.title = `${house.name} — Jesus Youth Houston Jubilee Cross`;

  const photosHtml = (house.photos && house.photos.length)
    ? `<div class="photo-grid">${house.photos.map(src => `<img src="${src}" alt="Photo from ${house.name}" loading="lazy" decoding="async" width="480" height="320" />`).join('')}</div>`
    : `<p class="empty-note">No photos yet from this visit.</p>`;

  const videosHtml = (house.videos && house.videos.length)
    ? `<div class="video-list">${house.videos.map(v => `
        <div class="video-item">
          <div class="video-embed">
            <iframe
              src="https://www.youtube-nocookie.com/embed/${v.youtubeId}"
              title="${v.title}"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <p>${v.title}</p>
        </div>
      `).join('')}</div>`
    : `<p class="empty-note">No videos yet from this visit.</p>`;

  content.innerHTML = `
    <h2 class="hub-title">${house.name}</h2>
    <div class="hub-meta">${house.neighborhood} &middot; visited ${formatDate(house.dateVisited)}</div>
    <div class="hub-notes">${house.notes}</div>

    <h3 class="section-title">Photos</h3>
    ${photosHtml}

    <h3 class="section-title">Videos</h3>
    ${videosHtml}
  `;
}

const houseId = getHouseId();

if (houseId === null) {
  document.getElementById('hub-content').innerHTML = '<p class="empty-note">No house selected.</p>';
} else {
  fetch('data/houses.json')
    .then(res => res.json())
    .then(houses => {
      const house = houses.find(h => h.id === houseId);
      if (house) {
        render(house);
      } else {
        document.getElementById('hub-content').innerHTML = '<p class="empty-note">House not found.</p>';
      }
    })
    .catch(err => {
      console.error('Failed to load houses.json', err);
      document.getElementById('hub-content').innerHTML = '<p class="empty-note">Failed to load house data.</p>';
    });
}
