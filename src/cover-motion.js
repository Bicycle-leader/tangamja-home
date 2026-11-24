const coverArtwork = document.querySelector('#cover-bike-art');
const motionButton = document.querySelector('.cover-motion-toggle');

if (coverArtwork && motionButton && typeof coverArtwork.pauseAnimations === 'function') {
  const cover = motionButton.closest('.cover');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let pausedByVisitor = false;

  function updateCoverMotion() {
    const motionEnabled = !reducedMotion.matches;
    cover.classList.toggle('cover-motion-enabled', motionEnabled);
    motionButton.hidden = !motionEnabled;
    motionButton.toggleAttribute('data-paused', pausedByVisitor);
    motionButton.textContent = pausedByVisitor ? '모션 재생' : '모션 일시정지';

    if (motionEnabled && !pausedByVisitor) {
      coverArtwork.unpauseAnimations();
    } else {
      coverArtwork.pauseAnimations();
    }
  }

  motionButton.addEventListener('click', () => {
    pausedByVisitor = !pausedByVisitor;
    updateCoverMotion();
  });
  reducedMotion.addEventListener('change', updateCoverMotion);
  updateCoverMotion();
}
