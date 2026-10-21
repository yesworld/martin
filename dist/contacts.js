(() => {
  const revealButton = document.querySelector('[data-phone-reveal]');
  const phoneLink = document.getElementById('contact-phone');
  if (!revealButton || !phoneLink) return;

  revealButton.hidden = false;
  revealButton.addEventListener('click', () => {
    revealButton.hidden = true;
    phoneLink.hidden = false;
    phoneLink.focus({ preventScroll: true });
  }, { once: true });
})();
