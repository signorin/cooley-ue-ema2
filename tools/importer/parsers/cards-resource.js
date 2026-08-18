/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-resource. Base: cards.
 * Source: https://www.cooley.com/
 * Container block. Child model `card` (blocks/cards-resource/_cards-resource.json): image (reference), imageAlt (collapsed), text (richtext).
 * Selector targets `ul.items`; each `li.item` => one row of 2 cells: [image, text].
 * Source cards have no image, so the image cell is empty (empty cell, no field hint).
 * Text cell holds title (linked heading), description, and CTA text — hinted field:text.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll(':scope > li.item, li.item, :scope > .item'));

  const uniqueItems = [];
  items.forEach((it) => { if (!uniqueItems.includes(it)) uniqueItems.push(it); });

  if (uniqueItems.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  uniqueItems.forEach((item) => {
    // Image cell (empty — resource cards have no image).
    const imageCell = '';

    // Text cell: heading (linked) + description + CTA.
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    const title = item.querySelector('h3.item-title, .item-title, h3, h4');
    if (title) textFrag.appendChild(title);

    const description = item.querySelector('p.item-description, .item-description, p');
    if (description) textFrag.appendChild(description);

    // CTA is a <span> in source; represent as a link using the card's own href so it stays a real CTA.
    const cardLink = item.querySelector('a[href]');
    const ctaSpan = item.querySelector('.item-link-text, [class*="link-text"]');
    if (ctaSpan) {
      const ctaText = ctaSpan.textContent.replace(/\s+/g, ' ').trim();
      if (ctaText) {
        const p = document.createElement('p');
        if (cardLink && cardLink.getAttribute('href')) {
          const a = document.createElement('a');
          a.setAttribute('href', cardLink.getAttribute('href'));
          a.textContent = ctaText;
          p.appendChild(a);
        } else {
          p.textContent = ctaText;
        }
        textFrag.appendChild(p);
      }
    }

    cells.push([imageCell, [textFrag]]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-resource', cells });
  element.replaceWith(block);
}
