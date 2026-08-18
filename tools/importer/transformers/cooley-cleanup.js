/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: cooley.com site-wide cleanup.
 * Removes non-authorable site chrome and third-party widgets.
 * All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent / overlays (OneTrust) — cleaned.html lines 743, 775, 966
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '#ot-fltr-modal',
      '.onetrust-pc-dark-filter',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome — cleaned.html lines 10, 21, 90, 611, 725
    WebImporter.DOMUtils.remove(element, [
      'header.site-header',
      'section.site-header-search',
      'section.hamburger-menu',
      'footer.site-footer',
      '.js-blocker',
      // Accent formation videos are decorative shell chrome (hero/footer) — lines 18, 213, 622
      '.formations.js-formations',
      // Coveo search resources + stray shell elements — lines 731, 732, 739, 1013, 1017
      'link',
      'iframe',
      'noscript',
      'script',
      'input',
    ]);
  }
}
