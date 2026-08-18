/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-home. Base: hero.
 * Source: https://www.cooley.com/
 * Model fields (blocks/hero-home/_hero-home.json): image (reference), imageAlt (collapsed -> alt), text (richtext)
 * Simple 1-column block: row per unique field (image, text). imageAlt collapses into the <img> alt attribute.
 */
export default function parse(element, { document }) {
  // --- Image (field:image) ---
  // Prefer the first real slot image; fall back to any picture/img inside the hero.
  const picture = element.querySelector('.slots picture, picture');
  const img = element.querySelector('.slots img, img');

  // --- Text (field:text): the hero title/headline ---
  const heading = element.querySelector('h1.title, h1, .inner h1, [class*="title"] , h2');
  // Optional CTA / control button (e.g. "Pause video")
  const cta = element.querySelector('button.js-video-toggle, .btn--video-toggle, a.btn, .inner a');

  // Empty-block guard
  if (!heading && !picture && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: image
  if (picture || img) {
    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(' field:image '));
    imageFrag.appendChild(picture || img);
    cells.push([imageFrag]);
  }

  // Row: text (title / headline)
  if (heading) {
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    // Normalize the multi-span title into a single heading element with plain text.
    const h = document.createElement('h1');
    h.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    textFrag.appendChild(h);
    // Optional CTA / control text goes in the same richtext cell.
    if (cta) {
      const ctaText = cta.textContent.replace(/\s+/g, ' ').trim();
      if (ctaText) {
        const p = document.createElement('p');
        if (cta.tagName === 'A' && cta.getAttribute('href')) {
          const a = document.createElement('a');
          a.setAttribute('href', cta.getAttribute('href'));
          a.textContent = ctaText;
          p.appendChild(a);
        } else {
          p.textContent = ctaText;
        }
        textFrag.appendChild(p);
      }
    }
    cells.push([textFrag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-home', cells });
  element.replaceWith(block);
}
