// The e-mail address in "Join Us" is written as "user [at] domain" in the HTML so
// that simple scrapers cannot harvest it; it is assembled here into a mailto link,
// and the Copy button (for webmail users) copies the assembled address.
(() => {
  const link = document.querySelector('.addr[data-user]');
  if (!link) return;
  const addr = `${link.dataset.user}@${link.dataset.domain}`;
  link.href = `mailto:${addr}`;
  link.textContent = addr;
  const button = document.querySelector('[data-copy-mail]');
  if (!button) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(addr);
      button.textContent = 'Copied!';
    } catch {
      button.textContent = 'Copy failed';
    }
    setTimeout(() => { button.textContent = 'Copy'; }, 1500);
  });
})();

// Home photo slider: native horizontal scroll with snapping (so swiping works on
// phones), plus arrows and dots. It never moves by itself.
(() => {
  const slider = document.querySelector('.slider');
  if (!slider) return;
  const track = slider.querySelector('.slides');
  const slides = [...track.children];
  const dots = [...slider.querySelectorAll('.dots button')];
  if (slides.length < 2) return;
  const current = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = (i) => track.scrollTo({ left: ((i + slides.length) % slides.length) * track.clientWidth, behavior: 'smooth' });
  slider.querySelector('.prev').addEventListener('click', () => go(current() - 1));
  slider.querySelector('.next').addEventListener('click', () => go(current() + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  track.addEventListener('scroll', () => {
    const i = current();
    dots.forEach((d, k) => (k === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
  }, { passive: true });
})();
