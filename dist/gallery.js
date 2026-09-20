(() => {
  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;

  const track = gallery.querySelector('[data-gallery-track]');
  const slides = [...track.children];
  const previous = gallery.querySelector('[data-gallery-previous]');
  const next = gallery.querySelector('[data-gallery-next]');
  const current = gallery.querySelector('[data-gallery-current]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let scrollTimer;

  const updateControls = () => {
    current.textContent = String(index + 1).padStart(2, '0');
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
  };

  const slideLeft = (position) => slides[position].offsetLeft - slides[0].offsetLeft;

  const goTo = (position, animate = true) => {
    index = Math.max(0, Math.min(slides.length - 1, position));
    clearTimeout(scrollTimer);
    updateControls();
    track.scrollTo({
      left: slideLeft(index),
      behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant',
    });
  };

  const syncPosition = () => {
    index = slides.reduce((nearest, slide, position) => (
      Math.abs(slideLeft(position) - track.scrollLeft)
        < Math.abs(slideLeft(nearest) - track.scrollLeft) ? position : nearest
    ), 0);
    updateControls();
  };

  previous.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(syncPosition, 150);
  }, { passive: true });

  gallery.addEventListener('keydown', (event) => {
    const destinations = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: slides.length - 1,
    };
    if (!(event.key in destinations) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    goTo(destinations[event.key]);
  });

  new ResizeObserver(() => goTo(index, false)).observe(track);
  updateControls();
  gallery.querySelector('[data-gallery-controls]').hidden = false;
})();
