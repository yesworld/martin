(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const track = gallery.querySelector('[data-gallery-track]');
    const slides = [...track.children];
    const previous = gallery.querySelector('[data-gallery-previous]');
    const next = gallery.querySelector('[data-gallery-next]');
    const current = gallery.querySelector('[data-gallery-current]');
    const pagination = document.createElement('div');
    pagination.className = 'gallery-pagination';
    pagination.setAttribute('aria-hidden', 'true');
    const dots = slides.map(() => {
      const dot = document.createElement('span');
      pagination.append(dot);
      return dot;
    });
    gallery.append(pagination);
    let index = 0;
    let scrollTimer;
    let gesture;

    const updateControls = () => {
      current.textContent = String(index + 1).padStart(2, '0');
      previous.disabled = index === 0;
      next.disabled = index === slides.length - 1;
      dots.forEach((dot, position) => dot.classList.toggle('is-current', position === index));
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
      if (gesture?.dragging) return;
      scrollTimer = setTimeout(syncPosition, 150);
    }, { passive: true });

    track.addEventListener('dragstart', (event) => event.preventDefault());
    track.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      clearTimeout(scrollTimer);
      gesture = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        left: track.scrollLeft,
        index,
        dragging: false,
      };
      track.setPointerCapture(event.pointerId);
    });

    track.addEventListener('pointermove', (event) => {
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      const distanceX = event.clientX - gesture.x;
      const distanceY = event.clientY - gesture.y;
      if (!gesture.dragging) {
        if (Math.max(Math.abs(distanceX), Math.abs(distanceY)) < 8) return;
        if (Math.abs(distanceY) >= Math.abs(distanceX)) {
          gesture = undefined;
          track.releasePointerCapture(event.pointerId);
          return;
        }
        gesture.dragging = true;
        track.classList.add('is-dragging');
      }
      event.preventDefault();
      track.scrollLeft = gesture.left - distanceX;
    });

    const finishGesture = (event, cancelled = false) => {
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      const completed = gesture;
      gesture = undefined;
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      track.classList.remove('is-dragging');
      if (!completed.dragging) return;
      const distance = event.clientX - completed.x;
      const threshold = Math.min(48, track.clientWidth * .14);
      const direction = !cancelled && Math.abs(distance) >= threshold ? (distance < 0 ? 1 : -1) : 0;
      goTo(completed.index + direction);
    };

    track.addEventListener('pointerup', (event) => finishGesture(event));
    track.addEventListener('pointercancel', (event) => finishGesture(event, true));
    track.addEventListener('lostpointercapture', (event) => finishGesture(event, true));

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
  });
})();
