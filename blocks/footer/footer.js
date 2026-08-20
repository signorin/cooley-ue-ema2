import { getMetadata } from '../../scripts/aem.js';

// Cooley footer: red CTA band + dark maroon main footer.
// Content-first: all copy/links/images come from content/footer.plain.html.

/**
 * Fetch the footer fragment as plain HTML.
 * (1) local / aem up: /content/footer.plain.html
 * (2) DA / EDS production: `${footerPath}.plain.html`
 */
async function fetchFooter(footerPath) {
  // EDS delivery serves the fragment at /footer.plain.html; local/DA dev may use
  // /content/footer.plain.html. Try the metadata path, then root, then /content.
  const candidates = [
    footerPath.endsWith('.plain.html') ? footerPath : `${footerPath}.plain.html`,
    '/footer.plain.html',
    '/content/footer.plain.html',
  ];
  let resp;
  for (let i = 0; i < candidates.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    resp = await fetch(candidates[i]);
    if (resp.ok) break;
  }
  if (!resp || !resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.querySelector('main') || doc.body;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';

  const source = await fetchFooter(footerPath);
  block.textContent = '';
  if (!source) return;

  const sections = [...source.querySelectorAll(':scope > div')];
  const [
    ctaSection, logoSection, navSection, portalSection, socialSection, legalSection,
  ] = sections;

  const footer = document.createElement('div');
  footer.className = 'cooley-footer';

  // --- top: red CTA band ---
  if (ctaSection) {
    const top = document.createElement('div');
    top.className = 'footer-top';
    const inner = document.createElement('div');
    inner.className = 'footer-top-inner';
    while (ctaSection.firstElementChild) inner.append(ctaSection.firstElementChild);
    inner.querySelectorAll('p > a').forEach((a) => a.classList.add('button'));
    top.append(inner);
    footer.append(top);
  }

  // --- bottom: dark maroon main footer ---
  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';
  const bottomInner = document.createElement('div');
  bottomInner.className = 'footer-bottom-inner';

  if (logoSection) {
    const logo = document.createElement('div');
    logo.className = 'footer-logo';
    while (logoSection.firstElementChild) logo.append(logoSection.firstElementChild);
    bottomInner.append(logo);
  }

  if (navSection) {
    const nav = document.createElement('nav');
    nav.className = 'footer-nav';
    nav.setAttribute('aria-label', 'Footer Navigation');
    const ul = navSection.querySelector('ul');
    if (ul) nav.append(ul);
    bottomInner.append(nav);
  }

  if (portalSection) {
    const portal = document.createElement('div');
    portal.className = 'footer-portal';
    while (portalSection.firstElementChild) portal.append(portalSection.firstElementChild);
    portal.querySelectorAll('p > a').forEach((a) => {
      if (a.getAttribute('href') && a.textContent.trim().toLowerCase() === 'visit portal') {
        a.classList.add('button', 'secondary');
      }
    });
    bottomInner.append(portal);
  }

  const finalRow = document.createElement('div');
  finalRow.className = 'footer-final';

  if (socialSection) {
    const social = document.createElement('nav');
    social.className = 'footer-social';
    social.setAttribute('aria-label', 'Social Media Links');
    const ul = socialSection.querySelector('ul');
    if (ul) social.append(ul);
    finalRow.append(social);
  }

  if (legalSection) {
    const legal = document.createElement('div');
    legal.className = 'footer-legal';
    while (legalSection.firstElementChild) legal.append(legalSection.firstElementChild);
    finalRow.append(legal);
  }

  bottomInner.append(finalRow);
  bottom.append(bottomInner);
  footer.append(bottom);

  block.append(footer);
}
