/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards.
 * Source: https://www.cooley.com/
 * Container block. Child model `card` (blocks/cards-news/_cards-news.json): image (reference), imageAlt (collapsed), text (richtext).
 * Each card => one row of 2 cells: [image, text]. Source cards have no image, so the image cell is empty
 * (empty cells carry no field hint). The text cell holds title (linked heading) + meta, hinted field:text.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll(':scope > .item, .item.swiper-slide, .item'));

  // De-duplicate in case nested selectors matched the same node.
  const uniqueItems = [];
  items.forEach((it) => { if (!uniqueItems.includes(it)) uniqueItems.push(it); });

  if (uniqueItems.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  uniqueItems.forEach((item) => {
    // Image cell (empty for news cards — no image in source; kept empty per block library).
    const imageCell = '';

    // Text cell: heading (with link) + meta (type + date).
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));

    const title = item.querySelector('h3.item-title, .item-title, h3, h4');
    if (title) textFrag.appendChild(title);

    const meta = item.querySelector('.item-meta');
    if (meta) textFrag.appendChild(meta);

    cells.push([imageCell, [textFrag]]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
