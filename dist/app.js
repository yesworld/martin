(() => {
  // Menus stay usable without JS through native <details>.
  const menus = [...document.querySelectorAll('.mobile-menu, .service-menu')];
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    for (const menu of menus) {
      if (menu.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    }
  });
  document.addEventListener('click', event => {
    for (const menu of menus) if (menu.open && (!menu.contains(event.target) || event.target.closest('a'))) menu.open = false;
  });
  const filterGroup = document.querySelector('[data-filters]');
  if (filterGroup) {
    filterGroup.hidden = false;
    filterGroup.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      filterGroup.querySelectorAll('button').forEach(item => {
        item.setAttribute('aria-pressed', String(item === button));
        item.classList.toggle('is-active', item === button);
      });
      let count = 0;
      document.querySelectorAll('[data-category]').forEach(card => {
        card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
        if (!card.hidden) count++;
      });
      document.querySelector('[data-filter-count]').textContent = 'Работ: ' + count;
    });
  }
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    document.querySelectorAll('.service-card, .principles article, .process-list li, .work-card').forEach(element => {
      element.classList.add('reveal');
      observer.observe(element);
    });
  }
})();
