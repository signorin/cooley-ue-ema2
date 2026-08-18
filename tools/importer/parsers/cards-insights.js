/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-insights. Base: cards.
 * Source: https://www.cooley.com/
 * Container block. Child model `card` (blocks/cards-insights/_cards-insights.json): image (reference), imageAlt (collapsed), text (richtext).
 * Selector targets `ul.items`; each `li.item` => one row of 2 cells: [image, text].
 * Source cards have no image, so the image cell is empty (empty cell, no field hint).
 * Text cell holds title (linked heading) + meta (type + date) — hinted field:text.
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
    // Image cell (empty — insight cards have no image).
    const imageCell = '';

    // Text cell: heading (linked) + meta.
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    const title = item.querySelector('h3.item-title, .item-title, h3, h4');
    if (title) textFrag.appendChild(title);

    const meta = item.querySelector('.item-meta');
    if (meta) textFrag.appendChild(meta);

    cells.push([imageCell, [textFrag]]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-insights', cells });
  element.replaceWith(block);
}
