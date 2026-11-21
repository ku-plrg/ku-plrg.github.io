// Builds the static site from the existing data in the repository:
//   ../_data/*.yml, ../_data/course/<course>/<YYYY_S>.yml, and the Markdown pages
//   (members/*.md, research/, courses/**, ...). `redirect_to` pages become redirects.
// Output goes to ./out, together with the static files (PDFs, images, ...), so
// ./out is the whole site (deployed by .github/workflows/pages.yml).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { makeImages, hasCwebp } from './images.mjs';
import * as yaml from 'js-yaml';
import { marked } from 'marked';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'out');

const readYaml = (p) => yaml.load(fs.readFileSync(path.join(ROOT, p), 'utf8'));
// web-sized photos (static/img/), made before anything refers to them
if (hasCwebp()) { const n = makeImages(); if (n) console.log(`${n} image(s) converted`); }
else console.warn('warning: cwebp not found; using the original photos');
// a web-sized copy made by images.mjs (static/img/...) if there is one, else the original
const optimized = (src) => {
  const m = String(src || '').match(/^\/assets\/images\/(avatars\/|members\/|trips\/)?(.+)\.\w+$/);
  const copy = m ? `/static/img/${m[1] || ''}${m[2]}.webp` : null;
  return copy && fs.existsSync(path.join(HERE, copy)) ? copy : src;
};
const DATA = {
  authors: readYaml('_data/authors.yml'),
  members: readYaml('_data/members.yml'),
  publications: readYaml('_data/publications.yml'),
  talks: readYaml('_data/talks.yml'),
  trips: readYaml('_data/trips.yml'),
  conferences: readYaml('_data/conferences.yml'),
  photos: readYaml('_data/photos.yml'),
  research: readYaml('_data/research.yml'),
};

// ---------------------------------------------------------------------------
// helpers
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ifs = (cond, html) => (cond ? html : '');
const slug = (s) => String(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const byYearDesc = (obj) => Object.entries(obj || {}).sort(([a], [b]) => b - a);

const SITE = 'https://plrg.korea.ac.kr';
const PAGES = []; // URLs of written pages, for sitemap.xml

function write(rel, html) {
  if (rel.endsWith('.html') && html.includes('<!--URL-->')) {
    const url = `${SITE}/${rel.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '')}`;
    html = html.replaceAll('<!--URL-->', url);
    if (!/^404/.test(rel)) PAGES.push(url);
  }
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

// splits a Markdown/HTML source into its YAML front matter and body
function readPage(rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n?---\n?/);
  return { fm: (m && yaml.load(m[1])) || {}, body: m ? src.slice(m[0].length) : src };
}

const NAV = [
  ['Members', '/members/'],
  ['Research', '/research/'],
  ['Publications', '/publications/'],
  ['Courses', '/courses/'],
  ['Talks', '/talks/'],
  ['Trips', '/trips/'],
];
const LOCK = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

// dark mode: off for now (every page stays light and shows no toggle, like the
// course pages); set to true to bring back the system-following theme and the toggle
const DARK_MODE = false;

function layout({ title, description = 'Programming Language Research Group (PLRG) at Korea University', active, body, scripts = [], lightOnly = false, banner = false }) {
  const full = title ? `${title} · PLRG @ Korea University` : 'PLRG @ Korea University';
  return `<!doctype html>
<html lang="en"${lightOnly || !DARK_MODE ? ' data-theme="light" data-lock-theme' : ''}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(full)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="<!--URL-->">
  <link rel="icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/logo/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/logo/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/logo/apple-touch-icon.png">
  <link rel="manifest" href="/assets/logo/site.webmanifest">
  <meta property="og:type" content="website">
  <meta property="og:url" content="<!--URL-->">
  <meta property="og:title" content="${esc(full)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${SITE}/assets/images/main.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-RPGXB995RD"></script>
  <script>window.dataLayer = window.dataLayer || []; function gtag() { dataLayer.push(arguments); } gtag('js', new Date()); gtag('config', 'G-RPGXB995RD');</script>
  <link rel="stylesheet" href="/static/style.css">
  <script src="/static/theme.js"></script>
${['/static/addr.js', ...scripts].map((s) => `  <script defer src="${s}"></script>`).join('\n')}
</head>
<body>
<nav class="topnav">
  <div class="topnav-inner">
    <a class="brand" href="/" aria-label="PLRG home"><img src="/assets/logo/logo-detail.svg" alt="PLRG"></a>
    <div class="links" id="nav-links">
${NAV.map(([name, url]) => `      <a href="${url}"${active === url ? ' aria-current="page"' : ''}><span data-label="${name}">${name}</span></a>`).join('\n')}
    </div>
    <a class="lock-link" href="/internal/" aria-label="Internal" title="Internal"${active === '/internal/' ? ' aria-current="page"' : ''}>${LOCK}</a>
    <span class="theme-slot"></span>
    <button class="menu-toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav-links"><svg class="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><svg class="i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </div>
</nav>
<div class="nav-scrim"></div>
<script>(() => {
  // phones: open and close the menu (the button, a tap outside, Esc, or a wider screen)
  const root = document.documentElement, btn = document.querySelector('.menu-toggle');
  const set = (open) => { root.classList.toggle('menu-open', open); btn.setAttribute('aria-expanded', open); };
  btn.addEventListener('click', () => set(!root.classList.contains('menu-open')));
  document.querySelector('.nav-scrim').addEventListener('click', () => set(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  matchMedia('(min-width: 641px)').addEventListener('change', () => set(false));
})();</script>
${banner ? `<a class="banner" href="#join"><strong>We're recruiting!</strong> Graduate &amp; undergraduate students and postdocs <span aria-hidden="true">→</span></a>` : ''}
<main>
${body}
</main>
<footer>
  <p><a href="https://github.com/ku-plrg">GitHub</a> ·
  <a href="https://www.youtube.com/@ku-plrg">YouTube</a> ·
  <a href="/deadlines/">Conference Deadlines</a></p>
  <p class="org">Programming Language Research Group, <a href="https://cs.korea.ac.kr/">Dept. of Computer Science and Engineering</a>, <a href="https://www.korea.ac.kr/">Korea University</a></p>
</footer>
</body>
</html>
`;
}

const pageHead = (title, sub = '', kicker = '') => `<header class="page-head">
  ${ifs(kicker, `<p class="kicker">${kicker}</p>`)}
  <h1>${title}</h1>
  ${ifs(sub, `<p class="tagline">${sub}</p>`)}
</header>`;

// ---------------------------------------------------------------------------
// Markdown pages (kramdown-flavored sources written for Jekyll)

// contact links of a member from _data/authors.yml
// "Contact Information" of a member, all from _data/authors.yml: `office` (optional lines,
// Markdown), then the links (`email` may be a list)
function authorLinks(name) {
  const a = DATA.authors[name];
  if (!a) return '';
  const real = (v) => v && v !== '#';
  const office = [].concat(a.office || []).map((l) => marked.parseInline(String(l))).join('<br>\n');
  const links = [
    ...[].concat(a.email || []).filter(real).map((e) => ['Email', `mailto:${e}`, e]),
    real(a.scholar) && ['Google Scholar', `https://scholar.google.com/citations?user=${a.scholar}`],
    real(a.dblp) && ['DBLP', `https://dblp.org/pid/${a.dblp}.html`],
    real(a.github) && ['GitHub', `https://github.com/${a.github}`, `@${a.github}`],
    real(a.linkedin) && ['LinkedIn', `https://www.linkedin.com/in/${a.linkedin}`],
    real(a.twitter) && ['X', `https://x.com/${a.twitter}`],
    real(a.facebook) && ['Facebook', `https://www.facebook.com/${a.facebook}`],
    real(a.youtube) && ['YouTube', `https://www.youtube.com/@${a.youtube}`],
  ].filter(Boolean);
  return `<h2>Contact Information</h2>
${office ? `<p class="office">${office}</p>\n` : ''}<ul class="contact">
${links.map(([label, href, text]) => {
  // e-mail: "user [at] domain" in the HTML, made a mailto link by static/addr.js
  const mail = href.startsWith('mailto:') && href.slice(7).split('@');
  const link = mail && mail.length === 2
    ? `<a class="addr" data-user="${esc(mail[0])}" data-domain="${esc(mail[1])}">${esc(mail[0])} [at] ${esc(mail[1])}</a>`
    : `<a href="${esc(href)}">${esc(text || href.replace(/^https?:\/\//, ''))}</a>`;
  return `  <li><span class="label">${label}</span>${link}</li>`;
}).join('\n')}
</ul>`;
}

// Renders a Markdown page body. Besides Markdown (and inline HTML), a page can use
// these markers, each on its own line:
//   <!--AUTO:contact-->      "Contact Information" of the member (from _data/authors.yml)
//   <!--AUTO:publications--> "Publications" of the member (see buildMemberPage)
//   <!--former-member-->     a sentence saying the member has left the lab (see buildMemberPage)
//   <!--schedule-->          the course schedule (from _data/course/<course>/<YYYY_S>.yml)
//   <!--automata-viewer-->   the COSE215 automata simulator (_next/partials/)
//   <!--AUTO:topics-->, <!--AUTO:venues-->   see buildMemberPage
// "--" becomes an en dash, as kramdown did.
function renderMarkdown(body, { schedule, contact, former } = {}) {
  const holes = [];
  const hole = (html) => `\n\n<!--HOLE${holes.push(html) - 1}-->\n\n`;
  const md = body
    .replace(/<!--former-member-->/g, () => hole(`<p class="former">${former || 'A former member of PLRG.'}</p>`))
    .replace(/<!--automata-viewer-->/g, () => hole(fs.readFileSync(path.join(HERE, 'partials/automata-viewer.html'), 'utf8')))
    .replace(/<!--schedule-->/g, () => hole(schedule || ''))
    .replace(/<!--AUTO:contact-->/g, () => hole(contact ? authorLinks(contact) : ''))
    .replace(/(?<![<!-])--(?![->])/g, '–');
  return marked.parse(md).replace(/(?:<p>)?<!--HOLE(\d+)-->(?:<\/p>)?/g, (_, i) => holes[+i]);
}

// gives ids to <h2>s and returns a chip index of them
function sectionIndex(html) {
  const heads = [];
  html = html.replace(/<h2([^>]*)>(.*?)<\/h2>/g, (_, attrs, inner) => {
    const id = slug(inner);
    heads.push([id, inner.replace(/<[^>]+>/g, '')]);
    return `<h2 id="${id}">${inner}</h2>`;
  });
  const toc = heads.length > 2 ? `<nav class="toc">${heads.map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join('')}</nav>` : '';
  return { html, toc };
}

// ---------------------------------------------------------------------------
// research topics, in display order (home list, filter chips, and tags on each paper);
// `topics: [...]` in _data/publications.yml uses these keys, in any order
const TOPICS = {
  spec: { name: 'Mechanized Specifications', short: 'Specification', desc: 'Mechanizing the specifications of real-world languages such as JavaScript and deriving language tools from them.' },
  analysis: { name: 'Program Analysis and Type Systems', short: 'Analysis', desc: 'Analyzing programs statically and dynamically, and designing type systems, to find bugs and guarantee safety.' },
  synthesis: { name: 'Program Synthesis and Testing', short: 'Synthesis & Testing', desc: 'Generating correct programs and effective tests from specifications, such as JavaScript polyfills and conformance tests.' },
  security: { name: 'Software Security', short: 'Security', desc: 'Finding and analyzing security vulnerabilities in the JavaScript ecosystem, on the web and in Node.js.' },
};
const sortTopics = (ts) => Object.keys(TOPICS).filter((k) => (ts || []).includes(k));
// a paper's topic: plain text (the filter chips above the list do the filtering)
const topicTag = (t) => TOPICS[t] ? `<span class="tag t-${t}">${TOPICS[t].short}</span>` : '';

// ---------------------------------------------------------------------------
// publications

// "ASE 2026 SRC" -> "ASE'26 SRC"; names without a year (journals) get the year: "TOSEM" -> "TOSEM'26"
// the venue as written in publications.yml: "ASE 2026" for a conference, "TOSEM" for a journal
function shortVenue(name, year) {
  return name;
}

// student research competitions, doctoral symposia, and tutorials: left out of the
// member pages' venue summary and the research page's recent papers
const isMinorVenue = (name) => / (SRC|DS|Tutorial)$/.test(name || '');

// a member's page, or '' when there is none (every member with a page in members/)
const memberPages = new Map();
function memberUrl(name) {
  const a = DATA.authors[name];
  if (!a?.url) return '';
  if (!memberPages.has(a.url)) memberPages.set(a.url, fs.existsSync(path.join(ROOT, `${a.url.replace(/^\//, '')}.md`)));
  return memberPages.get(a.url) ? a.url : '';
}

function authorList(pub) {
  const as = pub.authors || [];
  return as.map((a, i) => {
    const url = memberUrl(a.name);
    let s = url ? `<a href="${url}">${esc(a.name)}</a>` : esc(a.name);
    if (pub['co-first'] > i) s += '<sup title="equal contribution">*</sup>';
    else if (a.corr) s += '<sup title="corresponding author">†</sup>';
    return s;
  }).join(', ') + (pub['co-first'] ? ' <span class="equal">(* equally contributed)</span>' : '');
}

// the venue of a paper, linking to the venue
function venueBadge(pub, year = pub.year) {
  const venue = pub.target?.name ?? '';
  // <wbr> after "/" lets ESEC/FSE wrap there in the narrow phone column (spaces wrap anyway)
  const label = esc(shortVenue(venue, year)).replace(/\//g, '/<wbr>');
  return pub.target?.url
    ? `<a class="venue" href="${esc(pub.target.url)}">${label}</a>`
    : `<span class="venue">${label}</span>`;
}

function pubItem(pub, year) {
  const venue = pub.target?.name ?? '';
  const links = [];
  // the title links to the DOI, so the links below are the extra materials only
  for (const [k, v] of Object.entries(pub.materials || {})) links.push([k.toUpperCase() === 'PDF' ? 'PDF' : k[0].toUpperCase() + k.slice(1), v]);
  // the title links to the paper's DOI only (without a DOI it is plain text; the PDF is below)
  const titleUrl = pub.doi && pub.doi !== 'accepted' ? `https://doi.org/${pub.doi}` : '';
  return `<li data-year="${year}" data-award="${pub.award ? 1 : 0}" data-topics="${(pub.topics || []).join(' ')}">
  <div class="side">
    ${venueBadge(pub, year)}
  </div>
  <div class="body">
    ${titleUrl ? `<a class="title" href="${esc(titleUrl)}">${esc(pub.title)}</a>` : `<span class="title">${esc(pub.title)}</span>`}
    <div class="authors">${authorList(pub)}</div>
    ${ifs(pub.award, `<div class="award">${esc(pub.award)}</div>`)}
    <div class="meta">
      ${ifs(pub.doi === 'accepted', '<span class="note">Accepted</span>')}
      ${links.map(([l, u]) => `<a href="${esc(u)}">${esc(l)}</a>`).join('\n      ')}
      ${ifs(pub.topics?.length, `<span class="tags">${sortTopics(pub.topics).map(topicTag).join('<span aria-hidden="true"> · </span>')}</span>`)}
    </div>
  </div>
</li>`;
}

function allPubs() {
  return byYearDesc(DATA.publications).flatMap(([year, pubs]) => pubs.map((p) => ({ ...p, year })));
}

function buildPublications() {
  const pubs = allPubs();
  const groups = byYearDesc(DATA.publications).map(([y, list]) => `<section class="year-group" data-year="${y}">
  <h3 id="y${y}">${y}</h3>
  <ul class="pubs">
${list.map((p) => pubItem(p, y)).join('\n')}
  </ul>
</section>`).join('\n');

  const body = `${pageHead('Publications')}
<div class="filters" id="pub-filters" role="group" aria-label="Filter by topic">
  <button type="button" class="chip" data-topic="" aria-pressed="true">All</button>
${Object.entries(TOPICS).map(([k, t]) => `  <button type="button" class="chip topic-chip t-${k}" data-topic="${k}" aria-pressed="false">${t.short}<span class="n">${pubs.filter((p) => (p.topics || []).includes(k)).length}</span></button>`).join('\n')}
  <button type="button" class="chip" data-award aria-pressed="false">Awards<span class="n">${pubs.filter((p) => p.award).length}</span></button>
</div>
${groups}
<p class="empty" id="pub-empty" hidden>No publications match.</p>`;
  write('publications/index.html', layout({ title: 'Publications', active: '/publications/', body, scripts: ['/static/publications.js'] }));
}

// ---------------------------------------------------------------------------
// members
function buildMembers() {
  const sections = [];
  for (const [group, list] of Object.entries(DATA.members)) {
    if (!list || group === 'Alumni') continue;
    sections.push(`<section class="pgroup"><h2>${esc(group)}</h2>
<ul class="people">
${list.map((name) => {
  const a = DATA.authors[name] || {};
  return `  <li><a href="${esc(a.url || '#')}">
    <img src="${esc(optimized(a.avatar || '/assets/images/avatars/default.png'))}" alt="" loading="lazy" width="72" height="72">
    <span class="name">${esc(name)}</span>
    <span class="ko">${esc(a['ko-name'] || '')}</span>
  </a></li>`;
}).join('\n')}
</ul></section>`);
  }
  const alumni = (DATA.members.Alumni || []).filter((x) => x && x.name);
  const groups = `<div class="people-groups">\n${sections.splice(0).join('\n')}\n</div>`;
  sections.push(groups);
  sections.push(`<h2 class="alumni-head">Alumni</h2>
<ul class="alumni">
${alumni.map((x) => {
  const a = DATA.authors[x.name] || {};
  // one aligned row: name | Korean name | degree | year | where they went (`now`, optional)
  const degree = { BS: 'B.S.', MS: 'M.S.', PhD: 'Ph.D.' }[x.category] || x.category || '';
  const url = memberUrl(x.name);
  return `  <li>${url ? `<a href="${esc(url)}">${esc(x.name)}</a>` : `<span>${esc(x.name)}</span>`}<span class="ko">${esc(a['ko-name'] || '')}</span><span class="note">${esc(degree)}</span><span class="note year">${esc(x.year || '')}</span><span class="now">${esc(x.now || '')}</span></li>`;
}).join('\n')}
</ul>`);
  const body = `${pageHead('Members')}
${sections.join('\n')}`;
  write('members/index.html', layout({ title: 'Members', active: '/members/', body }));
}

// <!--AUTO:topics--> in a member page: the research topics, linked to the research page
function topicList() {
  return `<p class="topic-links">${Object.entries(TOPICS).map(([k, t]) => `<a href="/research/#${k}">${t.name}</a>`).join(', ')}</p>`;
}

// <!--AUTO:venues--> in a member page: their papers at major venues, grouped like
//   PL Conference: PLDI 2023 / 2024 · SE Conference: ... · Journal: ...
// (workshops, SRC, doctoral symposia, and tutorials are left out; demos are marked)
const VENUE_GROUPS = [
  ['PL Conference', ['POPL', 'PLDI', 'OOPSLA', 'ECOOP', 'ICFP', 'SAS', 'CAV', 'ESOP']],
  ['SE Conference', ['ICSE', 'FSE', 'ASE', 'ISSTA']],
  ['Journal', ['CACM', 'CSUR', 'IEEE Software', 'TOPLAS', 'TOSEM', 'TSE']],
];
// is `pub` at venue `v` (e.g. "ASE 2026", "ESEC/FSE 2022", "FSE 2025 Demo" are ASE / FSE / FSE)?
const atVenue = (pub, v) => {
  const n = (pub.target?.name || '').replace(/^ESEC\//, '');
  return (n === v || n.startsWith(`${v} `)) && !isMinorVenue(n);
};
function venueSummary(name) {
  const mine = allPubs().filter((p) => (p.authors || []).some((a) => a.name === name));
  const rows = VENUE_GROUPS.map(([group, venues]) => {
    const items = venues.map((v) => {
      const hits = mine.filter((p) => atVenue(p, v)).sort((a, b) => a.year - b.year);
      if (!hits.length) return '';
      const links = hits.map((p) => {
        const url = p.doi && p.doi !== 'accepted' ? `https://doi.org/${p.doi}` : p.materials?.pdf;
        const label = `${p.year}${/ Demo$/.test(p.target.name) ? ' (Demo)' : ''}`;
        return url ? `<a href="${esc(url)}">${label}</a>` : `<span>${label}</span>`;
      }).join(' / ');
      return `<li>${v} – ${links}</li>`;
    }).filter(Boolean);
    return items.length ? `<li><strong>${group}</strong><ul>${items.join('')}</ul></li>` : '';
  }).filter(Boolean);
  return `<p>See <a href="/publications/"><strong>Publications</strong></a> for the full list.</p>\n<ul class="venues">${rows.join('')}</ul>`;
}

// a member's own page: members/<id>.md, plus their PLRG publications.
// Served at /members/<id> like the Jekyll site (GitHub Pages maps it to <id>.html).
function buildMemberPage(file) {
  const id = path.basename(file, '.md');
  const { fm, body } = readPage(`members/${file}`);
  const url = `/members/${id}`;
  const [name] = Object.entries(DATA.authors).find(([, a]) => a.url === url) || [];
  const a = DATA.authors[name] || {};
  const title = fm.title || name || id;
  // a former member: one plain sentence from the Alumni list in members.yml, e.g.
  // "A former member of PLRG (M.S., 2026), now at NEXON Korea."
  const alum = (DATA.members.Alumni || []).find((x) => x && x.name === name);
  const degree = alum && ({ BS: 'B.S.', MS: 'M.S.', PhD: 'Ph.D.' }[alum.category] || alum.category);
  // `now` is a place ("NEXON Korea" -> "now at NEXON Korea") or a role at a place
  // ("M.S. student at ..." -> "now an M.S. student at ...")
  const now = alum?.now ? (/ at /.test(alum.now) ? `now ${/^([AEIOU]|[FHLMNRSX]\.)/.test(alum.now) ? 'an' : 'a'} ${alum.now}` : `now at ${alum.now}`) : '';
  const formerNote = `A former member of PLRG${alum ? ` (${esc([degree, alum.year].filter(Boolean).join(', '))})` : ''}${now ? `, ${esc(now)}` : ''}.`;
  let html = renderMarkdown(body, { contact: name, former: formerNote });
  html = html.replace(/<img ([^>]*)class="profile-img"([^>]*)>/, (m) => m.replace(/src="([^"]+)"/, (_, u) => `src="${optimized(u)}"`).replace(/>$/, ' alt="">'));
  html = html.replace(/<!--AUTO:topics[^>]*-->/, () => topicList())
    .replace(/<!--AUTO:venues[^>]*-->/, () => venueSummary(name));
  // the two sections a member does not write by hand: "Publications" (papers with this
  // member in publications.yml, plus their own entries, e.g. workshop papers or posters
  // without a DOI, written as `publications:` in the front matter in the same format with a
  // `year`; newest first) and "Contact Information" (from _data/authors.yml). Each comes
  // from a marker that must stay in the page; the professor's page has its own summary.
  // (a former member's page keeps only the note, the photo, and the publications)
  const prof = a.position === 'Assistant Professor', former = body.includes('<!--former-member-->');
  for (const k of prof ? ['contact'] : former ? ['publications'] : ['publications', 'contact'])
    if (!body.includes(`<!--AUTO:${k}-->`)) throw new Error(`members/${file}: keep the <!--AUTO:${k}--> line`);
  for (const h of prof ? ['Contact Information'] : ['Publications', 'Contact Information'])
    if (new RegExp(`^#+\\s*${h}\\s*$`, 'mi').test(body)) throw new Error(`members/${file}: remove the "${h}" heading (<!--AUTO:...--> makes it)`);
  const mine = prof ? [] : [
    ...allPubs().filter((p) => (p.authors || []).some((x) => x.name === name)),
    ...(fm.publications || []).filter((p) => p && p.title).map((p) => ({ ...p, year: Number(p.year) || 0 })),
  ].sort((x, y) => y.year - x.year);
  html = html.replace(/(<p>)?<!--AUTO:publications-->(<\/p>)?/, () => (mine.length
    ? `<h2>Publications</h2>\n<ul class="pubs">\n${mine.map((p) => pubItem(p, p.year)).join('\n')}\n</ul>\n` : ''));
  const sec = sectionIndex(html);
  // just the name on top (the Members page groups people by position; the menu shows the section)
  const page = layout({ title: title.replace(/\s*\(.*\)$/, ''), active: '/members/', body: `${pageHead(esc(title))}\n<div class="prose member">\n${sec.html}\n</div>` });
  write(`members/${id}.html`, page);
}

// ---------------------------------------------------------------------------
// home
function buildHome() {
  // "Selected Publications": the papers with `selected: true` (newest first), filled up
  // with the latest ones when fewer than six are selected
  const pubs = allPubs();
  const recent = [...pubs.filter((p) => p.selected), ...pubs.filter((p) => !p.selected)].slice(0, 6);
  const body = `<header class="hero">
  <h1>Programming Language Research Group</h1>
  <p class="tagline">Korea University, Seoul · Led by <a class="pi" href="/members/jihyeok.park">Prof. Jihyeok Park</a></p>
  <p class="intro">We develop programming language and software engineering techniques that make <span class="nowrap">real-world</span> software reliable and secure. Our tool <a href="https://es-meta.github.io/">ESMeta</a> checks every proposed change to JavaScript itself, as part of how the language is developed.</p>
</header>
<div class="slider" aria-roledescription="carousel" aria-label="PLRG members">
  <div class="slides">
${(DATA.photos || []).map((p, i) => `    <figure class="slide" aria-label="${i + 1} of ${DATA.photos.length}" data-caption="${esc(p.caption || '')}"><img src="${esc(optimized(p.src))}" alt="PLRG members, ${esc(p.caption || '')}"${p.position || p.zoom ? ` style="${[p.position && `object-position: ${esc(p.position)}`, p.zoom && `transform: scale(${Number(p.zoom)}); transform-origin: 50% 0`].filter(Boolean).join('; ')}"` : ''} draggable="false" ${i ? 'loading="lazy"' : ''}></figure>`).join('\n')}
  </div>
  <div class="slider-bar">
    <span class="cap">${esc(DATA.photos?.[0]?.caption || '')}</span>
${(DATA.photos || []).length > 1 ? `    <span class="ctrl"><button type="button" class="prev" aria-label="Previous photo">‹</button><span class="count">1 / ${DATA.photos.length}</span><button type="button" class="next" aria-label="Next photo">›</button></span>` : ''}
  </div>
</div>

<h2 id="join">Join Us</h2>
<div class="callout join">
  <p>We are looking for graduate and undergraduate students, as well as postdocs, who want to work on
  programming languages and software engineering. To apply, email Prof. Jihyeok Park with your CV, your
  transcript, and a few lines on the research topics you would like to work on.</p>
  <div class="mail">
    <a class="addr" data-user="jihyeok_park" data-domain="korea.ac.kr">jihyeok_park [at] korea.ac.kr</a>
  </div>
</div>
<h2>Research</h2>
<ul class="topics">
${Object.entries(TOPICS).map(([k, t]) => {
  return `  <li><a class="t-${k}" href="/research/#${k}"><span class="text"><strong>${t.name}</strong><span>${t.desc}</span></span></a></li>`;
}).join('\n')}
</ul>
<p class="see-all"><a href="/research/">More about our research →</a></p>


<h2>Selected Publications</h2>
<ul class="pubs">
${recent.map((p) => pubItem(p, p.year)).join('\n')}
</ul>
<p class="see-all"><a href="/publications/">All publications →</a></p>
`;
  write('index.html', layout({ body, scripts: ['/static/home.js'] }));
}

// ---------------------------------------------------------------------------
// ESMeta diagram from `highlight.flow` in _data/research.yml: a chain of steps
// (ECMA-262 -> extraction -> mechanized specification) and the derived tools
function findPub(part) {
  const hits = allPubs().filter((p) => p.title.toLowerCase().includes(part.toLowerCase()));
  if (hits.length !== 1) throw new Error(`research.yml: "${part}" matches ${hits.length} publications (needs exactly one)`);
  return hits[0];
}
// "runs in the CI of ..." mark on a derived tool
const ciBadge = (ci) => {
  if (!ci) return '';
  const [name, url] = [].concat(ci);
  return url ? `<a class="ci" href="${esc(url)}">CI of ${esc(name)}</a>` : `<span class="ci">CI of ${esc(name)}</span>`;
};
// The ESMeta diagram (from _data/research.yml), drawn as fixed SVG pictures: a wide one
// and a tall one for narrow screens (CSS shows one of them). ECMA-262 goes into ESMeta (a
// light frame with the logo): Extraction -> Mechanized Specification, and from it, through
// a tree of lines, the derived tools. Each box has its name and its papers as small
// buttons (links), and a "CI of ..." mark when the tool runs in a CI.
function flowDiagram(flow) {
  const chain = flow.chain || [], tools = flow.derived || [];
  const paperUrl = (p) => (p.doi && p.doi !== 'accepted' ? `https://doi.org/${p.doi}` : p.materials?.pdf) || '/publications/';
  // paper buttons centered at cx from y, wrapped into rows no wider than maxW; [svg, rows]
  const buttons = (parts, cx, y, maxW = 1e9) => {
    const items = (parts || []).map((part) => { const p = findPub(part); const t = shortVenue(p.target?.name ?? '', p.year); return [t, paperUrl(p), t.length * 6.9 + 14]; });
    const rows = [[]];
    for (const it of items) {
      const row = rows[rows.length - 1], w = row.reduce((n, r) => n + r[2] + 5, 0);
      if (row.length && w + it[2] > maxW) rows.push([it]); else row.push(it);
    }
    let out = '';
    rows.forEach((row, r) => {
      let x = cx - (row.reduce((n, it) => n + it[2], 0) + 5 * (row.length - 1)) / 2;
      for (const [t, u, w] of row) { out += `<a class="fbtn" href="${esc(u)}"><rect x="${x}" y="${y + r * 28}" width="${w}" height="23" rx="5"/><text x="${x + w / 2}" y="${y + r * 28 + 16}">${esc(t)}</text></a>`; x += w + 5; }
    });
    return [out, rows.filter((r) => r.length).length];
  };
  // a name, on two lines when wider than maxW; [svg, lines]
  const label = (name, cx, y, maxW, cls = '') => {
    const words = String(name).split(' ');
    let lines = [name];
    if (name.length * 8.4 > maxW && words.length > 1) {
      let best = 1, diff = Infinity;
      for (let k = 1; k < words.length; k++) { const d = Math.abs(words.slice(0, k).join(' ').length - words.slice(k).join(' ').length); if (d < diff) diff = d, best = k; }
      lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
    }
    return [`<text class="flabel${cls}" x="${cx}" y="${y}">${lines.map((l, k) => `<tspan x="${cx}" dy="${k ? 18 : 0}">${esc(l)}</tspan>`).join('')}</text>`, lines.length];
  };
  const rect = (x, y, w, h, cls) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`;
  const line = (pts, head = true) => `<polyline class="fline" points="${pts.map((p) => p.join(',')).join(' ')}"${head ? ' marker-end="url(#fhead)"' : ''}/>`;
  // the height a box needs for its name, papers, and CI mark at width w
  const need = (n, w) => {
    const nl = label(n.name, 0, 0, w - 16)[1], nb = buttons(n.papers, 0, 0, w - 16)[1];
    return 26 + (nl - 1) * 18 + 14 + nb * 28 + ([].concat(n.ci || []).length ? 28 : 0) + 6;
  };
  const node = (n, x, y, w, h, cls) => {
    const [names, nl] = label(n.name, x + w / 2, y + 26, w - 16, cls === 'hub' ? ' hub' : '');
    const [btns, nb] = buttons(n.papers, x + w / 2, y + 26 + (nl - 1) * 18 + 14, w - 16);
    const ci = [].concat(n.ci || []);
    const ciy = y + 26 + (nl - 1) * 18 + 14 + nb * 28 + 16;
    return rect(x, y, w, h, `fbox ${cls}`) + names + btns
      + (ci.length ? (() => {
        // "runs in the CI of ...": a green button
        const t = `✓ CI of ${ci[0]}`, bw = t.length * 6.9 + 16;
        return `<a class="fci" href="${esc(ci[1] || '#')}"><rect x="${x + w / 2 - bw / 2}" y="${ciy - 16}" width="${bw}" height="23" rx="5"/><text x="${x + w / 2}" y="${ciy}">${esc(t)}</text></a>`;
      })() : '');
  };
  const logo = (cx, cy, k) => `<g class="flogo" transform="translate(${cx} ${cy}) scale(${k})"><path d="M0 -62 L62 0 L0 62 L-62 0 Z"/><path class="in" d="M0 -55 L55 0 L0 55 L-55 0 Z"/><text class="e" x="0" y="13">E</text><rect class="bar" x="-46" y="26" width="92" height="17"/><text class="name" x="0" y="39">ESMETA</text></g>`;
  const ecma = (src, x, y, w) => rect(x, y, w, 96, 'fbox src')
    + `<image href="/assets/images/research/ecma-logo.svg" x="${x + w / 2 - 42}" y="${y + 14}" width="84" height="22.5"/>`
    + label(src.name, x + w / 2, y + 60, 1e9)[0] + `<text class="fsub" x="${x + w / 2}" y="${y + 79}">(JavaScript Spec.)</text>`;
  const [src, ext, hub] = chain;
  const svgOf = (cls, W, H, body) => `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="How ESMeta works: it extracts a mechanized specification from ECMA-262 and derives language tools from it">
<defs><marker id="fhead-${cls}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="fhead"/></marker></defs>
${body.replaceAll('url(#fhead)', `url(#fhead-${cls})`)}
</svg>`;

  // wide: left to right. ECMA-262 -> [Extraction -> Mechanized Specification -> the tools,
  // stacked on the right and reached by a tree of lines], all centered on one line
  const wide = (() => {
    // columns: ECMA-262 | Extraction | Mechanized Specification (with the logo on top) | tree | tools
    const W = 960, srcW = 140, extW = 140, hubW = 232, tw = 270, tg = 14, gap = 46;
    const srcX = 8, extX = srcX + srcW + gap, hubX = extX + extW + gap, tx = W - 10 - tw, spine = (hubX + hubW + tx) / 2;
    const hs = tools.map((t) => need(t, tw)), H = Math.max(hs.reduce((a, b) => a + b, 0) + tg * (tools.length - 1) + 20, 300);
    const mid = H / 2;
    const extH = ext ? need(ext, extW) : 0, hubH = hub ? need(hub, hubW) : 0;
    let svg = '';
    if (src) svg += ecma(src, srcX, mid - 48, srcW);
    if (ext) svg += node(ext, extX, mid - extH / 2, extW, extH, 'step');
    if (hub) svg += node(hub, hubX, mid - hubH / 2, hubW, hubH, 'hub') + logo(hubX + hubW / 2, mid - hubH / 2 - 46, 0.58);
    svg += line([[srcX + srcW + 2, mid], [extX - 5, mid]]) + line([[extX + extW + 2, mid], [hubX - 5, mid]]);
    let y = 10;
    const mids = tools.map((t, k) => { const m = y + hs[k] / 2; svg += node(t, tx, y, tw, hs[k], 'tool'); y += hs[k] + tg; return m; });
    if (mids.length) {
      svg += line([[hubX + hubW, mid], [spine, mid]], false) + line([[spine, mids[0]], [spine, mids[mids.length - 1]]], false);
      for (const m of mids) svg += line([[spine, m], [tx - 5, m]]);
    }
    return svgOf('wide', W, H, svg);
  })();

  // narrow: everything in one column; the tools hang off a line on the left like a tree
  const narrow = (() => {
    const W = 380, cx = 144, bw = 240;
    let y = 8, svg = '';
    if (src) svg += ecma(src, cx - 100, y, 200);
    const frameY = y + 96 + 26, arrowIn = line([[cx, y + 98], [cx, frameY + 20]]);
    y = frameY + 22;
    const parts = [];
    if (ext) { const w = 160, h = need(ext, w); parts.push(node(ext, cx - w / 2, y, w, h, 'step')); y += h; parts.push(line([[cx, y + 2], [cx, y + 24]])); y += 26; }
    let hubBottom = y;
    if (hub) { const h = need(hub, bw); parts.push(node(hub, cx - bw / 2, y, bw, h, 'hub') + logo(cx + bw / 2 + (W - cx - bw / 2) / 2, y + h / 2, 0.46)); y += h; hubBottom = y; }
    const spine = 40, tx = 60, tw = W - 20 - tx;
    y += 26;
    const mids = [];
    for (const t of tools) { const h = need(t, tw); parts.push(node(t, tx, y, tw, h, 'tool')); mids.push(y + h / 2); y += h + 12; }
    if (mids.length) {
      parts.push(line([[spine, hubBottom], [spine, mids[mids.length - 1]]], false));
      for (const m of mids) parts.push(line([[spine, m], [tx - 5, m]]));
    }
    const H = y + 6;
    svg += arrowIn + parts.join('');
    return svgOf('narrow', W, H, svg);
  })();

  return `<div class="flow">${wide}\n${narrow}</div>`;
}

// research: one section per topic (_data/research.yml) with its selected papers
const inlineMd = (t) => marked.parseInline(String(t ?? '').trim());
function buildResearch() {
  const R = DATA.research || {};
  const hl = R.highlight;
  // the highlighted project (ESMeta) inside its topic's section: its diagram (with the
  // papers as buttons, in place of a paper list), a sentence, and its links
  const highlight = hl ? `${ifs(hl.flow, flowDiagram(hl.flow))}
    <p>${inlineMd(hl.text)}</p>
    <div class="hl-links">${(hl.links || []).map(([n, u]) => `<a href="${esc(u)}">${esc(n)}</a>`).join('')}</div>` : '';
  const sections = Object.entries(TOPICS).map(([k, t]) => {
    const r = (R.topics || {})[k] || {};
    // one line per paper: Venue Year | Title · Award
    const paper = (p) => {
      const url = p.doi && p.doi !== 'accepted' ? `https://doi.org/${p.doi}` : '';
      const venue = p.target?.name ?? '';
      const where = / (19|20)\d\d\b/.test(venue) ? venue : `${venue} ${p.year}`;
      return `<li><span class="where">${esc(where)}</span><span>${url ? `<a href="${esc(url)}">${esc(p.title)}</a>` : esc(p.title)}${ifs(p.award, ` <span class="award-mark">· ${esc(p.award)}</span>`)}</span></li>`;
    };
    return `<section class="topic-sec t-${k}" id="${k}">
  <h2 class="topic-head">${t.name}</h2>
  <div class="topic-body">
    <p>${inlineMd(r.text || t.desc)}</p>
    ${ifs(r.image, `<img class="figure" src="${esc(r.image)}" alt="${esc(t.name)}" loading="lazy">`)}
    ${hl && hl.topic === k ? highlight : ''}
    ${ifs(r.selected?.length, `<ul class="mini-pubs">
${(r.selected || []).map(findPub).map(paper).join('\n')}
    </ul>`)}
  </div>
</section>`;
  }).join('\n');
  const body = `${pageHead('Research')}
<p class="lead">${inlineMd(R.intro || '')}</p>
${sections}`;
  write('research/index.html', layout({ title: 'Research', active: '/research/', body }));
}

// ---------------------------------------------------------------------------
// talks and trips
const linkList = (items) => items.filter(Boolean).map(([label, href, numbered]) =>
  numbered ? `<span class="grp">${label} ${numbered}</span>` : `<a href="${esc(href)}">${label}</a>`).join('\n      ');
const youtube = (id) => `https://www.youtube.com/watch?v=${id}`;
const mmdd = (s) => String(s ?? '').replace(/^\d{4}\./, '').replace('.', '/');

function buildTalks() {
  const all = byYearDesc(DATA.talks);
  const groups = all.map(([y, list]) => `<section class="year-group">
  <h3 id="y${y}">${y}</h3>
  <ul class="entries compact talks">
${(list || []).map((t) => `<li>
  <div class="side"><span class="when">${esc(mmdd(t.date))}</span></div>
  <div class="body">
    <span class="title">${esc(t.title)}</span> <span class="where">${t['place-url'] ? `<a href="${esc(t['place-url'])}">${esc(t.place)}</a>` : esc(t.place)}</span>
  </div>
  <div class="elinks slots">${t.youtube ? `<a href="${esc(youtube(t.youtube))}">Video</a>` : '<span></span>'}${t.pdf ? `<a href="${esc(t.pdf)}">Slides</a>` : '<span></span>'}</div>
</li>`).join('\n')}
  </ul>
</section>`).join('\n');
  write('talks/index.html', layout({ title: 'Talks', active: '/talks/', body: `${pageHead('Talks')}\n${groups}` }));
}

// a report's name: the member who wrote it (from the file name)
function reportName(pdf) {
  // ".../ase25-report-jungwoongkim.pdf" -> the member whose page id starts with "jungwoongkim"
  const who = path.basename(pdf, '.pdf').replace(/^.*?report-/, '').replace(/[^a-z]/g, '');
  const hit = Object.values(DATA.authors).find((a) => {
    const id = (a.url || '').replace('/members/', '').replace(/[^a-z]/g, '');
    return id && (id === who || id.startsWith(who));
  });
  // [English name, Korean name]
  return hit ? [hit.name, hit['ko-name'] || ''] : [who, ''];
}

function buildTrips() {
  const range = (a, b) => {
    const [, am, ad] = String(a).split('.'), [, bm, bd] = String(b || a).split('.');
    return am === bm && ad === bd ? `${am}/${ad}` : `${am}/${ad}–${bm}/${bd}`;
  };
  // one slot: always a drop-down list with the count ("Talks 1", "Reports 3"), so every
  // button looks the same; long names wrap
  const slot = (label, items) => {
    if (!items.length) return '<span></span>';
    return `<details class="drop"><summary class="pill">${label}s ${items.length}</summary><div class="menu">${items.map(([n, u, v, ko, by]) => `<a href="${esc(u)}">${v ? `<b>${esc(v)}</b> ` : ''}${esc(n)}${ko ? ` <span class="ko">${esc(ko)}</span>` : ''}${by ? `<span class="by">${esc(by)}${DATA.authors[by]?.['ko-name'] ? ` <span class="ko">${esc(DATA.authors[by]['ko-name'])}</span>` : ''}</span>` : ''}</a>`).join('')}</div></details>`;
  };
  // a talk: [title, slides, venue]. The title comes from the talk with the same slides in
  // talks.yml, else from the paper with these slides in publications.yml, else from `name`
  // in trips.yml. The venue (without the year) goes in front: the paper's (e.g. "ASE SRC"),
  // or the talk's place when it is a short name other than the trip's (e.g. "PLSS" at ECOOP)
  const noYear = (s) => String(s || '').replace(/ (19|20)\d\d\b/, '').trim();
  const talkItem = (d, trip) => {
    const talk = Object.values(DATA.talks || {}).flat().find((x) => x && x.pdf === d.pdf);
    // the presenter: `by`, or the professor for a talk in talks.yml
    const by = d.by || (talk ? 'Jihyeok Park' : '');
    if (talk) {
      const where = noYear(talk.place);
      return [talk.title, d.pdf, where && where !== noYear(trip.place) && where.length <= 15 ? where : '', '', by];
    }
    const paper = allPubs().find((p) => Object.values(p.materials || {}).includes(d.pdf));
    if (paper) return [paper.title, d.pdf, (paper.target?.name || '').replace(/^ESEC\//, '').replace(/ (19|20)\d\d\b/, ''), '', by];
    return [d.name || 'Talk', d.pdf, '', '', by];
  };
  // one card per trip: the album cover (assets/images/trips/<id>.jpg, see covers.mjs) on top,
  // then the dates, the place, and the Photos / Talk / Report buttons
  const groups = byYearDesc(DATA.trips).map(([y, list]) => `<section class="year-group">
  <h3 id="y${y}">${y}</h3>
  <ul class="trip-cards">
${(list || []).map((t) => {
  const talks = (t.talk || []).filter((d) => d.pdf).map((d) => talkItem(d, t));
  const reports = (t.report || []).filter((d) => d.pdf).map((d) => { const [en, ko] = reportName(d.pdf); return [en, d.pdf, '', ko]; });
  const album = t.photos ? `https://photos.app.goo.gl/${esc(t.photos)}` : '';
  const cover = t.photos && fs.existsSync(path.join(ROOT, `assets/images/trips/${t.photos}.jpg`)) ? optimized(`/assets/images/trips/${t.photos}.jpg`) : '';
  const pic = cover
    ? `<a class="cover" href="${album}" title="Open the album" aria-label="${esc(t.place)} photos"><img src="${esc(cover)}" alt="" loading="lazy"></a>`
    : `<div class="cover none" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg></div>`;
  // the cover opens the album, so there is no separate Photos button (unless there is no cover)
  const buttons = [album && !cover && `<a class="pill" href="${album}">Photos</a>`, talks.length && slot('Talk', talks), reports.length && slot('Report', reports)].filter(Boolean).join('');
  return `<li class="trip">
  ${pic}
  <div class="trip-body">
    <span class="when">${esc(range(t['date-from'], t['date-to']))}</span>
    ${t['place-url'] ? `<a class="title" href="${esc(t['place-url'])}">${esc(t.place)}</a>` : `<span class="title">${esc(t.place)}</span>`}
    <span class="where">${esc(t.location)}</span>
    ${buttons ? `<div class="trip-links">${buttons}</div>` : ''}
  </div>
</li>`;
}).join('\n')}
  </ul>
</section>`).join('\n');
  write('trips/index.html', layout({ title: 'Trips', active: '/trips/', body: `${pageHead('Trips')}\n${groups}`, scripts: ['/static/trips.js'] }));
}

// ---------------------------------------------------------------------------
// conference deadlines (countdown and ordering happen in static/conferences.js)
// "Jun 28 - Jul 2" -> "06/28–07/02", "Sep 7 - Sep 10" -> "09/07–09/10" (anything else as is)
const mmdd2 = (m, d) => `${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`;
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
function numericRange(s) {
  const m = String(s || '').match(/^([A-Za-z]{3})\w*\.? (\d+)\s*[-–]\s*(?:([A-Za-z]{3})\w*\.? )?(\d+)$/);
  if (!m || !MONTHS[m[1].toLowerCase()]) return s || '';
  const a = MONTHS[m[1].toLowerCase()], b = m[3] ? MONTHS[m[3].toLowerCase()] : a;
  return `${mmdd2(a, m[2])}–${mmdd2(b, m[4])}`;
}
// "Atlanta, Georgia, United States" -> "Atlanta, United States"
// "City, Country" (the full place is in the link's title); long country names shortened to fit the column
const COUNTRY = { 'United States': 'USA', 'United Kingdom': 'UK', 'The Netherlands': 'Netherlands', 'Republic of Korea': 'Korea' };
const shortPlace = (p) => { const xs = String(p).split(',').map((x) => x.trim()); const c = xs[xs.length - 1]; return xs.length > 1 ? `${xs[0]}, ${COUNTRY[c] || c}` : p; };

const PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';

function buildConferences() {
  const { infos = {}, list = [], last_update } = DATA.conferences;
  const TAGS = { PL: 'Programming Languages', SE: 'Software Engineering', SEC: 'Security' };
  // ranking lists (name, url, year, desc) from `rankings` in conferences.yml
  const R = DATA.conferences.rankings || {};
  // ranking cells are shaded by level within each list: darker is higher (1 = top)
  const LEVEL = {
    bk21: { 1: 1, 2: 2, 3: 3, 4: 4 },
    kiise: { 우수: 2, 최우수: 4 },
    core: { C: 1, B: 2, A: 3, 'A*': 4 },
  };
  const rankCell = (top, lv, html) => `<div class="rk${top ? ' top' : ''}"${html && lv ? ` data-lv="${lv}"` : ''}><span>${html}</span></div>`;
  const RANKS = Object.fromEntries(['bk21', 'kiise', 'core'].map((k) => {
    const r = R[k] || {};
    return [k, [r.name || k.toUpperCase(), r.url || '#', `${r.desc || ''}${r.year ? `, ${r.year} list` : ''}`]];
  }));
  const tag = (t) => `<span class="ctag ctag-${t.toLowerCase()}" title="${esc(TAGS[t] || t)}">${esc(t)}</span>`;
  const items = list.flatMap((c) => {
    const info = infos[c.name] || {};
    const ds = [].concat(c.deadline ?? 'TBA');
    return ds.map((d, i) => {
      // "%y" is the conference year and "%Y" the year before it
      const raw = String(d).replace('%y', c.year).replace('%Y', c.year - 1);
      const core = info.rank ? (info['rank-id'] ? `<a href="https://portal.core.edu.au/conf-ranks/${info['rank-id']}">${esc(info.rank)}</a>` : esc(info.rank)) : '';
      const place = c.place && c.place !== 'Online' ? shortPlace(c.place) : (c.place || '');
      return `<li class="conf" data-deadline="${esc(raw)}" data-tags="${esc((info.tags || []).join(' '))}">
  <div class="due"></div>
  <div class="countdown">${raw === 'TBA' ? 'TBA' : ''}</div>
  <div class="area">${Object.keys(TAGS).filter((t) => (info.tags || []).includes(t)).map(tag).join('')}</div>
  <div class="name"><a href="${esc(c.link)}">${esc(c.name)}'${String(c.year).slice(-2)}</a>${ds.length > 1 ? `<span class="round" title="Round ${i + 1} of ${ds.length}">(${i + 1}/${ds.length})</span>` : ''}${ifs(Array.isArray(c.note) ? c.note[i] : c.note, `<span class="round">${esc(Array.isArray(c.note) ? c.note[i] : c.note)}</span>`)}</div>
  <div class="dates">${esc(numericRange(c.date))}</div>
  <div class="place">${c.place && c.place !== 'Online' ? `<a href="https://maps.google.com/?q=${encodeURIComponent(c.place)}" title="${esc(c.place)}">${esc(place)}</a>` : esc(place)}</div>
  <div class="pin">${c.place && c.place !== 'Online' ? `<a href="https://maps.google.com/?q=${encodeURIComponent(c.place)}" title="${esc(c.place)}" aria-label="${esc(c.place)} on the map">${PIN}</a>` : ''}</div>
  ${rankCell(info.bk21 >= 3, LEVEL.bk21[info.bk21], /^\d$/.test(String(info.bk21)) ? `IF${info.bk21}` : '')}
  ${rankCell(info.kiise === '최우수', LEVEL.kiise[info.kiise], esc(info.kiise || ''))}
  ${rankCell(info.rank === 'A*', LEVEL.core[info.rank], core)}
</li>`;
    });
  });
  const head = `<li class="conf-head" aria-hidden="true"><div>Due<span class="aoe">AoE</span></div><div>Left</div><div class="area">Area</div><div>Conference</div><div class="dates">Dates</div><div class="place">Place</div><div class="pin"></div>${Object.values(RANKS).map(([n, u, t]) => `<div class="rk"><a href="${u}" title="${esc(`${n} ${t}`)}">${n}</a></div>`).join('')}</li>`;
  const body = `${pageHead('Conference Deadlines', `Last update ${esc(last_update || '')}`)}
<div class="filters" role="group" aria-label="Filter by area">
  <button type="button" class="chip" data-tag="" aria-pressed="true">All</button>
${Object.keys(TAGS).map((t) => `  <button type="button" class="chip area-chip ctag-${t.toLowerCase()}" data-tag="${t}" aria-pressed="false">${t}</button>`).join('\n')}
</div>
<div class="legend">
  <!-- area tags are labels only: filtering is the buttons above -->
  <table>
    <thead><tr><th colspan="2">Areas</th></tr></thead>
    <tbody>${Object.entries(TAGS).map(([t, d]) => `<tr><td>${tag(t)}</td><td>${esc(d)}</td></tr>`).join('')}</tbody>
  </table>
  <table>
    <thead><tr><th colspan="2">Rankings</th><th>List</th></tr></thead>
    <tbody>${['bk21', 'kiise', 'core'].map((k) => { const r = R[k] || {}; return `<tr><td><a href="${esc(r.url || '#')}">${esc(r.name || k)}</a></td><td>${esc(r.desc || '')}</td><td>${esc(r.year || '')}</td></tr>`; }).join('')}</tbody>
  </table>
</div>
<ul class="confs" id="conf-list">
${head}
${items.join('\n')}
</ul>
<section class="year-group" id="past-group" hidden>
  <h3>Past deadlines</h3>
  <ul class="confs past" id="conf-past"></ul>
</section>`;
  write('deadlines/index.html', layout({ title: 'Conference Deadlines', active: '', body, scripts: ['/static/conferences.js'] }));
  // the page used to be /conferences/ (old links, bookmarks): send them on, keeping the #filter
  write('conferences/index.html', redirectPage('/deadlines/', true));
}

// ---------------------------------------------------------------------------
// courses

// last commit time of each file under courses/ (file mtimes are the checkout time on CI,
// so the deploy workflow must fetch the full history); falls back to the file mtime
let GIT_TIMES;
function lastChanged(rel) {
  if (!GIT_TIMES) {
    GIT_TIMES = new Map();
    try {
      const log = execFileSync('git', ['log', '--format=@%cI', '--name-only', '--', 'courses'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });
      let t;
      for (const line of log.split('\n')) {
        if (line.startsWith('@')) t = new Date(line.slice(1));
        else if (line && !GIT_TIMES.has(line)) GIT_TIMES.set(line, t);
      }
    } catch {}
  }
  if (GIT_TIMES.has(rel)) return GIT_TIMES.get(rel);
  try { return fs.statSync(path.join(ROOT, rel)).mtime; } catch { return null; }
}
function scheduleTable(data, base, year) {
  const opt = data.options || {};
  const showHw = opt.homework !== false;
  const showPdf = opt.pdf !== false;
  const mtime = (rel) => {
    const d = lastChanged(path.join(base, rel));
    return d ? `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}` : '';
  };
  const iso = (md) => (/^\d\d\/\d\d$/.test(md || '') ? `${year}-${md.replace('/', '-')}` : '');
  // A finished semester (its last class or exam is over, ...) publishes only the slides: the
  // handouts are left out of the site (they stay in the repository) to keep it under 1 GB.
  const dates = (data.parts || []).flatMap((p) => (p.lectures || []).map((l) => iso(l.date))).filter(Boolean).sort();
  // ... and the semester itself is over (spring until 06/30, fall until 12/31)
  const semEnd = `${year}-${/_1$/.test(base) ? '06-30' : '12-31'}`;
  const finished = dates.length > 0 && dates[dates.length - 1] < TODAY && semEnd < TODAY;
  const local = (rel) => rel && !/^[a-z]+:|^\//i.test(rel);
  const parts = (data.parts || []).map((part) => {
    const rows = (part.lectures || []).map((l) => {
      if (l.exam) {
        const name = l.pdf ? `<a href="${esc(l.pdf)}">${esc(l.exam)}</a>` : esc(l.exam);
        const cov = l.link ? `<a href="${esc(l.link)}">${esc(l.coverage || '')}</a>` : esc(l.coverage || '');
        return `<li class="row exam" data-date="${iso(l.date)}">
  <span class="idx"></span><span class="date">${esc(l.date)}</span>
  <span class="what"><strong>${name}</strong> <span class="note">${cov}</span></span>
</li>`;
      }
      if (finished && local(l.handout)) SKIP_FILES.add(path.join(base, l.handout));
      const handout = finished ? '' : l.handout;
      // the title links to the slides once they are released (the handout exists);
      // in a finished semester, whenever the slides are there
      const released = finished ? l.pdf && (!local(l.pdf) || fs.existsSync(path.join(ROOT, base, l.pdf))) : l.handout && l.pdf;
      const title = released ? `<a href="${esc(l.pdf)}">${esc(l.title)}</a>` : esc(l.title || '');
      // the speaker's name links to their page (in link color); the affiliation stays plain
      const speakerHtml = (sp, url) => {
        const [, name, aff] = String(sp).match(/^(.*?)(\s*\(.*\))?$/);
        return url ? `<a href="${esc(url)}">${esc(name)}</a>${esc(aff || '')}` : esc(sp);
      };
      const speaker = opt.speaker && l.speaker ? `<span class="speaker">${speakerHtml(l.speaker, l.speaker_link)}</span>` : '';
      const updated = handout && opt.update ? mtime(handout) : '';
      const files = [
        showPdf && handout && `<a href="${esc(handout)}" title="Handout PDF">handout</a>`,
        updated && `<span class="updated" title="Last updated">upd ${updated}</span>`,
        opt.code && l.code && `<a href="${esc(l.code)}">code</a>`,
        ...(opt.materials ? (l.materials || []).map((m) => (m.link ? `<a href="${esc(m.link)}">${esc(m.name)}</a>` : esc(m.name))) : []),
      ].filter(Boolean).join('');
      const hw = showHw ? (l.homework || []).map((h) => {
        const name = h.link ? `<a class="hw" href="${esc(h.link)}">${esc(h.name)}</a>` : `<span class="hw">${esc(h.name)}</span>`;
        return `${name}${ifs(h.date, `<span class="hw-due">by ${esc(h.date)}</span>`)}${ifs(h.solution, `<a class="hw-sol" href="${esc(h.solution)}">sol</a>`)}`;
      }).join('') : '';
      return `<li class="row" data-date="${iso(l.date)}">
  <span class="idx">${l.index ?? ''}</span><span class="date">${esc(l.date)}</span>
  <span class="what">${title}${hw ? ` <span class="hws-in">${hw}</span>` : ''}${speaker}</span>
  <span class="hws">${hw}</span>
  <span class="files">${files}</span>
</li>`;
    }).join('\n');
    return `${ifs(part.name, `<h3>${esc(part.name)}</h3>`)}
<ol class="schedule">
${rows}
</ol>`;
  }).join('\n');
  if (!parts) return '<p class="note">The schedule will be posted soon.</p>';
  // one grid for all parts, so the homework and file columns line up across them
  return `<div class="sched">\n${parts}\n</div>`;
}

function buildCourse(course, sem) {
  const base = `courses/${course}/${sem}`;
  const { body } = readPage(`${base}/index.md`);
  let data = {};
  try { data = readYaml(`_data/course/${course}/${sem}.yml`) || {}; } catch {}
  const year = sem.split('_')[0];
  let html = renderMarkdown(body, { schedule: scheduleTable(data, base, year) });
  // the first heading is the course title; sections are <h4> in the sources
  let title = `${course.toUpperCase()} ${sem}`;
  html = html.replace(/<h3[^>]*>(.*?)<\/h3>/, (_, t) => { title = t; return ''; });
  html = html.replace(/<h4([^>]*)>/g, '<h2$1>').replace(/<\/h4>/g, '</h2>');
  const sec = sectionIndex(html);
  const jump = sec.html.includes('id="schedule"') ? ' <a class="jump" href="#schedule">Schedule ↓</a>' : '';
  const head = pageHead(title, '', `<a href="/courses/">Courses</a> / ${course.toUpperCase()}${jump}`);
  write(`${base}/index.html`, layout({ title: title.replace(/<[^>]+>/g, ''), active: '/courses/', body: `${head}\n<div class="prose course">\n${sec.html}\n</div>`, scripts: ['/static/course.js'], lightOnly: true }));
}

function buildCourses() {
  const { body } = readPage('courses/index.md');
  const html = renderMarkdown(body).replace(/<h4([^>]*)>/g, '<h2$1>').replace(/<\/h4>/g, '</h2>');
  write('courses/index.html', layout({ title: 'Courses', active: '/courses/', body: `${pageHead('Courses')}\n<div class="course-list">\n${html}\n</div>` }));
  for (const course of fs.readdirSync(path.join(ROOT, 'courses'))) {
    const dir = path.join(ROOT, 'courses', course);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const sem of fs.readdirSync(dir)) {
      if (/^\d{4}_\d$/.test(sem) && fs.existsSync(path.join(dir, sem, 'index.md'))) buildCourse(course, sem);
    }
  }
}

// ---------------------------------------------------------------------------
// pages that only redirect (`redirect_to` in the front matter) and the 404 page
// a page that sends the visitor to `to` (keeping the #hash if asked)
function redirectPage(to, keepHash = false) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting…</title>
  <link rel="canonical" href="${esc(to)}">
  <meta http-equiv="refresh" content="0; url=${esc(to)}">
  <meta name="robots" content="noindex">
  <script>location.replace(${JSON.stringify(to)}${keepHash ? ' + location.hash' : ''});</script>
</head>
<body><p>Redirecting to <a href="${esc(to)}">${esc(to)}</a>…</p></body>
</html>
`;
}

function buildRedirects() {
  const skip = new Set(['_site', '_next', '_includes', '_layouts', '_sass', '_data', 'node_modules', '.git', '.metals', '.bsp', '.scala-build', '.sass-cache', 'assets', 'vendor', 'slides']);
  const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return skip.has(e.name) ? [] : walk(path.join(dir, e.name));
    return e.name === 'index.md' ? [path.join(dir, e.name)] : [];
  });
  for (const rel of walk('.')) {
    const to = [].concat(readPage(rel).fm.redirect_to || [])[0];
    if (!to) continue;
    write(path.join(path.dirname(rel), 'index.html'), redirectPage(to));
  }
}

function build404() {
  write('404.html', layout({ title: 'Page not found', body: `<header class="hero">
  <h1>404</h1>
  <p class="tagline">This page does not exist (anymore).</p>
  <p class="intro">Try the <a href="/">home page</a>, <a href="/publications/">publications</a>, or <a href="/courses/">courses</a>.</p>
</header>` }));
}

// robots.txt and sitemap.xml: all pages and the publication PDFs
function buildSitemap() {
  const pdfs = allPubs().map((p) => p.materials?.pdf).filter((u) => u && u.startsWith('/')).map((u) => SITE + u);
  const urls = [...new Set([...PAGES, ...pdfs])].sort();
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}
</urlset>
`);
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
}

// ---------------------------------------------------------------------------
// static files: like Jekyll, every file outside "_*" and ".*" (except .well-known)
// that is not a page source (no YAML front matter) and not repository tooling
const STATIC_SKIP = new Set(['node_modules', 'vendor', 'docker', 'Gemfile', 'Gemfile.lock', 'README.md', 'package.json', 'package-lock.json']);
const STATIC_SKIP_DIRS = ['conferences/css', 'conferences/js', 'conferences/img']; // the old jQuery conference page
// files that are not published (handouts of finished semesters, see scheduleTable)
const SKIP_FILES = new Set();
const TODAY = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();

// originals under assets/images referenced by a built page (e.g. og:image main.jpg)
let usedImages = null;
const usedImage = (rel) => {
  if (!usedImages) {
    usedImages = new Set();
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(html|css|js|xml|webmanifest)$/.test(e.name)) {
          for (const m of fs.readFileSync(p, 'utf8').matchAll(/\/?(assets\/images\/[^"')\s<>]+)/g)) usedImages.add(m[1]);
        }
      }
    };
    walk(OUT);
  }
  return usedImages.has(rel.split(path.sep).join('/'));
};

function copyStatic(dir = '') {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (!dir && ((/^[_.]/.test(e.name) && e.name !== '.well-known') || STATIC_SKIP.has(e.name))) continue;
    if (e.name === '.DS_Store' || /\.(gem|gemspec)$/.test(e.name) || STATIC_SKIP_DIRS.includes(rel)) continue;
    if (e.isDirectory()) { copyStatic(rel); continue; }
    if (SKIP_FILES.has(rel)) continue;
    // photos are served as WebP (static/img); an original is published only if a page still uses it
    if (rel.startsWith(`assets${path.sep}images${path.sep}`) && hasCwebp() && !usedImage(rel)) continue;
    const src = path.join(ROOT, rel);
    if (/\.(md|markdown|html)$/.test(e.name) && fs.readFileSync(src, 'utf8').startsWith('---')) continue; // a page source
    const dst = path.join(OUT, rel);
    if (fs.existsSync(dst)) continue; // a built page wins
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

// ---------------------------------------------------------------------------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(HERE, 'static'), path.join(OUT, 'static'), { recursive: true });
buildHome();
buildMembers();
for (const f of fs.readdirSync(path.join(ROOT, 'members'))) if (f.endsWith('.md') && f !== 'index.md') buildMemberPage(f);
buildPublications();
buildResearch();
buildTalks();
buildTrips();
buildConferences();
buildCourses();
buildRedirects();
build404();
buildSitemap();
copyStatic();
console.log('built →', path.relative(process.cwd(), OUT) || '.');
