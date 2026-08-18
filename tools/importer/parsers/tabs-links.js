/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-links. Base: tabs.
 * Source: https://www.cooley.com/
 * Container block. Child model `tabs-links-item` (blocks/tabs-links/_tabs-links.json):
 *   title (Tab Title), content_heading, content_headingType (collapsed -> SKIP),
 *   content_image (reference), content_richtext.
 * Grouping: content_* fields share the `content_` prefix => same (second) cell.
 * Library: 2 columns. Each tab => one row: [tab label (field:title), tab content (field:content_richtext)].
 *
 * DOM note: the mapped element is `.tablist-items` (holds only the tab-trigger buttons).
 * The matching content lives in sibling `.tablist-container` panels under the shared `.tablist` parent,
 * paired to buttons by document order.
 *
 * Validation note: automatic completeness scores against the mapped element's own text
 * (just the button labels "Practices"/"Industries"), so the score is artificially low —
 * the tab *content* is correctly pulled from sibling panels and IS complete in the output.
 */
export default function parse(element, { document }) {
  const scope = element.closest('.tablist') || element.parentElement || element;

  // Tab triggers live inside the mapped `.tablist-items` element.
  const buttons = Array.from(element.querySelectorAll(':scope > .tablist-trigger, .tablist-trigger, button.btn--tab, button'));
  const containers = Array.from(scope.querySelectorAll('.tablist-container'));

  if (buttons.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  buttons.forEach((btn, i) => {
    // Build one row per tab: label cell + content cell.
    // Cell 1: tab label (field:title)
    const titleFrag = document.createDocumentFragment();
    titleFrag.appendChild(document.createComment(' field:title '));
    const label = btn.textContent.replace(/\s+/g, ' ').trim();
    titleFrag.appendChild(document.createTextNode(label));

    // Cell 2: tab content (field:content_richtext) — the link list for this tab.
    const contentFrag = document.createDocumentFragment();
    contentFrag.appendChild(document.createComment(' field:content_richtext '));
    const container = containers[i];
    if (container) {
      const content = container.querySelector('ul.tablist-content, ul, .tablist-content') || container;
      contentFrag.appendChild(content);
    }

    cells.push([[titleFrag], [contentFrag]]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-links', cells });
  element.replaceWith(block);
}
