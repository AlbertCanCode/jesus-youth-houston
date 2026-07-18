(function () {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const COLORS = { dark: '#12141a', light: '#f7f4ee' };

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (metaThemeColor) metaThemeColor.setAttribute('content', COLORS[theme]);
  }

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });

  // Sync the theme-color meta tag with whatever the blocking head script already set.
  applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
})();
