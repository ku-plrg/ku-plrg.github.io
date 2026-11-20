// Trips: only one talk/report list open at a time; clicking elsewhere closes it.
document.addEventListener('click', (e) => {
  for (const d of document.querySelectorAll('details.drop[open]')) if (!d.contains(e.target)) d.open = false;
});

// On a narrow screen a list can run off the edge (a card in the left column opens its
// last list to the left, one in the right column to the right): when a list opens,
// slide it back inside the screen with an 8px margin.
for (const d of document.querySelectorAll('details.drop')) {
  d.addEventListener('toggle', () => {
    const menu = d.querySelector('.menu');
    if (!menu) return;
    menu.style.transform = '';
    if (!d.open) return;
    const r = menu.getBoundingClientRect(), vw = document.documentElement.clientWidth, m = 8;
    const dx = r.left < m ? m - r.left : r.right > vw - m ? vw - m - r.right : 0;
    if (dx) menu.style.transform = `translateX(${dx}px)`;
  });
}
