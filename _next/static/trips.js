// Trips: only one talk/report list open at a time; clicking elsewhere closes it.
document.addEventListener('click', (e) => {
  for (const d of document.querySelectorAll('details.drop[open]')) if (!d.contains(e.target)) d.open = false;
});
