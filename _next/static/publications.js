// Publication filters: research topic chips and an awards toggle.
// The state is kept in the URL hash (e.g. #topic=spec&award=1) so a filtered
// list can be shared, and the home page's topic links land here.
(() => {
  const items = [...document.querySelectorAll('.year-group li')];
  const groups = [...document.querySelectorAll('.year-group')];
  const topicChips = [...document.querySelectorAll('.chip[data-topic]')];
  const awardChip = document.querySelector('.chip[data-award]');
  const count = document.getElementById('pub-count');
  const state = { topic: '', award: false };

  function apply() {
    let shown = 0;
    for (const li of items) {
      const ok = (!state.topic || li.dataset.topics.split(' ').includes(state.topic))
        && (!state.award || li.dataset.award === '1');
      li.hidden = !ok;
      if (ok) shown++;
    }
    for (const g of groups) g.hidden = !g.querySelector('li:not([hidden])');
    for (const c of topicChips) c.setAttribute('aria-pressed', String(c.dataset.topic === state.topic));
    awardChip.setAttribute('aria-pressed', String(state.award));
    count.textContent = shown === items.length ? `${shown} papers` : `${shown} of ${items.length} papers`;
    document.getElementById('pub-empty').hidden = shown > 0;
    const params = new URLSearchParams();
    if (state.topic) params.set('topic', state.topic);
    if (state.award) params.set('award', '1');
    const hash = params.toString();
    history.replaceState(null, '', hash ? `#${hash}` : location.pathname);
  }

  function load() {
    const params = new URLSearchParams(location.hash.slice(1));
    state.topic = params.get('topic') || '';
    state.award = params.get('award') === '1';
  }

  for (const c of topicChips) c.addEventListener('click', () => { state.topic = c.dataset.topic; apply(); });
  awardChip.addEventListener('click', () => { state.award = !state.award; apply(); });
  // topic tags inside the list link to #topic=..., which lands here
  window.addEventListener('hashchange', () => { load(); apply(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  load();
  apply();
})();
