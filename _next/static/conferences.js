// Conference deadlines: "YYYY-MM-DD HH:mm" in AoE (UTC-12). Shows a live countdown
// and the deadline day in the visitor's time zone (exact time on hover), puts
// upcoming deadlines first (soonest first) and past ones below, and filters by area.
(() => {
  const list = document.getElementById('conf-list');
  const past = document.getElementById('conf-past');
  const pastGroup = document.getElementById('past-group');
  const items = [...document.querySelectorAll('.conf')];
  const zone = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return ''; } })();

  function parse(raw) {
    const m = raw.match(/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d))?/);
    if (!m) return null;
    const [, y, mo, d, h = '23', mi = '59'] = m;
    return new Date(Date.UTC(+y, +mo - 1, +d, +h + 12, +mi, 59));
  }
  const full = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  for (const li of items) {
    li.deadline = parse(li.dataset.deadline);
    if (!li.deadline) continue;
    // the deadline day as in the CFP (AoE, MM/DD); the exact local time on hover
    li.querySelector('.due').textContent = li.dataset.deadline.slice(5, 10).replace('-', '/');
    li.querySelector('.due').dataset.tip = li.querySelector('.countdown').dataset.tip =
      `${full.format(li.deadline)}${zone ? ` (${zone})` : ''}`;
  }

  const now = Date.now();
  const upcoming = items.filter((li) => !li.deadline || li.deadline > now)
    .sort((a, b) => (a.deadline ?? Infinity) - (b.deadline ?? Infinity));
  const done = items.filter((li) => li.deadline && li.deadline <= now).sort((a, b) => b.deadline - a.deadline);
  list.append(...upcoming);
  past.append(...done);

  // time left in days ("145 days"), or hours and minutes on the last day ("19h 32m")
  // the value is right-aligned in a fixed width, so values and "ago" line up
  const cell = (v, past) => `<span class="v">${v}</span>${past ? '<span class="ago">ago</span>' : ''}`;
  function span(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return d < 1 ? `${h}h ${m}m` : `${d} day${d > 1 ? 's' : ''}`;
  }

  function tick() {
    const t = Date.now();
    for (const li of upcoming) {
      if (!li.deadline) continue;
      const d = Math.floor(Math.max(0, li.deadline - t) / 86400000);
      li.querySelector('.countdown').innerHTML = cell(span(li.deadline - t));
      li.classList.toggle('soon', d < 7);
    }
    // past deadlines use the same units: "13h 5m ago", "10 days ago"
    for (const li of done) li.querySelector('.countdown').innerHTML = cell(span(t - li.deadline), true);
  }

  tick();
  setInterval(tick, 30000);

  const chips = [...document.querySelectorAll('.chip[data-tag]')];
  function filter(tag) {
    for (const c of chips) c.setAttribute('aria-pressed', String(c.dataset.tag === tag));
    for (const li of items) li.hidden = !!tag && !li.dataset.tags.split(' ').includes(tag);
    pastGroup.hidden = !done.some((li) => !li.hidden);
  }
  for (const c of chips) c.addEventListener('click', () => filter(c.dataset.tag));
  // area tags in the table and the legend filter too (clicking the active one shows all)
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.ctag[data-tag]');
    if (!t) return;
    const active = chips.find((c) => c.getAttribute('aria-pressed') === 'true')?.dataset.tag;
    filter(active === t.dataset.tag ? '' : t.dataset.tag);
    document.querySelector('.filters').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  filter('');
})();
