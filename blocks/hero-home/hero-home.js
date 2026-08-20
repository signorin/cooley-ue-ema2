/**
 * Hero Home decoration.
 *
 * The hero's image cell holds the 5 decorative tiles. Depending on how the
 * content was authored/ingested, the images can arrive either as real
 * <img>/<picture> elements OR as (double-)escaped HTML text in the cell
 * (e.g. "&lt;p&gt;&lt;img src=...&gt;"). This decorator normalizes both cases
 * into real <img> elements so the CSS scatter always has tiles to position.
 *
 * The tile sources were ingested as AEM DAM references
 * (/content/dam/cooley-ue-ema2/-/media/...) which Edge Delivery does not serve
 * (404). The original assets are still served by the source site, so we rewrite
 * that DAM prefix back to the cooley.com origin, preserving the /-/media/... tail.
 */

const DAM_PREFIX = '/content/dam/cooley-ue-ema2/-/media/';
const ORIGIN_PREFIX = 'https://www.cooley.com/-/media/';

function resolveSrc(src) {
  if (src && src.startsWith(DAM_PREFIX)) {
    return ORIGIN_PREFIX + src.slice(DAM_PREFIX.length);
  }
  return src;
}

function decodeEntities(str) {
  const txt = document.createElement('textarea');
  let out = str;
  // decode repeatedly to handle double-encoding (&#x26;#x3C; -> &#x3C; -> <)
  for (let i = 0; i < 3; i += 1) {
    txt.innerHTML = out;
    const next = txt.value;
    if (next === out) break;
    out = next;
  }
  return out;
}

// Rewrite any unservable DAM img src (and <source> srcset in optimized
// <picture>) to the cooley.com origin, across the whole block.
function fixDamSources(root) {
  root.querySelectorAll('img').forEach((im) => {
    const fixed = resolveSrc(im.getAttribute('src'));
    if (fixed !== im.getAttribute('src')) im.setAttribute('src', fixed);
    if (im.getAttribute('srcset')) im.removeAttribute('srcset');
  });
  root.querySelectorAll('source').forEach((s) => {
    // EDS createOptimizedPicture adds <source srcset=...> pointing at the
    // same (DAM) path; drop them so the corrected <img src> is used.
    const ss = s.getAttribute('srcset') || '';
    if (ss.includes(DAM_PREFIX)) s.remove();
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  const imageCell = rows[0] ? (rows[0].querySelector(':scope > div') || rows[0]) : null;
  if (!imageCell) return;

  const hasRealImg = imageCell.querySelector('img');
  const rawText = imageCell.textContent.trim();

  if (!hasRealImg && /&(#x?[0-9a-f]+|lt|gt|amp|quot);/i.test(rawText)) {
    const htmlStr = decodeEntities(rawText);
    if (/<img\b/i.test(htmlStr)) {
      const tmp = document.createElement('div');
      tmp.innerHTML = htmlStr;
      const imgs = [...tmp.querySelectorAll('img')];
      if (imgs.length) {
        const p = document.createElement('p');
        imgs.forEach((im, i) => {
          if (i > 0) p.appendChild(document.createTextNode(' '));
          const clean = document.createElement('img');
          clean.setAttribute('src', resolveSrc(im.getAttribute('src')));
          clean.setAttribute('alt', im.getAttribute('alt') || '');
          clean.setAttribute('loading', 'lazy');
          p.appendChild(clean);
        });
        imageCell.textContent = '';
        imageCell.appendChild(p);
      }
    }
  }

  // Always normalize DAM sources across the whole block, now and again after
  // the current task cycle (EDS may run createOptimizedPicture after this
  // decorator and re-introduce DAM paths / add <source> elements).
  fixDamSources(block);
  requestAnimationFrame(() => fixDamSources(block));
  setTimeout(() => fixDamSources(block), 1000);
}
