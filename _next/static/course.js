// Course schedule: while the semester is in progress, dims past classes and
// highlights the next one. Finished semesters (no upcoming class) stay as they are.
(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows = [...document.querySelectorAll('.schedule .row[data-date]')]
    .map((row) => [row, new Date(`${row.dataset.date}T00:00:00`)])
    .filter(([, d]) => !Number.isNaN(d.getTime()));
  const next = rows.find(([, d]) => d >= today);
  if (!next) return;
  for (const [row, d] of rows) if (d < today) row.classList.add('past');
  next[0].classList.add('next');
  // once classes have started, the "Schedule ↓" link jumps to the next class instead
  const jump = document.querySelector('.kicker .jump');
  if (jump && rows.some(([, d]) => d < today)) {
    next[0].id = 'next-class';
    jump.href = '#next-class';
    jump.textContent = 'Next class ↓';
    jump.addEventListener('click', (e) => {
      e.preventDefault();
      // slide down (instant for visitors who turned off animations)
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      next[0].scrollIntoView({ block: 'center', behavior: still ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#next-class');
    });
  }
})();
