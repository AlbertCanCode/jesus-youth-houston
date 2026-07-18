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
  content.removeAttribute('aria-busy');
  document.title = `${house.name} — Jesus Youth Houston Jubilee Cross`;

  const photosHtml = (house.photos && house.photos.length)
    ? `<div class="photo-grid">${house.photos.map((src, i) => `<img src="${src}" alt="Photo from ${house.name}" loading="lazy" decoding="async" width="480" height="320" class="reveal" style="transition-delay: ${i * 0.06}s" />`).join('')}</div>`
    : `<p class="empty-note">No photos yet from this visit.</p>`;

  const videosHtml = (house.videos && house.videos.length)
    ? `<div class="video-list">${house.videos.map((v, i) => `
        <div class="video-item reveal" style="transition-delay: ${i * 0.06}s">
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
    <div class="hub-notes reveal">${house.notes}</div>

    <h3 class="section-title">Photos</h3>
    ${photosHtml}

    <h3 class="section-title">Videos</h3>
    ${videosHtml}
  `;

  if (window.initReveal) window.initReveal(content);
  if (window.initLightbox && house.photos && house.photos.length) {
    window.initLightbox(content, house.photos);
  }
}

function showMessage(message) {
  const content = document.getElementById('hub-content');
  content.removeAttribute('aria-busy');
  content.innerHTML = `<p class="empty-note">${message}</p>`;
}

const houseId = getHouseId();

if (houseId === null) {
  showMessage('No house selected.');
} else {
  fetch('data/houses.json')
    .then(res => res.json())
    .then(houses => {
      const house = houses.find(h => h.id === houseId);
      if (house) {
        render(house);
      } else {
        showMessage('House not found.');
      }
    })
    .catch(err => {
      console.error('Failed to load houses.json', err);
      showMessage('Failed to load house data.');
    });
}
