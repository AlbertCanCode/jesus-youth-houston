// Fades/slides ".reveal" elements in as they enter the viewport.
// Call window.initReveal(container) again after injecting new markup
// (e.g. the house hub content) so newly added elements get observed too.
window.initReveal = function (root) {
  const scope = root || document;
  const items = scope.querySelectorAll('.reveal:not(.is-visible)');
  if (!items.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
};

window.initReveal();
