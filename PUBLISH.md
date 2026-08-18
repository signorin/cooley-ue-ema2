# Publishing the Cooley homepage (cooley-ue-ema2)

This is an **xwalk / Universal Editor** project. "Publish" = three steps:
code → Git (done), content → AEM author (needs AEM access), then
preview/publish via admin.hlx.page.

## Status

| Step | State |
|------|-------|
| 1. Code → Git | ✅ DONE — branch `aem-20260818-1225` pushed (remote == local). All 6 blocks, styles, header/footer, hero md2jcr + scatter fixes. |
| 2. Content → AEM author | 📦 Package built & validated — `migration-work/aem-pages-package.zip`. Needs install into AEM author (AEM token required). |
| 3. Preview/Publish | 🔑 admin.hlx.page authenticated (write perms). Blocked until Step 2 lands content (preview currently returns `error from content-bus`). |

## Content package

`migration-work/aem-pages-package.zip` — FileVault package, validated:

- `jcr_root/content/cooley-ue-ema2/index/.content.xml` — homepage: hero-home (5 tiles), 16 cards, video-fullwidth, 2 tabs-links items, 7 sections
- `jcr_root/content/cooley-ue-ema2/nav/.content.xml` — header (3 sections)
- `jcr_root/content/cooley-ue-ema2/footer/.content.xml` — footer (6 sections)
- Filter roots: `/content/cooley-ue-ema2/{index,nav,footer}`

## Step 2 — install content into AEM author (pick one)

**A. CRX Package Manager (UI)**
1. Go to `https://author-p127374-e1240195.adobeaemcloud.com/crx/packmgr`
2. Upload `migration-work/aem-pages-package.zip` → Install.

**B. aem-import-helper CLI (needs your AEM token)**
```bash
npx @adobe/aem-import-helper aem upload \
  --zip migration-work/aem-pages-package.zip \
  --token <YOUR_AEM_TOKEN> \
  --target https://author-p127374-e1240195.adobeaemcloud.com
```

**C. Universal Editor**
Open `https://author-p127374-e1240195.adobeaemcloud.com/content/cooley-ue-ema2/index.html`
in UE, create the page if needed, and author/save the blocks.

## Step 3 — preview + publish (via admin.hlx.page)

Once content is in AEM author, run for each page (`index`, `nav`, `footer`):
```bash
# preview
curl -X POST https://admin.hlx.page/preview/signorin/cooley-ue-ema2/main/index
# publish (live)
curl -X POST https://admin.hlx.page/live/signorin/cooley-ue-ema2/main/index
```

Live site: **https://main--cooley-ue-ema2--signorin.aem.live/**
Preview:   **https://main--cooley-ue-ema2--signorin.aem.page/**

## Regenerating the JCR (if content changes)

Content lives in `content/*.plain.html`. JCR XML is generated with the
md2jcr CLI against the project's component JSON:
```bash
node <helix-md2jcr>/bin/md2jcr.js migration-work/jcr-content/index.md -ue .
```
Then rebuild the package (jcr_root structure above) and reinstall.
