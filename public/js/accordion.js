/* =========================================
   Accordion Enhancement
   - data-accordion="single" on a container limits to one open at a time
   - Persists open/closed per <details id="..."> in sessionStorage
   ========================================= */

(function () {
  const groups = document.querySelectorAll('.accordion');

  groups.forEach(group => {
    const single = group.getAttribute('data-accordion') === 'single';
    const items = group.querySelectorAll('details.acc-item');

    // restore state
    items.forEach(d => {
      const id = d.id || '';
      if (!id) return;
      const saved = sessionStorage.getItem(`acc:${id}`);
      if (saved === 'open') d.setAttribute('open', '');
      if (saved === 'closed') d.removeAttribute('open');
    });

    group.addEventListener('toggle', e => {
      const target = e.target;
      if (!(target instanceof HTMLDetailsElement)) return;

      // persist state
      const id = target.id || '';
      if (id) {
        sessionStorage.setItem(`acc:${id}`, target.open ? 'open' : 'closed');
      }

      // single-open enforcement
      if (single && target.open) {
        items.forEach(d => {
          if (d !== target) {
            d.removeAttribute('open');
            const otherId = d.id || '';
            if (otherId) sessionStorage.setItem(`acc:${otherId}`, 'closed');
          }
        });
      }
    });
  });
})();
