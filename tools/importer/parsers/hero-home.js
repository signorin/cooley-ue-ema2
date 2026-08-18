/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-home. Base: hero.
 * Source: https://www.cooley.com/
 * Model fields (blocks/hero-home/_hero-home.json): image (reference), imageAlt (collapsed -> alt), text (richtext)
 * Simple 1-column block: row per unique field (image, text). imageAlt collapses into the <img> alt attribute.
 */
export default function parse(element, { document }) {
  // --- Images (field:image) ---
  // Collect all decorative hero tiles: each .slot holds either an <img>
  // (picture) or a <video> with a poster frame. Represent every tile as an
  // <img> so all 5 scattered tiles survive into the content.
  const tileImgs = [];
  const slots = element.querySelectorAll('.slots .slot, .js-hero-home-slots .slot');
  slots.forEach((slot) => {
    const slotImg = slot.querySelector('img');
    const slotVideo = slot.querySelector('video');
    if (slotImg && slotImg.getAttribute('src')) {
      const im = document.createElement('img');
      im.setAttribute('src', slotImg.getAttribute('src'));
      im.setAttribute('alt', slotImg.getAttribute('alt') || '');
      tileImgs.push(im);
    } else if (slotVideo && slotVideo.getAttribute('poster')) {
      // Use the video's poster frame as a still image tile.
      const im = document.createElement('img');
      im.setAttribute('src', slotVideo.getAttribute('poster'));
      im.setAttribute('alt', '');
      tileImgs.push(im);
    }
  });
  // Fallback: any single picture/img inside the hero if no slots matched.
  const picture = element.querySelector('.slots picture, picture');
  const img = element.querySelector('.slots img, img');

  // --- Text (field:text): the hero title/headline ---
  const heading = element.querySelector('h1.title, h1, .inner h1, [class*="title"] , h2');

  // Empty-block guard
  if (!heading && !picture && !img && tileImgs.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: images (all scattered tiles; fall back to a single picture/img).
  // All tiles go in ONE paragraph — md2jcr maps a single field to one cell and
  // cannot handle multiple block-level paragraphs in the same cell.
  if (tileImgs.length > 0) {
    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(' field:image '));
    const p = document.createElement('p');
    tileImgs.forEach((im, i) => {
      if (i > 0) p.appendChild(document.createTextNode(' '));
      p.appendChild(im);
    });
    imageFrag.appendChild(p);
    cells.push([imageFrag]);
  } else if (picture || img) {
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
    cells.push([textFrag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-home', cells });
  element.replaceWith(block);
}
