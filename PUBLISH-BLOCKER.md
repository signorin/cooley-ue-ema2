# Publish blocker — AEM content-source not authorized

**Status:** Code is live on `main`; homepage content is built and staged.
**Only the final "go live" step is blocked** by a server-side authorization
issue between AEM author and Edge Delivery. Nothing in this repo can fix it —
it must be enabled in Adobe Cloud Manager / the AEM–EDS integration.

## The error

`POST https://admin.hlx.page/preview/signorin/cooley-ue-ema2/main/index` returns:

```
HTTP/2 401
x-error-code: AEM_BACKEND_FETCH_FAILED
x-error: [admin] Unable to fetch '/index.md' from 'html2md':
         (401) - not authenticated to access resource:
         https://api.aem.live/signorin/sites/cooley-ue-ema2/source/
```

The Edge Delivery admin pipeline cannot authenticate to the site's AEM content
source, so it cannot read the page to preview/publish it.

## Site configuration (authoritative)

From `https://admin.hlx.page/config/signorin/sites/cooley-ue-ema2.json`:

- **content.source.type**: `markup`
- **content.source.url**: `https://api.aem.live/signorin/sites/cooley-ue-ema2/source`
- **code.source**: `https://github.com/signorin/cooley-ue-ema2`
- **access.admin.role.admin**: `signorin@adobe.com`, `signorinoadobe@gmail.com`
- AEM author instance: `https://author-p127374-e1240195.adobeaemcloud.com`
- fstab mountpoint: `https://author-p127374-e1240195.adobeaemcloud.com/bin/franklin.delivery/signorin/cooley-ue-ema2/main`

## Endpoints tested (all return 401)

| Endpoint | Result |
|----------|--------|
| `api.aem.live/signorin/sites/cooley-ue-ema2/source/index` | 401 |
| `author-.../bin/franklin.delivery/signorin/cooley-ue-ema2/main/index.html` | 401 |
| `admin.hlx.page/preview/.../main/index` | 401 (AEM_BACKEND_FETCH_FAILED) |
| `admin.hlx.page/profile` | authenticated: none (for the AEM backend) |

A local preview-server restart does NOT change this — the 401 is on the AEM
backend authorization, not the local dev server.

## Fix (Cloud Manager admin / Adobe)

Enable + authorize the AEM authoring ↔ Edge Delivery Services connection for
program `p127374` / environment `e1240195`:

1. **Cloud Manager → Program → Edit Program → Solutions & add-ons:** ensure
   **Edge Delivery Services** capability is enabled. Save.
2. **Run a deployment / restart the pipeline** so the capability takes effect
   (can take several minutes to propagate).
3. **Confirm the EDS content connector** serves the site: the
   `franklin.delivery` servlet must be readable by the pipeline's technical
   account, with **read** on `/content/cooley-ue-ema2`
   (AEM → Tools → Security → Users/Permissions).
4. **Register/authorize the content-source credential** so
   `api.aem.live/.../source` can read the AEM author instance (done via the
   AEM Cloud "Edge Delivery Services" onboarding, which binds the IMS org +
   technical account to the aem.live site).

If the Edge Delivery Services option is missing in Cloud Manager, the
entitlement must be provisioned by Adobe — open a support ticket:
"Enable Edge Delivery Services authoring for program p127374."

**Docs:** https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/aem-authoring

## Verify it's fixed

When authorized, this returns page markup (not 401):

```bash
curl -I "https://author-p127374-e1240195.adobeaemcloud.com/bin/franklin.delivery/signorin/cooley-ue-ema2/main/index.html"
```

Then publish (all three pages):

```bash
for p in index nav footer; do
  curl -X POST "https://admin.hlx.page/preview/signorin/cooley-ue-ema2/main/$p"
  curl -X POST "https://admin.hlx.page/live/signorin/cooley-ue-ema2/main/$p"
done
```

Live site: **https://main--cooley-ue-ema2--signorin.aem.live/**
