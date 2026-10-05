/* Minimal hand-rolled stroke icon set — no external icon font/network dependency. */
(function () {
  const ICONS = {
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    battery: '<rect x="2" y="7" width="18" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/>',
    gauge: '<circle cx="12" cy="13" r="8"/><path d="M12 13l3.2-3.6"/><path d="M9 4.5h6"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-3.7 11.8c.55.46.9 1.18.9 1.9v.3h5.6v-.3c0-.72.35-1.44.9-1.9A6.5 6.5 0 0 0 12 2.5z"/>',
    wind: '<path d="M3 8h9.5a2.5 2.5 0 1 0-2.4-3.2"/><path d="M3 16h12.5a2.5 2.5 0 1 1-2.4 3.2"/><path d="M3 12h16"/>',
    truck: '<rect x="1.5" y="6.5" width="13" height="10" rx="1"/><path d="M14.5 10h4l3.5 3.2v3.3h-7.5z"/><circle cx="6" cy="18.5" r="1.8"/><circle cx="18" cy="18.5" r="1.8"/>',
    shield: '<path d="M12 2.5 4.5 5.3v5.6c0 5 3.2 8.1 7.5 10.6 4.3-2.5 7.5-5.6 7.5-10.6V5.3z"/>',
    'shield-check': '<path d="M12 2.5 4.5 5.3v5.6c0 5 3.2 8.1 7.5 10.6 4.3-2.5 7.5-5.6 7.5-10.6V5.3z"/><polyline points="8.7 12.2 11 14.5 15.4 10"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.2v5l3.4 2"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
    headset: '<path d="M4 13.5a8 8 0 0 1 16 0"/><path d="M20 13.5v4a1.8 1.8 0 0 1-1.8 1.8H17v-6h3z"/><path d="M4 13.5v4a1.8 1.8 0 0 0 1.8 1.8H7v-6H4z"/>',
    check: '<polyline points="20 6.5 9.5 17 4.5 12.2"/>',
    'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>',
    menu: '<line x1="3.5" y1="6.5" x2="20.5" y2="6.5"/><line x1="3.5" y1="12" x2="20.5" y2="12"/><line x1="3.5" y1="17.5" x2="20.5" y2="17.5"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    phone: '<path d="M21 16.4v2.7a1.8 1.8 0 0 1-2 1.8 17.9 17.9 0 0 1-7.7-2.8 17.6 17.6 0 0 1-5.4-5.4A17.9 17.9 0 0 1 3.1 5a1.8 1.8 0 0 1 1.8-2h2.7a1.8 1.8 0 0 1 1.8 1.5c.1.8.3 1.6.6 2.4a1.8 1.8 0 0 1-.4 1.9L8.3 10a14.4 14.4 0 0 0 5.4 5.4l1.2-1.2a1.8 1.8 0 0 1 1.9-.4c.8.3 1.6.5 2.4.6A1.8 1.8 0 0 1 21 16.4z"/>',
    mail: '<rect x="2.2" y="4.5" width="19.6" height="15" rx="2"/><path d="m2.6 6 9.4 7 9.4-7"/>',
    pin: '<path d="M20 10.3c0 6.2-8 11.2-8 11.2s-8-5-8-11.2a8 8 0 1 1 16 0z"/><circle cx="12" cy="10.3" r="2.8"/>',
    building: '<rect x="4" y="2.5" width="16" height="19" rx="1"/><line x1="8" y1="7" x2="8" y2="7"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01"/><line x1="10" y1="21.5" x2="10" y2="17.5"/><line x1="14" y1="21.5" x2="14" y2="17.5"/>',
    bank: '<line x1="3" y1="21.5" x2="21" y2="21.5"/><line x1="5" y1="21" x2="5" y2="10.5"/><line x1="10" y1="21" x2="10" y2="10.5"/><line x1="14" y1="21" x2="14" y2="10.5"/><line x1="19" y1="21" x2="19" y2="10.5"/><polygon points="12 3 21 9 3 9"/>',
    activity: '<polyline points="22 12.5 18 12.5 15 21 9 3 6 12.5 2 12.5"/>',
    plane: '<path d="M21.5 15.8v-1.9l-7.6-4.7V4.3a1.9 1.9 0 1 0-3.8 0v4.9l-7.6 4.7v1.9l7.6-2.3v4.6l-2.7 1.9v1.4l4.6-1.3 4.6 1.3v-1.4l-2.7-1.9v-4.6z"/>',
    radio: '<circle cx="12" cy="12" r="1.8"/><path d="M15.6 8.4a5 5 0 0 1 0 7.2"/><path d="M8.4 15.6a5 5 0 0 1 0-7.2"/><path d="M18.4 5.6a9.2 9.2 0 0 1 0 12.8"/><path d="M5.6 18.4a9.2 9.2 0 0 1 0-12.8"/>',
    factory: '<path d="M2.5 20.5V11l5.3 3.6V11l5.3 3.6V6.5l5.4 3.6v10.4z"/><line x1="2.5" y1="20.5" x2="21.5" y2="20.5"/>',
    award: '<circle cx="12" cy="8.3" r="5.8"/><polyline points="8.3 13.6 7.2 21.5 12 18.8 16.8 21.5 15.7 13.6"/>',
    users: '<path d="M16.5 21v-1.8a3.6 3.6 0 0 0-3.6-3.6H5.6A3.6 3.6 0 0 0 2 19.2V21"/><circle cx="9" cy="7.6" r="3.6"/><path d="M22 21v-1.8a3.6 3.6 0 0 0-2.7-3.5"/><path d="M15.3 4.2a3.6 3.6 0 0 1 0 7"/>',
    file: '<path d="M13.5 2.5h-7a1.8 1.8 0 0 0-1.8 1.8v15.4a1.8 1.8 0 0 0 1.8 1.8h10.8a1.8 1.8 0 0 0 1.8-1.8V7.7z"/><polyline points="13.5 2.5 13.5 7.7 18.7 7.7"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><line x1="16" y1="2.5" x2="16" y2="6.5"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="3" y1="9.8" x2="21" y2="9.8"/>',
    layers: '<polygon points="12 2.5 21.5 7.5 12 12.5 2.5 7.5"/><polyline points="2.5 12.5 12 17.5 21.5 12.5"/><polyline points="2.5 17.5 12 22.5 21.5 17.5"/>',
    search: '<circle cx="10.5" cy="10.5" r="7"/><line x1="20.5" y1="20.5" x2="15.5" y2="15.5"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="12" y2="18.01"/><line x1="16" y1="18" x2="16" y2="18.01"/>',
    map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
    'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  };

  function render(root) {
    (root || document).querySelectorAll('[data-icon]').forEach((el) => {
      const name = el.getAttribute('data-icon');
      const body = ICONS[name];
      if (!body || el.dataset.iconDone) return;
      el.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
        body +
        '</svg>';
      el.dataset.iconDone = '1';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => render());
  } else {
    render();
  }
  window.renderIcons = render;
})();
