// Glass overlay + fade transition between pages
(function () {
  const overlay = document.createElement('div');
  overlay.className = 'glass-overlay';
  document.body.appendChild(overlay);

  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    let url;
    try { url = new URL(link.href, location.href); } catch { return; }

    // Skip: external, anchor-only, new-tab, modifier keys
    if (url.hostname !== location.hostname) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (link.target === '_blank') return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    const dest = link.href;

    overlay.classList.add('active');
    setTimeout(function () { location.href = dest; }, 340);
  });
})();
