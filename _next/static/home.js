// Home photo slider: native horizontal scroll with snapping (so swiping works on
// phones), dragging with a mouse, and the previous / next buttons under the photo.
// It never moves by itself.
(() => {
  const slider = document.querySelector('.slider');
  if (!slider) return;
  const track = slider.querySelector('.slides');
  const slides = [...track.children];
  if (slides.length < 2) return;
  const cap = slider.querySelector('.cap'), count = slider.querySelector('.count');
  const current = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = (i) => track.scrollTo({ left: ((i + slides.length) % slides.length) * track.clientWidth, behavior: 'smooth' });
  slider.querySelector('.prev').addEventListener('click', () => go(current() - 1));
  slider.querySelector('.next').addEventListener('click', () => go(current() + 1));
  track.addEventListener('scroll', () => {
    const i = current();
    cap.textContent = slides[i].dataset.caption;
    count.textContent = `${i + 1} / ${slides.length}`;
  }, { passive: true });

  // mouse drag: move with the pointer, then settle on the next / previous photo
  // when dragged far enough (a sixth of the width), else back on the same one
  let start = null;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    start = { x: e.clientX, left: track.scrollLeft, i: current() };
    track.setPointerCapture(e.pointerId);
    track.classList.add('dragging');
  });
  track.addEventListener('pointermove', (e) => {
    if (start) track.scrollLeft = start.left - (e.clientX - start.x);
  });
  const end = (e) => {
    if (!start) return;
    const dx = e.clientX - start.x, i = start.i;
    start = null;
    track.classList.remove('dragging');
    const step = Math.abs(dx) > track.clientWidth / 6 ? (dx < 0 ? 1 : -1) : 0;
    go(Math.min(Math.max(i + step, 0), slides.length - 1));
  };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);
})();
