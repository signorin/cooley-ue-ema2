import { getMetadata } from '../../scripts/aem.js';

// Cooley header: minimal sticky top bar (logo left, search + hamburger right)
// with a full-screen overlay menu (utility nav + main nav + search).
// Content-first: all links/labels/images come from content/nav.plain.html.

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeMenu(nav, overlay, hamburger) {
  overlay.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open Menu');
  nav.classList.remove('menu-open-active');
  document.body.style.overflowY = '';
}

function openMenu(nav, overlay, hamburger) {
  overlay.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.setAttribute('aria-label', 'Close Menu');
  nav.classList.add('menu-open-active');
  document.body.style.overflowY = 'hidden';
}

/**
 * Fetch the nav fragment as plain HTML.
 * (1) local / aem up: /content/nav.plain.html
 * (2) DA / EDS production: `${navPath}.plain.html`
 */
async function fetchNav(navPath) {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    resp = await fetch(`${navPath}.plain.html`);
  }
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.querySelector('main') || doc.body;
}

/**
 * loads and decorates the header nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/content/nav';

  const source = await fetchNav(navPath);
  block.textContent = '';
  if (!source) return;

  const sections = source.querySelectorAll(':scope > div');
  const brandSection = sections[0];
  const mainNavSection = sections[1];
  const utilNavSection = sections[2];

  // --- top bar ---
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.className = 'cooley-nav';
  nav.setAttribute('aria-label', 'Main');

  const bar = document.createElement('div');
  bar.className = 'nav-bar';

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSection) {
    const brandLink = brandSection.querySelector('a');
    if (brandLink) brand.append(brandLink);
  }

  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const searchToggle = document.createElement('button');
  searchToggle.type = 'button';
  searchToggle.className = 'nav-search-toggle';
  searchToggle.setAttribute('aria-label', 'Toggle Search Open/Closed');
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open Menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'nav-overlay');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';
  tools.append(searchToggle, hamburger);

  bar.append(brand, tools);

  // --- overlay menu ---
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.id = 'nav-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const overlayInner = document.createElement('div');
  overlayInner.className = 'nav-overlay-inner';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'nav-close';
  closeBtn.setAttribute('aria-label', 'Close');

  if (utilNavSection) {
    const util = document.createElement('nav');
    util.className = 'nav-utility';
    util.setAttribute('aria-label', 'Utility Navigation');
    const ul = utilNavSection.querySelector('ul');
    if (ul) util.append(ul);
    overlayInner.append(util);
  }

  if (mainNavSection) {
    const main = document.createElement('nav');
    main.className = 'nav-main';
    main.setAttribute('aria-label', 'Main Navigation');
    const ul = mainNavSection.querySelector('ul');
    if (ul) main.append(ul);
    overlayInner.append(main);
  }

  // search form (controls built in JS, not in the fragment)
  const searchWrap = document.createElement('form');
  searchWrap.className = 'nav-search';
  searchWrap.setAttribute('role', 'search');
  searchWrap.action = '/search';
  searchWrap.innerHTML = '<label class="nav-search-label" for="nav-search-input">Search</label>'
    + '<input id="nav-search-input" name="q" type="search" placeholder="Enter search keywords" autocomplete="off">'
    + '<button type="submit" class="nav-search-submit" aria-label="Search"></button>';
  overlayInner.append(searchWrap);

  overlay.append(closeBtn, overlayInner);

  // --- assemble ---
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  nav.append(bar);
  navWrapper.append(nav, overlay);
  block.append(navWrapper);

  // --- behavior ---
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    if (expanded) closeMenu(nav, overlay, hamburger);
    else openMenu(nav, overlay, hamburger);
  });
  closeBtn.addEventListener('click', () => closeMenu(nav, overlay, hamburger));

  searchToggle.addEventListener('click', () => {
    openMenu(nav, overlay, hamburger);
    overlay.querySelector('#nav-search-input')?.focus();
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      closeMenu(nav, overlay, hamburger);
    }
  });

  // reset overlay state on breakpoint change so layout stays clean
  isDesktop.addEventListener('change', () => {
    closeMenu(nav, overlay, hamburger);
  });
}
