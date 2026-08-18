/* eslint-disable */
/* global WebImporter */
/**
 * Parser for video-fullwidth. Base: video.
 * Source: https://www.cooley.com/
 * Simple 1-column block. Model (blocks/video-fullwidth/_video-fullwidth.json):
 *   uri (aem-content video), classes (SKIP per hinting rules), placeholder_image (reference),
 *   placeholder_imageAlt (collapsed -> img alt).
 * Library: row 2 = video source, row 3 = optional poster/placeholder image.
 * In source the video opens via a modal trigger (no inline file URL); the poster image is present.
 */
export default function parse(element, { document }) {
  // Video source URL (uri): look for a real video element/source or an explicit data URL if present.
  const videoEl = element.querySelector('video source[src], video[src], source[src]');
  const videoSrc = videoEl ? (videoEl.getAttribute('src') || '') : '';

  // Poster / placeholder image (placeholder_image + placeholder_imageAlt via alt attribute).
  const picture = element.querySelector('picture');
  const img = element.querySelector('img');

  if (!videoSrc && !picture && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: video uri (only if a concrete source URL exists in the source HTML).
  if (videoSrc) {
    const uriFrag = document.createDocumentFragment();
    uriFrag.appendChild(document.createComment(' field:uri '));
    const a = document.createElement('a');
    a.setAttribute('href', videoSrc);
    a.textContent = videoSrc;
    uriFrag.appendChild(a);
    cells.push([uriFrag]);
  }

  // Row: placeholder image.
  if (picture || img) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:placeholder_image '));
    imgFrag.appendChild(picture || img);
    cells.push([imgFrag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'video-fullwidth', cells });
  element.replaceWith(block);
}
