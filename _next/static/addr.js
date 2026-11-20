// E-mail addresses are written as "user [at] domain" in the HTML (<a class="addr"
// data-user=".." data-domain="..">) so that simple scrapers cannot harvest them; they
// are assembled here into mailto links.
for (const link of document.querySelectorAll('a.addr[data-user]')) {
  const addr = `${link.dataset.user}@${link.dataset.domain}`;
  link.href = `mailto:${addr}`;
  link.textContent = addr;
}
