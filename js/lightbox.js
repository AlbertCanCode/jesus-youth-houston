(function () {
  let currentPhotos = [];
  let currentIndex = 0;
  let lightbox, imgEl, counterEl, prevBtn, nextBtn, closeBtn, wired;

  function ensureLightbox() {
    if (wired) return;
    lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    imgEl = document.getElementById('lightbox-img');
    counterEl = document.getElementById('lightbox-counter');
    prevBtn = document.getElementById('lightbox-prev');
    nextBtn = document.getElementById('lightbox-next');
    closeBtn = document.getElementById('lightbox-close');

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });

    wired = true;
  }

  function render() {
    const photo = currentPhotos[currentIndex];
    imgEl.src = photo;
    imgEl.alt = `Photo ${currentIndex + 1} of ${currentPhotos.length}`;
    const multi = currentPhotos.length > 1;
    counterEl.textContent = multi ? `${currentIndex + 1} / ${currentPhotos.length}` : '';
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
  }

  function open(photos, index) {
    currentPhotos = photos;
    currentIndex = index;
    render();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
    render();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % currentPhotos.length;
    render();
  }

  // container: element holding the .photo-grid; photos: the same URL array used to render it.
  window.initLightbox = function (container, photos) {
    ensureLightbox();
    if (!lightbox) return;

    const imgs = container.querySelectorAll('.photo-grid img');
    imgs.forEach((img, i) => {
      img.classList.add('is-clickable');
      img.addEventListener('click', () => open(photos, i));
    });
  };
})();
