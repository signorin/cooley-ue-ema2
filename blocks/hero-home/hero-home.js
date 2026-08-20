/**
 * Hero Home decoration.
 *
 * The hero's image cell holds the 5 decorative tiles. Depending on how the
 * content was authored/ingested, the images can arrive either as real
 * <img>/<picture> elements OR as (double-)escaped HTML text in the cell
 * (e.g. "&lt;p&gt;&lt;img src=...&gt;"). This decorator normalizes both cases
 * into real <img> elements so the CSS scatter always has tiles to position.
 */

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
          clean.setAttribute('src', im.getAttribute('src'));
          clean.setAttribute('alt', im.getAttribute('alt') || '');
          clean.setAttribute('loading', 'lazy');
          p.appendChild(clean);
        });
        imageCell.textContent = '';
        imageCell.appendChild(p);
      }
    }
  }
}
